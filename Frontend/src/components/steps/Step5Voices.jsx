import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlay, FiUpload, FiVolume2, FiCopy, FiCheck } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, SectionLabel, SoftSelect, StatBar, StatChip, TitleGlow, SmallLabel, IconBtn } from '../ui/motionPrimitives';

const Title = styled(motion.h2)`margin:0 0 1rem;text-align:center;font-size:clamp(1.8rem,3vw,2.4rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Mode = styled.div`font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;background:${p=>p.theme.colors.surface2};padding:.55rem 1rem;border-radius:${p=>p.theme.radii.md};display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem;color:${p=>p.theme.colors.textSecondary};`;
const Row = styled.div`display:flex;gap:1rem;flex-wrap:wrap;align-items:center;`;
const CheckboxLabel = styled.label`display:flex;align-items:center;gap:.55rem;font-size:.7rem;cursor:pointer;background:${p=>p.theme.colors.surface2};padding:.65rem 1rem;border-radius:${p=>p.theme.radii.md};border:1px solid ${p=>p.theme.colors.border};font-weight:500;`;
const ScriptsBox = styled.div`background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};padding:1rem;border-radius:${p=>p.theme.radii.lg};max-height:300px;overflow:auto;display:grid;gap:.5rem;`;
const ScriptItem = styled(motion.div)`font-size:.7rem;line-height:1.05rem;padding:.55rem .6rem;border-radius:9px;background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};display:flex;gap:.45rem;`;
const VoicesList = styled.div`display:grid;gap:.7rem;margin-top:.5rem;`;
const VoiceClip = styled(motion.div)`display:flex;align-items:center;justify-content:space-between;gap:1rem;background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};padding:.55rem .75rem;border-radius:${p=>p.theme.radii.md};`;

const voiceOptions = [
  '', 'Arista-PlayAI','Atlas-PlayAI','Basil-PlayAI','Celeste-PlayAI','Mason-PlayAI','Quinn-PlayAI',
  'Briggs-PlayAI','Calum-PlayAI','Cheyenne-PlayAI','Chip-PlayAI','Cillian-PlayAI','Deedee-PlayAI',
  'Fritz-PlayAI','Gail-PlayAI','Indigo-PlayAI','Mamaw-PlayAI','Mikail-PlayAI','Mitch-PlayAI','Thunder-PlayAI'
];

export function Step5Voices(){
  const { scripts, voices, generateVoices, setStep, voiceChoice, setVoiceChoice, ownVoice, setOwnVoice, loading } = usePipeline();
  const [customFile, setCustomFile] = useState(null);
  const [copied,setCopied] = useState(false);
  const submit = () => generateVoices({ voice: voiceChoice, ownVoice, customFile });
  const copyAll = () => { if(!scripts.voiceScripts.length) return; navigator.clipboard.writeText(scripts.voiceScripts.join('\n')).then(()=>{setCopied(true); setTimeout(()=>setCopied(false),1300);}); };
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Generate Voices</Title>
      <StatBar>
        <StatChip><SmallLabel>Lines</SmallLabel> {scripts.voiceScripts.length}</StatChip>
        <StatChip><SmallLabel>Voice</SmallLabel> {ownVoice? 'Custom' : (voiceChoice || 'Default')}</StatChip>
        <StatChip><SmallLabel>Generated</SmallLabel> {voices.length}</StatChip>
      </StatBar>
      <Mode>
        <span>Voice script lines: <strong>{scripts.voiceScripts.length}</strong></span>
        <span>{voices.length} generated</span>
      </Mode>
      <Row>
        <div>
          <SectionLabel>Voice</SectionLabel>
          <SoftSelect value={voiceChoice} disabled={ownVoice || loading} onChange={e=>setVoiceChoice(e.target.value)} style={{minWidth:220}}>
            {voiceOptions.map(v=> <option key={v} value={v}>{v? v: 'Default AI Voice'}</option>)}
          </SoftSelect>
        </div>
        <CheckboxLabel>
          <input type="checkbox" checked={ownVoice} disabled={loading} onChange={e=>setOwnVoice(e.target.checked)} /> Use my own voice
        </CheckboxLabel>
        {ownVoice && (
          <motion.label initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.65rem 1rem',background:'rgba(255,255,255,0.04)',border:'1px solid '+ 'rgba(255,255,255,0.08)',borderRadius:14}}>
            <FiUpload />
            <input type="file" accept="audio/mpeg,audio/wav" onChange={e=>setCustomFile(e.target.files[0])} disabled={loading} />
          </motion.label>
        )}
      </Row>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <SectionLabel>Voice Scripts</SectionLabel>
          <IconBtn type="button" aria-label="Copy all voice scripts" onClick={copyAll}>{copied? <FiCheck size={14}/> : <FiCopy size={14}/>}</IconBtn>
        </div>
        <ScriptsBox>
          {scripts.voiceScripts.length? scripts.voiceScripts.map((s,i)=>(<ScriptItem key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}><strong>{i+1}.</strong><span>{s}</span></ScriptItem>)) : <div style={{opacity:.7,fontSize:'.7rem'}}>No voice scripts.</div>}
        </ScriptsBox>
      </div>
      {voices.length>0 && (
        <div>
          <SectionLabel>Generated Clips</SectionLabel>
          <VoicesList>
            {voices.map((v,i)=>(
              <VoiceClip key={v||i} initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.04,type:'spring',stiffness:260}}>
                <span style={{fontSize:'.65rem',display:'flex',alignItems:'center',gap:4}}><FiVolume2/> Clip {i+1}</span>
                <audio controls src={v} style={{maxWidth:'240px'}}/>
              </VoiceClip>
            ))}
          </VoicesList>
        </div>
      )}
      <Row style={{justifyContent:'space-between'}}>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(4)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        {voices.length === 0 ? (
          <GradientButton whileTap={{scale:.95}} onClick={submit} disabled={loading || (ownVoice && !customFile) || scripts.voiceScripts.length===0}><FiPlay/> Generate Voices</GradientButton>
        ) : (
          <GradientButton whileTap={{scale:.95}} onClick={()=>setStep(6)} disabled={loading}><FiChevronRight/> Continue to Editing</GradientButton>
        )}
      </Row>
    </AnimatedPanel>
  );
}
