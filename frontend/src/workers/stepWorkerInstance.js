import { useState, useEffect, useRef } from 'react';
import { useShellStore } from '../shell/shellStore';

const MAX_BYTES_PER_WORKER = 256 * 1024 * 1024;
const POOL_SIZE = Math.max(1, Math.min(navigator.hardwareConcurrency || 2, 4));

const pool = Array.from({ length: POOL_SIZE }, () =>
  new Worker(new URL('./stepWorker.js', import.meta.url), { type: 'module' })
);

// Route log events from all workers into the shell console
pool.forEach(w => {
  w.addEventListener('message', ({ data }) => {
    if (data.type !== 'log') return;
    useShellStore.getState().appendLog(data.level, data.message);
  });
});

function workerFor(uuid) {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) h = (h * 31 + uuid.charCodeAt(i)) >>> 0;
  return pool[h % POOL_SIZE];
}

export function clearWorkerCache({ idb = false } = {}) {
  pool.forEach(w => w.postMessage({ type: 'clear', idb }));
}

export function setWorkerMaxBytes(bytes) {
  pool.forEach(w => w.postMessage({ type: 'setMaxBytes', maxBytes: bytes }));
}

// Drop-in replacement for single Worker — routes load by UUID, broadcasts stats
export const stepWorker = {
  postMessage(data) {
    if (data.uuid) {
      workerFor(data.uuid).postMessage(data);
    } else {
      pool.forEach(w => w.postMessage(data));
    }
  },
  addEventListener(event, handler) {
    pool.forEach(w => w.addEventListener(event, handler));
  },
  removeEventListener(event, handler) {
    pool.forEach(w => w.removeEventListener(event, handler));
  },
};

const _emptyWorkerStats = () => ({
  entries: 0, cacheBytes: 0, maxBytes: MAX_BYTES_PER_WORKER,
  memHits: 0, idbHits: 0, netFetches: 0,
  avgDownloadMs: null, avgParseMs: null,
});

function _poolAvg(arr, key) {
  const vals = arr.map(x => x[key]).filter(v => v != null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}

export function useCacheStats() {
  const statsRef = useRef(pool.map(_emptyWorkerStats));
  const [, setTick] = useState(0);

  useEffect(() => {
    const handlers = pool.map((w, i) => {
      const h = ({ data }) => {
        if (data.type !== 'stats') return;
        statsRef.current[i] = {
          entries: data.entries, cacheBytes: data.cacheBytes, maxBytes: data.maxBytes ?? MAX_BYTES_PER_WORKER,
          memHits: data.memHits ?? 0, idbHits: data.idbHits ?? 0, netFetches: data.netFetches ?? 0,
          avgDownloadMs: data.avgDownloadMs ?? null, avgParseMs: data.avgParseMs ?? null,
        };
        setTick(t => t + 1);
      };
      w.addEventListener('message', h);
      w.postMessage({ type: 'stats' });
      return h;
    });
    return () => pool.forEach((w, i) => w.removeEventListener('message', handlers[i]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const arr = statsRef.current;
  return {
    workers:       POOL_SIZE,
    entries:       arr.reduce((s, x) => s + x.entries, 0),
    cacheBytes:    arr.reduce((s, x) => s + x.cacheBytes, 0),
    maxBytes:      arr.reduce((s, x) => s + x.maxBytes, 0),
    memHits:       arr.reduce((s, x) => s + x.memHits, 0),
    idbHits:       arr.reduce((s, x) => s + x.idbHits, 0),
    netFetches:    arr.reduce((s, x) => s + x.netFetches, 0),
    avgDownloadMs: _poolAvg(arr, 'avgDownloadMs'),
    avgParseMs:    _poolAvg(arr, 'avgParseMs'),
  };
}
