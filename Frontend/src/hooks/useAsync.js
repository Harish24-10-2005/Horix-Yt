import { useState, useCallback } from 'react';

export function useAsync(fn, deps = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true); setError(null);
    try { const v = await fn(...args); setValue(v); return v; }
    catch (e) { setError(e); throw e; }
    finally { setLoading(false); }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { execute, loading, error, value };
}
