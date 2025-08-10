import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiMusic } from 'react-icons/fi';
import { usePipeline } from '../../context/PipelineContext';
import { AnimatedPanel, GradientButton, OutlineButton, fadeSlideUp, SectionLabel, StatBar, StatChip, TitleGlow, SmallLabel } from '../ui/motionPrimitives';
import { motion } from 'framer-motion';

const Title = styled(motion.h2)`margin:0 0 1rem;text-align:center;font-size:clamp(1.8rem,3vw,2.3rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Row = styled.div`display:flex;flex-wrap:wrap;align-items:center;gap:1rem;`;
const CheckboxLabel = styled.label`display:flex;align-items:center;gap:.55rem;font-size:.7rem;cursor:pointer;background:${p=>p.theme.colors.surface2};padding:.65rem 1rem;border-radius:${p=>p.theme.radii.md};border:1px solid ${p=>p.theme.colors.border};font-weight:500;`;
const Actions = styled.div`display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:1.4rem;`;

export function Step7Music(){
  const { addBackgroundMusic, setStep, loading, bgAdded } = usePipeline();
  const [file,setFile] = useState(null);
  const [addCaptions,setAddCaptions] = useState(false);
  const submit = () => addBackgroundMusic({ file, addCaptions });
  return (
    <AnimatedPanel variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" layout>
      <Title><TitleGlow/>Background Music</Title>
      <StatBar>
        <StatChip><SmallLabel>Status</SmallLabel> {bgAdded? 'Added':'Pending'}</StatChip>
        {file && <StatChip><SmallLabel>File</SmallLabel> {file.name}</StatChip>}
        <StatChip><SmallLabel>Next</SmallLabel> {addCaptions? 'Captions':'Finalize'}</StatChip>
      </StatBar>
      <SectionLabel>Upload track (optional)</SectionLabel>
      <Row>
        <input type="file" accept="audio/mpeg,audio/wav" onChange={e=>setFile(e.target.files[0])} disabled={loading} />
        <CheckboxLabel>
          <input type="checkbox" checked={addCaptions} onChange={e=>setAddCaptions(e.target.checked)} disabled={loading} /> Add captions next
        </CheckboxLabel>
      </Row>
      <Actions>
        <OutlineButton whileTap={{scale:.95}} onClick={()=>setStep(6)} disabled={loading}><FiChevronLeft/> Back</OutlineButton>
        {file ? (
          <GradientButton whileTap={{scale:.95}} onClick={submit} disabled={loading}><FiMusic/> Add Music & Continue</GradientButton>
        ) : (
          <GradientButton whileTap={{scale:.95}} onClick={()=> addBackgroundMusic({ file:null, addCaptions })} disabled={loading}><FiChevronRight/> Skip Music</GradientButton>
        )}
      </Actions>
    </AnimatedPanel>
  );
}
