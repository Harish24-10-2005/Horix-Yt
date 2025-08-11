import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiX, FiLoader, FiStar, FiZap, FiRefreshCw, FiZoomIn, FiZoomOut, FiLayers } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, SectionLabel, StatBar, StatChip, TitleGlow, SmallLabel, IconBtn } from '../ui/motionPrimitives';

const Title = styled(motion.h2)`margin:0 0 .6rem;text-align:center;font-size:clamp(1.8rem,3vw,2.4rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const InfoBar = styled.div`font-size:.65rem;letter-spacing:.06em;text-transform:uppercase;background:${p=>p.theme.colors.surface2};padding:.55rem 1rem;border-radius:${p=>p.theme.radii.md};display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;color:${p=>p.theme.colors.textSecondary};position:relative;`;
const Grid = styled(motion.div)`display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--card-min,180px),1fr));gap:var(--gap,1.05rem);perspective:1400px;transition:.4s;`;
const CardShell = styled(motion.div)`position:relative;`;
const Card = styled(motion.button)`--rX:0deg;--rY:0deg;--scale:1;position:relative;border:none;padding:0;border-radius:20px;overflow:hidden;cursor:pointer;width:100%;background:${p=>p.theme.colors.surface2};display:flex;align-items:center;justify-content:center;aspect-ratio:${p=>p.videoMode? '16 / 9':'9 / 16'};box-shadow:0 12px 32px -10px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06);transform:rotateX(var(--rX)) rotateY(var(--rY)) scale(var(--scale));transition:transform .6s cubic-bezier(.22,1,.28,1), box-shadow .6s;will-change:transform;
  &:before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(160deg,hsla(270,95%,65%,.65),hsla(300,95%,65%,.4),transparent 70%);-webkit-mask:linear-gradient(#000,#000) content-box,linear-gradient(#000,#000);-webkit-mask-composite:destination-out;mask-composite:exclude;opacity:.9;pointer-events:none;}
  & img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 1s cubic-bezier(.22,1,.23,1), filter .65s ease;filter:blur(14px) saturate(140%) brightness(.8) contrast(1.05);}
  &.loaded img{filter:blur(0) saturate(108%) brightness(1.03) contrast(1.07);}
  &:hover{box-shadow:0 18px 42px -12px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.08);} &:hover img{transform:scale(1.15);} &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}
`;
const CardTopActions = styled.div`position:absolute;top:6px;right:6px;display:flex;gap:6px;z-index:3;opacity:0;transition:.4s;transform:translateY(-4px);${CardShell}:hover &{opacity:1;transform:translateY(0)}`;
const FavBtn = styled(IconBtn)`width:28px;height:28px;border-radius:10px;background:rgba(0,0,0,.35);backdrop-filter:blur(6px);color:${p=>p.active? p.theme.colors.primary:'rgba(255,255,255,.8)'};border:1px solid rgba(255,255,255,.15);&:hover{background:rgba(0,0,0,.55);}`;
const Overlay = styled.div`position:absolute;inset:0;background:linear-gradient(to top,rgba(15,10,30,.68),rgba(15,10,30,.2));display:flex;align-items:flex-end;justify-content:center;padding:.55rem;opacity:0;transition:.45s;${CardShell}:hover &{opacity:1}`;
const ModifyButton = styled.span`background:${p=>p.theme.colors.primaryTransparent};backdrop-filter:blur(6px);padding:.48rem .85rem;border-radius:999px;font-size:.65rem;display:inline-flex;align-items:center;gap:.4rem;color:${p=>p.theme.colors.text};font-weight:600;letter-spacing:.05em;box-shadow:0 4px 14px -4px hsla(280,95%,60%,.5);`;
const Pulse = styled.span`position:absolute;inset:0;border-radius:inherit;pointer-events:none;mix-blend-mode:overlay;background:radial-gradient(circle at 30% 20%,hsla(280,95%,65%,.25),transparent 60%),radial-gradient(circle at 70% 80%,hsla(300,95%,65%,.25),transparent 60%);opacity:0;transition:.7s;${CardShell}:hover &{opacity:.85;}`;
const Empty = styled.div`text-align:center;padding:3rem 1rem;font-size:.85rem;opacity:.7;`;
const Actions = styled.div`display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;`;

// Modal
const Backdrop = styled(motion.div)`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:2.2rem;z-index:1500;background:radial-gradient(circle at 32% 38%,rgba(45,25,72,.82),rgba(15,12,28,.92));backdrop-filter:blur(24px) saturate(160%);`; 
const Modal = styled(motion.div)`width:clamp(420px, 1200px, 96vw);display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));background:${p=>p.theme.colors.surfaceTransparent};${p=>p.theme.glass(.65,30)}border-radius:${p=>p.theme.radii.lg};position:relative;padding:2.4rem 2.2rem 2.1rem;box-shadow:${p=>p.theme.shadows.lg};overflow:visible; &:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,hsla(280,95%,60%,.25),transparent 55%),radial-gradient(circle at 82% 75%,hsla(300,95%,62%,.25),transparent 55%);mix-blend-mode:overlay;pointer-events:none;}`;
const ModalFullscreen = styled(motion.div)`position:fixed;inset:0;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:0;background:rgba(10,8,18,.9);backdrop-filter:blur(28px) saturate(180%);z-index:2000;overflow:hidden;`;
const Close = styled.button`position:absolute;top:.65rem;right:.7rem;background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};color:${p=>p.theme.colors.text};font-size:1.1rem;cursor:pointer;width:38px;height:38px;display:grid;place-items:center;border-radius:50%;`;
const ImageWrapper = styled.div`border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.md};overflow:hidden;display:flex;align-items:center;justify-content:center;background:${p=>p.theme.colors.surface2};min-height:420px;position:relative;isolation:isolate;box-shadow:0 10px 38px -12px rgba(0,0,0,.6);touch-action:none; & img{transition:transform .25s ease, filter .6s ease;cursor:grab;}`;
const FSImageStage = styled.div`position:relative;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;`;
const FSToolbar = styled.div`position:absolute;top:12px;left:12px;display:flex;gap:.5rem;z-index:30;`;
const Suggest = styled.button`font-size:.6rem;letter-spacing:.05em;text-transform:uppercase;padding:.5rem .75rem;border-radius:999px;border:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.surface2};cursor:pointer;color:${p=>p.theme.colors.textSecondary};display:inline-flex;align-items:center;gap:.45rem;transition:.35s; position:relative;overflow:hidden; &:before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.25),rgba(255,255,255,0) 60%);mix-blend-mode:overlay;opacity:0;transition:.5s;} &:hover{color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface3};} &:hover:before{opacity:.9;}`;
const Suggestions = styled.div`display:flex;flex-wrap:wrap;gap:.55rem;`;
const Toolbar = styled.div`position:absolute;top:-14px;left:50%;transform:translate(-50%,0);display:flex;gap:.6rem;z-index:10;`;
const DensityGroup = styled.div`display:flex;gap:.4rem;align-items:center;margin-left:auto;`;
const DensityBtn = styled.button`font-size:.55rem;letter-spacing:.15em;text-transform:uppercase;padding:.45rem .7rem;border-radius:999px;border:1px solid ${p=>p.active? p.theme.colors.primary: p.theme.colors.border};background:${p=>p.active? p.theme.colors.primaryTransparent: p.theme.colors.surface2};cursor:pointer;color:${p=>p.theme.colors.textSecondary};font-weight:600;transition:.3s; &:hover{color:${p=>p.theme.colors.text}}`;
const Tabs = styled.div`display:flex;gap:.55rem;margin-bottom:.4rem;`;
const TabBtn = styled.button`padding:.6rem .9rem;border-radius:12px;border:1px solid ${p=>p.active? p.theme.colors.primary: p.theme.colors.border};background:${p=>p.active? p.theme.colors.primaryTransparent: p.theme.colors.surface2};font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:${p=>p.active? p.theme.colors.text: p.theme.colors.textSecondary};cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:.45rem;transition:.35s;`;
const ZoomBar = styled.div`display:flex;align-items:center;gap:.6rem;margin-top:.6rem;`;
const ZoomRange = styled.input`width:100%;accent-color:${p=>p.theme.colors.primary};`;
const NavArrow = styled.button`position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.15);color:${p=>p.theme.colors.text};width:44px;height:64px;display:grid;place-items:center;cursor:pointer;border-radius:14px;backdrop-filter:blur(8px);z-index:12;transition:.35s; &:hover{background:rgba(0,0,0,.65);} &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}`;
const OverlaySpinner = styled.div`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,10,25,.55);backdrop-filter:blur(4px) saturate(160%);z-index:20;`;
const VariantsPlaceholder = styled.div`border:1px dashed ${p=>p.theme.colors.border};padding:2rem 1rem;border-radius:${p=>p.theme.radii.md};text-align:center;font-size:.7rem;letter-spacing:.08em;color:${p=>p.theme.colors.textSecondary};display:flex;flex-direction:column;gap:.8rem;align-items:center;justify-content:center;`;
const Form = styled.form`display:flex;flex-direction:column;gap:1rem;`;
const Textarea = styled.textarea`min-height:180px;resize:vertical;padding:.95rem 1rem;border-radius:${p=>p.theme.radii.md};background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};color:${p=>p.theme.colors.text};font-size:.85rem;line-height:1.3rem;font-family:inherit;`;

export function Step4Images(){
  const { images, videoMode, modifyImage, setStep, loading } = usePipeline();
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [favs, setFavs] = useState(new Set());
  const [loadedSet, setLoadedSet] = useState(new Set());
  const shellRefs = useRef([]);
  const [density, setDensity] = useState('comfortable'); // comfortable | spacious | gallery
  const [activeTab, setActiveTab] = useState('modify'); // modify | variants
  const [zoom, setZoom] = useState(1);
  const imgContainerRef = useRef(null);
  const selectedIndex = selected? images.findIndex(i=>i===selected): -1;
  const [fullscreen,setFullscreen] = useState(false);
  const containerRef = useRef(null);
  const baseSizeRef = useRef({w:0,h:0});
  const naturalRef = useRef({w:0,h:0});
  const x = useMotionValue(0); const y = useMotionValue(0);

  const openModify = (url) => { setSelected(url); setPrompt(''); };
  const closeModal = () => { if(!submitting) { setSelected(null); setPrompt(''); } };
  const onSubmit = async (e) => { e.preventDefault(); if(!prompt.trim() || !selected) return; try { setSubmitting(true); await modifyImage(selected, prompt.trim()); setSelected(null); setPrompt(''); } finally { setSubmitting(false); } };
  const toggleFav = (img) => { const ns = new Set(favs); ns.has(img)? ns.delete(img): ns.add(img); setFavs(ns); };

  const handleMouseMove = useCallback((e, idx) => {
    const el = shellRefs.current[idx]; if(!el) return; const card = el.querySelector('button'); if(!card) return;
    const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const rX = ((y / rect.height) - .5) * -12; const rY = ((x / rect.width) - .5) * 12;
    card.style.setProperty('--rX', rX.toFixed(2)+'deg'); card.style.setProperty('--rY', rY.toFixed(2)+'deg');
    card.style.setProperty('--scale','1.02');
  },[]);
  const resetTilt = (idx) => { const el = shellRefs.current[idx]; if(!el) return; const card = el.querySelector('button'); if(!card) return; card.style.setProperty('--rX','0deg'); card.style.setProperty('--rY','0deg'); card.style.setProperty('--scale','1'); };

  const samplePrompts = [
    'add cinematic neon lighting',
    'convert to watercolor painting style',
    'enhance contrast & dramatic shadows',
    'add futuristic holographic HUD elements',
    'soft golden hour lighting'
  ];
  const appendPrompt = (txt) => setPrompt(p => p? p.trim()+', '+txt : txt);
  const favoriteCount = favs.size;
  const goRelative = (dir)=>{ if(!selected) return; if(!images.length) return; let idx = selectedIndex; if(idx<0) return; let next = (idx + dir + images.length)%images.length; setSelected(images[next]); setPrompt(''); setZoom(1); };
  const handleKey = (e)=>{ if(!selected) return; if(e.key==='Escape'){ e.preventDefault(); closeModal(); } else if(e.key==='ArrowRight'){ e.preventDefault(); goRelative(1);} else if(e.key==='ArrowLeft'){ e.preventDefault(); goRelative(-1);} else if((e.metaKey||e.ctrlKey)&& e.key==='Enter'){ e.preventDefault(); if(!submitting && prompt.trim()) { onSubmit(new Event('submit')); } } };
  const handleImageDouble = ()=>{ setZoom(z=> z>1.01? 1 : 2); };
  const handleWheel = (e)=>{ if(!selected) return; e.preventDefault(); const delta = -e.deltaY; setZoom(z=>{ let nz = z + (delta>0? 0.08: -0.08); return Math.min(2.5, Math.max(1, +nz.toFixed(2))); }); };
  const resetView = ()=>{ setZoom(1); x.set(0); y.set(0); };

  const measureBaseSize = ()=>{
    const container = containerRef.current; const imgEl = imgContainerRef.current; if(!container || !imgEl) return;
    const cw = container.clientWidth; const ch = container.clientHeight;
    const nw = naturalRef.current.w; const nh = naturalRef.current.h; if(!nw || !nh) return;
    const containerRatio = cw / ch; const imageRatio = nw / nh;
    let bw, bh; if(imageRatio > containerRatio){ // width fills
      bw = cw; bh = cw / imageRatio;
    } else { bh = ch; bw = ch * imageRatio; }
    baseSizeRef.current = {w:bw,h:bh};
  };

  const clampPosition = useCallback(()=>{
    const container = containerRef.current; if(!container) return; const {w:bw,h:bh} = baseSizeRef.current; if(!bw||!bh) return;
    const cw = container.clientWidth; const ch = container.clientHeight;
    const scaledW = bw * zoom; const scaledH = bh * zoom;
    const maxX = Math.max(0,(scaledW - cw)/2); const maxY = Math.max(0,(scaledH - ch)/2);
    const cx = Math.min(maxX, Math.max(-maxX, x.get()));
    const cy = Math.min(maxY, Math.max(-maxY, y.get()));
    if(cx !== x.get()) x.set(cx); if(cy !== y.get()) y.set(cy);
  },[zoom, x, y]);

  useEffect(()=>{ measureBaseSize(); clampPosition(); },[zoom, fullscreen, selected, clampPosition]);
  useEffect(()=>{ const onResize = ()=>{ measureBaseSize(); clampPosition(); }; window.addEventListener('resize', onResize); return ()=> window.removeEventListener('resize', onResize); },[clampPosition]);
  const onDrag = ()=>{ clampPosition(); };
  const handleImageLoad = (e)=>{ naturalRef.current = {w:e.target.naturalWidth,h:e.target.naturalHeight}; measureBaseSize(); clampPosition(); };

  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Generated Images</Title>
      <StatBar>
        <StatChip><SmallLabel>Total</SmallLabel> {images.length}</StatChip>
        <StatChip><SmallLabel>Format</SmallLabel> {videoMode? '16:9':'9:16'}</StatChip>
        <StatChip><SmallLabel>Favorites</SmallLabel> {favoriteCount}</StatChip>
      </StatBar>
      <InfoBar style={{'--card-min': density==='gallery'? '240px': density==='spacious'? '210px':'180px','--gap': density==='comfortable'? '1.05rem': density==='spacious'? '1.35rem':'1.6rem'}}>
        <span>Format: <strong>{videoMode? 'Standard 16:9':'Shorts 9:16'}</strong></span>
        <span>{images.length} image{images.length!==1 && 's'}</span>
        <DensityGroup>
          {['comfortable','spacious','gallery'].map(d => <DensityBtn key={d} type="button" active={density===d} onClick={()=>setDensity(d)}>{d}</DensityBtn>)}
        </DensityGroup>
      </InfoBar>
      {images.length>0 ? (
        <Grid initial={{opacity:0}} animate={{opacity:1}} transition={{staggerChildren:.03,delayChildren:.05}}>
          {images.map((img,i)=>{
            const loaded = loadedSet.has(img);
            return (
        <CardShell key={img||i} ref={el=>shellRefs.current[i]=el} as={motion.div} layout initial={{opacity:0,y:28,scale:.9}} animate={{opacity:1,y:0,scale:1}} transition={{type:'spring',stiffness:260,damping:30,delay:i*0.02}}
                onMouseMove={(e)=>handleMouseMove(e,i)} onMouseLeave={()=>resetTilt(i)}>
                <Card videoMode={videoMode} className={loaded? 'loaded':''} onClick={()=>openModify(img)}>
                  <img src={img} alt={`Generated ${i+1}`} loading="lazy"
                    onLoad={()=> setLoadedSet(s=> new Set(s).add(img))}
                    onError={(e)=>{e.currentTarget.src=`https://placehold.co/${videoMode? '320x180':'180x320'}/1e1e3f/a0a0c0?text=Error`; setLoadedSet(s=> new Set(s).add(img));}} />
                  <Pulse />
                  <Overlay><ModifyButton><FiEdit2/> Modify</ModifyButton></Overlay>
                </Card>
                <CardTopActions>
          <FavBtn type="button" active={favs.has(img)} aria-label="Favorite" onClick={()=>toggleFav(img)}><FiStar size={14}/></FavBtn>
          <FavBtn type="button" aria-label="Quick modify" onClick={()=>openModify(img)}><FiZap size={14}/></FavBtn>
                </CardTopActions>
              </CardShell>
            );
          })}
        </Grid>
      ) : <Empty>No images generated yet.</Empty>}
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(3)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        <GradientButton whileTap={{scale:.95}} onClick={()=>setStep(5)} disabled={loading || images.length===0}><FiChevronRight/> Continue to Voices</GradientButton>
      </Actions>
      <AnimatePresence>
        {selected && (
          <Backdrop initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>{ if(!fullscreen) closeModal(); }} onKeyDown={handleKey} tabIndex={-1}>
            {fullscreen ? (
              <ModalFullscreen initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>e.stopPropagation()}>
                <FSImageStage onWheel={handleWheel} ref={containerRef}>
                  <motion.img ref={imgContainerRef} src={selected} alt="Selected" style={{width:'auto',height:'auto',maxWidth:'100%',maxHeight:'100%',scale:zoom,x,y}} drag onDrag={onDrag} dragElastic={.05} onDoubleClick={handleImageDouble} onLoad={handleImageLoad} />
                  <FSToolbar>
                    <GradientButton type="button" whileTap={{scale:.92}} onClick={()=> setFullscreen(false)} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}>Exit</GradientButton>
                    <OutlineButton type="button" whileTap={{scale:.92}} onClick={resetView} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}>Reset</OutlineButton>
                    <OutlineButton type="button" whileTap={{scale:.92}} onClick={()=> setZoom(z=> Math.min(2.5, +(z+0.2).toFixed(2)))} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}>+ Zoom</OutlineButton>
                    <OutlineButton type="button" whileTap={{scale:.92}} onClick={()=> setZoom(z=> Math.max(1, +(z-0.2).toFixed(2)))} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}>- Zoom</OutlineButton>
                  </FSToolbar>
                  {images.length>1 && <NavArrow style={{left:'12px'}} aria-label="Previous" onClick={(e)=>{e.stopPropagation();goRelative(-1);}}><FiChevronLeft size={18}/></NavArrow>}
                  {images.length>1 && <NavArrow style={{right:'12px'}} aria-label="Next" onClick={(e)=>{e.stopPropagation();goRelative(1);}}><FiChevronRight size={18}/></NavArrow>}
                  {submitting && <OverlaySpinner><FiLoader className="spin" size={32}/></OverlaySpinner>}
                </FSImageStage>
                <Form style={{padding:'1.25rem 1.5rem',overflowY:'auto'}} onSubmit={onSubmit}>
                  <Tabs>
                    <TabBtn type="button" active={activeTab==='modify'} onClick={()=>setActiveTab('modify')}><FiEdit2 size={12}/> Modify</TabBtn>
                    <TabBtn type="button" active={activeTab==='variants'} onClick={()=>setActiveTab('variants')}><FiLayers size={12}/> Variations</TabBtn>
                  </Tabs>
                  {activeTab==='modify' && <>
                    <SectionLabel>Modification Prompt</SectionLabel>
                    <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe changes (style, details, lighting, etc.)  (Ctrl+Enter to apply, Esc to close)" />
                    <Suggestions>
                      {samplePrompts.map(p => <Suggest type="button" key={p} onClick={()=>appendPrompt(p)}>{p}</Suggest>)}
                    </Suggestions>
                    <div style={{display:'flex',gap:'.85rem',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',gap:'.35rem'}}>
                        <IconBtn type="button" aria-label="Zoom out" onClick={()=>setZoom(z=> Math.max(1, +(z-0.1).toFixed(2)))}>−</IconBtn>
                        <span style={{fontSize:'.55rem',letterSpacing:'.1em',opacity:.65}}>{Math.round(zoom*100)}%</span>
                        <IconBtn type="button" aria-label="Zoom in" onClick={()=>setZoom(z=> Math.min(2.5, +(z+0.1).toFixed(2)))}>+</IconBtn>
                        <IconBtn type="button" aria-label="Reset view" onClick={resetView}>⟳</IconBtn>
                      </div>
                      <div style={{display:'flex',gap:'.85rem'}}>
                        <OutlineButton type="button" whileTap={{scale:.95}} onClick={closeModal} disabled={submitting}><FiX/> Cancel</OutlineButton>
                        <GradientButton type="submit" whileTap={{scale:.95}} disabled={!prompt.trim()||submitting}>{submitting? <FiLoader className="spin"/>:<><FiEdit2/> Apply</>}</GradientButton>
                      </div>
                    </div>
                  </>}
                  {activeTab==='variants' && <VariantsPlaceholder>
                    <strong style={{fontSize:'.75rem',letterSpacing:'.1em'}}>Variations (Coming Soon)</strong>
                    <p style={{margin:0,maxWidth:340,lineHeight:1.4}}>Generate stylistic variations of this frame with automatic prompt blending & negative prompt safety filters. This interactive lab will appear here.</p>
                  </VariantsPlaceholder>}
                </Form>
              </ModalFullscreen>
            ) : (
            <Modal initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9,y:10}} transition={{type:'spring',stiffness:260,damping:28}} onClick={e=>e.stopPropagation()}>
              <Close onClick={closeModal} aria-label="Close modal"><FiX/></Close>
              <ImageWrapper onWheel={handleWheel} ref={containerRef}>
                <motion.img ref={imgContainerRef} src={selected} alt="Selected" style={{width:'100%',height:'100%',objectFit:'contain',scale:zoom,x,y}} drag onDrag={onDrag} dragElastic={.05} onDoubleClick={handleImageDouble} onLoad={handleImageLoad} />
                <Toolbar>
                  <GradientButton type="button" whileTap={{scale:.92}} onClick={()=> setPrompt('')} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}><FiRefreshCw size={14}/> Clear</GradientButton>
                  <OutlineButton type="button" whileTap={{scale:.92}} onClick={()=> setFullscreen(true)} style={{fontSize:'.6rem',padding:'.55rem .9rem'}}>Fullscreen</OutlineButton>
                </Toolbar>
                {images.length>1 && <NavArrow style={{left:'-54px'}} aria-label="Previous" onClick={(e)=>{e.stopPropagation();goRelative(-1);}}><FiChevronLeft size={18}/></NavArrow>}
                {images.length>1 && <NavArrow style={{right:'-54px'}} aria-label="Next" onClick={(e)=>{e.stopPropagation();goRelative(1);}}><FiChevronRight size={18}/></NavArrow>}
                {submitting && <OverlaySpinner><FiLoader className="spin" size={28}/></OverlaySpinner>}
              </ImageWrapper>
              <Form onSubmit={onSubmit}>
                <Tabs>
                  <TabBtn type="button" active={activeTab==='modify'} onClick={()=>setActiveTab('modify')}><FiEdit2 size={12}/> Modify</TabBtn>
                  <TabBtn type="button" active={activeTab==='variants'} onClick={()=>setActiveTab('variants')}><FiLayers size={12}/> Variations</TabBtn>
                </Tabs>
                {activeTab==='modify' && <>
                  <SectionLabel>Modification Prompt</SectionLabel>
                  <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe changes (style, details, lighting, etc.)  (Ctrl+Enter to apply, Esc to close)" />
                  <Suggestions>
                    {samplePrompts.map(p => <Suggest type="button" key={p} onClick={()=>appendPrompt(p)}>{p}</Suggest>)}
                  </Suggestions>
                  <ZoomBar>
                    <IconBtn type="button" aria-label="Zoom out" onClick={()=>setZoom(z=> Math.max(1, +(z-0.1).toFixed(2)))}><FiZoomOut size={14}/></IconBtn>
                    <ZoomRange type="range" min="1" max="2.5" step="0.1" value={zoom} onChange={e=>setZoom(parseFloat(e.target.value))} />
                    <IconBtn type="button" aria-label="Zoom in" onClick={()=>setZoom(z=> Math.min(2.5, +(z+0.1).toFixed(2)))}><FiZoomIn size={14}/></IconBtn>
                    <span style={{fontSize:'.55rem',letterSpacing:'.1em',opacity:.65}}>{Math.round(zoom*100)}%</span>
                  </ZoomBar>
                  <div style={{display:'flex',gap:'.85rem',justifyContent:'flex-end'}}>
                    <OutlineButton type="button" whileTap={{scale:.95}} onClick={closeModal} disabled={submitting}><FiX/> Cancel</OutlineButton>
                    <GradientButton type="submit" whileTap={{scale:.95}} disabled={!prompt.trim()||submitting}>{submitting? <FiLoader className="spin"/>:<><FiEdit2/> Apply</>}</GradientButton>
                  </div>
                </>}
                {activeTab==='variants' && <VariantsPlaceholder>
                  <strong style={{fontSize:'.75rem',letterSpacing:'.1em'}}>Variations (Coming Soon)</strong>
                  <p style={{margin:0,maxWidth:340,lineHeight:1.4}}>Generate stylistic variations of this frame with automatic prompt blending & negative prompt safety filters. This interactive lab will appear here.</p>
                </VariantsPlaceholder>}
              </Form>
            </Modal>) }
          </Backdrop>
        )}
      </AnimatePresence>
    </AnimatedPanel>
  );
}
