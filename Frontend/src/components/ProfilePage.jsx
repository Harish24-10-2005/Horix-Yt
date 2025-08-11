import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiEdit2, FiRefreshCw, FiShield, FiUser, FiLock, FiKey, FiSun, FiMoon } from 'react-icons/fi';
import { ApiKeysPanel } from './ApiKeysPanel';
import { useAuth } from '../context/AuthContext';
// Removed unused icon imports (FiTrash2, FiImage, FiType)

// Animations & helpers
const fade = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-10} };
const glow = keyframes`0%,100%{opacity:.25;transform:translate3d(0,0,0);}50%{opacity:.6;transform:translate3d(0,-12px,0);}`;
// Removed unused pulse animation

// Layout containers
const Page = styled.div`position:relative;max-width:940px;margin:0 auto 4rem;padding:0 1rem;`;
const Hero = styled.div`position:relative;margin-top:1.2rem;padding:3.2rem 2.2rem 2.2rem;border-radius:38px;overflow:hidden;
  background:${p=> p.theme.isDark
    ? 'linear-gradient(140deg,#1d1b28,#14121c)'
    : 'linear-gradient(140deg,#ffffff,#f3f1ff)'};
  border:1px solid ${p=>p.theme.colors.border};
  box-shadow:0 18px 55px -18px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.04);color:${p=>p.theme.colors.text};transition:background .45s,color .45s;`;
const HeroFX = styled.div`position:absolute;inset:0;pointer-events:none;`;
const Orb = styled.div`position:absolute;width:560px;height:560px;top:-240px;left:-160px;background:${p=> p.theme.isDark
  ? 'radial-gradient(circle at 30% 30%,rgba(127,90,240,.55),transparent 70%)'
  : 'radial-gradient(circle at 30% 30%,rgba(127,90,240,.35),transparent 70%)'};filter:blur(90px);animation:${glow} 14s ease-in-out infinite;transition:background .6s;`;
const Orb2 = styled(Orb)`top:auto;bottom:-260px;left:auto;right:-200px;background:${p=> p.theme.isDark
  ? 'radial-gradient(circle at 70% 70%,rgba(86,190,255,.45),transparent 70%)'
  : 'radial-gradient(circle at 70% 70%,rgba(86,190,255,.30),transparent 70%)'};animation-duration:18s;animation-delay:-4s;`;
const HeroInner = styled.div`position:relative;display:flex;flex-wrap:wrap;align-items:flex-start;gap:2.5rem;z-index:1;`;

// Avatar block
const AvatarWrap = styled.div`position:relative;width:140px;height:140px;border-radius:36px;background:${p=> p.theme.isDark
  ? 'linear-gradient(135deg,#272432,#1a1822)'
  : 'linear-gradient(135deg,#f6f3ff,#ece8ff)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid ${p=>p.theme.colors.border};box-shadow:0 6px 28px -10px rgba(0,0,0,.25);transition:background .45s;`;
const AvatarInitial = styled.span`font-size:3rem;font-weight:600;letter-spacing:-1px;background:linear-gradient(135deg,#7f5af0,#2cb67d);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`; 
const AvatarBadge = styled(motion.button)`position:absolute;bottom:10px;right:10px;background:#7f5af0;border:none;color:#fff;border-radius:14px;padding:.45rem .65rem;display:inline-flex;align-items:center;gap:.25rem;font-size:.6rem;letter-spacing:.1em;font-weight:600;cursor:pointer;box-shadow:0 6px 22px -10px rgba(127,90,240,.6);
  &:hover{background:#6f4ed7;} &:active{transform:translateY(1px);} `;

// Head info
const HeadInfo = styled.div`flex:1;min-width:260px;display:flex;flex-direction:column;gap:1rem;`;
const NameRow = styled.div`display:flex;align-items:center;gap:.85rem;flex-wrap:wrap;`;
const DisplayName = styled.h1`margin:0;font-size:clamp(1.8rem,3vw,2.6rem);line-height:1.05;font-weight:600;letter-spacing:-.5px;`;
const Tag = styled.span`padding:.35rem .7rem;border-radius:999px;background:${p=> p.theme.isDark? 'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'};border:1px solid ${p=>p.theme.colors.border};font-size:.6rem;letter-spacing:.15em;font-weight:600;text-transform:uppercase;`;
const Meta = styled.div`font-size:.7rem;letter-spacing:.1em;opacity:.6;text-transform:uppercase;display:flex;flex-wrap:wrap;gap:1rem;`;

// Tabs
const Tabs = styled.div`margin-top:2.6rem;display:flex;gap:.65rem;border-bottom:1px solid ${p=>p.theme.colors.border};flex-wrap:wrap;`;
const TabBtn = styled.button`background:none;border:none;position:relative;padding:.85rem 1.15rem;font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${p=>p.active? p.theme.colors.text : p.theme.colors.textSecondary};cursor:pointer;transition:.35s;border-radius:12px;display:inline-flex;align-items:center;gap:.45rem;
  &:hover{color:${p=>p.theme.colors.text};background:${p=> p.theme.isDark? 'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'};} &:after{content:'';position:absolute;left:12px;right:12px;bottom:0;height:3px;border-radius:4px;background:${p=>p.theme.colors.gradientPrimary};opacity:${p=>p.active?1:0};transform:translateY(4px);transition:.45s cubic-bezier(.6,.2,.25,1);} }`;

// Panels
const PanelWrap = styled(motion.div)`margin-top:1.8rem;display:grid;gap:1.6rem;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));`;
const Panel = styled(motion.div)`position:relative;padding:1.6rem 1.4rem 1.55rem;border:1px solid ${p=>p.theme.colors.border};border-radius:26px; 
  background:${p=> p.theme.isDark
    ? 'linear-gradient(155deg,rgba(255,255,255,.05),rgba(255,255,255,.02))'
    : 'linear-gradient(155deg,rgba(0,0,0,.05),rgba(0,0,0,.02))'};backdrop-filter:blur(14px) saturate(180%);box-shadow:0 10px 45px -18px rgba(0,0,0,.25);overflow:hidden;transition:background .45s,color .45s;`;
const PanelTitle = styled.h3`margin:0 0 1.1rem;font-size:1rem;letter-spacing:.05em;font-weight:600;display:flex;align-items:center;gap:.55rem;`;

// Form bits
const Field = styled.div`display:flex;flex-direction:column;gap:.45rem;margin-bottom:1rem;`;
const Label = styled.label`font-size:.55rem;letter-spacing:.18em;font-weight:600;text-transform:uppercase;opacity:.65;`;
const Input = styled.input`background:${p=> p.theme.isDark? 'rgba(255,255,255,.07)':'rgba(0,0,0,.04)'};border:1px solid ${p=>p.theme.colors.border};padding:.8rem .9rem;border-radius:14px;color:${p=>p.theme.colors.text};font-size:.85rem;outline:none;transition:.35s;width:100%;font-family:inherit;
  &:focus{border-color:${p=>p.theme.colors.primary};box-shadow:0 0 0 3px ${p=>p.theme.colors.primaryTransparent};} &:disabled{opacity:.5;cursor:not-allowed;}`;
const ButtonRow = styled.div`display:flex;align-items:center;flex-wrap:wrap;gap:.9rem;margin-top:.25rem;`;
const Button = styled.button`background:${p=>p.theme.colors.gradientPrimary};border:none;color:#fff;padding:.75rem 1.15rem;border-radius:14px;font-size:.7rem;letter-spacing:.1em;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:.45rem;transition:.4s;position:relative;overflow:hidden;
  &:disabled{opacity:.55;cursor:not-allowed;} &:hover:not(:disabled){filter:brightness(1.12);} &:active{transform:translateY(1px);} `;
const GhostBtn = styled(Button)`background:${p=> p.theme.isDark? 'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'};color:${p=>p.theme.colors.text};box-shadow:none; &:hover{background:${p=> p.theme.isDark? 'rgba(255,255,255,.14)':'rgba(0,0,0,.14)'};}`;
const Helper = styled.div`font-size:.6rem;letter-spacing:.08em;opacity:.55;text-transform:uppercase;margin-top:-.3rem;margin-bottom:.7rem;`;

// Skeletons
const shimmer = keyframes`0%{background-position:-450px 0}100%{background-position:450px 0}`;
const Skeleton = styled.div`height:${p=>p.h||'14px'};width:${p=>p.w||'100%'};border-radius:8px;background:${p=> p.theme.isDark
  ? 'linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.12) 50%,rgba(255,255,255,.05) 75%)'
  : 'linear-gradient(90deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.12) 50%,rgba(0,0,0,.05) 75%)'};background-size:900px 100%;animation:${shimmer} 2.2s linear infinite;`;

// Toast messages
const ToastWrap = styled(motion.div)`position:fixed;bottom:22px;right:22px;display:flex;flex-direction:column;gap:.7rem;z-index:4000;`; 
const Toast = styled(motion.div)`display:flex;align-items:flex-start;gap:.65rem;padding:.85rem 1rem 1rem;border-radius:16px;font-size:.7rem;letter-spacing:.05em;line-height:1.35;font-weight:500;
  background:${p=>{
    if(p.variant==='error') return p.theme.isDark? 'linear-gradient(135deg,#3a1218,#220a0f)':'#ffe6e8';
    return p.theme.isDark? 'linear-gradient(135deg,#11291d,#0b1c15)':'#e6f7f0';
  }};color:${p=>p.theme.colors.text};
  border:1px solid ${p=>p.variant==='error'? (p.theme.isDark? 'rgba(255,77,79,.45)':'#ffb3b8'):(p.theme.isDark? 'rgba(82,196,26,.5)':'#a4e2c1')};box-shadow:0 8px 28px -14px rgba(0,0,0,.25);`;

// Theme preference buttons
const ThemeOptionsRow = styled.div`display:flex;gap:.6rem;`;
const ThemeOption = styled.button`padding:.55rem .9rem;border-radius:12px;border:1px solid ${p=> p.active? p.theme.colors.primary : p.theme.colors.border};background:${p=> p.active? p.theme.colors.primaryTransparent : (p.theme.isDark? 'rgba(255,255,255,.08)':'rgba(0,0,0,.05)')};color:${p=>p.theme.colors.text};cursor:pointer;display:flex;align-items:center;gap:6px;font-size:.65rem;transition:.3s; 
  &:hover{background:${p=> p.active? p.theme.colors.primaryTransparent : (p.theme.isDark? 'rgba(255,255,255,.12)':'rgba(0,0,0,.08)')};}`;

export function ProfilePage(){
  const { user, fetchProfile, updateProfile, changePassword } = useAuth();
  const [profile,setProfile] = useState(null);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState('profile');
  const [displayName,setDisplayName] = useState('');
  const [saving,setSaving] = useState(false);
  const [themePref,setThemePref] = useState(null);
  const [pw,setPw] = useState({ old:'', neo:'' });
  const [pwSaving,setPwSaving] = useState(false);
  const [toasts,setToasts] = useState([]); // {id,msg,type}
  const [avatarUrl,setAvatarUrl] = useState(null);
  const idRef = useRef(0);

  const pushToast = useCallback((msg,type='ok',ttl=3800)=>{ const id = ++idRef.current; setToasts(t=>[...t,{id,msg,type}]); setTimeout(()=> setToasts(t=> t.filter(x=>x.id!==id)), ttl); },[]);

  // Initial profile & avatar load
  useEffect(()=>{ (async()=>{ setLoading(true); const p = await fetchProfile(); if(p){ setProfile(p); setDisplayName(p.display_name||''); setThemePref(p.theme_pref||null); }
    // Attempt to load avatar
    try {
      if(user?.user_id){
        const res = await fetch(`http://localhost:8000/api/video/user/${user.user_id}/avatar`);
        if(res.ok){
          // Cache-bust by appending timestamp (avoid stale image)
            setAvatarUrl(`http://localhost:8000/api/video/user/${user.user_id}/avatar?t=${Date.now()}`);
        }
      }
    } catch { /* ignore */ }
  setLoading(false); })(); },[fetchProfile,user,pushToast]);
  // NOTE: pushToast intentionally omitted from deps (stable ref) to avoid duplicate initial fetch.

  if(!user) return null;

  const initial = (displayName || user.email||'?').trim()[0]?.toUpperCase()||'?';
  const created = profile? new Date(profile.created_at*1000).toLocaleString(): '';

  const saveName = async ()=>{ if(!displayName.trim()) return; setSaving(true); try { await updateProfile({ display_name: displayName.trim(), theme_pref: themePref }); pushToast('Profile updated','ok'); } catch(e){ pushToast(e.message||'Update failed','error'); } finally { setSaving(false);} };
  const savePw = async ()=>{ if(pw.neo.length<6) { pushToast('Password too short','error'); return; } setPwSaving(true); try { await changePassword({ old_password: pw.old, new_password: pw.neo }); pushToast('Password changed','ok'); setPw({ old:'', neo:'' }); } catch(e){ pushToast(e.message||'Password change failed','error'); } finally { setPwSaving(false);} };

  return (
    <Page>
      <Hero as={motion.div} initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.7,ease:[.25,.6,.3,1]}}>
        <HeroFX><Orb /><Orb2 /></HeroFX>
        <HeroInner>
          <AvatarWrap as={motion.div} initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:.15,type:'spring',stiffness:220,damping:20}}>
            {loading? <Skeleton h="48px" w="48px" /> : (
              avatarUrl ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:36}} /> : <AvatarInitial>{initial}</AvatarInitial>
            )}
            <AvatarBadge whileTap={{scale:.9}} whileHover={{scale:1.05}} onClick={()=> document.getElementById('avatarInput')?.click()}>{<FiEdit2 size={14}/> } Edit</AvatarBadge>
            <input id="avatarInput" type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{ const file=e.target.files?.[0]; if(!file) return; const fd=new FormData(); fd.append('file',file); try { const r= await fetch(`http://localhost:8000/api/video/user/${user.user_id}/avatar`,{method:'POST',body:fd}); if(r.ok){ pushToast('Avatar updated'); setAvatarUrl(`http://localhost:8000/api/video/user/${user.user_id}/avatar?t=${Date.now()}`); } else pushToast('Avatar upload failed','error'); } catch{ pushToast('Avatar upload failed','error'); } finally { e.target.value=''; }}} />
          </AvatarWrap>
          <HeadInfo>
            <NameRow>
              {loading? <Skeleton h="34px" w="200px" /> : <DisplayName>{displayName || 'Unnamed User'}</DisplayName>}
              <Tag>USER</Tag>
            </NameRow>
            <Meta>
              {loading? <Skeleton w="130px" /> : <span>Created {created}</span>}
              <span>Id {user.user_id.slice(0,8)}…</span>
              <span>{user.email}</span>
            </Meta>
          </HeadInfo>
        </HeroInner>
        <Tabs>
          <TabBtn active={tab==='profile'} onClick={()=>setTab('profile')}><FiUser size={14}/> Profile</TabBtn>
          <TabBtn active={tab==='security'} onClick={()=>setTab('security')}><FiShield size={14}/> Security</TabBtn>
          <TabBtn active={tab==='gallery'} onClick={()=>setTab('gallery')}><FiLock size={14}/> Gallery</TabBtn>
          <TabBtn active={tab==='keys'} onClick={()=>setTab('keys')}><FiKey size={14}/> API Keys</TabBtn>
        </Tabs>

        <AnimatePresence mode="wait" initial={false}>
          {tab==='profile' && (
            <PanelWrap key="profile" variants={fade} initial="initial" animate="animate" exit="exit" transition={{duration:.4}}>
              <Panel layout variants={fade} initial="initial" animate="animate" transition={{delay:.05}}>
                <PanelTitle><FiUser size={16}/> Basic Info</PanelTitle>
                <Field>
                  <Label>Email</Label>
                  {loading? <Skeleton h="40px" /> : <Input value={user.email} disabled />}
                </Field>
                <Field>
                  <Label>Display Name</Label>
                  {loading? <Skeleton h="40px" /> : <Input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" />}
                </Field>
                <Field>
                  <Label>Theme Preference</Label>
                  {loading? <Skeleton h="40px" /> : (
                    <ThemeOptionsRow>
                      <ThemeOption type="button" active={themePref==='light'} onClick={()=>setThemePref('light')}><FiSun/> Light</ThemeOption>
                      <ThemeOption type="button" active={themePref==='dark'} onClick={()=>setThemePref('dark')}><FiMoon/> Dark</ThemeOption>
                      <ThemeOption type="button" active={themePref===null} onClick={()=>setThemePref(null)}>System</ThemeOption>
                    </ThemeOptionsRow>
                  )}
                </Field>
                <Helper>Manage your profile details & theme</Helper>
                <ButtonRow>
                  <Button disabled={saving || loading || !displayName.trim()} onClick={saveName}>{saving? <><FiRefreshCw size={14}/> Saving...</>: <><FiCheckCircle size={14}/> Save Changes</>}</Button>
                  <GhostBtn type="button" disabled={loading} onClick={()=> { setDisplayName(profile?.display_name||''); setThemePref(profile?.theme_pref||null);} }>Reset</GhostBtn>
                </ButtonRow>
              </Panel>
            </PanelWrap>
          )}
          {tab==='security' && (
            <PanelWrap key="security" variants={fade} initial="initial" animate="animate" exit="exit" transition={{duration:.4}}>
              <Panel layout variants={fade} initial="initial" animate="animate" transition={{delay:.05}}>
                <PanelTitle><FiLock size={16}/> Change Password</PanelTitle>
                <Field>
                  <Label>Current Password</Label>
                  <Input type="password" value={pw.old} onChange={e=>setPw(p=>({...p,old:e.target.value}))} placeholder="••••••" />
                </Field>
                <Field>
                  <Label>New Password</Label>
                  <Input type="password" value={pw.neo} onChange={e=>setPw(p=>({...p,neo:e.target.value}))} placeholder="At least 6 characters" />
                </Field>
                <Helper>Password is locally validated then securely updated</Helper>
                <ButtonRow>
                  <Button disabled={pwSaving || pw.neo.length<6 || !pw.old} onClick={savePw}>{pwSaving? <><FiRefreshCw size={14}/> Updating...</>: <>Update Password</>}</Button>
                  <GhostBtn type="button" onClick={()=> setPw({ old:'', neo:'' })} disabled={pwSaving}>Clear</GhostBtn>
                </ButtonRow>
              </Panel>
            </PanelWrap>
          )}
          {tab==='gallery' && (
            <GalleryPanel user={user} pushToast={pushToast} />
          )}
          {tab==='keys' && (
            <PanelWrap key="keys" variants={fade} initial="initial" animate="animate" exit="exit" transition={{duration:.4}}>
              <Panel layout variants={fade} initial="initial" animate="animate" transition={{delay:.05}}>
                <PanelTitle><FiKey size={16}/> API Keys</PanelTitle>
                <ApiKeysPanel />
              </Panel>
            </PanelWrap>
          )}
        </AnimatePresence>
      </Hero>

      <AnimatePresence>
        {toasts.length>0 && (
      <ToastWrap initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:30}}>
            {toasts.map(t => (
        <Toast key={t.id} variant={t.type==='error'? 'error':'ok'} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}} transition={{type:'spring',stiffness:300,damping:28}}>
                {t.type==='error'? '⚠️':'✅'} {t.msg}
              </Toast>
            ))}
          </ToastWrap>
        )}
      </AnimatePresence>
    </Page>
  );
}

const GalleryGrid = styled(motion.div)`margin-top:1.6rem;display:grid;gap:1.2rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));`;
const GalleryItem = styled(motion.button)`position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(140deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border-radius:22px;cursor:pointer;display:flex;flex-direction:column;align-items:stretch;padding:0;text-align:left;color:#fff;`;
const Thumb = styled.div`aspect-ratio:16/9;width:100%;background:radial-gradient(circle at 30% 35%,rgba(127,90,240,.5),rgba(0,0,0,.9));display:flex;align-items:center;justify-content:center;font-size:2.2rem;`;
const FileMeta = styled.div`padding:.75rem .9rem .85rem;display:flex;flex-direction:column;gap:.3rem;font-size:.65rem;letter-spacing:.07em;text-transform:uppercase;`;
const ModalBackdrop = styled(motion.div)`position:fixed;inset:0;background:rgba(8,6,15,.78);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:center;z-index:5000;padding:2rem;`;
const Modal = styled(motion.div)`width:100%;max-width:960px;background:linear-gradient(140deg,#1d1b26,#14121b);border:1px solid rgba(255,255,255,.08);border-radius:28px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 65px -20px rgba(0,0,0,.65);`;
const ModalHead = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.08);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;`;
const CloseBtn = styled.button`background:none;border:none;color:#fff;cursor:pointer;font-size:1.2rem;`;

function GalleryPanel({ user, pushToast }){
   const [items,setItems] = useState([]);
   const [loading,setLoading] = useState(true);
   const [open,setOpen] = useState(null); // selected item
   const [renaming,setRenaming] = useState(null);
   const [newName,setNewName] = useState('');
   const retryTimers = useRef([]);
   const [pending,setPending] = useState({}); // key -> {type, attempts, payload}
   const MAX_ATTEMPTS = 3;

   const fetchWithRetry = async (exec, key, onSuccess, onFail) => {
     const attempt = (prevAttempts=0) => {
       exec().then(res => {
         if(res === false){ throw new Error('op-failed'); }
     onSuccess && onSuccess(res);
         setPending(p => { const cp = {...p}; delete cp[key]; return cp; });
       }).catch(err => {
         const nextAttempts = prevAttempts + 1;
         if(nextAttempts < MAX_ATTEMPTS){
           const delay = 500 * Math.pow(1.6, prevAttempts);
           retryTimers.current.push(setTimeout(()=>attempt(nextAttempts), delay));
           setPending(p => ({...p,[key]:{...p[key], attempts: nextAttempts}}));
         } else {
           onFail && onFail(err);
           pushToast((err?.message||'Action failed')+' (give up)','error');
           setPending(p => { const cp={...p}; delete cp[key]; return cp; });
         }
       });
     };
     setPending(p => ({...p,[key]:{type: key.split(':')[0], attempts:0}}));
     attempt(0);
   };

   useEffect(()=> () => { retryTimers.current.forEach(t=>clearTimeout(t)); },[]);
  useEffect(()=>{ (async()=>{ if(!user) return; setLoading(true); try { const r = await fetch(`http://localhost:8000/api/video/user/${user.user_id}/gallery`); const j = await r.json(); if(j.items) setItems(j.items); } catch(e){ pushToast('Gallery load failed','error'); } finally { setLoading(false); } })(); },[user,pushToast]);
   const doDelete = (name)=>{ if(!window.confirm('Delete '+name+' ?')) return; // optimistic removal
     const snapshot = items;
     setItems(it=> it.filter(x=>x.name!==name));
     fetchWithRetry(
       () => fetch(`http://localhost:8000/api/video/user/${user.user_id}/gallery/file/${name}`,{method:'DELETE'}).then(r=> r.ok || false),
       'delete:'+name,
       () => { pushToast('Deleted','ok'); },
       () => { setItems(snapshot); }
     );
   };
   const startRename = (it)=>{ setRenaming(it.name); setNewName(it.name.replace(/\.[^.]+$/,'')); };
   const submitRename = (it)=>{ const orig = it.name; const baseNew = newName; if(!baseNew.trim()) { pushToast('Name required','error'); return; }
     // optimistic
     setItems(list=> list.map(x=> x.name===orig? {...x, name: baseNew + orig.slice(orig.lastIndexOf('.'))}:x));
     setRenaming(null);
     fetchWithRetry(
       () => fetch(`http://localhost:8000/api/video/user/${user.user_id}/gallery/rename/${orig}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({new_name:baseNew})})
              .then(async r=> r.ok ? await r.json() : false),
       'rename:'+orig,
       (data) => { if(data?.new){ setItems(list=> list.map(x=> x.name=== (baseNew + orig.slice(orig.lastIndexOf('.')))? {...x,name:data.new}:x)); pushToast('Renamed','ok'); }},
       () => { // revert
         setItems(list=> list.map(x=> x.name.startsWith(baseNew) && x.name.endsWith(orig.slice(orig.lastIndexOf('.'))) ? {...x,name:orig}:x));
       }
     );
   };
   return (
     <PanelWrap key="gallery" variants={fade} initial="initial" animate="animate" exit="exit" transition={{duration:.4}}>
       <Panel layout variants={fade}>
         <PanelTitle>Video Gallery</PanelTitle>
         {loading && <Skeleton h="34px" w="180px" />}
         {!loading && items.length===0 && <Helper>No videos yet. Generate some!</Helper>}
         <GalleryGrid>
           {items.map(it => (
             <GalleryItem key={it.name} onClick={()=> setOpen(it)} whileHover={{scale:1.03}} whileTap={{scale:.97}}>
              <Thumb style={it.thumbnail? {background:`url(http://localhost:8000${it.thumbnail}) center/cover`,backgroundSize:'cover', position:'relative'} : {position:'relative'}}>
                {!it.thumbnail && (it.name.toLowerCase().endsWith('.mp4')? '🎬':'📄')}
                {pending['rename:'+it.name] && <span style={{position:'absolute',top:4,right:6,fontSize:9,letterSpacing:'.1em',background:'rgba(0,0,0,.55)',padding:'2px 4px',borderRadius:6}}>RENAMING…</span>}
                {pending['delete:'+it.name] && <span style={{position:'absolute',top:4,left:6,fontSize:9,letterSpacing:'.1em',background:'rgba(0,0,0,.55)',padding:'2px 4px',borderRadius:6}}>DELETING…</span>}
              </Thumb>
              <FileMeta>
                {renaming===it.name ? (
                  <div style={{display:'flex',flexDirection:'column',gap:4}} onClick={e=>e.stopPropagation()}>
                    <input value={newName} onChange={e=>setNewName(e.target.value)} style={{padding:4,borderRadius:6,border:'1px solid rgba(255,255,255,.2)',background:'rgba(0,0,0,.3)',color:'#fff',fontSize:10}} />
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>submitRename(it)} style={{background:'#2cb67d',border:'none',color:'#fff',fontSize:10,padding:'4px 6px',borderRadius:6,cursor:'pointer'}}>Save</button>
                      <button onClick={()=>setRenaming(null)} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',fontSize:10,padding:'4px 6px',borderRadius:6,cursor:'pointer'}}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <strong style={{fontSize:'.62rem',letterSpacing:'.12em',fontWeight:600,display:'flex',justifyContent:'space-between',width:'100%'}}>
                    <span style={{maxWidth:'70%',overflow:'hidden',textOverflow:'ellipsis'}}>{it.name}</span>
                    <span style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>startRename(it)} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:12}}>✏️</button>
                      <button onClick={()=>doDelete(it.name)} style={{background:'none',border:'none',color:'#ff6b6b',cursor:'pointer',fontSize:12}}>🗑</button>
                    </span>
                  </strong>
                )}
                <span style={{opacity:.6}}>{(it.size/1024).toFixed(1)} KB</span>
                <span style={{opacity:.5}}>{new Date(it.modified).toLocaleString()}</span>
              </FileMeta>
             </GalleryItem>
           ))}
         </GalleryGrid>
       </Panel>
      <AnimatePresence>
        {open && (
          <ModalBackdrop initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(null)}>
            <Modal initial={{scale:.85,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.85,opacity:0}} transition={{type:'spring',stiffness:160,damping:24}} onClick={e=>e.stopPropagation()}>
              <ModalHead>
                <span>{open.name}</span>
                <CloseBtn onClick={()=>setOpen(null)}>×</CloseBtn>
              </ModalHead>
              <div style={{padding:'1rem 1.25rem 1.6rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
                {open.name.toLowerCase().endsWith('.mp4') ? (
                  <video style={{width:'100%',borderRadius:18,background:'#000'}} controls src={`http://localhost:8000${open.url}`}></video>
                ) : (
                  <a href={`http://localhost:8000${open.url}`} target="_blank" rel="noreferrer" style={{color:'#7f5af0'}}>Open File</a>
                )}
              </div>
            </Modal>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </PanelWrap>
  );
}
