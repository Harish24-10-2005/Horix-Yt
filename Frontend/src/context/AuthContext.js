import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_API = 'http://localhost:8000/api/auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(()=> localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(()=> {
    const raw = localStorage.getItem('auth_user');
    return raw? JSON.parse(raw): null;
  });
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [error, setError] = useState(null);

  const persist = (t,u)=>{ if(t){ localStorage.setItem('auth_token', t);} else { localStorage.removeItem('auth_token'); } if(u){ localStorage.setItem('auth_user', JSON.stringify(u)); } else { localStorage.removeItem('auth_user'); } };

  const signup = async (email, password, display_name)=>{
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${AUTH_API}/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, display_name }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.detail || data.message || 'Signup failed');
      setToken(data.token); setUser(data.user); persist(data.token, data.user); return data.user;
    } catch(e){ setError(e.message); throw e; } finally { setLoading(false);} };

  const login = async (email, password)=>{
    setLoading(true); setError(null);
    try { const res = await fetch(`${AUTH_API}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) }); const data = await res.json(); if(!res.ok) throw new Error(data.detail || data.message || 'Login failed'); setToken(data.token); setUser(data.user); persist(data.token, data.user); return data.user; } catch(e){ setError(e.message); throw e; } finally { setLoading(false);} };

  const logout = ()=>{ setToken(null); setUser(null); setGallery([]); setGalleryLoaded(false); persist(null,null); };

  const authHeaders = useCallback(()=> token? { Authorization: `Bearer ${token}` } : {}, [token]);

  const fetchGallery = useCallback(async ()=>{
    if(!token) return []; setLoading(true); setError(null);
    try { const res = await fetch(`${AUTH_API}/gallery`, { headers: { ...authHeaders() } }); const data = await res.json(); if(!res.ok) throw new Error(data.detail || data.message || 'Failed to load gallery'); setGallery(data.assets || []); setGalleryLoaded(true); return data.assets; } catch(e){ setError(e.message); throw e; } finally { setLoading(false);} }, [token, authHeaders]);

  const addAsset = async (asset)=>{ if(!token) throw new Error('Auth required'); setError(null); const res = await fetch(`${AUTH_API}/gallery`, { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify(asset) }); const data = await res.json(); if(!res.ok) throw new Error(data.detail || data.message || 'Add asset failed'); setGallery(g=> [data.asset, ...g]); return data.asset; };

  const deleteAsset = async (id)=>{ if(!token) return; const res = await fetch(`${AUTH_API}/gallery/${id}`, { method:'DELETE', headers:{...authHeaders()} }); if(res.ok){ setGallery(g=> g.filter(a=> a.id!==id)); } };

  useEffect(()=>{ if(token && !galleryLoaded){ fetchGallery().catch(()=>{}); } }, [token, galleryLoaded, fetchGallery]);

  return <AuthContext.Provider value={{ token, user, loading, error, signup, login, logout, gallery, fetchGallery, addAsset, deleteAsset, authHeaders }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth(){ return useContext(AuthContext); }
