import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, assets } from '../api/client';

const PipelineContext = createContext(null);

export function PipelineProvider({ children }) {
  const [state, setState] = useState({
    step: 0, // 0 = Home landing
    title: '',
    channelType: '',
    videoMode: true,
    content: '',
    scripts: { script: '', voiceScripts: [], imagePrompts: [] },
    images: [],
    voices: [],
  voiceChoice: '',
  ownVoice: false,
    bgAdded: false,
    captions: false,
    finalVideo: null,
    loading: false,
    loadingMessage: '',
    error: null,
  });

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  const startLoading = (loadingMessage) => update({ loading: true, loadingMessage, error: null });
  const stopLoading = () => update({ loading: false, loadingMessage: '' });
  const fail = (err, fallback) => {
    console.error(err);
    update({ error: err.message || fallback || 'Unexpected error', loading: false });
  };

  const setStep = (step) => update({ step });
  const setTitle = (title) => update({ title });
  const setChannelType = (channelType) => update({ channelType });
  const setVideoMode = async (videoMode) => {
    update({ videoMode });
    try { await api.setVideoMode(videoMode); } catch (e) { console.warn('Video mode sync failed', e); }
  };
  const setVoiceChoice = (voiceChoice) => update({ voiceChoice });
  const setOwnVoice = (ownVoice) => update({ ownVoice });

  const generateContent = async () => {
    startLoading('Generating content...');
    try {
      const data = await api.generateContent({ title: state.title, video_mode: state.videoMode, channel_type: state.channelType || undefined });
      update({ content: data.content || '', step: 2 });
      stopLoading();
    } catch (e) { fail(e, 'Content generation failed'); }
  };

  const generateScripts = async () => {
    startLoading('Generating scripts...');
    try {
      const data = await api.generateScripts({ title: state.title, content: state.content, video_mode: state.videoMode, channel_type: state.channelType || undefined });
      // Normalize image prompts: backend may return image_prompts (array[str]) OR image_prompts_detailed (array[object]{prompt})
      let imagePrompts = data.image_prompts || [];
      if ((!imagePrompts || imagePrompts.length === 0) && Array.isArray(data.image_prompts_detailed)) {
        imagePrompts = data.image_prompts_detailed.map(p => (typeof p === 'string' ? p : (p.prompt || p.description || ''))).filter(Boolean);
      }
      update({ scripts: { script: data.script || '', voiceScripts: data.voice_scripts || [], imagePrompts }, step: 3 });
      stopLoading();
    } catch (e) { fail(e, 'Script generation failed'); }
  };

  const generateImages = async () => {
    startLoading('Generating images...');
    try {
      const data = await api.generateImages({ prompts: state.scripts.imagePrompts, video_mode: state.videoMode });
      const images = (data.image_paths || []).map(p => `${assets.full(p)}?t=${Date.now()}`);
      update({ images, step: 4 });
      stopLoading();
    } catch (e) { fail(e, 'Image generation failed'); }
  };

  const modifyImage = async (imageUrl, prompt) => {
    if (!imageUrl || !prompt) return;
    startLoading('Modifying image...');
    try {
      const base = imageUrl.split('?')[0];
      const relative = base.replace(assets.base, '').replace(/^\//,'');
      await api.modifyImage({ image_path: relative, prompt, video_mode: state.videoMode });
      const cacheBusted = `${assets.full(relative)}?t=${Date.now()}`;
      update({ images: state.images.map(i => i.split('?')[0] === base ? cacheBusted : i) });
      stopLoading();
    } catch (e) { fail(e, 'Image modification failed'); }
  };

  const uploadCustomVoice = async (file) => api.uploadCustomVoice(file);

  const generateVoices = async ({ voice, ownVoice, customFile }) => {
    startLoading('Generating voices...');
    try {
      if (ownVoice && customFile) {
        await uploadCustomVoice(customFile);
      }
      const data = await api.generateVoices({ sentences: state.scripts.voiceScripts, voice: voice || undefined, own_voice: ownVoice, video_mode: state.videoMode });
      const rawList = data.voice_paths || data.voice_files || [];
      let list = Array.isArray(rawList) ? rawList : [];
      if (typeof rawList === 'string') {
        const base = rawList.endsWith('/') ? rawList : rawList + '/';
        list = (state.scripts.voiceScripts || []).map((_, i) => `${base}voicescript${i+1}.wav`);
      }
      const voices = list.map(p => assets.full(p.replace(/\\\\/g,'/')));
      update({ voices, step: 5 });
      stopLoading();
    } catch (e) { fail(e, 'Voice generation failed'); }
  };

  const editVideo = async () => {
    startLoading('Editing video...');
    try {
      await api.editVideo({ video_mode: state.videoMode });
      update({ step: 7 });
      stopLoading();
    } catch (e) { fail(e, 'Video edit failed'); }
  };

  const addBackgroundMusic = async ({ file, addCaptions }) => {
    startLoading('Processing background music...');
    try {
      let music_path = null;
      if (file) {
        const up = await api.uploadMusic(file);
        music_path = up.music_path;
        await api.addBackgroundMusic({ music_path, video_mode: state.videoMode });
      }
      update({ bgAdded: true });
      if (addCaptions) {
        update({ step: 8 });
      } else {
        await fetchFinalVideo(false, !!file);
        update({ step: 9 });
      }
      stopLoading();
    } catch (e) { fail(e, 'Background music step failed'); }
  };

  const addCaptionsToVideo = async () => {
    startLoading('Adding captions...');
    try {
      await api.addCaptions({ video_mode: state.videoMode });
      update({ captions: true });
      await fetchFinalVideo(true, state.bgAdded);
      update({ step: 9 });
      stopLoading();
    } catch (e) { fail(e, 'Captioning failed'); }
  };

  const fetchFinalVideo = async (captions, bg) => {
    startLoading('Fetching final video...');
    try {
      const file = captions ? 'output_with_glowing_captions.mp4' : (bg ? 'youtube_shorts_with_music.mp4' : 'youtube_shorts.mp4');
      const cacheBust = `t=${Date.now()}`;
      const url = `${apiBase()}/video?file=${file}&${cacheBust}`;
      // simple fetch to validate
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Video fetch failed ${res.status}`);
      update({ finalVideo: `${url}${url.includes('?') ? '&' : '?'}${cacheBust}` });
      stopLoading();
    } catch (e) { fail(e, 'Final video fetch failed'); }
  };

  const reset = () => setState({
    step: 0, title: '', channelType: '', videoMode: true, content: '',
  scripts: { script: '', voiceScripts: [], imagePrompts: [] }, images: [], voices: [], voiceChoice: '', ownVoice: false,
    bgAdded: false, captions: false, finalVideo: null, loading: false, loadingMessage: '', error: null
  });

  const apiBase = () => (process.env.REACT_APP_API_BASE || 'http://localhost:8000/api/video');

  const value = {
    ...state,
  setStep, setTitle, setChannelType, setVideoMode, setVoiceChoice, setOwnVoice,
    generateContent, generateScripts, generateImages, modifyImage,
    generateVoices, editVideo, addBackgroundMusic, addCaptionsToVideo,
    fetchFinalVideo, reset,
  };
  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider');
  return ctx;
}
