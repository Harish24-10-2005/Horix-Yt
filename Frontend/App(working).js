import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GalleryPage } from './src/components/GalleryPage';
import { AuthForms } from './src/components/AuthForms';
    import ReactDOM from 'react-dom';
    import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
    import { motion, AnimatePresence } from 'framer-motion';
    import { FiCheck, FiX, FiUpload, FiDownload, FiPlay, FiPause, FiVolume2, FiEdit2, FiRefreshCw, FiChevronLeft, FiChevronRight, FiLoader, FiMoon, FiSun, FiMenu, FiXCircle, FiInfo } from 'react-icons/fi';
    import { FaBullseye, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

    // --- Enhanced Theme ---
    const theme = {
      colors: {
        primary: 'hsl(270, 95%, 65%)', // Vibrant purple
        primaryHover: 'hsl(270, 95%, 58%)',
        primaryTransparent: 'hsla(270, 95%, 65%, 0.15)',
        secondary: 'hsl(220, 15%, 55%)',
        secondaryHover: 'hsl(220, 15%, 45%)',
        background: 'hsl(240, 20%, 10%)', // Deep, rich dark
        surface: 'hsl(240, 15%, 15%)',
        surface2: 'hsl(240, 15%, 20%)',
        surfaceTransparent: 'hsla(240, 15%, 15%, 0.85)',
        text: 'hsl(0, 0%, 95%)',
        textSecondary: 'hsl(240, 10%, 70%)',
        accent: 'hsl(45, 100%, 65%)', // Warm gold
        accentHover: 'hsl(45, 100%, 58%)',
        success: 'hsl(150, 70%, 45%)',
        successHover: 'hsl(150, 70%, 38%)',
        successTransparent: 'hsla(150, 70%, 45%, 0.15)',
        error: 'hsl(0, 85%, 60%)',
        errorHover: 'hsl(0, 85%, 53%)',
        errorTransparent: 'hsla(0, 85%, 60%, 0.15)',
        border: 'hsla(240, 20%, 50%, 0.25)',
        borderHover: 'hsla(270, 95%, 65%, 0.5)',
        white: '#ffffff',
        shadow: 'hsla(0, 0%, 0%, 0.4)',
        highlight: 'hsla(240, 20%, 95%, 0.08)',
        gradientPrimary: 'linear-gradient(135deg, hsl(270, 95%, 65%), hsl(300, 95%, 65%))',
        gradientAccent: 'linear-gradient(135deg, hsl(45, 100%, 65%), hsl(35, 100%, 65%))',
        gradientText: 'linear-gradient(135deg, hsl(0, 0%, 95%), hsl(240, 20%, 85%))',
      },
      fonts: {
        main: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      borderRadius: '20px',
      borderRadiusSmall: '12px',
      boxShadow: '0 12px 40px hsla(0, 0%, 0%, 0.35)',
      boxShadowSubtle: '0 6px 20px hsla(0, 0%, 0%, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      glassEffect: `
        background: hsla(240, 15%, 15%, 0.7);
        backdrop-filter: blur(15px) saturate(200%);
        -webkit-backdrop-filter: blur(15px) saturate(200%);
        border: 1px solid hsla(240, 20%, 95%, 0.15);
      `,
    };

    // --- Global Styles ---
    const GlobalStyle = createGlobalStyle`
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

    // --- Styled Components ---
    const AppContainer = styled.div`
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
    `;

    const Header = styled(motion.header)`
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

    const HeaderContent = styled.div`
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    `;

    const Logo = styled.h1`
      font-size: 1.8rem;
      font-weight: 800;
      background: ${({ theme }) => theme.colors.gradientPrimary};
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    `;

    const Nav = styled.nav`
      display: flex;
      gap: 1.5rem;
      align-items: center;
      @media (max-width: 768px) {
        display: none;
      }
    `;

    const NavLink = styled.a`
      font-size: 1rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text};
      &:hover {
        color: ${({ theme }) => theme.colors.primary};
      }
    `;

    const ThemeToggle = styled.button`
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.text};
      font-size: 1.5rem;
      cursor: pointer;
      transition: ${({ theme }) => theme.transition};
      &:hover { color: ${({ theme }) => theme.colors.primary}; }
    `;

    const ProgressBarContainer = styled.div`
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

    const ProgressStep = styled(motion.div)`
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

    const MainContent = styled.main`
      flex-grow: 1;
      padding: 4rem 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    `;

    const StepContainer = styled(motion.div)`
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
        font-size: 2.4rem;
      }
    `;

    const FormGroup = styled.div`
      margin-bottom: 2.5rem;
      position: relative;
      
    `;

    const Label = styled.label`
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

    const Input = styled.input`
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

    const Select = styled.select`
  padding: 1.2rem 3rem 1.2rem 1.2rem; /* More space for arrow */
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

    const Textarea = styled.textarea`
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

    const Button = styled(motion.button)`
      padding: 1rem 2rem;
      border: none;
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: ${({ theme }) => theme.transition};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      position: relative;
      overflow: hidden;
      svg { width: 1.3em; height: 1.3em; }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      &:focus-visible {
        box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
      }
    `;

    const PrimaryButton = styled(Button)`
      background: ${({ theme }) => theme.colors.gradientPrimary};
      color: ${({ theme }) => theme.colors.white};
      box-shadow: 0 6px 20px ${({ theme }) => theme.colors.primary}60;
      &:not(:disabled):hover {
        background-size: 200%;
        transform: translateY(-4px);
        box-shadow: 0 10px 30px ${({ theme }) => theme.colors.primary}80;
      }
    `;

    const SecondaryButton = styled(Button)`
      background: transparent;
      color: ${({ theme }) => theme.colors.text};
      border: 2px solid ${({ theme }) => theme.colors.primary};
      &:not(:disabled):hover {
        background-color: ${({ theme }) => theme.colors.primaryTransparent};
        transform: translateY(-2px);
      }
    `;

    const StepButtonsContainer = styled.div`
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 3.5rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    `;

    const ErrorMessage = styled(motion.div)`
      background-color: ${({ theme }) => theme.colors.errorTransparent};
      color: ${({ theme }) => theme.colors.errorHover};
      border: 1px solid ${({ theme }) => theme.colors.error};
      border-left: 5px solid ${({ theme }) => theme.colors.error};
      padding: 1.2rem 1.8rem;
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      margin-bottom: 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      font-size: 0.95rem;
      button {
        background: none;
        border: none;
        color: ${({ theme }) => theme.colors.errorHover};
        cursor: pointer;
        font-size: 1.4rem;
        &:hover { color: ${({ theme }) => theme.colors.error}; }
      }
    `;

    const LoadingOverlay = styled(motion.div)`
      position: fixed;
      inset: 0;
      background-color: hsla(0, 0%, 0%, 0.85);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      color: ${({ theme }) => theme.colors.white};
      ${({ theme }) => theme.glassEffect}
    `;

    const LoadingSpinner = styled(motion.div)`
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: 5px solid;
      border-color: ${({ theme }) => theme.colors.primary} ${({ theme }) => theme.colors.primary} transparent transparent;
      margin-bottom: 2rem;
    `;

    const ContentPreviewBox = styled.div`
      background-color: ${({ theme }) => theme.colors.surface2};
      padding: 2rem;
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      border: 1px solid ${({ theme }) => theme.colors.border};
      margin: 1.5rem 0;
      max-height: 400px;
      overflow-y: auto;
      color: ${({ theme }) => theme.colors.text};
      box-shadow: inset 0 2px 6px hsla(0, 0%, 0%, 0.15);
      h3 {
        margin-bottom: 1.2rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 1.3rem;
        font-weight: 600;
      }
    `;

    const ScriptsContainer = styled.div`
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-bottom: 3rem;
    `;

    const ScriptSection = styled.div`
      h3 {
        margin-bottom: 1.2rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 1.3rem;
        font-weight: 600;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        padding-bottom: 0.6rem;
      }
    `;

    const ScriptList = styled.div`
      background-color: ${({ theme }) => theme.colors.surface2};
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      border: 1px solid ${({ theme }) => theme.colors.border};
      max-height: 350px;
      overflow-y: auto;
    `;

    const ScriptListItem = styled.div`
      display: flex;
      align-items: flex-start;
      gap: 1.2rem;
      padding: 1rem 1.8rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border}90;
      &:last-child { border-bottom: none; }
      &:hover { background-color: ${({ theme }) => theme.colors.highlight}; }
      .script-number {
        font-weight: 700;
        color: ${({ theme }) => theme.colors.primary};
        min-width: 30px;
        text-align: right;
        font-size: 0.95rem;
      }
      .script-text {
        color: ${({ theme }) => theme.colors.text};
        line-height: 1.7;
      }
    `;

    const GeneratedImagesGrid = styled.div`
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    `;

    const ImageCard = styled(motion.div)`
      border-radius: ${({ theme }) => theme.borderRadius};
      overflow: hidden;
      border: 3px solid ${({ theme, selected }) => selected ? theme.colors.primary : 'transparent'};
      box-shadow: ${({ theme }) => theme.boxShadowSubtle};
      cursor: pointer;
      position: relative;
      background-color: ${({ theme }) => theme.colors.surface2};
      ${({ selected, theme }) => selected && `box-shadow: 0 0 25px ${theme.colors.primary}90;`}
      img {
        width: 100%;
        aspect-ratio: ${({ videoMode }) => videoMode ? '16 / 9' : '9 / 16'};
        object-fit: cover;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      }
      &:hover .overlay {
        opacity: 1;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        button {
          background: ${({ theme }) => theme.colors.primary};
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          &:hover {
            background: ${({ theme }) => theme.colors.primaryHover};
          }
        }
      }
    `;

    const ImageModificationModal = styled(motion.div)`
      background-color: ${({ theme }) => theme.colors.surface};
      border-radius: ${({ theme }) => theme.borderRadius};
      padding: 2.5rem;
      box-shadow: ${({ theme }) => theme.boxShadow};
      width: 90%;
      max-width: 900px;
      position: relative;
      display: flex;
      gap: 2rem;
      @media (max-width: 768px) {
        flex-direction: column;
      }
    `;

    const CheckboxLabel = styled.label`
      display: flex;
      align-items: center;
      gap: 1.2rem;
      cursor: pointer;
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.text};
      padding: 0.6rem 0;
      input[type="checkbox"] {
        appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid ${({ theme }) => theme.colors.border};
        border-radius: 6px;
        background-color: ${({ theme }) => theme.colors.surface2};
        cursor: pointer;
        position: relative;
        &:checked {
          background-color: ${({ theme }) => theme.colors.primary};
          border-color: ${({ theme }) => theme.colors.primaryHover};
          &:after {
            content: '';
            position: absolute;
            top: 4px;
            left: 8px;
            width: 6px;
            height: 12px;
            border: solid white;
            border-width: 0 3px 3px 0;
            transform: rotate(45deg);
          }
        }
      }
    `;

    const GeneratedVoicesContainer = styled.div`
      margin-top: 3rem;
      h3 {
        margin-bottom: 1.5rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 1.3rem;
        font-weight: 600;
      }
    `;

    const VoiceItem = styled.div`
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background-color: ${({ theme }) => theme.colors.surface2};
      padding: 1.2rem 1.8rem;
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      border: 1px solid ${({ theme }) => theme.colors.border};
      margin-bottom: 1.5rem;
      &:hover { background-color: ${({ theme }) => theme.colors.highlight}; }
      span {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
        min-width: 80px;
      }
      audio {
        flex-grow: 1;
        height: 50px;
      }
    `;

    const VideoPreviewContainer = styled.div`
      margin: 2.5rem 0;
      border-radius: ${({ theme }) => theme.borderRadius};
      overflow: hidden;
      border: 1px solid ${({ theme }) => theme.colors.border};
      box-shadow: ${({ theme }) => theme.boxShadow};
      video {
        max-width: 100%;
        max-height: 70vh;
        border-radius: ${({ theme }) => theme.borderRadius};
      }
    `;

    const DownloadSection = styled.div`
      display: flex;
      justify-content: center;
      margin: 3rem 0;
    `;

    const DownloadButton = styled(motion.a)`
      padding: 1rem 2rem;
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: ${({ theme }) => theme.transition};
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      background: ${({ theme }) => theme.colors.success};
      color: white;
      box-shadow: 0 6px 20px ${({ theme }) => theme.colors.success}60;
      &:hover {
        background: ${({ theme }) => theme.colors.successHover};
        transform: translateY(-4px);
        box-shadow: 0 10px 30px ${({ theme }) => theme.colors.success}80;
      }
    `;

    const Footer = styled.footer`
      padding: 3rem 2rem;
      background-color: ${({ theme }) => theme.colors.surface};
      border-top: 1px solid ${({ theme }) => theme.colors.border};
      text-align: center;
      color: ${({ theme }) => theme.colors.textSecondary};
      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }
      .footer-links a {
        display: block;
        margin-bottom: 0.8rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        &:hover { color: ${({ theme }) => theme.colors.primary}; }
      }
      .social-icons {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-top: 1.5rem;
        svg { font-size: 1.8rem; }
      }
    `;

    const VideoModeIndicator = styled.div`
      text-align: center;
      margin-bottom: 2.5rem;
      padding: 0.8rem 1.5rem;
      background-color: ${({ theme }) => theme.colors.surface2};
      border-radius: ${({ theme }) => theme.borderRadiusSmall};
      border: 1px solid ${({ theme }) => theme.colors.border};
      display: inline-block;
      box-shadow: ${({ theme }) => theme.boxShadowSubtle};
      p {
        margin: 0;
        font-size: 1rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        strong {
          color: ${({ theme }) => theme.colors.primary};
          font-weight: 600;
        }
      }
    `;

    // --- Animation Variants ---
    const stepVariants = {
      hidden: { opacity: 0, x: 50, scale: 0.95 },
      visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
      exit: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.4, ease: 'easeIn' } },
    };

    const loadingVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.4 } },
      exit: { opacity: 0, transition: { duration: 0.4 } },
    };

    const spinnerVariants = {
      animate: {
        rotate: 360,
        transition: { loop: Infinity, ease: 'linear', duration: 0.7 },
      },
    };

    const buttonHoverTap = {
      hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400 } },
      tap: { scale: 0.95, transition: { type: 'spring', stiffness: 400 } },
    };

    const imageCardHover = {
      hover: { y: -8, scale: 1.05, transition: { type: 'spring', stiffness: 300 } },
    };

    // --- Main App Component ---
  function InnerApp() {
      const [currentStep, setCurrentStep] = useState(1);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [loadingMessage, setLoadingMessage] = useState('Processing your request...');
      const [title, setTitle] = useState('');
      const [videoMode, setVideoMode] = useState(true);
      const [channelType, setChannelType] = useState('');
      const [generatedContent, setGeneratedContent] = useState('');
      const [captions, setCaptions] = useState(false);
      const [bg, setBg] = useState(false);
      const [scripts, setScripts] = useState({ script: '', voiceScripts: [], imagePrompts: [] });
      const [generatedImages, setGeneratedImages] = useState([]);
      const [selectedImageToModify, setSelectedImageToModify] = useState(null);
      const [modificationPrompt, setModificationPrompt] = useState('');
      const [voice, setVoice] = useState('');
      const [ownVoice, setOwnVoice] = useState(false);
      const [customVoiceFile, setCustomVoiceFile] = useState(null);
      const [generatedVoices, setGeneratedVoices] = useState([]);
      const [backgroundMusic, setBackgroundMusic] = useState(null);
      const [addCaptions, setAddCaptions] = useState(false);
      const [finalVideo, setFinalVideo] = useState(null);
      const [isDarkMode, setIsDarkMode] = useState(true);

      const API_ENDPOINT_BASE = 'http://localhost:8000/api/video';
      const ASSET_BASE_URL = 'http://localhost:8000';

      const startLoading = (message = 'Processing your request...') => {
        setLoadingMessage(message);
        setLoading(true);
        setError(null);
      };

      const stopLoading = () => {
        setLoading(false);
        setLoadingMessage('');
      };

      const handleApiError = (err, defaultMessage = 'An unexpected error occurred.') => {
        console.error("API Error:", err);
        setError(err.message || defaultMessage);
        stopLoading();
      };

      const apiFetch = async (endpoint, options, loadingMsg) => {
        startLoading(loadingMsg);
        try {
          const response = await fetch(`${API_ENDPOINT_BASE}${endpoint}`, options);
          const data = await response.json();
          if (!response.ok || data.status === 'error') {
            throw new Error(data.message || `Request failed with status ${response.status}`);
          }
          stopLoading();
          return data;
        } catch (err) {
          handleApiError(err);
          throw err;
        }
      };

      const getFullAssetUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${ASSET_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
      };

      const getRelativePath = (url) => {
        if (!url || !url.startsWith(ASSET_BASE_URL)) {
          console.warn(`Cannot get relative path from URL: ${url}`);
          return url;
        }
        let relativePath = url.substring(ASSET_BASE_URL.length);
        if (relativePath.startsWith('/')) {
          relativePath = relativePath.substring(1);
        }
        return relativePath;
      };

      const updateBackendVideoMode = async (newVideoMode) => {
        try {
          await fetch(`${API_ENDPOINT_BASE}/set-video-mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_mode: newVideoMode })
          });
        } catch (err) {
          console.error("Failed to update video mode:", err);
        }
      };

      const handleVideoModeChange = (event) => {
        const newVideoMode = event.target.value === 'standard';
        setVideoMode(newVideoMode);
        updateBackendVideoMode(newVideoMode);
      };

      const generateContent = async () => {
        try {
          const data = await apiFetch('/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, video_mode: videoMode, channel_type: channelType || undefined })
          }, 'Generating content ideas...');
          setGeneratedContent(data.content);
          setCurrentStep(2);
        } catch (err) {}
      };

      const generateScripts = async () => {
        try {
          const data = await apiFetch('/scripts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content: generatedContent, video_mode: videoMode, channel_type: channelType || undefined })
          }, 'Generating scripts...');
          setScripts({ script: data.script || '', voiceScripts: data.voice_scripts || [], imagePrompts: data.image_prompts || [] });
          setCurrentStep(3);
        } catch (err) {}
      };

      const generateImages = async () => {
        try {
          const data = await apiFetch('/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompts: scripts.imagePrompts, video_mode: videoMode })
          }, 'Generating images...');
          const receivedPaths = data.image_paths || [];
          const fullImagePaths = receivedPaths.map(path => `${getFullAssetUrl(path)}?t=${Date.now()}`);
          setGeneratedImages(fullImagePaths);
          setCurrentStep(4);
        } catch (err) {}
      };

      const modifyImage = async () => {
        if (!selectedImageToModify || !modificationPrompt) {
          setError('Please select an image and enter a modification prompt.');
          return;
        }
        try {
          const selectedBaseUrl = selectedImageToModify.split('?')[0];
          const relativePathToSend = getRelativePath(selectedBaseUrl);
          await apiFetch('/modify-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: relativePathToSend, prompt: modificationPrompt, video_mode: videoMode })
          }, 'Modifying selected image...');
          const modifiedPathFullBase = getFullAssetUrl(relativePathToSend);
          const cacheBustedUrl = `${modifiedPathFullBase}?t=${Date.now()}`;
          const updatedImages = generatedImages.map(imgUrl => imgUrl.split('?')[0] === selectedBaseUrl ? cacheBustedUrl : imgUrl);
          setGeneratedImages(updatedImages);
          setSelectedImageToModify(null);
          setModificationPrompt('');
        } catch (err) {}
      };

      const generateVoices = async () => {
        let customVoiceUploaded = false;
        try {
          if (ownVoice && customVoiceFile) {
            startLoading('Uploading custom voice...');
            const formData = new FormData();
            formData.append('voice_file', customVoiceFile);
            const uploadResponse = await fetch(`${API_ENDPOINT_BASE}/custom-voice`, { method: 'POST', body: formData });
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok || uploadData.status === 'error') {
              throw new Error(uploadData.message || 'Failed to upload custom voice.');
            }
            customVoiceUploaded = true;
          }
          const data = await apiFetch('/voices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentences: scripts.voiceScripts, voice: voice || undefined, own_voice: ownVoice, video_mode: videoMode })
          }, customVoiceUploaded ? 'Generating voices with custom sample...' : 'Generating voices...');
          const receivedPaths = data.voice_paths || [];
          let voicePathsRelative = Array.isArray(receivedPaths) ? receivedPaths : [];
          if (typeof receivedPaths === 'string') {
            voicePathsRelative = scripts.voiceScripts.map((_, index) => `${receivedPaths.endsWith('/') ? receivedPaths : receivedPaths + '/'}voicescript${index + 1}.wav`);
          }
          const fullVoicePaths = voicePathsRelative.map(path => getFullAssetUrl(path));
          setGeneratedVoices(fullVoicePaths);
          setCurrentStep(5);
        } catch (err) {
          if (!loading) {
            stopLoading();
            setError(err.message || 'Voice generation failed.');
          }
        }
      };

      const editVideo = async () => {
        try {
          await apiFetch('/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_mode: videoMode })
          }, 'Editing video sequence...');
          setCurrentStep(7);
        } catch (err) {}
      };

      const addBackgroundMusic = async () => {
        if (!backgroundMusic) {
          setError('Please select a background music file.');
          return;
        }
        try {
          startLoading('Uploading background music...');
          const formData = new FormData();
          formData.append('music_file', backgroundMusic);
          const uploadResponse = await fetch(`${API_ENDPOINT_BASE}/upload-music`, { method: 'POST', body: formData });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok || uploadData.status === 'error') {
            throw new Error(uploadData.message || 'Failed to upload music file.');
          }
          await apiFetch('/bgmusic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ music_path: uploadData.music_path, video_mode: videoMode })
          }, 'Adding background music to video...');
          setBg(true);
          if (addCaptions) {
            setCurrentStep(8);
          } else {
            await getFinalVideo();
            setCurrentStep(9);
          }
        } catch (err) {
          if (!loading) {
            stopLoading();
            setError(err.message || 'Failed to add background music.');
          }
        }
      };

      const addCaptionsToVideo = async () => {
        try {
          await apiFetch('/captions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_mode: videoMode })
          }, 'Adding captions to video...');
          setCaptions(true);
          await getFinalVideo();
          setCurrentStep(9);
        } catch (err) {}
      };

      const getFinalVideo = async () => {
        startLoading('Fetching final video...');
        try {
          const videoFile = captions ? "output_with_glowing_captions.mp4" : (bg ? "youtube_shorts_with_music.mp4" : "youtube_shorts.mp4");
          const cacheBust = `t=${Date.now()}`;
          const response = await fetch(`${API_ENDPOINT_BASE}/video?file=${videoFile}&${cacheBust}`);
          if (!response.ok) {
            let errorMsg = `Failed to fetch video (Status: ${response.status})`;
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
          }
          // Ensure the URL includes the cache-busting parameter
          const finalVideoUrl = `${response.url}${response.url.includes('?') ? '&' : '?'}${cacheBust}`;
          setFinalVideo(finalVideoUrl);
          stopLoading();
        } catch (err) {
          handleApiError(err, 'Failed to retrieve the final video URL.');
        }
      };

      const handleFileChange = (e, setterFunction) => {
        const file = e.target.files[0];
        if (file) setterFunction(file);
      };

      const resetApplication = () => {
        setCurrentStep(1);
        setFinalVideo(null);
        setTitle('');
        setGeneratedContent('');
        setScripts({ script: '', voiceScripts: [], imagePrompts: [] });
        setGeneratedImages([]);
        setSelectedImageToModify(null);
        setModificationPrompt('');
        setVoice('');
        setOwnVoice(false);
        setCustomVoiceFile(null);
        setGeneratedVoices([]);
        setBackgroundMusic(null);
        setAddCaptions(false);
        setError(null);
      };

      const handleButtonClick = (e) => {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        e.currentTarget.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      };

      const { user, logout, addAsset } = useAuth();
      const [view,setView] = useState('pipeline'); // pipeline | gallery | auth

      const saveVideoToGallery = async ()=>{
        if(!finalVideo || !title) return;
        try { await addAsset({ title: title || 'Untitled Video', path: finalVideo }); alert('Saved to gallery'); } catch(e){ alert(e.message); }
      };

      return (
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <AppContainer>
            <Header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}>
              <HeaderContent>
                <Logo>AI Video Studio</Logo>
                <Nav>
                  <NavLink href="#features">Features</NavLink>
                  <NavLink href="#pricing">Pricing</NavLink>
                  <NavLink href="#support">Support</NavLink>
                  <NavLink as="button" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setView('pipeline')}>Create</NavLink>
                  <NavLink as="button" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setView('gallery')}>Gallery</NavLink>
                  {!user && <NavLink as="button" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setView('auth')}>Sign In</NavLink>}
                  {user && <NavLink as="button" style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>{logout(); setView('auth');}}>Logout</NavLink>}
                  <PrimaryButton as="a" href="#get-premium" {...buttonHoverTap} onClick={handleButtonClick}>
                    Get Premium
                  </PrimaryButton>
                  <ThemeToggle onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? <FiSun /> : <FiMoon />}
                  </ThemeToggle>
                </Nav>
              </HeaderContent>
            </Header>
            {view !== 'pipeline' && (
              <MainContent>
               {view==='gallery' && <GalleryPage />}
               {view==='auth' && <AuthForms />}
              </MainContent>
            )}
            {view === 'pipeline' && <>
            <ProgressBarContainer style={{ '--progress-percent': `${(currentStep - 1) / 8}` }}>
              {Array.from({ length: 9 }, (_, i) => (
                <ProgressStep
                  key={i}
                  active={currentStep === i + 1}
                  completed={currentStep > i + 1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i, type: 'spring', stiffness: 400 }}
                  onClick={() => currentStep > i + 1 && setCurrentStep(i + 1)}
                >
                  {currentStep > i + 1 ? <FiCheck /> : i + 1}
                </ProgressStep>
              ))}
            </ProgressBarContainer>

            <MainContent>
              <AnimatePresence>
                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <span><FiXCircle style={{ marginRight: '0.5rem' }} />{error}</span>
                    <button onClick={() => setError(null)}><FiX /></button>
                  </ErrorMessage>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {loading && (
                  <LoadingOverlay variants={loadingVariants} initial="initial" animate="animate" exit="exit">
                    <LoadingSpinner variants={spinnerVariants} animate="animate" />
                    <p>{loadingMessage}</p>
                  </LoadingOverlay>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <StepContainer key={currentStep} variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                  {currentStep === 1 && (
                    <>
                      <h2>Create Your Video</h2>
                      <FormGroup>
                        <Input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder=" "
                          required
                        />
                        <Label htmlFor="title">Video Title</Label>
                      </FormGroup>
                      
                      <FormGroup>
                    <Select
                      id="videoSize"
                      value={videoMode ? 'standard' : 'shorts'}
                      onChange={handleVideoModeChange}
                    >
                      <option value="standard">Standard (16:9)</option>
                      <option value="shorts">Shorts (9:16)</option>
                    </Select>
                  </FormGroup>
                      <FormGroup>
                        <Input
                          type="text"
                          id="channelType"
                          value={channelType}
                          onChange={(e) => setChannelType(e.target.value)}
                          placeholder=" "
                        />
                        <Label htmlFor="channelType">Channel Type</Label>
                      </FormGroup>
                      <StepButtonsContainer style={{ justifyContent: 'center' }}>
                        <PrimaryButton onClick={generateContent} disabled={!title || loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Generate Content <FiChevronRight />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <h2>Review Content</h2>
                      <ContentPreviewBox>
                        <h3>Generated Content Idea:</h3>
                        {generatedContent || "No content generated yet."}
                      </ContentPreviewBox>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(1)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        <PrimaryButton onClick={generateScripts} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Generate Scripts <FiChevronRight />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <h2>Review Scripts & Prompts</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <ScriptsContainer>
                        <ScriptSection>
                          <h3>Main Script</h3>
                          <ContentPreviewBox>{scripts.script || "No main script generated."}</ContentPreviewBox>
                        </ScriptSection>
                        <ScriptSection>
                          <h3>Voice Scripts</h3>
                          <ScriptList>
                            {scripts.voiceScripts.length > 0 ? scripts.voiceScripts.map((script, index) => (
                              <ScriptListItem key={index}>
                                <span className="script-number">{index + 1}.</span>
                                <span className="script-text">{script}</span>
                              </ScriptListItem>
                            )) : <p>No voice scripts generated.</p>}
                          </ScriptList>
                        </ScriptSection>
                        <ScriptSection>
                          <h3>Image Prompts</h3>
                          <ScriptList>
                            {scripts.imagePrompts.length > 0 ? scripts.imagePrompts.map((prompt, index) => (
                              <ScriptListItem key={index}>
                                <span className="script-number">{index + 1}.</span>
                                <span className="script-text">{prompt}</span>
                              </ScriptListItem>
                            )) : <p>No image prompts generated.</p>}
                          </ScriptList>
                        </ScriptSection>
                      </ScriptsContainer>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(2)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        <PrimaryButton onClick={generateImages} disabled={loading || scripts.imagePrompts.length === 0} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Generate Images <FiChevronRight />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <h2>Generated Images</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <AnimatePresence>
                        {selectedImageToModify && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              position: 'fixed',
                              inset: 0,
                              background: 'rgba(0, 0, 0, 0.8)',
                              backdropFilter: 'blur(8px)',
                              zIndex: 100,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                            onClick={() => setSelectedImageToModify(null)}
                          >
                            <ImageModificationModal
                              onClick={e => e.stopPropagation()}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                            >
                              <button
                                onClick={() => setSelectedImageToModify(null)}
                                style={{
                                  position: 'absolute',
                                  top: '1rem',
                                  right: '1rem',
                                  background: 'none',
                                  border: 'none',
                                  color: theme.colors.text,
                                  fontSize: '1.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiX />
                              </button>
                              <div style={{ flex: 1 }}>
                                <img
                                  src={selectedImageToModify}
                                  alt="Selected"
                                  style={{ width: '100%', borderRadius: theme.borderRadius, maxHeight: '50vh', objectFit: 'contain' }}
                                  onError={(e) => { e.target.src = `https://placehold.co/${videoMode ? '160x90' : '90x160'}/1e1e3f/a0a0c0?text=Load+Error`; }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h3>Modify Image {generatedImages.findIndex(url => url === selectedImageToModify) + 1}</h3>
                                <FormGroup>
                                  <Textarea
                                    id="modificationPrompt"
                                    value={modificationPrompt}
                                    onChange={(e) => setModificationPrompt(e.target.value)}
                                    placeholder=" "
                                  />
                                  <Label htmlFor="modificationPrompt">Modification Prompt</Label>
                                </FormGroup>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                  <SecondaryButton onClick={() => setSelectedImageToModify(null)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                                    <FiX /> Cancel
                                  </SecondaryButton>
                                  <PrimaryButton onClick={modifyImage} disabled={!modificationPrompt || loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                                    {loading ? <FiLoader className="spin" /> : <FiEdit2 />} Apply
                                  </PrimaryButton>
                                </div>
                              </div>
                            </ImageModificationModal>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <GeneratedImagesGrid>
                        {generatedImages.length > 0 ? generatedImages.map((imagePath, index) => (
                          <ImageCard
                            key={imagePath || index}
                            selected={selectedImageToModify === imagePath}
                            videoMode={videoMode}
                            variants={imageCardHover}
                            whileHover="hover"
                            whileTap={{ scale: 0.98 }}
                          >
                            <img
                              src={imagePath}
                              alt={`Generated image ${index + 1}`}
                              onError={(e) => { e.target.src = `https://placehold.co/${videoMode ? '160x90' : '90x160'}/1e1e3f/a0a0c0?text=Load+Error`; }}
                            />
                            <div className="overlay">
                              <button onClick={() => setSelectedImageToModify(imagePath)}>
                                <FiEdit2 /> Modify
                              </button>
                            </div>
                          </ImageCard>
                        )) : <p>No images generated yet.</p>}
                      </GeneratedImagesGrid>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(3)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setCurrentStep(5)} disabled={loading || generatedImages.length === 0} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Continue to Voices <FiChevronRight />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 5 && (
                    <>
                      <h2>Generate Voices</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <FormGroup>
                        <Select id="voice" value={voice} onChange={(e) => setVoice(e.target.value)} disabled={ownVoice || loading}>
                          <option value="">Default AI Voice</option>
                          <option value="Arista-PlayAI">Arista (Female)</option>
                          <option value="Atlas-PlayAI">Atlas (Male, Deep)</option>
                          <option value="Basil-PlayAI">Basil (Male, British)</option>
                          <option value="Celeste-PlayAI">Celeste (Female, Calm)</option>
                          <option value="Mason-PlayAI">Mason (Male, Standard)</option>
                          <option value="Quinn-PlayAI">Quinn (Female, Upbeat)</option>
                          <option value="Briggs-PlayAI">Briggs-PlayAI</option>
                          <option value="Calum-PlayAI">Calum-PlayAI</option>
                          <option value="Cheyenne-PlayAI">Cheyenne-PlayAI</option>
                          <option value="Chip-PlayAI">Chip-PlayAI</option>
                          <option value="Cillian-PlayAI">Cillian-PlayAI</option>
                          <option value="Deedee-PlayAI">Deedee-PlayAI</option>
                          <option value="Fritz-PlayAI">Fritz-PlayAI</option>
                          <option value="Gail-PlayAI">Gail-PlayAI</option>
                          <option value="Indigo-PlayAI">Indigo-PlayAI</option>
                          <option value="Mamaw-PlayAI">Mamaw-PlayAI</option>
                          <option value="Mikail-PlayAI">Mikail-PlayAI</option>
                          <option value="Mitch-PlayAI">Mitch-PlayAI</option>
                          <option value="Thunder-PlayAI">Thunder-PlayAI</option>
                        </Select>
                        <Label htmlFor="voice">Select Voice</Label>
                      </FormGroup>
                      <FormGroup>
                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={ownVoice}
                            onChange={(e) => setOwnVoice(e.target.checked)}
                            disabled={loading}
                          />
                          Use my own voice sample
                        </CheckboxLabel>
                      </FormGroup>
                      <AnimatePresence>
                        {ownVoice && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <FormGroup>
                              <Input
                                type="file"
                                id="customVoice"
                                accept="audio/mpeg, audio/wav"
                                onChange={(e) => handleFileChange(e, setCustomVoiceFile)}
                                disabled={loading}
                              />
                              <Label htmlFor="customVoice">Upload Voice Sample</Label>
                              {customVoiceFile && <p style={{ fontSize: '0.9rem', marginTop: '0.8rem' }}>Selected: {customVoiceFile.name}</p>}
                            </FormGroup>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <ScriptSection style={{ marginBottom: '2rem' }}>
                        <h3>Voice Scripts</h3>
                        <ScriptList>
                          {scripts.voiceScripts.length > 0 ? scripts.voiceScripts.map((script, index) => (
                            <ScriptListItem key={index}>
                              <span className="script-number">{index + 1}.</span>
                              <span className="script-text">{script}</span>
                            </ScriptListItem>
                          )) : <p>No voice scripts available.</p>}
                        </ScriptList>
                      </ScriptSection>
                      {generatedVoices.length > 0 && (
                        <GeneratedVoicesContainer>
                          <h3>Generated Voice Clips</h3>
                          {generatedVoices.map((voicePath, index) => (
                            <VoiceItem key={voicePath || index}>
                              <span>Clip {index + 1}</span>
                              <audio controls src={voicePath} onError={(e) => { e.target.style.display = 'none'; }}>
                                Your browser does not support the audio element.
                              </audio>
                            </VoiceItem>
                          ))}
                        </GeneratedVoicesContainer>
                      )}
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(4)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        {generatedVoices.length === 0 ? (
                          <PrimaryButton
                            onClick={generateVoices}
                            disabled={loading || (ownVoice && !customVoiceFile) || scripts.voiceScripts.length === 0}
                            {...buttonHoverTap}
                            onClickCapture={handleButtonClick}
                          >
                            Generate Voices <FiPlay />
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton onClick={() => setCurrentStep(6)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                            Continue to Editing <FiChevronRight />
                          </PrimaryButton>
                        )}
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 6 && (
                    <>
                      <h2>Assemble Video</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <p style={{ textAlign: 'center', color: theme.colors.text }}>
                        Ready to combine images and voices into a stunning video sequence.
                      </p>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(5)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        <PrimaryButton onClick={editVideo} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Assemble Video <FiEdit2 />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 7 && (
                    <>
                      <h2>Add Background Music</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <FormGroup>
                        <Input
                          type="file"
                          id="backgroundMusic"
                          accept="audio/mpeg, audio/wav"
                          onChange={(e) => handleFileChange(e, setBackgroundMusic)}
                          disabled={loading}
                        />
                        <Label htmlFor="backgroundMusic">Upload Background Music</Label>
                        {backgroundMusic && <p style={{ fontSize: '0.9rem', marginTop: '0.8rem' }}>Selected: {backgroundMusic.name}</p>}
                      </FormGroup>
                      <FormGroup>
                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={addCaptions}
                            onChange={(e) => setAddCaptions(e.target.checked)}
                            disabled={loading}
                          />
                          Add auto-generated captions
                        </CheckboxLabel>
                      </FormGroup>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(6)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        {backgroundMusic ? (
                          <PrimaryButton onClick={addBackgroundMusic} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                            Add Music & Continue <FiChevronRight />
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton onClick={() => {
                            if (addCaptions) setCurrentStep(8);
                            else { getFinalVideo(); setCurrentStep(9); }
                          }} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                            Skip Music & Continue <FiChevronRight />
                          </PrimaryButton>
                        )}
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 8 && (
                    <>
                      <h2>Add Captions</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <p style={{ textAlign: 'center', color: theme.colors.text }}>
                        Generating and overlaying captions onto your video.
                      </p>
                      <StepButtonsContainer>
                        <SecondaryButton onClick={() => setCurrentStep(7)} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          <FiChevronLeft /> Back
                        </SecondaryButton>
                        <PrimaryButton onClick={addCaptionsToVideo} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Generate Captions <FiChevronRight />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}

                  {currentStep === 9 && (
                    <>
                      <h2>Your Video is Ready!</h2>
                      <VideoModeIndicator>
                        <p>Video Format: <strong>{videoMode ? 'Standard (16:9)' : 'Shorts (9:16)'}</strong></p>
                      </VideoModeIndicator>
                      <VideoPreviewContainer>
                        {finalVideo ? (
                          <video controls src={finalVideo} key={finalVideo}>
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '5rem', background: theme.colors.surface, borderRadius: theme.borderRadius }}>
                            <LoadingSpinner variants={spinnerVariants} animate="animate" />
                            <p>Loading your video...</p>
                            <SecondaryButton onClick={getFinalVideo} disabled={loading} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                              <FiRefreshCw /> Reload Video
                            </SecondaryButton>
                          </div>
                        )}
                      </VideoPreviewContainer>
            {finalVideo && (
                        <DownloadSection>
                          <DownloadButton
                            href={finalVideo}
                            download={videoMode ? `${title || 'video'}.mp4` : `${title || 'shorts'}.mp4`}
                            {...buttonHoverTap}
                            onClickCapture={handleButtonClick}
                          >
                            <FiDownload /> Download Video
                          </DownloadButton>
              {user && <PrimaryButton style={{marginLeft:'1rem'}} onClick={saveVideoToGallery}>Save to Gallery</PrimaryButton>}
                        </DownloadSection>
                      )}
                      <StepButtonsContainer style={{ justifyContent: 'center' }}>
                        <PrimaryButton onClick={resetApplication} {...buttonHoverTap} onClickCapture={handleButtonClick}>
                          Create New Video <FiRefreshCw />
                        </PrimaryButton>
                      </StepButtonsContainer>
                    </>
                  )}
                </StepContainer>
              </AnimatePresence>
            </MainContent>
            </>}

            <Footer>
              <div className="footer-content">
                <div>
                  <h3>AI Video Studio</h3>
                  <p>Create stunning videos with the power of AI.</p>
                </div>
                <div className="footer-links">
                  <h3>Links</h3>
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#support">Support</a>
                  <a href="#terms">Terms</a>
                </div>
                <div>
                  <h3>Contact</h3>
                  <p>Email: harishravikumar24@gmail.com</p>
                  <p>Phone: 8807639930</p>
                </div>
              </div>
              <div className="social-icons">
                <a href="#twitter"><FaTwitter /></a>
                <a href="#instagram"><FaInstagram /></a>
                <a href="#linkedin"><FaLinkedin /></a>
              </div>
            </Footer>
          </AppContainer>
        </ThemeProvider>
      );
    }
export default function App(){
  return <AuthProvider><InnerApp /></AuthProvider>;
}