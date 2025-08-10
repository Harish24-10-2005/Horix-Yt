import { motion } from 'framer-motion';
import styled from 'styled-components';

// Reusable animation variants
export const fadeSlideUp = {
  initial: { opacity: 0, y: 28, scale: .98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: .55, ease: [0.4,0,0.2,1] } },
  exit: { opacity: 0, y: -14, scale: .98, transition: { duration: .35 } }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: .06 } }
};

export const popItem = {
  initial: { opacity: 0, scale: .85, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type:'spring', stiffness: 340, damping: 28 } }
};

export const shimmer = {
  initial: { backgroundPosition: '200% 50%' },
  animate: { backgroundPosition: '0% 50%', transition: { duration: 2.2, repeat: Infinity, ease: 'linear' } }
};

// Styled wrapper components
export const AnimatedPanel = styled(motion.div)`
  position:relative;padding:2.4rem 2.3rem;border-radius:${p=>p.theme.radii.lg};
  ${p=>p.theme.glass(.55,22)}
  box-shadow:${p=>p.theme.shadows.lg};
  overflow:hidden;
  &:before{content:'';position:absolute;inset:0;pointer-events:none;background:
    radial-gradient(circle at 15% 20%,hsla(270,95%,65%,0.18),transparent 60%),
    radial-gradient(circle at 85% 80%,hsla(300,95%,65%,0.18),transparent 55%);
    mix-blend-mode:overlay;opacity:.9;}
`;

export const GradientButton = styled(motion.button)`
  --padY:.95rem;--padX:1.55rem;--radius:${p=>p.theme.radii.md};
  font-weight:600;font-size:.9rem;padding:var(--padY) var(--padX);border-radius:var(--radius);border:none;cursor:pointer;display:inline-flex;align-items:center;gap:.65rem;
  background:${p=>p.theme.colors.gradientPrimary};color:#fff;position:relative;isolation:isolate;
  box-shadow:0 4px 18px -4px hsla(270,95%,30%,.6),0 6px 28px -6px hsla(300,95%,30%,.55);
  transition:${p=>p.theme.transitions.base};
  &:hover{transform:translateY(-3px);box-shadow:0 8px 30px -6px hsla(270,95%,30%,.55),0 10px 42px -10px hsla(300,95%,30%,.5);}
  &:active{transform:translateY(0)}
  &:before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(120deg,rgba(255,255,255,.4),rgba(255,255,255,0) 42%,rgba(255,255,255,.25));mix-blend-mode:overlay;opacity:.35;pointer-events:none;}
  &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}
`;

export const OutlineButton = styled(GradientButton)`
  background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};box-shadow:none;border:1px solid ${p=>p.theme.colors.border};
  &:hover{background:${p=>p.theme.colors.surface3};transform:translateY(-2px);}
  &:before{opacity:0;}
`;

export const SoftInput = styled.input`
  width:100%;padding:1rem 1.05rem;border-radius:${p=>p.theme.radii.md};border:1px solid ${p=>p.theme.colors.border};
  background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};font-size:.95rem;transition:${p=>p.theme.transitions.base};
  &:focus{border-color:${p=>p.theme.colors.primary};box-shadow:0 0 0 4px ${p=>p.theme.colors.primaryTransparent};outline:none;}
  &::placeholder{color:${p=>p.theme.colors.textSecondary};opacity:.7;}
`;

export const SoftSelect = styled.select`
  width:100%;padding:1rem 1.05rem;border-radius:${p=>p.theme.radii.md};border:1px solid ${p=>p.theme.colors.border};
  background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};font-size:.95rem;transition:${p=>p.theme.transitions.base};appearance:none;position:relative;
  &:focus{border-color:${p=>p.theme.colors.primary};box-shadow:0 0 0 4px ${p=>p.theme.colors.primaryTransparent};outline:none;}
`;

export const SectionLabel = styled.span`
  display:block;margin-bottom:.55rem;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:${p=>p.theme.colors.textSecondary};
`;

export const Skeleton = styled.div`
  --h:1rem;position:relative;overflow:hidden;border-radius:8px;background:${p=>p.theme.colors.surface3};
  height:var(--h);width:${p=>p.w||'100%'};animation:pulse 1.6s ease-in-out infinite;
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
`;
// Added shared UI atoms for stats / glow titles / icon buttons
export const StatBar = styled.div`display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem;margin:-.2rem 0 1.1rem;`;
export const StatChip = styled.span`font-size:.62rem;letter-spacing:.5px;text-transform:uppercase;padding:.42rem .68rem;border-radius:999px;display:inline-flex;gap:.35rem;align-items:center;background:${p=>p.theme.colors.surface2};border:1px solid ${p=>p.theme.colors.border};color:${p=>p.theme.colors.textSecondary};font-weight:600;line-height:1;position:relative;overflow:hidden;&:before{content:'';position:absolute;inset:0;background:linear-gradient(140deg,rgba(255,255,255,.08),transparent 60%);mix-blend-mode:overlay;opacity:.6;}`;
export const SmallLabel = styled.span`font-size:.55rem;font-weight:600;letter-spacing:.7px;opacity:.65;`;
export const TitleGlow = styled.span`position:absolute;inset:0;filter:blur(22px);opacity:.18;background:${p=>p.theme.colors.gradientPrimary};pointer-events:none;border-radius:120px;`;
export const IconBtn = styled.button`background:rgba(255,255,255,.05);border:1px solid ${p=>p.theme.colors.border};width:26px;height:26px;border-radius:8px;display:grid;place-items:center;color:${p=>p.theme.colors.textSecondary};cursor:pointer;font-size:12px;transition:.25s;&:hover{color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface2};}&:active{scale:.9}`;
