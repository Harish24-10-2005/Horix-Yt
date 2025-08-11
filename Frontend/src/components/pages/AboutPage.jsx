import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTarget, FiLayers, FiCode, FiTrendingUp, FiAward } from 'react-icons/fi';

const Wrapper = styled.div`padding:3rem 0 5rem;display:flex;flex-direction:column;gap:3.8rem;`;
const Hero = styled.div`max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:1.2rem;text-align:center;`;
const Title = styled.h1`margin:0;font-size:clamp(2.4rem,5vw,3.6rem);letter-spacing:-.02em;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`;
const Lead = styled.p`margin:0;font-size:clamp(1rem,1.3vw,1.2rem);line-height:1.55;color:${p=>p.theme.colors.textSecondary};`;
const TwoCol = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2.2rem;align-items:start;`;
const Block = styled(motion.div)`padding:1.6rem 1.4rem 1.7rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.lg};background:${p=>p.theme.colors.surface2};display:flex;flex-direction:column;gap:.75rem;box-shadow:${p=>p.theme.shadows.sm};`;
const BlockTitle = styled.h3`margin:0;font-size:1.1rem;letter-spacing:.01em;display:flex;align-items:center;gap:.6rem;`;
const BlockText = styled.p`margin:0;font-size:.78rem;line-height:1.5;color:${p=>p.theme.colors.textSecondary};`;
const TagCloud = styled.div`display:flex;flex-wrap:wrap;gap:.55rem;`;
const Tag = styled.span`padding:.4rem .65rem;font-size:.55rem;letter-spacing:.1em;font-weight:600;text-transform:uppercase;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.pill};background:${p=>p.theme.colors.surface3};opacity:.85;`;
const SectionTitle = styled.h2`margin:0 0 1.2rem;font-size:clamp(1.9rem,3.2vw,2.5rem);letter-spacing:-.01em;text-align:center;`;
const Timeline = styled.ol`list-style:none;margin:0;padding:0;display:grid;gap:1rem;`;
const Milestone = styled.li`padding:1rem 1rem 1.15rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.md};background:${p=>p.theme.colors.surface2};display:flex;flex-direction:column;gap:.4rem;`;
const Note = styled.p`margin:0;font-size:.65rem;letter-spacing:.08em;opacity:.65;text-align:center;text-transform:uppercase;`;

const skills = ['Python','C++','FastAPI','React','LangChain','LangGraph','Kafka','Spark','Airflow','Hadoop','NiFi','SQL','MongoDB','Neo4j','Docker','RAG','AI Agents','MCP','p5.js','Manim'];
const achievements = [
  'Creatathon – 1st Place (Solo)',
  'Electra Code Debug – 1st Place',
  'Python Project Expo – 1st Place',
  'Code Fiesta – 1st Place'
];
const milestones = [
  ['2024','Laid groundwork for multi-agent video generation concepts.'],
  ['Early 2025','Implemented full pipeline MVP (scripts → images → voices → edit).'],
  ['Mid 2025','Added iterative refinement + parallelism + gallery management.'],
  ['Late 2025','Expanded autonomous MCP tool acquisition for Horix AI platform.']
];

export function AboutPage(){
  return (
    <Wrapper>
      <Hero>
        <Title>About The Developer</Title>
        <Lead>Hi, I'm Harish R — AI + data engineering enthusiast focused on autonomous agent systems, distributed data flows, and creative automation tooling.</Lead>
      </Hero>
      <TwoCol>
        <Block initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <BlockTitle><FiTarget/> Mission</BlockTitle>
          <BlockText>Empower creators to convert raw intent into engaging video content with near‑zero friction by orchestrating specialized AI agents across the entire production lifecycle.</BlockText>
        </Block>
        <Block initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.05}}>
          <BlockTitle><FiLayers/> Philosophy</BlockTitle>
          <BlockText>Design for iteration, transparency, and extensibility. Every stage should be independently improvable without pipeline resets.</BlockText>
        </Block>
        <Block initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}}>
          <BlockTitle><FiCode/> Tech Focus</BlockTitle>
          <BlockText>Multi-agent coordination, async orchestration, retrieval‑augmented reasoning, and dynamic tool acquisition (MCP) to expand autonomous capabilities in real time.</BlockText>
        </Block>
        <Block initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.15}}>
          <BlockTitle><FiTrendingUp/> Growth</BlockTitle>
          <BlockText>Consistently scaling throughput, reducing latency, and improving creative control loops via caching, parallelism, and structured agent messaging.</BlockText>
        </Block>
        <Block initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.2}}>
          <BlockTitle><FiAward/> Achievements</BlockTitle>
          <BlockText>{achievements.join(' • ')}</BlockText>
        </Block>
      </TwoCol>

      <div>
        <SectionTitle>Core Skills & Stack</SectionTitle>
        <TagCloud>{skills.map(s=> <Tag key={s}>{s}</Tag>)}</TagCloud>
      </div>

      <div>
        <SectionTitle>Milestones</SectionTitle>
        <Timeline>
          {milestones.map(([year,text])=> <Milestone key={year}><strong>{year}</strong><span style={{fontSize:'.72rem',opacity:.75}}>{text}</span></Milestone>)}
        </Timeline>
        <Note>Continuously iterating — more autonomous capabilities coming.</Note>
      </div>
    </Wrapper>
  );
}
export default AboutPage;
