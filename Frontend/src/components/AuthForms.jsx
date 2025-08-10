import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Wrap = styled.div`max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:1.6rem;`;
const Title = styled.h2`text-align:center;font-size:clamp(1.6rem,2.2vw,2.4rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 .5rem;`;
const Switcher = styled.div`text-align:center;font-size:.75rem;letter-spacing:.08em;`;
const Form = styled.form`display:flex;flex-direction:column;gap:1rem;background:${p=>p.theme.colors.surface2};padding:2rem 1.75rem;border:1px solid ${p=>p.theme.colors.border};border-radius:${p=>p.theme.radii? p.theme.radii.md:'16px'};box-shadow:0 10px 30px -12px rgba(0,0,0,.55);`;
const Field = styled.div`display:flex;flex-direction:column;gap:.45rem;`;
const Label = styled.label`font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;color:${p=>p.theme.colors.textSecondary};`;
const Input = styled.input`background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};padding:.85rem .95rem;border-radius:10px;color:${p=>p.theme.colors.text};font-size:.9rem;outline:none;transition:.3s; &:focus{border-color:${p=>p.theme.colors.primary};box-shadow:0 0 0 3px ${p=>p.theme.colors.primaryTransparent};}`;
const Submit = styled.button`background:${p=>p.theme.colors.gradientPrimary};color:#fff;border:none;padding:.9rem 1.1rem;border-radius:12px;cursor:pointer;font-weight:600;letter-spacing:.08em;font-size:.85rem;display:inline-flex;justify-content:center;align-items:center;transition:.35s; &:hover{filter:brightness(1.1);} &:disabled{opacity:.55;cursor:not-allowed;}`;
const Error = styled.div`background:${p=>p.theme.colors.errorTransparent};color:${p=>p.theme.colors.error};padding:.75rem 1rem;border:1px solid ${p=>p.theme.colors.error};font-size:.7rem;letter-spacing:.08em;border-radius:10px;`;

export function AuthForms(){
  const { signup, login, loading, error } = useAuth();
  const [mode,setMode] = useState('login');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [display,setDisplay] = useState('');

  const onSubmit = async (e)=>{ e.preventDefault(); if(mode==='login'){ await login(email,password); } else { await signup(email,password,display||undefined); } };

  return <Wrap>
    <Title>{mode==='login'? 'Sign In':'Create Account'}</Title>
    <Form onSubmit={onSubmit}>
      {error && <Error>{error}</Error>}
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      </Field>
      {mode==='signup' && <Field>
        <Label htmlFor="display">Display Name</Label>
        <Input id="display" value={display} onChange={e=>setDisplay(e.target.value)} placeholder="(optional)" />
      </Field>}
      <Field>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete={mode==='login'? 'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} required />
      </Field>
      <Submit type="submit" disabled={loading}>{loading? 'Please wait...': mode==='login'? 'Login':'Create Account'}</Submit>
    </Form>
    <Switcher>
      {mode==='login'? <>Need an account? <button type="button" style={{background:'none',border:'none',color:'inherit',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setMode('signup')}>Sign up</button></>
      : <>Have an account? <button type="button" style={{background:'none',border:'none',color:'inherit',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setMode('login')}>Log in</button></>}
    </Switcher>
  </Wrap>;
}

export default AuthForms;
