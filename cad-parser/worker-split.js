// Part-file reconstruction for /split.
//
// Runs as a worker thread (one bucket of parts per worker) and is also imported
// by app.js for the inline small-file path. The whole source file lives in a
// SharedArrayBuffer; each part file is built by copying its entities' raw bytes
// out of it. Entities keep their original #ids (valid ISO-10303-21), so this is
// a pure byte copy — no decode, no renumber. Adjacent entities are coalesced
// into contiguous runs, so a part is written in a handful of large writes.

import { workerData, parentPort } from 'worker_threads';
import { createWriteStream } from 'fs';
import { join } from 'path';

const FLUSH = 8 * 1024 * 1024; // batch entity slices into ~8 MB writes

// Reconstruct one part STEP file by copying its closure's raw bytes.
// p: { partIndex, count, offArr, lenArr } — entity byte ranges (any order).
async function writePart(fileBuf, jobDir, headerSection, p) {
  // entity ranges in ascending file order
  const order = Array.from({ length: p.count }, (_, i) => i)
    .sort((a, b) => p.offArr[a] - p.offArr[b]);

  // coalesce ranges that are exactly contiguous in the source file
  const runs = [];
  for (const i of order) {
    const start = p.offArr[i], end = start + p.lenArr[i];
    const last = runs.length ? runs[runs.length - 1] : null;
    if (last && last.end === start) last.end = end;
    else runs.push({ start, end });
  }

  const ws = createWriteStream(join(jobDir, `part-${p.partIndex}.stp`));
  let pending = [], pendingSize = 0;
  const flush = async () => {
    if (!pendingSize) return;
    const buf = pending.length === 1 ? pending[0] : Buffer.concat(pending, pendingSize);
    pending = []; pendingSize = 0;
    if (!ws.write(buf)) await new Promise(res => ws.once('drain', res));
  };
  const push = chunk => { pending.push(chunk); pendingSize += chunk.length; };

  push(Buffer.from(`ISO-10303-21;\n${headerSection}\nDATA;\n`));
  for (const r of runs) {
    push(fileBuf.subarray(r.start, r.end));
    if (pendingSize >= FLUSH) await flush();
  }
  push(Buffer.from('\nENDSEC;\nEND-ISO-10303-21;\n'));
  await flush();
  await new Promise((res, rej) => ws.end(err => err ? rej(err) : res()));
}

// Reconstruct a set of part STEP files. fileBuf is a Buffer over the full file.
export async function writeParts(fileBuf, jobDir, headerSection, parts) {
  for (const p of parts) await writePart(fileBuf, jobDir, headerSection, p);
}

// Worker entry point — reconstruct the parts assigned to this worker, copying
// entity bytes from the shared source file.
if (parentPort) {
  const { sab, jobDir, headerSection, parts } = workerData;
  writeParts(Buffer.from(sab), jobDir, headerSection, parts)
    .then(() => parentPort.postMessage('done'))
    .catch(err => parentPort.postMessage({ error: err.message }));
}
