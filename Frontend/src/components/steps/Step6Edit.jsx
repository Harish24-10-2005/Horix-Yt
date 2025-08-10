import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiEdit2 } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, StatBar, StatChip, TitleGlow, SmallLabel } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 .9rem;text-align:center;font-size:clamp(1.8rem,3vw,2.3rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Info = styled.p`text-align:center;font-size:.85rem;opacity:.8;margin:0 auto 1rem;max-width:560px;line-height:1.5;`;
const Actions = styled.div`display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;`;

export function Step6Edit(){
  const { editVideo, setStep, videoMode, loading, images, voices } = usePipeline();
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Assemble Video</Title>
      <StatBar>
        <StatChip><SmallLabel>Images</SmallLabel> {images.length}</StatChip>
        <StatChip><SmallLabel>Voice Clips</SmallLabel> {voices.length}</StatChip>
        <StatChip><SmallLabel>Format</SmallLabel> {videoMode? '16:9':'9:16'}</StatChip>
      </StatBar>
      <Info>Combine {videoMode? 'landscape':'vertical'} images & narration into a cohesive dynamic sequence with automatic pacing.</Info>
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(5)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        <GradientButton whileTap={{scale:.95}} onClick={editVideo} disabled={loading || !images.length || !voices.length}><FiEdit2/> Assemble Video</GradientButton>
      </Actions>
    </AnimatedPanel>
  );
}
