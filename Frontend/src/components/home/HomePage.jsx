import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCpu, FiZap, FiRefreshCw, FiImage, FiMusic, FiType, FiVideo } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';

// Hero Section
const Hero = styled.section`
  padding: clamp(3rem,8vw,6rem) 0 3.5rem;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.4rem;text-align:center;
`;
const HeroTitle = styled(motion.h1)`
  font-size:clamp(2.4rem,5vw,4rem);line-height:1.05;margin:0;font-weight:700;letter-spacing:-.02em;
  background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
`;
const HeroLead = styled(motion.p)`
  margin:0;max-width:860px;font-size:clamp(1rem,1.4vw,1.35rem);line-height:1.55;color:${p=>p.theme.colors.textSecondary};
`;
const Actions = styled.div`display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;`;
const PrimaryBtn = styled(motion.button)`
  background:${p=>p.theme.colors.gradientPrimary};color:#fff;border:none;padding:1rem 1.6rem;font-size:.95rem;font-weight:600;border-radius:${p=>p.theme.radii.lg};cursor:pointer;display:inline-flex;align-items:center;gap:.65rem;
  box-shadow:${p=>p.theme.shadows.md};position:relative;overflow:hidden;isolation:isolate;
  &:before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.15),transparent 40%,transparent 60%,rgba(255,255,255,.15));opacity:0;transition:.5s;}
  &:hover:before{opacity:1;}
  &:hover{transform:translateY(-2px);}
  &:active{transform:translateY(0);} 
`;
const OutlineBtn = styled(PrimaryBtn)`
  background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};box-shadow:none;border:1px solid ${p=>p.theme.colors.border};
  &:hover{background:${p=>p.theme.colors.surface3};}
  &:before{display:none;}
`;

// Feature Grid
const SectionTitle = styled.h2`margin:0 0 1.2rem;font-size:clamp(1.8rem,3.2vw,2.5rem);letter-spacing:-.01em;text-align:center;`;
const FeatureSection = styled.section`padding:4rem 0 3rem;`;
const FeaturesGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.4rem;margin-top:2rem;`;
const FeatureCard = styled(motion.div)`
  position:relative;padding:1.4rem 1.3rem 1.5rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.lg};background:${p=>p.theme.colors.surface2};
  display:flex;flex-direction:column;gap:.75rem;box-shadow:${p=>p.theme.shadows.sm};
  &:after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:${p=>p.theme.colors.gradientPrimary};mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);mask-composite:exclude;opacity:0;transition:.5s;}
  &:hover:after{opacity:1;} &:hover{transform:translateY(-4px);} 
`;
const IconWrap = styled.div`width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:1.4rem;background:${p=>p.theme.colors.primaryTransparent};color:${p=>p.theme.colors.primary};`;
const CardTitle = styled.h3`margin:0;font-size:1.05rem;letter-spacing:.02em;`;
const CardText = styled.p`margin:0;font-size:.8rem;line-height:1.4;color:${p=>p.theme.colors.textSecondary};`;

// Steps overview
const StepsOverview = styled.section`padding:4.5rem 0 3.2rem;`;
const StepsGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1.2rem;margin-top:2rem;`;
const StepItem = styled(motion.div)`padding:1rem 1rem 1.15rem;border-radius:${p=>p.theme.radii.md};background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};display:flex;flex-direction:column;gap:.55rem;position:relative;overflow:hidden;
  &:hover{background:${p=>p.theme.colors.surface3};}
`;
const StepNumber = styled.span`font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${p=>p.theme.colors.primaryAlt};`;
const StepName = styled.h4`margin:.1rem 0;font-size:1rem;font-weight:600;`;
const StepDesc = styled.p`margin:0;font-size:.7rem;line-height:1.35;color:${p=>p.theme.colors.textSecondary};`;

// CTA band
const CtaBand = styled.section`margin:4.5rem 0 5rem;padding:3.2rem clamp(1.5rem,4vw,3rem);border-radius:${p=>p.theme.radii.lg};position:relative;overflow:hidden;background:${p=>p.theme.colors.gradientPrimary};color:white;display:flex;flex-direction:column;align-items:center;gap:1.4rem;text-align:center;`;
const CtaTitle = styled.h2`margin:0;font-size:clamp(1.9rem,3vw,2.6rem);`;
const CtaText = styled.p`margin:0;max-width:760px;line-height:1.5;font-size:.95rem;`;
const CtaActions = styled.div`display:flex;flex-wrap:wrap;gap:.9rem;justify-content:center;`;

// Footer extension for home (above main footer)
const MiniMeta = styled.div`margin-top:1rem;font-size:.65rem;letter-spacing:.08em;opacity:.7;text-transform:uppercase;`;

const featureData = [
  { icon: <FiCpu/>, title: 'Unified AI Pipeline', text: 'All creative stages—script, images, voice, edit, music, captions—in one cohesive flow.' },
  { icon: <FiType/>, title: 'Smart Content Engine', text: 'Generates tailored multi-format scripts & detailed image prompts contextually.' },
  { icon: <FiImage/>, title: 'Adaptive Visuals', text: 'Generate & iteratively refine images with prompt-based modifications.' },
  { icon: <FiMusic/>, title: 'Custom Audio Layering', text: 'Own voice cloning, AI narration, and background music merging with captions.' },
  { icon: <FiVideo/>, title: 'Automated Assembly', text: 'Seamless video editing stage composes visuals, audio, and timing.' },
  { icon: <FiRefreshCw/>, title: 'Iterative Editing', text: 'Modify images or regenerate voices without restarting the pipeline.' },
  { icon: <FiZap/>, title: 'Performance Optimized', text: 'Parallelized operations & caching for a fluid creative experience.' },
];

const steps = [
  ['Create','Start with your video idea & meta.'],
  ['Content','Long-form outline & segments.'],
  ['Scripts','Detailed narration & prompts.'],
  ['Images','AI visuals + modifications.'],
  ['Voices','Choose or upload a voice.'],
  ['Edit','Assemble timeline automatically.'],
  ['Music','Add / upload background track.'],
  ['Captions','Generate accessible subtitles.'],
  ['Final','Preview & download output.'],
];

export function HomePage(){
  const { setStep } = usePipeline();
  return (
    <div>
      <Hero>
        <HeroTitle initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8}}>Horix YT</HeroTitle>
        <HeroLead initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1,duration:.7}}>
          The unified AI-first studio to ideate, generate, refine, and publish engaging video content—faster than ever.
        </HeroLead>
        <Actions>
          <PrimaryBtn whileTap={{scale:.95}} whileHover="hover" onClick={()=>setStep(1)}>
            Launch Creator <FiArrowRight />
          </PrimaryBtn>
          <OutlineBtn whileTap={{scale:.95}} onClick={()=>{
            const el = document.getElementById('features'); if(el) el.scrollIntoView({behavior:'smooth'});
          }}>Explore Features</OutlineBtn>
        </Actions>
      </Hero>

      <FeatureSection id="features">
        <SectionTitle>Production Pipeline Superpowers</SectionTitle>
        <HeroLead style={{maxWidth:720,margin:'0 auto'}}>
          Every stage of content creation orchestrated inside a single consistent workflow.
        </HeroLead>
        <FeaturesGrid>
          {featureData.map((f,i)=> (
            <FeatureCard key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:'-40px'}} transition={{delay:i*0.05,duration:.55}}>
              <IconWrap>{f.icon}</IconWrap>
              <CardTitle>{f.title}</CardTitle>
              <CardText>{f.text}</CardText>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeatureSection>

      <StepsOverview>
        <SectionTitle>9 Steps • One Seamless Flow</SectionTitle>
        <HeroLead style={{maxWidth:760,margin:'0 auto'}}>
          Understand the journey from idea spark to final downloadable video asset.
        </HeroLead>
        <StepsGrid>
          {steps.map(([name,desc],i)=> (
            <StepItem key={name} initial={{opacity:0,scale:.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true, margin:'-30px'}} transition={{delay:.03*i,type:'spring',stiffness:260,damping:24}}>
              <StepNumber>Step {i+1}</StepNumber>
              <StepName>{name}</StepName>
              <StepDesc>{desc}</StepDesc>
            </StepItem>
          ))}
        </StepsGrid>
      </StepsOverview>

      <CtaBand>
        <CtaTitle>Ready to Create with AI Velocity?</CtaTitle>
        <CtaText>Jump into the Horix YT pipeline and generate a production-ready video in minutes—not hours.</CtaText>
        <CtaActions>
          <PrimaryBtn whileTap={{scale:.95}} onClick={()=>setStep(1)}>Start Now <FiArrowRight/></PrimaryBtn>
          <OutlineBtn whileTap={{scale:.95}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Back to Top</OutlineBtn>
        </CtaActions>
        <MiniMeta>Experiment • Iterate • Publish</MiniMeta>
      </CtaBand>
    </div>
  );
}
