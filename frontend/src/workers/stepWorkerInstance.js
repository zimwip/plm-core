import { useState, useEffect } from 'react';

export const stepWorker = new Worker(
  new URL('./stepWorker.js', import.meta.url),
  { type: 'module' },
);

export function useCacheStats() {
  const [stats, setStats] = useState({ entries: 0, cacheBytes: 0, maxBytes: 256 * 1024 * 1024 });
  useEffect(() => {
    const handler = ({ data }) => {
      if (data.type === 'stats') setStats({ entries: data.entries, cacheBytes: data.cacheBytes, maxBytes: data.maxBytes });
    };
    stepWorker.addEventListener('message', handler);
    stepWorker.postMessage({ type: 'stats' });
    return () => stepWorker.removeEventListener('message', handler);
  }, []);
  return stats;
}
