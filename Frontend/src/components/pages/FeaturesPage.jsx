import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCpu, FiType, FiImage, FiMusic, FiVideo, FiRefreshCw, FiZap } from 'react-icons/fi';

const Wrapper = styled.div`padding:3rem 0 4rem;display:flex;flex-direction:column;gap:3.5rem;`;
const SectionHead = styled.div`text-align:center;max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:1.1rem;`;
const Title = styled.h1`margin:0;font-size:clamp(2.2rem,4.5vw,3.4rem);letter-spacing:-.02em;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`;
const Lead = styled.p`margin:0;font-size:clamp(.95rem,1.2vw,1.15rem);line-height:1.55;color:${p=>p.theme.colors.textSecondary};`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.3rem;`;
const Card = styled(motion.div)`padding:1.5rem 1.3rem 1.7rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.lg};background:${p=>p.theme.colors.surface2};display:flex;flex-direction:column;gap:.75rem;position:relative;overflow:hidden;box-shadow:${p=>p.theme.shadows.sm};
  &:hover{background:${p=>p.theme.colors.surface3};}
`;
const IconWrap = styled.div`width:54px;height:54px;border-radius:18px;display:grid;place-items:center;background:${p=>p.theme.colors.primaryTransparent};color:${p=>p.theme.colors.primary};font-size:1.5rem;`;
const CardTitle = styled.h3`margin:.25rem 0;font-size:1.15rem;letter-spacing:.01em;`;
const CardText = styled.p`margin:0;font-size:.8rem;line-height:1.45;color:${p=>p.theme.colors.textSecondary};`;
const SubTitle = styled.h2`margin:0 0 1.2rem;font-size:clamp(1.8rem,3vw,2.4rem);letter-spacing:-.01em;text-align:center;`;
const PipelineList = styled.ol`list-style:none;margin:0;padding:0;display:grid;gap:.9rem;counter-reset:step;`;
const PipelineItem = styled.li`padding:1rem 1rem 1.15rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.md};background:${p=>p.theme.colors.surface2};display:flex;flex-direction:column;gap:.4rem;position:relative;line-height:1.35;`;
const StepName = styled.span`font-weight:600;display:flex;align-items:center;gap:.6rem;`;
const StepBadge = styled.span`display:inline-flex;align-items:center;justify-content:center;font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;background:${p=>p.theme.colors.primaryTransparent};color:${p=>p.theme.colors.primary};border:1px solid ${p=>p.theme.colors.primaryTransparent};border-radius:${p=>p.theme.radii.pill};padding:.25rem .5rem;`;
const Note = styled.p`margin:0;max-width:860px;font-size:.7rem;line-height:1.5;color:${p=>p.theme.colors.textSecondary};text-align:center;`;

const featureCards = [
  { icon:<FiCpu/>, title:'Unified AI Pipeline', text:'All creative stages—script, images, voice, edit, music, captions—in one cohesive flow with persistent context.' },
  { icon:<FiType/>, title:'Smart Content Engine', text:'Multi-format outlines and narration driven by adaptive prompt expansion & user intent detection.' },
  { icon:<FiImage/>, title:'Adaptive Visual Generation', text:'Generate, refine, and batch iterate image assets with modification prompts without losing alignment.' },
  { icon:<FiMusic/>, title:'Layered Audio Stack', text:'Own‑voice cloning, narration synthesis, background music blending and timing-aware caption alignment.' },
  { icon:<FiVideo/>, title:'Automated Assembly', text:'Timeline assembly merges visuals, voice, music & captions, outputting production‑ready video drafts.' },
  { icon:<FiRefreshCw/>, title:'Iterative Editing Loop', text:'Modify any stage (e.g., regenerate voice for one segment) without re-running the whole pipeline.' },
  { icon:<FiZap/>, title:'Performance Optimized', text:'Concurrency + caching accelerate multi-agent actions for near real‑time feedback.' },
];

const pipeline = [
  ['Create','Seed the project: title, goals, tone, target platform.'],
  ['Content','Structured long-form outline + segments.'],
  ['Scripts','Expanded narration & granular image prompt stubs.'],
  ['Images','AI visual generation + iterative modifications.'],
  ['Voices','Voice cloning or TTS selection & synthesis.'],
  ['Edit','Programmatic timeline & asset composition.'],
  ['Music','Background scoring & level balancing.'],
  ['Captions','Accurate subtitle generation & sync.'],
  ['Final','Render preview & export downloadable asset.'],
];

export function FeaturesPage(){
  return (
    <Wrapper>
      <SectionHead>
        <Title>Powerful Features</Title>
        <Lead>Everything you need to turn a single idea into a fully‑produced video. Each stage is an AI agent working in concert.</Lead>
      </SectionHead>
      <Grid>
        {featureCards.map((c,i)=> (
          <Card key={c.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.04,duration:.5}}>
            <IconWrap>{c.icon}</IconWrap>
            <CardTitle>{c.title}</CardTitle>
            <CardText>{c.text}</CardText>
          </Card>
        ))}
      </Grid>
      <div>
        <SubTitle>Pipeline Overview</SubTitle>
        <PipelineList>
          {pipeline.map(([name,desc],i)=> (
            <PipelineItem key={name} as={motion.li} initial={{opacity:0,scale:.94}} whileInView={{opacity:1,scale:1}} viewport={{once:true, margin:'-40px'}} transition={{delay:i*0.03,type:'spring',stiffness:260,damping:24}}>
              <StepName><StepBadge>Step {i+1}</StepBadge> {name}</StepName>
              <span style={{fontSize:'.72rem',color:'inherit',opacity:.75}}>{desc}</span>
            </PipelineItem>
          ))}
        </PipelineList>
        <Note style={{marginTop:'1.8rem'}}>Designed for iteration, speed and creative control—without tool‑sprawl.</Note>
      </div>
    </Wrapper>
  );
}
export default FeaturesPage;
