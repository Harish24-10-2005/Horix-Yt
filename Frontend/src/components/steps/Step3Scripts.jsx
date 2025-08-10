import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiCopy, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, SectionLabel } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1.2rem;text-align:center;font-size:clamp(1.85rem,3vw,2.5rem);letter-spacing:.5px;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const TitleGlow = styled.span`position:absolute;inset:0;filter:blur(22px);opacity:.18;background:${p=>p.theme.colors.gradientPrimary};pointer-events:none;border-radius:120px;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.15rem;`;
const Panel = styled(motion.div)`--pad:1rem;background:${p=>p.theme.colors.surface2};backdrop-filter:blur(14px) saturate(140%);border:1px solid ${p=>p.theme.colors.border};padding:var(--pad) calc(var(--pad) + .2rem);border-radius:${p=>p.theme.radii.lg};display:flex;flex-direction:column;max-height:400px;min-height:230px;position:relative;overflow:hidden;isolation:isolate;box-shadow:0 4px 18px -6px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.03);
&:before{content:"";position:absolute;inset:0;padding:1px;border-radius:inherit;background:linear-gradient(140deg,hsla(280,95%,62%,.35),hsla(320,95%,65%,.22),transparent 70%);-webkit-mask:linear-gradient(#000,#000) content-box,linear-gradient(#000,#000);-webkit-mask-composite:destination-out;mask-composite:exclude;pointer-events:none;}
`;
const Scroll = styled.div`overflow:auto;margin-top:.55rem;padding-right:.4rem;scrollbar-width:thin;position:relative;flex:1;mask-image:linear-gradient(to bottom,transparent,rgba(0,0,0,.8) 18px, #000 40%),linear-gradient(to top,transparent,rgba(0,0,0,.85) 18px,#000 36px);mask-composite:intersect; &::-webkit-scrollbar{width:8px}&::-webkit-scrollbar-track{background:transparent}&::-webkit-scrollbar-thumb{background:${p=>p.theme.colors.primaryTransparent};border-radius:10px;border:1px solid ${p=>p.theme.colors.border};}`;
const Item = styled(motion.div)`font-size:.74rem;line-height:1.15rem;margin:0 0 .5rem;padding:.55rem .6rem .55rem .65rem;border-radius:10px;background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};display:flex;gap:.55rem;position:relative;transition:.25s background,border-color;cursor:default;overflow:hidden;
&:hover{background:${p=>p.theme.colors.surfaceElevated};border-color:${p=>p.theme.colors.primaryTransparent};}
`;
const Trunc = styled.div`flex:1;display:-webkit-box;-webkit-line-clamp:${p=>p.expanded? 'unset':'4'};-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;`; 
const ScriptBox = styled.pre`white-space:pre-wrap;font-family:inherit;font-size:.76rem;line-height:1.2rem;margin:0;`; 
const ItemIndex = styled.span`font-weight:600;opacity:.85;`; 
const ItemActions = styled.div`display:flex;align-items:center;gap:.45rem;position:absolute;top:4px;right:4px;`; 
const IconBtn = styled.button`background:rgba(255,255,255,.05);border:1px solid ${p=>p.theme.colors.border};width:24px;height:24px;border-radius:8px;display:grid;place-items:center;color:${p=>p.theme.colors.textDim};cursor:pointer;font-size:12px;transition:.25s;border-radius:8px;
&:hover{color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface2};}
&:active{scale:.9}
`;
const StatBar = styled.div`display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem;margin:-.3rem 0 1.1rem;`;
const StatChip = styled.span`font-size:.62rem;letter-spacing:.5px;text-transform:uppercase;padding:.4rem .65rem;border-radius:999px;display:inline-flex;gap:.35rem;align-items:center;background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};color:${p=>p.theme.colors.textDim};font-weight:500;`;
const MainHeaderActions = styled.div`display:flex;gap:.5rem;position:absolute;top:.65rem;right:.7rem;z-index:2;`;
const SmallLabel = styled.span`font-size:.55rem;font-weight:600;letter-spacing:.7px;opacity:.65;`;
const Actions = styled.div`display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:1.6rem;`;

export function Step3Scripts(){
  const { scripts, setStep, generateImages, loading } = usePipeline();
  const { script = '', voiceScripts = [], imagePrompts = [] } = scripts || {};
  const [copiedItem, setCopiedItem] = useState(null);
  const [expandedVoice, setExpandedVoice] = useState(new Set());
  const [expandedPrompt, setExpandedPrompt] = useState(new Set());

  const copyText = (text, key) => {
    if(!text) return;
    navigator.clipboard.writeText(text).then(()=>{
      setCopiedItem(key);
      setTimeout(()=> setCopiedItem(null), 1500);
    });
  };

  const statWords = script? script.trim().split(/\s+/).length : 0;
  const statChars = script.length;

  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Scripts & Prompts</Title>
      <StatBar>
        <StatChip><SmallLabel>Script Words</SmallLabel> {statWords}</StatChip>
        <StatChip><SmallLabel>Characters</SmallLabel> {statChars}</StatChip>
        <StatChip><SmallLabel>Voice Segments</SmallLabel> {voiceScripts.length}</StatChip>
        <StatChip><SmallLabel>Image Prompts</SmallLabel> {imagePrompts.length}</StatChip>
      </StatBar>
      <Grid>
        <Panel style={{gridColumn:'1/-1'}} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.04,type:'spring',damping:28}}>
          <SectionLabel>Main Script</SectionLabel>
          <MainHeaderActions>
            <IconBtn aria-label="Copy main script" onClick={()=>copyText(script,'main')}>{copiedItem==='main'? <FiCheck size={14}/> : <FiCopy size={14}/>}</IconBtn>
          </MainHeaderActions>
          <Scroll>
            <ScriptBox>{script || 'No main script generated.'}</ScriptBox>
          </Scroll>
        </Panel>
        <Panel initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.08,type:'spring',damping:28}}>
          <SectionLabel>Voice Scripts ({voiceScripts.length})</SectionLabel>
          <Scroll>
            {voiceScripts.length ? voiceScripts.map((s,i)=>{
              const expanded = expandedVoice.has(i);
              return (
                <Item key={i} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.015}}>
                  <ItemIndex>{i+1}.</ItemIndex>
                  <Trunc expanded={expanded}>{s}</Trunc>
                  <ItemActions>
                    <IconBtn aria-label="Copy" onClick={()=>copyText(s,'v'+i)}>{copiedItem==='v'+i? <FiCheck size={13}/> : <FiCopy size={13}/>}</IconBtn>
                    <IconBtn aria-label={expanded? 'Collapse':'Expand'} onClick={()=>{const ns=new Set(expandedVoice); expanded? ns.delete(i): ns.add(i); setExpandedVoice(ns);}}>{expanded? <FiMinimize2 size={13}/> : <FiMaximize2 size={13}/>}</IconBtn>
                  </ItemActions>
                </Item>
              );
            }) : <Item>No voice scripts.</Item>}
          </Scroll>
        </Panel>
        <Panel initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.12,type:'spring',damping:28}}>
          <SectionLabel>Image Prompts ({imagePrompts.length})</SectionLabel>
          <Scroll>
            {imagePrompts.length ? imagePrompts.map((p,i)=>{
              const expanded = expandedPrompt.has(i);
              return (
                <Item key={i} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.015}}>
                  <ItemIndex>{i+1}.</ItemIndex>
                  <Trunc expanded={expanded}>{p}</Trunc>
                  <ItemActions>
                    <IconBtn aria-label="Copy" onClick={()=>copyText(p,'p'+i)}>{copiedItem==='p'+i? <FiCheck size={13}/> : <FiCopy size={13}/>}</IconBtn>
                    <IconBtn aria-label={expanded? 'Collapse':'Expand'} onClick={()=>{const ns=new Set(expandedPrompt); expanded? ns.delete(i): ns.add(i); setExpandedPrompt(ns);}}>{expanded? <FiMinimize2 size={13}/> : <FiMaximize2 size={13}/>}</IconBtn>
                  </ItemActions>
                </Item>
              );
            }) : <Item>No image prompts.</Item>}
          </Scroll>
        </Panel>
      </Grid>
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(2)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        <GradientButton whileTap={{scale:.95}} onClick={generateImages} disabled={loading || !imagePrompts.length}><FiChevronRight/> Generate Images</GradientButton>
      </Actions>
    </AnimatedPanel>
  );
}
