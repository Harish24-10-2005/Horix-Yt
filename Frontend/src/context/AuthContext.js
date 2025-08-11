import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_AUTH_BASE || 'http://localhost:8000/api/auth';

async function api(path, { method='POST', body } = {}) {
	let res;
	try {
		res = await fetch(`${API_BASE}${path}`, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: body ? JSON.stringify(body) : undefined
		});
	} catch (e) {
		throw new Error('Cannot reach auth server. Is backend running on 8000?');
	}
	let data = null;
	try { data = await res.json(); } catch (_) {}
	if (!res.ok) {
		throw new Error(data?.detail || data?.message || `Auth request failed (${res.status})`);
	}
	return data;
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null); // { token, user_id, email, display_name }
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Load from sessionStorage only (fresh login required each new browser session)
	useEffect(() => {
		const raw = sessionStorage.getItem('auth');
		if(raw){ try { setUser(JSON.parse(raw)); } catch(_){} }
	}, []);

	const persist = (u) => { setUser(u); if(u) sessionStorage.setItem('auth', JSON.stringify(u)); else sessionStorage.removeItem('auth'); };

	const register = useCallback(async ({ email, password, display_name }) => {
		setLoading(true); setError(null);
		try {
			const data = await api('/register', { body: { email, password, display_name } });
			persist(data);
			return data;
		} catch(e){ setError(e.message); throw e; }
		finally { setLoading(false); }
	}, []);

	const login = useCallback(async ({ email, password }) => {
		setLoading(true); setError(null);
		try {
			const data = await api('/login', { body: { email, password } });
			persist(data);
			return data;
		} catch(e){ setError(e.message); throw e; }
		finally { setLoading(false); }
	}, []);

	const logout = useCallback(() => { persist(null); }, []);

	// Profile helpers
	const fetchProfile = useCallback(async () => {
		if(!user?.token) return null;
		try {
			const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${user.token}` }});
			if(!res.ok) return null; const data = await res.json();
			return data;
		} catch { return null; }
	}, [user]);

	const updateProfile = useCallback(async ({ display_name, theme_pref }) => {
		if(!user?.token) throw new Error('Not authenticated');
		const res = await fetch(`${API_BASE}/profile`, { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${user.token}`}, body: JSON.stringify({ display_name, theme_pref }) });
		const data = await res.json().catch(()=>null);
		if(!res.ok) throw new Error(data?.detail || 'Update failed');
		persist({ ...user, display_name: data.display_name, theme_pref: data.theme_pref });
		return data;
	}, [user]);

	const changePassword = useCallback( async ({ old_password, new_password }) => {
		if(!user?.token) throw new Error('Not authenticated');
		const res = await fetch(`${API_BASE}/change-password`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${user.token}`}, body: JSON.stringify({ old_password, new_password }) });
		const data = await res.json().catch(()=>null);
		if(!res.ok) throw new Error(data?.detail || 'Password change failed');
		return true;
	}, [user]);

	const value = { user, loading, error, login, register, logout, fetchProfile, updateProfile, changePassword };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
	const ctx = useContext(AuthContext);
	if(!ctx) throw new Error('useAuth must be inside AuthProvider');
	return ctx;
}
