import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { usePipeline } from '../context/PipelineContext';

const Wrapper = styled.div`position:sticky;top:58px;z-index:55;margin-top:.35rem;`;
const TrackOuter = styled.div`position:relative;display:flex;justify-content:center;`;
const Track = styled.div`
  --pad: clamp(.9rem,2.5vw,1.6rem);
  display:flex;align-items:flex-start;justify-content:center;flex-wrap:wrap;row-gap:1.1rem;column-gap:clamp(.5rem,1.3vw,1.2rem);
  padding:1.15rem var(--pad) 1.4rem;max-width:1000px;width:100%;margin:0 auto;position:relative;
  background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.lg};
  backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);
  box-shadow:${p=>p.theme.shadows.lg};
`;
const ProgressLineBase = styled.div`position:absolute;left:var(--line-left,0px);top:46px;height:4px;border-radius:4px;background:${p=>p.theme.colors.surface2};width:var(--line-width,0px);transition:width .4s ease;`;
const ProgressLine = styled(motion.div)`
  position:absolute;top:46px;height:4px;border-radius:4px;pointer-events:none;
  background:linear-gradient(90deg, hsl(270 95% 65%), hsl(300 95% 65%), hsl(270 95% 65%));
  background-size:200% 100%;
  box-shadow:0 0 0 1px rgba(255,255,255,0.05),0 0 14px -2px hsla(280,95%,60%,.7);
  animation:progressShimmer 3.2s linear infinite;
  @keyframes progressShimmer { 0%{background-position:0% 50%;} 100%{background-position:-200% 50%;} }
`;
const ProgressDot = styled(motion.div)`
  position:absolute;top:46px;width:16px;height:16px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #fff, ${p=>p.theme.colors.primary} 55%, ${p=>p.theme.colors.primaryAlt});
  box-shadow:0 0 0 3px ${p=>p.theme.colors.primaryTransparent},0 0 18px -2px ${p=>p.theme.colors.primaryAlt};
  transform:translate(-50%,-50%);
`;
const StepBtn = styled(motion.button)`
  --size:44px;--ring-size:56px;
  width:var(--size);height:var(--size);min-width:var(--size);border:none;border-radius:50%;display:grid;place-items:center;font-weight:600;font-size:1rem;cursor:pointer;position:relative;
  color:${p=>p.active? p.theme.colors.white : p.theme.colors.text};
  background:${p=>p.active? p.theme.colors.primary : p.completed? p.theme.colors.success : p.theme.colors.surface2};
  box-shadow:${p=>p.active? p.theme.shadows.md : '0 0 0 1px '+p.theme.colors.border};transition:${p=>p.theme.transitions.base};
  outline:none;border:2px solid transparent;
  &:hover:not(:disabled){transform:translateY(-4px);} &:active{transform:translateY(-1px);}
  &:focus-visible{box-shadow:0 0 0 3px ${p=>p.theme.colors.focus};}
  &:disabled{cursor:default;opacity:.55;}
`;
const Ring = styled(motion.div)`position:absolute;inset:0;margin:calc((var(--ring-size) - var(--size))*-0.5);width:var(--ring-size);height:var(--ring-size);border-radius:50%;background:radial-gradient(circle,${p=>p.theme.colors.primaryTransparent},transparent 70%);pointer-events:none;`;
const StepWrapper = styled.div`position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:.45rem;`;
const StepLabel = styled.span`font-size:.6rem;letter-spacing:.11em;text-transform:uppercase;font-weight:600;color:${p=>p.theme.colors.textSecondary};white-space:nowrap;max-width:72px;text-align:center;line-height:1.1;`;

const labels = ['Create','Content','Scripts','Images','Voices','Edit','Music','Captions','Final'];

export function ProgressSteps(){
  const { step, setStep } = usePipeline();
  const trackRef = useRef(null);
  const stepRefs = useRef([]);
  const [line, setLine] = useState({ left:0, width:0, ready:false });

  useEffect(()=>{
    const calc = () => {
      if(!trackRef.current || !stepRefs.current[0]) return;
      const firstEl = stepRefs.current[0];
      const activeEl = stepRefs.current[step-1];
      if(!activeEl) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const firstRect = firstEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const firstCenter = firstRect.left + firstRect.width/2 - trackRect.left;
      const activeCenter = activeRect.left + activeRect.width/2 - trackRect.left;
      setLine({ left:firstCenter, width:Math.max(activeCenter - firstCenter, 0), ready:true });
    };
    calc();
    const ro = new ResizeObserver(()=>calc());
    if(trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', calc);
    return ()=>{ window.removeEventListener('resize', calc); ro.disconnect(); };
  },[step]);

  return (
    <Wrapper aria-label="Progress" role="group">
      <TrackOuter>
        <Track ref={trackRef}>
          {line.ready && <ProgressLineBase style={{'--line-left':`${line.left}px`, '--line-width':`${line.width}px`}} />}
          {line.ready && (
            <>
              <ProgressLine layout key={step} initial={{left:line.left, width:0}} animate={{left:line.left, width:line.width}} transition={{type:'spring', stiffness:320, damping:34}} />
              <ProgressDot layout initial={{left:line.left, scale:.4, opacity:0}} animate={{left:line.left + line.width, scale:1, opacity:1}} transition={{type:'spring', stiffness:300, damping:30}} />
            </>
          )}
          {Array.from({length:9}, (_,i)=>{
            const index=i+1; const active=index===step; const completed=index<step;
            return (
              <StepWrapper key={index} ref={el=> stepRefs.current[i]=el}>
                <StepBtn active={active} completed={completed} disabled={!completed && !active}
                  onClick={()=> completed && setStep(index)}
                  initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:.02*i,type:'spring',stiffness:520}}
                  aria-current={active? 'step':undefined} aria-label={`Step ${index} ${labels[i]} ${active? '(current)':''}`}> 
                  {active && <Ring layoutId="activeStepRing" initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:320}} />}
                  {completed? <FiCheck size={20}/> : index}
                </StepBtn>
                <StepLabel>{labels[i]}</StepLabel>
              </StepWrapper>
            );
          })}
        </Track>
      </TrackOuter>
    </Wrapper>
  );
}
