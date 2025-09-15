// Centralized API client for backend collaboration
const DEFAULT_BASE = (typeof process.env.REACT_APP_API_BASE === 'string' && process.env.REACT_APP_API_BASE !== '')
  ? process.env.REACT_APP_API_BASE
  : 'http://localhost:8000/api/video';

async function request(path, { method = 'GET', headers = {}, body, json = true, formData } = {}) {
  const url = `${DEFAULT_BASE}${path}`;
  let options = { method, headers: { ...headers } };
  try {
    const rawAuth = sessionStorage.getItem('auth') || localStorage.getItem('auth');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.user_id) {
        // Backend expects custom header x_user_id (underscore variant)
        options.headers['x_user_id'] = parsed.user_id;
      }
      if (parsed?.token) {
        options.headers['Authorization'] = `Bearer ${parsed.token}`; // reserved for future secured endpoints
      }
    }
  } catch (_) {}
  if (formData) {
    options.body = formData; // browser sets multipart headers automatically
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  let data;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok || (data && data.status === 'error')) {
    const msg = (data && (data.message || data.detail)) || `Request failed ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  setVideoMode: (video_mode) => request('/set-video-mode', { method: 'POST', body: { video_mode } }),
  generateContent: (payload) => request('/content', { method: 'POST', body: payload }),
  generateScripts: (payload) => request('/scripts', { method: 'POST', body: payload }),
  generateImages: (payload) => request('/images', { method: 'POST', body: payload }),
  modifyImage: (payload) => request('/modify-image', { method: 'POST', body: payload }),
  uploadCustomVoice: (file) => {
    const fd = new FormData();
    fd.append('voice_file', file);
    return request('/custom-voice', { method: 'POST', formData: fd });
  },
  generateVoices: (payload) => request('/voices', { method: 'POST', body: payload }),
  editVideo: (payload) => request('/edit', { method: 'POST', body: payload }),
  uploadMusic: (file) => { const fd = new FormData(); fd.append('music_file', file); return request('/upload-music', { method: 'POST', formData: fd }); },
  addBackgroundMusic: (payload) => request('/bgmusic', { method: 'POST', body: payload }),
  addCaptions: (payload) => request('/captions', { method: 'POST', body: payload }),
};

const RAW_ASSET_BASE = process.env.REACT_APP_ASSET_BASE;
export const assets = {
  // If env is defined (even empty string), respect it; else fallback to localhost
  base: (typeof RAW_ASSET_BASE === 'string') ? RAW_ASSET_BASE : 'http://localhost:8000',
  full: (p) => {
    if (!p) return '';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    // Support empty base for same-origin
    const base = assets.base || '';
    return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
  }
};
