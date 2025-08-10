import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: ${({ theme }) => theme.fonts.main};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.8;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
  h1 { font-size: 3rem; }
  h2 { font-size: 2.2rem; }
  h3 { font-size: 1.6rem; }
  p {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transition};
    &:hover { color: ${({ theme }) => theme.colors.primaryHover}; }
  }
  button, input, select, textarea {
    font-family: inherit;
    font-size: 1rem;
  }
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 6px;
    border: 3px solid ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

export const Header = styled(motion.header)`
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  ${({ theme }) => theme.glassEffect}
  box-shadow: ${({ theme }) => theme.boxShadowSubtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled.a`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

export const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 900px;
  gap: 12px;
  position: relative;
  margin: 2rem auto;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 22px;
    right: 22px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.surface2};
    border-radius: 4px;
    transform: translateY(-50%);
    z-index: 0;
  }
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 22px;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradientPrimary};
    border-radius: 4px;
    transform: translateY(-50%);
    z-index: 0;
    width: calc(var(--progress-percent, 0%) * (100% - 44px));
    transition: width 0.6s ease-in-out;
  }
`;

export const ProgressStep = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
  background-color: ${({ theme, active, completed }) =>
    active ? theme.colors.primary : completed ? theme.colors.success : theme.colors.surface2};
  color: ${({ theme }) => theme.colors.white};
  border: 3px solid ${({ theme, active, completed }) =>
    active ? theme.colors.primaryHover : completed ? theme.colors.successHover : theme.colors.surface};
  box-shadow: ${({ active, theme }) => active && `0 0 25px ${theme.colors.primary}80`};
  cursor: pointer;
  &:hover {
    transform: scale(1.15);
  }
`;

export const MainContent = styled.main`
  flex-grow: 1;
  padding: 4rem 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

export const StepContainer = styled(motion.div)`
  padding: 3.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  margin-bottom: 4rem;
  ${({ theme }) => theme.glassEffect}
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.surfaceTransparent}, ${({ theme }) => theme.colors.background}80);
  h2 {
    text-align: center;
    margin-bottom: 3rem;
    background: ${({ theme }) => theme.colors.gradientText};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 2.5rem;
  position: relative;
`;

export const Label = styled.label`
  position: absolute;
  top: 1rem;
  left: 1.2rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;
  pointer-events: none;
  &.float {
    top: -0.5rem;
    left: 1rem;
    font-size: 0.8rem;
    background: ${({ theme }) => theme.colors.surface};
    padding: 0 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Input = styled.input`
  padding: 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  background-color: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: ${({ theme }) => theme.transition};
  width: 100%;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
  &:not(:placeholder-shown) + ${Label}, &:focus + ${Label} {
    top: -0.5rem;
    left: 1rem;
    font-size: 0.8rem;
    background: ${({ theme }) => theme.colors.surface};
    padding: 0 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  &[type="file"] {
    padding: 2rem;
    border-style: dashed;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    cursor: pointer;
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.highlight};
    }
    &::file-selector-button { display: none; }
    &::before {
      content: 'Drag & Drop or Click to Upload';
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 1rem;
    }
  }
`;

export const Select = styled.select`
  padding: 1.2rem 3rem 1.2rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  background-color: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: ${({ theme }) => theme.transition};
  cursor: pointer;
  appearance: none;
  width: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a0a0c0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.5em;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea`
  padding: 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  background-color: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: ${({ theme }) => theme.transition};
  min-height: 150px;
  resize: vertical;
  width: 100%;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
  &:not(:placeholder-shown) + ${Label}, &:focus + ${Label} {
    top: -0.5rem;
    left: 1rem;
    font-size: 0.8rem;
    background: ${({ theme }) => theme.colors.surface};
    padding: 0 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradientPrimary};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const PrimaryButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.colors.secondary};
  &:hover { background: ${({ theme }) => theme.colors.secondaryHover}; }
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin: 1rem 0;
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

export const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid ${({ theme }) => theme.colors.surface2};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const StepButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

export const ContentPreviewBox = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface2};
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  margin-bottom: 2rem;
`;

export const ScriptSection = styled.div`
  margin-bottom: 2rem;
`;

export const ScriptList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const ScriptListItem = styled.li`
  margin-bottom: 0.5rem;
`;

export const VideoModeIndicator = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const ScriptsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GeneratedImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

export const ImageCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
`;

export const GeneratedVoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const VoiceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const VideoPreviewContainer = styled.div`
  position: relative;
  padding-top: 56.25%;
  iframe, video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const DownloadSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

export const DownloadButton = styled.a`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.8rem 1.2rem;
  border-radius: ${({ theme }) => theme.borderRadiusSmall};
  text-decoration: none;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

export const Footer = styled.footer`
  padding: 2rem;
  text-align: center;
  margin-top: auto;
`;
