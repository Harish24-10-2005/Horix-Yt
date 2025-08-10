import React, { useState } from 'react';
import { PipelineProvider, usePipeline } from './context/PipelineContext';
import { Layout } from './components/Layout';
import { Step1Create, Step2Content, Step3Scripts, Step4Images, Step5Voices, Step6Edit, Step7Music, Step8Captions, Step9Final } from './components/steps';
import { HomePage } from './components/home/HomePage';
import { AuthProvider } from './context/AuthContext';
import { AuthForms } from './components/AuthForms';
import { GalleryPage } from './components/GalleryPage';

function StepPlaceholder({ n, label }) {
  return (
    <div style={{ padding: '2rem', border: '1px dashed #555', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Step {n}</h2>
      <p>{label} (migration pending)</p>
    </div>
  );
}

function StepsRouter() {
  const { step } = usePipeline();
  if(step === 0) return <HomePage />;
  switch (step) {
    case 1: return <Step1Create />;
    case 2: return <Step2Content />;
  case 3: return <Step3Scripts />;
  case 4: return <Step4Images />;
  case 5: return <Step5Voices />;
  case 6: return <Step6Edit />;
  case 7: return <Step7Music />;
  case 8: return <Step8Captions />;
  case 9: return <Step9Final />;
    default: return <div>Unknown step</div>;
  }
}

function AppShell(){
  const [view,setView] = useState('pipeline'); // pipeline | gallery | auth
  return (
    <Layout currentView={view} onNavigate={setView} showProgress={view==='pipeline'}>
      {view==='auth' && <AuthForms />}
      {view==='gallery' && <GalleryPage />}
      {view==='pipeline' && <StepsRouter />}
    </Layout>
  );
}

export default function App(){
  return <AuthProvider><PipelineProvider><AppShell/></PipelineProvider></AuthProvider>;
}