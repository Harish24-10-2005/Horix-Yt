import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiType } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, StatBar, StatChip, TitleGlow, SmallLabel } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1rem;text-align:center;font-size:clamp(1.8rem,3vw,2.3rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Info = styled.p`text-align:center;font-size:.8rem;opacity:.8;margin:0 auto 1.2rem;max-width:520px;line-height:1.5;`;
const Actions = styled.div`display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;`;

export function Step8Captions(){
  const { addCaptionsToVideo, setStep, loading, captions, bgAdded } = usePipeline();
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Captions</Title>
      <StatBar>
        <StatChip><SmallLabel>Status</SmallLabel> {captions? 'Done':'Pending'}</StatChip>
        <StatChip><SmallLabel>Music</SmallLabel> {bgAdded? 'Yes':'No'}</StatChip>
      </StatBar>
      <Info>Create accessible, styled captions and burn them into the output video with glow highlights.</Info>
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(7)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        <GradientButton whileTap={{scale:.95}} onClick={addCaptionsToVideo} disabled={loading || captions}><FiType/> {captions? 'Regenerate':'Generate'} Captions</GradientButton>
      </Actions>
    </AnimatedPanel>
  );
}
