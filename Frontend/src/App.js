import React from 'react';
import { PipelineProvider, usePipeline } from './context/PipelineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiKeysProvider } from './context/ApiKeysContext';
import { AuthPage } from './components/AuthPage';
import { Layout } from './components/Layout';
import { Step1Create, Step2Content, Step3Scripts, Step4Images, Step5Voices, Step6Edit, Step7Music, Step8Captions, Step9Final } from './components/steps';
import { HomePage } from './components/home/HomePage';

function StepsRouter() {
  const { step } = usePipeline();
  const { user } = useAuth();
  if(step === 0) return <HomePage />;
    if(!user) return <AuthPage />; // gate access if not logged in
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

function App() {
  return (
    <AuthProvider>
        <InnerApp />
    </AuthProvider>
  );
}

  function InnerApp(){
    const { user } = useAuth();
    if(!user) return <AuthPage />;
    return (
      <ApiKeysProvider>
        <PipelineProvider>
          <Layout>
            <StepsRouter />
          </Layout>
        </PipelineProvider>
      </ApiKeysProvider>
    );
  }

export default App;