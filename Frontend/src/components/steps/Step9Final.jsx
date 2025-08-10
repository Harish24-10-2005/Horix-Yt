import React from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, StatBar, StatChip, TitleGlow, SmallLabel, IconBtn } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1rem;text-align:center;font-size:clamp(1.9rem,3.2vw,2.5rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const VideoWrap = styled(motion.div)`background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};padding:1rem;border-radius:${p=>p.theme.radii.lg};display:flex;justify-content:center;position:relative;overflow:hidden;min-height:240px;`;
const Actions = styled.div`display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:.8rem;`;
const Badge = styled.span`position:absolute;top:10px;left:10px;background:${p=>p.theme.colors.primaryTransparent};color:${p=>p.theme.colors.text};padding:.35rem .7rem;border-radius:999px;font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;backdrop-filter:blur(6px);`;

export function Step9Final(){
  const { finalVideo, fetchFinalVideo, reset, title, loading, videoMode, captions, bgAdded, images, voices } = usePipeline();
  const [copied,setCopied] = React.useState(false);
  const [duration,setDuration] = React.useState(null);
  const fileName = `${(title||'video').replace(/[^a-z0-9_-]/ig,'_')}.mp4`;
  const copyUrl = () => { if(!finalVideo) return; navigator.clipboard.writeText(finalVideo).then(()=>{setCopied(true); setTimeout(()=>setCopied(false),1200);}); };
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Your Video is Ready!</Title>
      <StatBar>
        <StatChip><SmallLabel>Format</SmallLabel> {videoMode? '16:9':'9:16'}</StatChip>
        <StatChip><SmallLabel>Images</SmallLabel> {images.length}</StatChip>
        <StatChip><SmallLabel>Clips</SmallLabel> {voices.length}</StatChip>
        <StatChip><SmallLabel>Music</SmallLabel> {bgAdded? 'Yes':'No'}</StatChip>
        <StatChip><SmallLabel>Captions</SmallLabel> {captions? 'Yes':'No'}</StatChip>
        {duration && <StatChip><SmallLabel>Duration</SmallLabel> {Math.round(duration)}s</StatChip>}
      </StatBar>
      <VideoWrap initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}>
        <Badge>Final Output</Badge>
        {finalVideo ? (
          <div style={{position:'relative',width:'100%',display:'flex',justifyContent:'center'}}>
            <video controls src={finalVideo} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} style={{maxWidth:'100%',borderRadius:12,boxShadow:'0 4px 24px -4px rgba(0,0,0,.4)'}} />
            <div style={{position:'absolute',top:8,right:8,display:'flex',gap:6}}>
              <IconBtn type="button" aria-label="Copy video URL" onClick={copyUrl}>{copied? <FiCheck size={14}/> : <FiCopy size={14}/>}</IconBtn>
            </div>
          </div>
        ) : (
          <div style={{padding:'4rem 2rem',textAlign:'center',fontSize:'.75rem',opacity:.65}}>No video URL yet.</div>
        )}
      </VideoWrap>
      <Actions>
        <OutlineButton as={motion.button} whileTap={{scale:.95}} onClick={()=>fetchFinalVideo()} disabled={loading}><FiRefreshCw/> Refresh URL</OutlineButton>
        {finalVideo && (
          <GradientButton as="a" href={finalVideo} download={fileName} whileTap={{scale:.95}}><FiDownload/> Download</GradientButton>
        )}
        <GradientButton as={motion.button} whileTap={{scale:.95}} onClick={reset}><FiRefreshCw/> New Video</GradientButton>
      </Actions>
    </AnimatedPanel>
  );
}
