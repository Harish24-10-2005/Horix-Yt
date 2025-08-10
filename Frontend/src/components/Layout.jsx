import React from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiX, FiXCircle } from 'react-icons/fi';
import { usePipeline } from '../context/PipelineContext';
import { useAuth } from '../context/AuthContext';
import { ProgressSteps } from './ProgressSteps';
import { themeDark, themeLight } from '../design/theme';

const GlobalStyle = createGlobalStyle`
  :root { color-scheme: ${p=>p.theme.isDark? 'dark':'light'}; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Poppins',system-ui,sans-serif; min-height:100vh; background:${p=>p.theme.colors.background}; color:${p=>p.theme.colors.text};
    -webkit-font-smoothing:antialiased; }
  ::selection { background:${p=>p.theme.colors.primaryTransparent}; }
  @media (prefers-reduced-motion:no-preference) {
    html { scroll-behavior:smooth; }
  }
`;

const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}`;
const BackgroundFX = styled.div`position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;mask:radial-gradient(circle at 50% 40%, rgba(255,255,255,.9), transparent 70%);`;
const Orb = styled(motion.div)`position:absolute;width:480px;height:480px;border-radius:50%;filter:blur(120px);opacity:.65;background:${p=>p.theme.colors.gradientPrimary};mix-blend-mode:overlay;animation:${float} 12s ease-in-out infinite;`;

const Shell = styled.div`position:relative;z-index:1;display:flex;flex-direction:column;min-height:100vh;max-width:${p=>p.theme.layout.maxWidth};margin:0 auto;padding:0 2rem;`;
const Header = styled(motion.header)`display:flex;align-items:center;justify-content:space-between;padding:1.2rem 0;`;
const Logo = styled.a`font-size:1.5rem;font-weight:600;text-decoration:none;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Nav = styled.nav`display:flex;align-items:center;gap:1.2rem;`;
const NavLink = styled.a`position:relative;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600;text-decoration:none;color:${p=>p.theme.colors.textSecondary};padding:.4rem .6rem;border-radius:${p=>p.theme.radii.sm};transition:${p=>p.theme.transitions.base};
  &:hover{color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.primaryTransparent};}
`;
const ThemeToggle = styled.button`border:none;background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:${p=>p.theme.radii.md};cursor:pointer;box-shadow:${p=>p.theme.shadows.sm};transition:${p=>p.theme.transitions.base};
  &:hover{background:${p=>p.theme.colors.surface3};}
  &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}
`;
const Main = styled.main`flex:1;display:flex;flex-direction:column;gap:1.4rem;padding-bottom:4rem;`;
const Footer = styled.footer`margin-top:auto;padding:2.5rem 0 3rem;text-align:center;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:${p=>p.theme.colors.textSecondary};opacity:.85;`;
const ErrorMessage = styled(motion.div)`background:${p=>p.theme.colors.errorTransparent};color:${p=>p.theme.colors.errorHover};border:1px solid ${p=>p.theme.colors.error};border-left:5px solid ${p=>p.theme.colors.error};padding:1rem 1.4rem;border-radius:${p=>p.theme.radii.md};display:flex;justify-content:space-between;align-items:center;font-size:.9rem;box-shadow:${p=>p.theme.shadows.sm};`;
const LoadingOverlay = styled(motion.div)`position:fixed;inset:0;background:linear-gradient(140deg,rgba(15,15,25,.88),rgba(20,15,35,.92));display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:2000;color:white;${p=>p.theme.glass(.55,30)}backdrop-filter:blur(22px);`;
const Spinner = styled(motion.div)`width:70px;height:70px;border-radius:50%;position:relative;display:grid;place-items:center;
  &::before,&::after{content:'';position:absolute;inset:0;border-radius:inherit;border:5px solid transparent;}
  &::before{border-top-color:${p=>p.theme.colors.primary};border-right-color:${p=>p.theme.colors.primaryAlt};animation:spin 1s linear infinite;}
  &::after{border-bottom-color:${p=>p.theme.colors.primaryAlt};border-left-color:${p=>p.theme.colors.primary};animation:spin 1.3s linear infinite reverse;}
  @keyframes spin{to{transform:rotate(360deg)}}`;

const loadingVariants = { initial:{opacity:0}, animate:{opacity:1,transition:{duration:.35}}, exit:{opacity:0,transition:{duration:.3}} };

export function Layout({ children, showProgress = true, onNavigate, currentView }) {
  const { error, loading, loadingMessage, step, setStep } = usePipeline();
  const { user, logout } = useAuth?.() || {};
  const [mode, setMode] = React.useState('dark');
  const theme = mode==='dark'? themeDark : themeLight;
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BackgroundFX aria-hidden="true">
        <Orb style={{top:'-120px',left:'-120px'}} initial={{opacity:0,scale:.8}} animate={{opacity:.7,scale:1}} transition={{duration:1}} />
        <Orb style={{bottom:'-160px',right:'-160px'}} initial={{opacity:0,scale:.8}} animate={{opacity:.55,scale:1}} transition={{duration:1.2}} />
      </BackgroundFX>
      <Shell>
        <Header initial={{ y: -70, opacity:0 }} animate={{ y: 0, opacity:1 }} transition={{ duration: .6, ease:[.4,0,.2,1] }}>
          <Logo href="#top">AI Video Studio</Logo>
          <Nav>
            <NavLink as="button" onClick={()=>onNavigate && onNavigate('pipeline')} style={{color: currentView==='pipeline'? theme.colors.text: undefined}}>Create</NavLink>
            <NavLink as="button" onClick={()=>onNavigate && onNavigate('gallery')} style={{color: currentView==='gallery'? theme.colors.text: undefined}}>Gallery</NavLink>
            {!user && <NavLink as="button" onClick={()=>onNavigate && onNavigate('auth')} style={{color: currentView==='auth'? theme.colors.text: undefined}}>Sign In</NavLink>}
            {user && <NavLink as="button" onClick={()=>{logout(); onNavigate && onNavigate('auth');}}>Logout</NavLink>}
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#support">Support</NavLink>
            <ThemeToggle aria-label="Toggle theme" onClick={()=>setMode(m=>m==='dark'?'light':'dark')}>
              {mode==='dark'? <FiSun/>:<FiMoon/>}
            </ThemeToggle>
          </Nav>
        </Header>
        {showProgress && <ProgressSteps />}
        <Main>
          <AnimatePresence>
            {error && (
              <ErrorMessage initial={{opacity:0,y:-15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-15}} role="alert">
                <span style={{display:'flex',alignItems:'center',gap:6}}><FiXCircle /> {error}</span>
                <button onClick={()=>setStep(step)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}} aria-label="Dismiss error"><FiX/></button>
              </ErrorMessage>) }
          </AnimatePresence>
          <AnimatePresence>
            {loading && (
              <LoadingOverlay variants={loadingVariants} initial="initial" animate="animate" exit="exit">
                <Spinner />
                <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.2}} style={{letterSpacing:'.05em',fontSize:'.8rem',textTransform:'uppercase'}}>{loadingMessage}</motion.p>
              </LoadingOverlay>) }
          </AnimatePresence>
          {children}
        </Main>
        <Footer>© {new Date().getFullYear()} AI Video Studio • Crafted for creators</Footer>
      </Shell>
    </ThemeProvider>
  );
}
