// OCCT conversion worker pool.
//
// Each worker holds its own occt-import-js (WASM) instance. `run(stepBuffer)`
// queues a conversion; tasks dispatch to idle workers, so up to `size`
// conversions run in parallel — the way to convert an assembly's split parts
// concurrently. A crashed worker (e.g. WASM OOM on a huge part) is replaced.

import { Worker } from 'worker_threads';

export class ConvertPool {
  constructor(size) {
    this.url = new URL('./worker-convert.js', import.meta.url);
    this.idle = [];
    this.queue = [];
    for (let i = 0; i < size; i++) this.idle.push(this._spawn());
  }

  _spawn() {
    const w = new Worker(this.url);
    w.task = null;
    w.on('message', msg => {
      const task = w.task;
      w.task = null;
      this.idle.push(w);
      if (task) {
        if (msg.error) task.reject(new Error(msg.error));
        else task.resolve({ glb: Buffer.from(msg.glb), meshCount: msg.meshCount });
      }
      this._pump();
    });
    w.on('error', err => {
      if (w.task) { w.task.reject(err); w.task = null; }
      const i = this.idle.indexOf(w);
      if (i !== -1) this.idle.splice(i, 1);
      this.idle.push(this._spawn());
      this._pump();
    });
    return w;
  }

  // run(stepBuffer) → Promise<{ glb: Buffer, meshCount: number }>
  run(stepBuffer) {
    return new Promise((resolve, reject) => {
      this.queue.push({ stepBuffer, resolve, reject });
      this._pump();
    });
  }

  _pump() {
    while (this.idle.length && this.queue.length) {
      const w = this.idle.pop();
      const task = this.queue.shift();
      w.task = task;
      const b = task.stepBuffer;
      const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      w.postMessage({ step: ab }, [ab]);
    }
  }
}
