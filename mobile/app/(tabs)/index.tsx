import React, { useState } from 'react';
import Home from '../../components/screens/Home';
import Onboarding from '../../components/screens/Onboarding';
import Configurator from '../../components/screens/Configurator';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'onboarding' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('onboarding')} />;
      case 'onboarding':
        return <Onboarding onComplete={(name) => { setUserName(name); setCurrentView('configurator'); }} />;
      case 'configurator':
        return <Configurator userName={userName} />;
      default:
        return null;
    }
  };

  return renderView();
}