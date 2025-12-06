import React, { useState } from 'react';
import Home from '../../components/screens/Home';
import QRscan from '../../components/screens/QRscan';
import Onboarding from '../../components/screens/Onboarding';
import Configurator from '../../components/screens/Configurator';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'qrscan' | 'onboarding' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('qrscan')} />;
      case 'qrscan':
        return <QRscan onComplete={(roomId) => { setRoomId(roomId);  setCurrentView('onboarding')}} />;
      case 'onboarding':
        return <Onboarding onComplete={(name) => { setUserName(name); setCurrentView('configurator'); }} />;
      case 'configurator':
        return <Configurator userName={userName} roomId={roomId}/>;
      default:
        return null;
    }
  };

  return renderView();
}