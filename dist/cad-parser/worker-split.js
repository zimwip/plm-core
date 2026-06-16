import{createRequire as ___cr}from'module';import{fileURLToPath as ___f}from'url';import{dirname as ___d}from'path';const require=___cr(import.meta.url),__filename=___f(import.meta.url),__dirname=___d(__filename);

// worker-split.js
import { workerData, parentPort } from "worker_threads";
import { createWriteStream } from "fs";
import { join } from "path";
var FLUSH = 8 * 1024 * 1024;
async function writePart(fileBuf, jobDir, headerSection, p) {
  const order = Array.from({ length: p.count }, (_, i) => i).sort((a, b) => p.offArr[a] - p.offArr[b]);
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
    pending = [];
    pendingSize = 0;
    if (!ws.write(buf)) await new Promise((res) => ws.once("drain", res));
  };
  const push = (chunk) => {
    pending.push(chunk);
    pendingSize += chunk.length;
  };
  push(Buffer.from(`ISO-10303-21;
${headerSection}
DATA;
`));
  for (const r of runs) {
    push(fileBuf.subarray(r.start, r.end));
    if (pendingSize >= FLUSH) await flush();
  }
  push(Buffer.from("\nENDSEC;\nEND-ISO-10303-21;\n"));
  await flush();
  await new Promise((res, rej) => ws.end((err) => err ? rej(err) : res()));
}
async function writeParts(fileBuf, jobDir, headerSection, parts) {
  for (const p of parts) await writePart(fileBuf, jobDir, headerSection, p);
}
if (parentPort) {
  const { sab, jobDir, headerSection, parts } = workerData;
  writeParts(Buffer.from(sab), jobDir, headerSection, parts).then(() => parentPort.postMessage("done")).catch((err) => parentPort.postMessage({ error: err.message }));
}
export {
  writeParts
};
