import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const KeysContext = createContext(null);
const AUTH_BASE = process.env.REACT_APP_AUTH_BASE || 'http://localhost:8000/api/auth';

export function ApiKeysProvider({ children }) {
  const { user } = useAuth();
  const [keysState, setKeysState] = useState({ loading: false, presence: null, error: null });

  // Stable headers builder to satisfy hooks exhaustive-deps without re-running unnecessarily
  const headers = useCallback(() => (
    user? { 'Content-Type':'application/json', Authorization: `Bearer ${user.token}` } : { 'Content-Type':'application/json' }
  ), [user]);

  const fetchPresence = useCallback(async () => {
    if(!user) return;
    setKeysState(s=>({...s, loading:true, error:null}));
    try {
      const res = await fetch(`${AUTH_BASE}/api-keys`, { headers: headers() });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.detail || 'Failed to load');
      setKeysState({ loading:false, presence:data, error:null });
    } catch(e){
      setKeysState({ loading:false, presence:null, error:e.message });
    }
  }, [user, headers]);

  const saveKeys = useCallback(async (partial) => {
    if(!user) throw new Error('Not authenticated');
    const res = await fetch(`${AUTH_BASE}/api-keys`, { method:'PUT', headers: headers(), body: JSON.stringify(partial) });
    const data = await res.json().catch(()=>null);
    if(!res.ok) throw new Error(data?.detail || 'Save failed');
    setKeysState(s=>({...s, presence:data }));
    return data;
  }, [user, headers]);

  useEffect(()=>{ fetchPresence().catch(()=>{}); }, [fetchPresence]);

  return <KeysContext.Provider value={{ ...keysState, fetchPresence, saveKeys }}>{children}</KeysContext.Provider>;
}

export function useApiKeys(){ const ctx = useContext(KeysContext); if(!ctx) throw new Error('useApiKeys inside ApiKeysProvider'); return ctx; }
