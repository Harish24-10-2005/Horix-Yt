import React from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiX, FiXCircle, FiMenu } from 'react-icons/fi';
import { usePipeline } from '../context/PipelineContext';
import { ProgressSteps } from './ProgressSteps';
import { useAuth } from '../context/AuthContext';
import { ProfilePage } from './ProfilePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { SupportPage } from './pages/SupportPage';
import { AboutPage } from './pages/AboutPage';
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
const Header = styled(motion.header)`position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:.95rem 0;transition:background .45s, box-shadow .45s, border-color .45s;backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);
  background:${p=> p.$scrolled? (p.theme.isDark? 'hsla(240,15%,12%,0.72)':'hsla(240,15%,98%,0.72)'):'transparent'};border-bottom:1px solid ${p=> p.$scrolled? p.theme.colors.border:'transparent'};box-shadow:${p=> p.$scrolled? '0 6px 25px -12px rgba(0,0,0,.35)':'none'};`;
const Logo = styled.a`font-size:1.5rem;font-weight:600;text-decoration:none;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;`;
const Nav = styled.nav`display:flex;align-items:center;gap:.35rem;position:relative;`;
const NavList = styled.ul`list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:.35rem;`;
const NavItem = styled.li`position:relative;`;
const NavButton = styled.button`position:relative;font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;text-decoration:none;border:none;cursor:pointer;background:none;color:${p=>p.active? p.theme.colors.text : p.theme.colors.textSecondary};padding:.65rem .95rem;border-radius:14px;display:inline-flex;align-items:center;gap:.45rem;transition:.45s;
  &:hover{color:${p=>p.theme.colors.text};}
  &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}
`;
const Indicator = styled(motion.span)`position:absolute;left:4px;right:4px;bottom:4px;height:3px;border-radius:3px;background:${p=>p.theme.colors.gradientPrimary};box-shadow:0 0 0 1px rgba(255,255,255,.15);`;
const Divider = styled.span`width:1px;height:20px;background:${p=>p.theme.colors.border};margin:0 .4rem;display:inline-block;`;
const MobileToggle = styled.button`display:none;@media (max-width:900px){display:inline-flex;}border:none;background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};width:46px;height:46px;border-radius:16px;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:${p=>p.theme.transitions.base};
  &:hover{background:${p=>p.theme.colors.surface3};}
`;
const DesktopHide = styled.div`@media (max-width:900px){display:none !important;}`;
const MobileMenu = styled(motion.div)`position:fixed;top:0;left:0;right:0;z-index:100;display:flex;flex-direction:column;gap:1.2rem;padding:5.5rem 1.5rem 2rem;min-height:100vh;background:${p=> p.theme.isDark? 'linear-gradient(160deg,#0e0e16,#1b1b26)':'linear-gradient(160deg,#ffffff,#ecebff)'};${p=>p.theme.glass(.75,32)};`;
const MobileNavList = styled.ul`list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.4rem;`;
const MobileNavButton = styled.button`font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;border:none;background:none;text-align:left;padding:.85rem 1rem;border-radius:16px;cursor:pointer;color:${p=>p.active? p.theme.colors.text : p.theme.colors.textSecondary};position:relative;transition:.4s;display:flex;align-items:center;justify-content:space-between;
  &:hover{background:${p=>p.theme.colors.primaryTransparent};color:${p=>p.theme.colors.text};}
`;
const ThemeToggle = styled.button`border:none;background:${p=>p.theme.colors.surface2};color:${p=>p.theme.colors.text};display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:16px;cursor:pointer;box-shadow:${p=>p.theme.shadows.sm};transition:${p=>p.theme.transitions.base};position:relative;overflow:hidden;
  &:hover{background:${p=>p.theme.colors.surface3};}
  &:focus-visible{outline:2px solid ${p=>p.theme.colors.focus};outline-offset:2px;}
  & svg{transition:transform .6s cubic-bezier(.6,.2,.2,1);}
  &[data-anim='on'] svg{transform:rotate(360deg);}
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

export function Layout({ children }) {
  const { error, loading, loadingMessage, step, setStep } = usePipeline();
  const { user } = useAuth();
  const [view,setView] = React.useState('app'); // app | profile | features | support | about
  const [mobileOpen,setMobileOpen] = React.useState(false);
  const [hasScrolled,setHasScrolled] = React.useState(false);
  React.useEffect(()=>{ const onScroll=()=> setHasScrolled(window.scrollY>8); window.addEventListener('scroll',onScroll,{passive:true}); return ()=> window.removeEventListener('scroll',onScroll); },[]);
  const initialMode = React.useMemo(()=> (user?.theme_pref === 'light' ? 'light':'dark'), [user]);
  const [mode, setMode] = React.useState(initialMode);
  React.useEffect(()=>{ if(user?.theme_pref && user.theme_pref !== mode) setMode(user.theme_pref); }, [user, mode]);
  const theme = mode==='dark'? themeDark : themeLight;
  const navItems = [
    {key:'app', label:'Studio'},
    {key:'features', label:'Features'},
    {key:'support', label:'Support'},
    {key:'about', label:'About'},
    ...(user? [{key:'profile', label:'Profile'}]:[])
  ];
  const activate = (k)=> { setView(k); setMobileOpen(false); };
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BackgroundFX aria-hidden="true">
        <Orb style={{top:'-120px',left:'-120px'}} initial={{opacity:0,scale:.8}} animate={{opacity:.7,scale:1}} transition={{duration:1}} />
        <Orb style={{bottom:'-160px',right:'-160px'}} initial={{opacity:0,scale:.8}} animate={{opacity:.55,scale:1}} transition={{duration:1.2}} />
      </BackgroundFX>
      <Shell>
        <Header $scrolled={hasScrolled} initial={{ y: -70, opacity:0 }} animate={{ y: 0, opacity:1 }} transition={{ duration: .6, ease:[.4,0,.2,1] }}>
          <Logo href="#top" onClick={()=>activate('app')}>AI Video Studio</Logo>
          <DesktopHide>
            <Nav>
              <NavList>
                {navItems.map((n,i)=> (
                  <NavItem key={n.key}>
                    <NavButton type="button" active={view===n.key} onClick={()=>activate(n.key)} as={motion.button} whileTap={{scale:.92}} whileHover={{y:-2}}>
                      {n.label}
                      {view===n.key && <Indicator layoutId="navIndicator" />}
                    </NavButton>
                  </NavItem>
                ))}
                <Divider />
                <NavItem>
                  <ThemeToggle aria-label="Toggle theme" data-anim="on" onClick={()=>setMode(m=>m==='dark'?'light':'dark')}>
                    {mode==='dark'? <FiSun/>:<FiMoon/>}
                  </ThemeToggle>
                </NavItem>
              </NavList>
            </Nav>
          </DesktopHide>
          <MobileToggle aria-label="Menu" onClick={()=> setMobileOpen(o=>!o)} as={motion.button} whileTap={{scale:.9}}>
            {mobileOpen? <FiX size={22}/> : <FiMenu size={22}/>} 
          </MobileToggle>
        </Header>
        <AnimatePresence>
          {mobileOpen && (
            <MobileMenu initial={{y:-40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-20,opacity:0}} transition={{type:'spring',stiffness:160,damping:24}}>
              <MobileNavList>
                {navItems.map((n,i)=> (
                  <li key={n.key}>
                    <MobileNavButton active={view===n.key} onClick={()=>activate(n.key)} as={motion.button} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                      <span>{n.label}</span>
                      {view===n.key && <motion.span layoutId="mobileDot" style={{width:10,height:10,borderRadius:8,background:theme.colors.gradientPrimary}} />}
                    </MobileNavButton>
                  </li>
                ))}
                <li style={{marginTop:'1.2rem'}}>
                  <MobileNavButton onClick={()=> { setMode(m=>m==='dark'?'light':'dark'); }}>
                    Theme: {mode==='dark'? 'Dark':'Light'}
                    <span style={{display:'inline-flex',alignItems:'center'}}>{mode==='dark'? <FiSun/>:<FiMoon/>}</span>
                  </MobileNavButton>
                </li>
              </MobileNavList>
            </MobileMenu>
          )}
        </AnimatePresence>
        {view==='app' && <ProgressSteps />}
        <Main>
          {view==='profile' && <ProfilePage />}
          {view==='features' && <FeaturesPage />}
          {view==='support' && <SupportPage />}
          {view==='about' && <AboutPage />}
          {view==='app' && children}
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
        </Main>
  <Footer>© {new Date().getFullYear()} AI Video Studio • Crafted by Harish R • Coimbatore • <a href="https://github.com/Harish24-10-2005" style={{color:'inherit'}}>GitHub</a></Footer>
      </Shell>
    </ThemeProvider>
  );
}
