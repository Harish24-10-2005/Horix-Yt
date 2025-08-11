import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { AuthForms } from './AuthForms';
import { themeDark } from '../design/theme';

const Global = createGlobalStyle`body{margin:0;font-family:'Poppins',system-ui,sans-serif;background:${p=>p.theme.colors.background};color:${p=>p.theme.colors.text};}`;
const Shell = styled.div`min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;position:relative;overflow:hidden;`;
const Branding = styled.div`position:absolute;top:2rem;left:2rem;font-weight:600;font-size:1.2rem;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:.5px;`;
const Footer = styled.footer`position:absolute;bottom:1.2rem;left:0;right:0;text-align:center;font-size:.65rem;letter-spacing:.12em;opacity:.55;`;

export function AuthPage(){
  return (
    <ThemeProvider theme={themeDark}>
      <Global />
      <Shell>
        <Branding>Horix YT</Branding>
        <AuthForms />
        <Footer>© {new Date().getFullYear()} Horix YT</Footer>
      </Shell>
    </ThemeProvider>
  );
}

export default AuthPage;
