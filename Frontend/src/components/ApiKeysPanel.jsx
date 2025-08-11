import React, { useState } from 'react';
import styled from 'styled-components';
import { useApiKeys } from '../context/ApiKeysContext';

const Wrap = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const Field = styled.div`display:flex;flex-direction:column;gap:.4rem;`;
const Label = styled.label`font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;opacity:.65;`;
const Input = styled.input`background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:.7rem .85rem;border-radius:10px;color:#fff;font-size:.8rem;outline:none; &:focus{border-color:#7f5af0;}`;
const Row = styled.div`display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;`;
const Button = styled.button`background:#7f5af0;border:none;color:#fff;padding:.65rem 1rem;font-size:.65rem;letter-spacing:.1em;font-weight:600;border-radius:12px;cursor:pointer; &:disabled{opacity:.5;cursor:not-allowed;}`;
const Badge = styled.span`background:${p=>p.on? 'linear-gradient(135deg,#7f5af0,#2cb67d)':'rgba(255,255,255,.1)'};color:#fff;padding:.35rem .6rem;font-size:.55rem;letter-spacing:.1em;border-radius:999px;`; 
const Note = styled.p`margin:.2rem 0 0;font-size:.6rem;opacity:.55;line-height:1.4;`;

export function ApiKeysPanel(){
  const { presence, loading, saveKeys } = useApiKeys();
  const [form,setForm] = useState({ gemini:'', groq1:'', groq2:'', groq3:'' });
  const [submitting,setSubmitting] = useState(false);
  const set = (k,v)=> setForm(f=>({...f,[k]:v}));
  const submit = async (e)=>{ e.preventDefault(); setSubmitting(true); try { await saveKeys(Object.fromEntries(Object.entries(form).filter(([,v])=>v))); Object.keys(form).forEach(k=> form[k]=''); } catch(_){} finally { setSubmitting(false);} };
  return (
    <Wrap>
      <Row>
        <Badge on={presence?.gemini}>Gemini {presence?.gemini? 'SET':'—'}</Badge>
        <Badge on={presence?.groq1}>Groq1 {presence?.groq1? 'SET':'—'}</Badge>
        <Badge on={presence?.groq2}>Groq2 {presence?.groq2? 'SET':'—'}</Badge>
        <Badge on={presence?.groq3}>Groq3 {presence?.groq3? 'SET':'—'}</Badge>
      </Row>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <Field>
          <Label htmlFor='gemini'>Gemini API Key (leave blank to keep existing)</Label>
          <Input id='gemini' value={form.gemini} onChange={e=>set('gemini', e.target.value)} placeholder='AI...'/>
        </Field>
        <Field>
          <Label htmlFor='groq1'>Groq API Key 1</Label>
          <Input id='groq1' value={form.groq1} onChange={e=>set('groq1', e.target.value)} placeholder='gsk_...'/>
        </Field>
        <Field>
          <Label htmlFor='groq2'>Groq API Key 2</Label>
          <Input id='groq2' value={form.groq2} onChange={e=>set('groq2', e.target.value)} placeholder='(optional)'/>
        </Field>
        <Field>
          <Label htmlFor='groq3'>Groq API Key 3</Label>
          <Input id='groq3' value={form.groq3} onChange={e=>set('groq3', e.target.value)} placeholder='(optional)'/>
        </Field>
        <Note>Keys are stored server-side per user. They are returned only as presence flags (SET/—) for security.</Note>
        <Button type='submit' disabled={submitting || loading}>{submitting? 'Saving...':'Save / Update Keys'}</Button>
      </form>
    </Wrap>
  );
}

export default ApiKeysPanel;
