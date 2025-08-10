import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiCopy, FiCheck } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { fadeSlideUp, AnimatedPanel, GradientButton, OutlineButton, SoftInput, SoftSelect, SectionLabel, StatBar, StatChip, SmallLabel, TitleGlow, IconBtn } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1.2rem;text-align:center;font-size:clamp(1.9rem,3.5vw,2.6rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-.5px;position:relative;`;
const Form = styled(motion.form)`display:grid;gap:1.25rem;max-width:760px;margin:0 auto;`;
const Duo = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;`;
const Helper = styled.p`margin:.15rem 0 0;font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:${p=>p.theme.colors.textSecondary};`;
const Actions = styled.div`display:flex;justify-content:center;gap:1rem;margin-top:.6rem;`;

export function Step1Create(){
  const { title, setTitle, channelType, setChannelType, videoMode, setVideoMode, generateContent } = usePipeline();
  const [copied,setCopied] = useState(false);
  const submit = (e) => { e.preventDefault(); if(title) generateContent(); };
  const copyTitle = () => { if(!title) return; navigator.clipboard.writeText(title).then(()=>{setCopied(true); setTimeout(()=>setCopied(false),1200);}); };
  const chars = title.length; const words = title.trim()? title.trim().split(/\s+/).length:0;
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.05,duration:.6}}><TitleGlow/>Create Your Video</Title>
      <StatBar>
        <StatChip><SmallLabel>Words</SmallLabel> {words}</StatChip>
        <StatChip><SmallLabel>Characters</SmallLabel> {chars}</StatChip>
        <StatChip><SmallLabel>Format</SmallLabel> {videoMode? '16:9':'9:16'}</StatChip>
        {channelType && <StatChip><SmallLabel>Channel</SmallLabel> {channelType}</StatChip>}
      </StatBar>
      <Form onSubmit={submit}>
        <div style={{position:'relative'}}>
          <SectionLabel htmlFor="title">Video Title</SectionLabel>
          <SoftInput id="title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Compelling hook or topic" autoFocus />
          <div style={{position:'absolute',top:0,right:0,display:'flex',gap:6}}>
            <IconBtn type="button" aria-label="Copy title" onClick={copyTitle}>{copied? <FiCheck size={14}/> : <FiCopy size={14}/>}</IconBtn>
          </div>
          <Helper>Set a clear, concise concept to drive better AI context.</Helper>
        </div>
        <Duo>
          <div>
            <SectionLabel htmlFor="videoMode">Format</SectionLabel>
            <SoftSelect id="videoMode" value={videoMode? 'standard':'shorts'} onChange={e=>setVideoMode(e.target.value==='standard')}>
              <option value="standard">Standard (16:9)</option>
              <option value="shorts">Shorts (9:16)</option>
            </SoftSelect>
          </div>
          <div>
            <SectionLabel htmlFor="channelType">Channel Type (optional)</SectionLabel>
            <SoftInput id="channelType" value={channelType} onChange={e=>setChannelType(e.target.value)} placeholder="e.g. tech, finance, travel" />
          </div>
        </Duo>
        <Actions>
          <GradientButton type="submit" whileTap={{scale:.95}} disabled={!title} aria-disabled={!title} aria-label="Generate content from title">
            Generate Content <FiChevronRight/>
          </GradientButton>
          {title && (
            <OutlineButton type="button" whileTap={{scale:.95}} onClick={()=>{ setTitle(''); }} aria-label="Clear title">Reset</OutlineButton>
          )}
        </Actions>
      </Form>
    </AnimatedPanel>
  );
}
