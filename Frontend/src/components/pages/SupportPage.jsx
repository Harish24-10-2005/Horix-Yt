import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiGithub, FiLinkedin, FiExternalLink, FiBookOpen, FiAlertCircle } from 'react-icons/fi';

const Wrapper = styled.div`padding:3rem 0 5rem;display:flex;flex-direction:column;gap:3.5rem;`;
const Head = styled.div`text-align:center;max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;`;
const Title = styled.h1`margin:0;font-size:clamp(2.1rem,4.5vw,3.2rem);letter-spacing:-.02em;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`;
const Lead = styled.p`margin:0;font-size:clamp(.95rem,1.15vw,1.1rem);line-height:1.55;color:${p=>p.theme.colors.textSecondary};`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.3rem;`;
const Card = styled(motion.div)`padding:1.4rem 1.25rem 1.5rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.lg};background:${p=>p.theme.colors.surface2};display:flex;flex-direction:column;gap:.7rem;position:relative;overflow:hidden;box-shadow:${p=>p.theme.shadows.sm};
  &:hover{background:${p=>p.theme.colors.surface3};}
`;
const CardTitle = styled.h3`margin:0;font-size:1.05rem;letter-spacing:.01em;display:flex;align-items:center;gap:.55rem;`;
const CardText = styled.p`margin:0;font-size:.75rem;line-height:1.45;color:${p=>p.theme.colors.textSecondary};`;
const ContactRow = styled.div`display:flex;flex-direction:column;gap:.5rem;margin-top:.3rem;font-size:.72rem;`;
const ContactLink = styled.a`color:${p=>p.theme.colors.primary};text-decoration:none;display:inline-flex;align-items:center;gap:.4rem;font-weight:500;font-size:.72rem; &:hover{text-decoration:underline;}`;
const FAQSection = styled.section`display:flex;flex-direction:column;gap:1.6rem;`;
const FAQItem = styled(motion.div)`border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii.md};background:${p=>p.theme.colors.surface2};padding:1rem 1rem 1.15rem;display:flex;flex-direction:column;gap:.55rem;`;
const Q = styled.h4`margin:0;font-size:.9rem;display:flex;align-items:center;gap:.55rem;`;
const A = styled.p`margin:0;font-size:.72rem;line-height:1.45;color:${p=>p.theme.colors.textSecondary};`;

const faqs = [
  ['What is Horix YT?', 'An AI‑driven multi‑agent pipeline that converts a single prompt into a production‑ready video by orchestrating content, visuals, voice, music, captions, and assembly.'],
  ['Do I need technical skills?', 'No. The interface abstracts complexity. You describe intent; agents generate assets, while allowing selective regeneration when you want refinements.'],
  ['Is asset generation iterative?', 'Yes. You can regenerate scripts, modify images, re‑synthesize voices, or replace music without restarting other finalized stages.'],
  ['How is my data used?', 'Only for generation workflows; no third‑party selling. Future roadmap includes encrypted project storage + export portability.'],
  ['Can I bring my own voice?', 'Yes. Upload samples to clone your voice (follow ethical usage guidelines).'],
];

export function SupportPage(){
  return (
    <Wrapper>
      <Head>
        <Title>Support & Resources</Title>
        <Lead>Get help, explore docs, or reach out directly. Your creative velocity matters.</Lead>
      </Head>
      <Grid>
        <Card initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <CardTitle><FiBookOpen/> Documentation</CardTitle>
          <CardText>Concept guides, pipeline breakdowns, and best practices for optimal outputs.</CardText>
          <ContactLink href="#docs"><FiExternalLink/> Browse Docs</ContactLink>
        </Card>
        <Card initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.05}}>
          <CardTitle><FiAlertCircle/> Status & Updates</CardTitle>
          <CardText>Track feature rollouts, maintenance windows, and agent improvements.</CardText>
          <ContactLink href="#changelog"><FiExternalLink/> View Changelog</ContactLink>
        </Card>
        <Card initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}}>
          <CardTitle><FiMail/> Direct Contact</CardTitle>
          <CardText>Reach out for technical questions, integration help, or feedback.</CardText>
          <ContactRow>
            <ContactLink href="mailto:harish.r2023ai-ds@sece.ac.in"><FiMail/> harish.r2023ai-ds@sece.ac.in</ContactLink>
            <ContactLink href="tel:+918807639930"><FiPhone/> +91 88076 39930</ContactLink>
            <ContactLink href="https://github.com/Harish24-10-2005" target="_blank" rel="noreferrer"><FiGithub/> GitHub</ContactLink>
            <ContactLink href="https://www.linkedin.com/in/harish-r-12372b28b/" target="_blank" rel="noreferrer"><FiLinkedin/> LinkedIn</ContactLink>
            <ContactLink href="https://harishravikumar.netlify.app/" target="_blank" rel="noreferrer"><FiExternalLink/> Portfolio</ContactLink>
          </ContactRow>
        </Card>
      </Grid>
      <FAQSection>
        {faqs.map(([q,a],i)=> (
          <FAQItem key={q} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.04}}>
            <Q>{q}</Q>
            <A>{a}</A>
          </FAQItem>
        ))}
      </FAQSection>
    </Wrapper>
  );
}
export default SupportPage;
