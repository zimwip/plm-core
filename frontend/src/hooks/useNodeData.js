import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useNodeData(userId, nodeId) {
  const [signatures, setSignatures] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!nodeId) return;
    setLoading(true);
    setError(null);
    try {
      const [sigs, hist] = await Promise.all([
        api.getSignatures(userId, nodeId).catch(() => []),
        api.getVersionHistory(userId, nodeId).catch(() => []),
      ]);
      setSignatures(Array.isArray(sigs) ? sigs : []);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId, nodeId]);

  useEffect(() => { load(); }, [load]);

  return { signatures, history, loading, error, reload: load };
}
