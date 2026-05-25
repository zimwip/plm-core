// Linear, Buffer-based STEP streaming scanner.
//
// scanStep streams the file once with a moving cursor — no per-terminator
// buffer slicing — and reports each ';'-delimited segment. For DATA-section
// entities it also reports the raw byte [offset, length] range, so callers can
// later extract entities by random access without re-segmenting the file.
//
// readEntitiesAt fetches a set of those ranges by positional (pread) reads.

import { createReadStream } from 'fs';
import { open } from 'fs/promises';

const OPEN  = Buffer.from('/*');
const CLOSE = Buffer.from('*/');
const SEMI  = 0x3B; // ';'
const EMPTY = Buffer.alloc(0);

// scanStep(filePath, { onHeader, onEntity }) → Promise<void>
//
// onHeader(headerString)  — called once, the reconstructed "HEADER;…ENDSEC;" block.
// onEntity({ id, type, text, offset, length }) — once per DATA-section segment:
//   id      entity id without '#', or null when the segment is not "#n = …"
//   type    entity type name, '_COMPOUND_' for compound records, null when no id
//   text    normalised record text — comments removed, newlines→spaces, trimmed,
//           no trailing ';' — matching the previous string-based segmentation
//   offset  byte offset of the record in the file (start of the segment)
//   length  byte length of the record through the terminating ';' inclusive
export function scanStep(filePath, { onHeader, onEntity } = {}) {
  return new Promise((resolve, reject) => {
    const rs = createReadStream(filePath); // raw Buffer chunks

    let work = EMPTY;       // unconsumed bytes
    let workBase = 0;       // absolute file offset of work[0]
    let cursor = 0;         // scan position within work
    let commentPos = -2;    // cached next '/*' index: -2 stale, -1 none ahead
    let inComment = false;

    let segStart = 0;       // absolute offset of the current segment's first byte
    let segChunks = [];     // non-comment byte pieces of the current segment
    const headerLines = [];
    let inHeader = false;
    let inData = false;

    function pushPiece(piece) {
      if (piece.length > 0) segChunks.push(piece);
    }

    function emitSegment(semicolonAbs) {
      const length = semicolonAbs - segStart + 1;
      const raw = segChunks.length === 0 ? EMPTY
                : segChunks.length === 1 ? segChunks[0]
                : Buffer.concat(segChunks);
      const text = raw.toString('utf8').replace(/\r?\n/g, ' ').trim();
      handleSegment(text, segStart, length);
    }

    function handleSegment(text, offset, length) {
      if (text === '') return;
      if (text === 'HEADER') { inHeader = true; return; }
      if (text === 'DATA') {
        if (onHeader) {
          onHeader(headerLines.length
            ? `HEADER;\n${headerLines.join('\n')}\nENDSEC;`
            : 'HEADER;\nENDSEC;');
        }
        inHeader = false; inData = true; return;
      }
      if (text === 'ENDSEC') { inHeader = false; inData = false; return; }
      if (inHeader) { headerLines.push(text + ';'); return; }
      if (!inData || !onEntity) return;

      const idMatch = text.match(/^#(\d+)\s*=/);
      const id = idMatch ? idMatch[1] : null;
      let type = null;
      if (id) {
        const tm = text.match(/^#\d+\s*=\s*([A-Z_][A-Z0-9_]*)\s*\(/);
        type = tm ? tm[1] : '_COMPOUND_';
      }
      onEntity({ id, type, text, offset, length });
    }

    function scan() {
      for (;;) {
        if (inComment) {
          const end = work.indexOf(CLOSE, cursor);
          if (end === -1) return;          // unterminated — carry to next chunk
          cursor = end + 2;
          inComment = false;
          commentPos = -2;
          continue;
        }
        if (commentPos === -2) commentPos = work.indexOf(OPEN, cursor);
        const sp = work.indexOf(SEMI, cursor);
        const cp = commentPos;
        if (cp !== -1 && (sp === -1 || cp < sp)) {
          pushPiece(work.subarray(cursor, cp));
          cursor = cp + 2;
          inComment = true;
          continue;
        }
        if (sp !== -1) {
          pushPiece(work.subarray(cursor, sp));
          emitSegment(workBase + sp);
          cursor = sp + 1;
          segStart = workBase + cursor;
          segChunks = [];
          continue;
        }
        // no ';' and no '/*' ahead — leftover is text, wait for the next chunk
        pushPiece(work.subarray(cursor));
        cursor = work.length;
        return;
      }
    }

    rs.on('data', chunk => {
      try {
        if (work.length === 0) {
          work = chunk;
        } else if (cursor >= work.length) {
          workBase += work.length;
          work = chunk;
          cursor = 0;
        } else if (cursor > 0) {
          workBase += cursor;
          work = Buffer.concat([work.subarray(cursor), chunk]);
          cursor = 0;
        } else {
          work = Buffer.concat([work, chunk]);
        }
        commentPos = -2; // positions shifted by the rebuild
        scan();
      } catch (err) {
        rs.destroy();
        reject(err);
      }
    });
    rs.on('end', () => {
      // Flush a trailing segment with no terminating ';' (malformed file).
      if (segChunks.length) {
        const raw = segChunks.length === 1 ? segChunks[0] : Buffer.concat(segChunks);
        const text = raw.toString('utf8').replace(/\r?\n/g, ' ').trim();
        if (text) handleSegment(text, segStart, workBase + work.length - segStart);
      }
      resolve();
    });
    rs.on('error', reject);
  });
}

// readEntitiesAt(filePath, ranges, onEntity) → Promise<void>
//
// Positional (pread) reads for a set of byte ranges — fetches only the needed
// entities without streaming the whole file. Used to fetch the geometry
// referenced by assembly transforms (/parse) and to reconstruct part files in
// the /split workers. ranges: array of { offset, length, … } best sorted
// ascending for readahead; onEntity(rawBytes, range) called once per range.
export async function readEntitiesAt(filePath, ranges, onEntity) {
  const fh = await open(filePath, 'r');
  try {
    for (const r of ranges) {
      const buf = Buffer.allocUnsafe(r.length);
      await fh.read(buf, 0, r.length, r.offset);
      onEntity(buf, r);
    }
  } finally {
    await fh.close();
  }
}
