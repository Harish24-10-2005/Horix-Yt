import React from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiChevronLeft, FiCopy, FiCheck } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { fadeSlideUp, AnimatedPanel, GradientButton, OutlineButton, SectionLabel, StatBar, StatChip, SmallLabel, TitleGlow, IconBtn } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1.4rem;text-align:center;font-size:clamp(1.8rem,3.2vw,2.5rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const ContentBox = styled(motion.div)`background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};padding:1.4rem 1.6rem;border-radius:${p=>p.theme.radii.lg};position:relative;min-height:170px;line-height:1.5;font-size:.9rem;`;
const Actions = styled.div`display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:2rem;`;

export function Step2Content(){
  const { content, generateScripts, setStep, loading } = usePipeline();
  const [copied,setCopied] = React.useState(false);
  const lines = content? content.split(/\n+/) : [];
  const wordCount = content? content.trim().split(/\s+/).filter(Boolean).length:0;
  const paragraphs = lines.filter(l=>l.trim()).length;
  const estDuration = Math.ceil(wordCount/150);
  const copyAll = () => { if(!content) return; navigator.clipboard.writeText(content).then(()=>{setCopied(true); setTimeout(()=>setCopied(false),1200);}); };
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><TitleGlow/>Review Content</Title>
      <StatBar>
        <StatChip><SmallLabel>Words</SmallLabel> {wordCount}</StatChip>
        <StatChip><SmallLabel>Paragraphs</SmallLabel> {paragraphs}</StatChip>
        <StatChip><SmallLabel>Est. Duration</SmallLabel> {estDuration}m</StatChip>
      </StatBar>
      <div style={{position:'relative'}}>
        <SectionLabel>Generated Concept</SectionLabel>
        <div style={{position:'absolute',top:-4,right:0,display:'flex',gap:6}}>
          <IconBtn type="button" aria-label="Copy content" onClick={copyAll}>{copied? <FiCheck size={14}/> : <FiCopy size={14}/>}</IconBtn>
        </div>
      </div>
      <ContentBox initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
        {content ? (
          <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:.04}}}}>
            {lines.map((ln,i)=>(
              <motion.p key={i} style={{margin:'0 0 .75rem'}} variants={{hidden:{opacity:0,y:6},visible:{opacity:1,y:0}}}>{ln}</motion.p>
            ))}
          </motion.div>
        ) : (
          <div style={{opacity:.7,fontSize:'.8rem'}}>No content generated yet.</div>
        )}
      </ContentBox>
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(1)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        <GradientButton whileTap={{scale:.95}} onClick={generateScripts} disabled={!content || loading}><FiChevronRight/> Generate Scripts</GradientButton>
      </Actions>
    </AnimatedPanel>
  );
}
