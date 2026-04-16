import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useLinkData(userId, nodeId) {
  const [childLinks, setChildLinks] = useState([]);
  const [parentLinks, setParentLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!nodeId) return;
    setLoading(true);
    try {
      const [children, parents] = await Promise.all([
        api.getChildLinks(userId, nodeId).catch(() => []),
        api.getParentLinks(userId, nodeId).catch(() => []),
      ]);
      setChildLinks(Array.isArray(children) ? children : []);
      setParentLinks(Array.isArray(parents) ? parents : []);
    } finally {
      setLoading(false);
    }
  }, [userId, nodeId]);

  useEffect(() => { load(); }, [load]);

  return { childLinks, parentLinks, loading, reload: load };
}
