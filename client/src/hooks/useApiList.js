import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function useApiList(path, fallback = [], params = {}) {
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
  const queryString = query.toString();
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`${path}${queryString ? `?${queryString}` : ''}`)
      .then(response => { if (!cancelled) setItems(response.data.data.items || []); })
      .catch(() => { if (!cancelled) setItems(fallback); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path, queryString]);
  return { items, loading };
}
