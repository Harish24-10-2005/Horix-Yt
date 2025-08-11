import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// Animations
const fadeIn = { initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8} };
const glow = keyframes`0%,100%{opacity:.6;filter:blur(4px);}50%{opacity:.9;filter:blur(8px);}`;

// Styled components
const CardWrap = styled(motion.div)`
	position:relative; padding:2.1rem 2rem 2.4rem; width:100%; max-width:380px; border-radius:26px; background:linear-gradient(155deg,rgba(35,30,55,.75),rgba(20,15,35,.85)); backdrop-filter:blur(18px) saturate(180%);
	border:1px solid rgba(255,255,255,.08); box-shadow:0 10px 35px -8px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04);
	overflow:hidden; isolation:isolate;
	&:before{content:'';position:absolute;inset:-1px;z-index:-1;padding:1px;border-radius:inherit;background:conic-gradient(from 120deg,var(--grad-from,#7f5af0),var(--grad-to,#2cb67d));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:xor;opacity:.35;} 
`;
const Ambient = styled.div`position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit;`; 
const Blob = styled.div`position:absolute;width:320px;height:320px;background:radial-gradient(circle at 30% 30%,rgba(127,90,240,.85),transparent 70%);top:-140px;left:-140px;mix-blend-mode:screen;animation:${glow} 9s ease-in-out infinite;`;
const Title = styled.h3`margin:0 0 1.1rem;font-size:1.55rem;letter-spacing:.5px;font-weight:600;background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`; 
const Switcher = styled.div`margin-top:.75rem;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase; text-align:center; opacity:.75;`; 
const InlineBtn = styled.button`background:none;border:none;padding:0;margin:0 .25rem;cursor:pointer;color:${p=>p.theme.colors.primary};font-weight:600; &:hover{text-decoration:underline;}`;
const Form = styled.form`display:flex;flex-direction:column;gap:1rem;`;
const Field = styled.div`display:flex;flex-direction:column;gap:.5rem;`;
const Label = styled.label`font-size:.65rem;letter-spacing:.15em;font-weight:600;opacity:.7;text-transform:uppercase;`; 
const InputWrap = styled.div`position:relative;display:flex;align-items:center;`;
const Input = styled.input`width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:.85rem .95rem;font-size:.9rem;color:${p=>p.theme.colors.text};outline:none;backdrop-filter:blur(6px);transition:.35s;
	&:focus{border-color:${p=>p.theme.colors.primary};box-shadow:0 0 0 3px ${p=>p.theme.colors.primaryTransparent};}
`;
const IconBtn = styled.button`position:absolute;right:.55rem;top:50%;transform:translateY(-50%);background:none;border:none;color:${p=>p.theme.colors.textSecondary};display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;cursor:pointer;transition:.3s;
	&:hover{color:${p=>p.theme.colors.text}}
`;
const Submit = styled(motion.button)`border:none;border-radius:16px;padding:.95rem 1.2rem;font-weight:600;font-size:.85rem;letter-spacing:.08em;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.55rem;color:#fff;background:${p=>p.theme.colors.gradientPrimary};box-shadow:0 6px 22px -8px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);position:relative;overflow:hidden;
	&:disabled{opacity:.6;cursor:not-allowed;}
	&:before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.18),transparent 40%,transparent 60%,rgba(255,255,255,.18));opacity:0;transition:.6s;}
	&:hover:not(:disabled):before{opacity:1;}
`;
const ErrorBox = styled(motion.div)`display:flex;align-items:flex-start;gap:.6rem;font-size:.7rem;line-height:1.3;padding:.7rem .85rem;border:1px solid ${p=>p.theme.colors.error};background:${p=>p.theme.colors.errorTransparent};color:${p=>p.theme.colors.error};border-radius:12px;`;
const Success = styled(motion.div)`display:flex;align-items:center;gap:.4rem;font-size:.65rem;font-weight:600;letter-spacing:.08em;color:${p=>p.theme.colors.success};`; 
const StrengthBar = styled.div`height:6px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;display:flex;`;
const StrengthSeg = styled.div`flex:1;background:${p=>p.active? p.color:'transparent'};transition:.4s;`;
const Helper = styled.div`font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;opacity:.55;display:flex;justify-content:space-between;`;

function passwordScore(pw){
	let score=0; if(pw.length>=6) score++; if(/[A-Z]/.test(pw)) score++; if(/[0-9]/.test(pw)) score++; if(/[^A-Za-z0-9]/.test(pw)) score++; if(pw.length>=12) score++; return score; }

export function AuthForms(){
	const { user, login, register, error, loading, logout } = useAuth();
	const [mode, setMode] = useState('login');
	const [showPw, setShowPw] = useState(false);
	const [form, setForm] = useState({ email:'', password:'', display_name:'' });
	const score = useMemo(()=> passwordScore(form.password), [form.password]);
	const segColors = ['#ff4d4f','#ff884d','#ffce3d','#52c41a','#2cb67d'];
	const onChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
	const submitting = loading;
	const canSubmit = form.email && form.password && (mode==='login' || form.password.length>=6);
	const onSubmit = async e => { e.preventDefault(); if(!canSubmit) return; try { if(mode==='login') await login({ email: form.email.trim(), password: form.password }); else await register({ email: form.email.trim(), password: form.password, display_name: form.display_name.trim() }); } catch(_){} };

	if(user) return (
		<CardWrap layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
			<Ambient><Blob /></Ambient>
			<Title style={{marginBottom:'1rem'}}>Welcome</Title>
			<Success initial={{opacity:0}} animate={{opacity:1}}><FiCheckCircle size={14}/> Signed in as {user.display_name || user.email}</Success>
			<Submit type="button" style={{marginTop:'1.3rem'}} whileTap={{scale:.95}} onClick={logout}>Logout</Submit>
		</CardWrap>
	);

	return (
		<AnimatePresence mode="wait" initial={false}>
			<CardWrap key={mode} variants={fadeIn} initial="initial" animate="animate" exit="exit" layout>
				<Ambient><Blob /></Ambient>
				<Title>{mode==='login'? 'Sign In':'Create Account'}</Title>
				<Form onSubmit={onSubmit} noValidate>
					{mode==='register' && (
						<Field as={motion.div} variants={fadeIn} initial="initial" animate="animate" transition={{delay:.05}}>
							<Label htmlFor="display_name">Display Name</Label>
							<Input id="display_name" name="display_name" autoComplete="nickname" placeholder="Your display name" value={form.display_name} onChange={onChange} />
						</Field>
					)}
					<Field>
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
					</Field>
						<Field>
							<Label htmlFor="password">Password</Label>
							<InputWrap>
								<Input id="password" name="password" type={showPw? 'text':'password'} autoComplete={mode==='login'? 'current-password':'new-password'} placeholder={mode==='login'? 'Your password':'Create a password'} value={form.password} onChange={onChange} required />
								<IconBtn type="button" onClick={()=>setShowPw(s=>!s)} aria-label={showPw? 'Hide password':'Show password'}>{showPw? <FiEyeOff size={18}/>: <FiEye size={18}/>}</IconBtn>
							</InputWrap>
							{mode==='register' && (
								<>
									<StrengthBar aria-hidden="true">
										{Array.from({length:5}).map((_,i)=>(<StrengthSeg key={i} active={score>i} color={segColors[Math.min(score-1, segColors.length-1)]}/>))}
									</StrengthBar>
									<Helper>
										<span>{score<=2? 'Weak': score===3? 'Fair': score===4? 'Good':'Strong'}</span>
										<span>{form.password.length||0} chars</span>
									</Helper>
								</>
							)}
						</Field>
					<AnimatePresence>
						{error && (
							<ErrorBox key="err" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}>
								<FiAlertCircle size={16}/> <span style={{whiteSpace:'pre-line'}}>{error}</span>
							</ErrorBox>
						)}
					</AnimatePresence>
					<Submit type="submit" disabled={!canSubmit || submitting} whileTap={{scale:.95}} whileHover={!submitting && canSubmit? {scale:1.02}: undefined}>
						{submitting? 'Please wait...': mode==='login'? <><FiLogIn size={16}/> Sign In</>: <><FiUserPlus size={16}/> Register</>}
					</Submit>
				</Form>
				<Switcher>
					{mode==='login'? <>Need an account? <InlineBtn type="button" onClick={()=>{setMode('register'); setForm(f=>({...f,password:''}));}}>Register</InlineBtn></>: <>Have an account? <InlineBtn type="button" onClick={()=>{setMode('login');}}>Sign In</InlineBtn></>}
				</Switcher>
			</CardWrap>
		</AnimatePresence>
	);
}
