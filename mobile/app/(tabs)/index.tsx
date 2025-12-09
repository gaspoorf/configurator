import React, { useRef, useState } from 'react';
import Home from '../../components/screens/Home';
import QRscan from '../../components/screens/QRscan';
import Onboarding from '../../components/screens/Onboarding';
import Tuto from '../../components/screens/Tuto';
import Configurator from '../../components/screens/Configurator'
import TransitionOverlay from '../../components/transitions/TransitionOverlay';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'qrscan' | 'onboarding' | 'tuto' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const transitionRef = useRef<{ play: (onMiddle: () => void) => void } | null>(null);

  const switchViewWithTransition = (nextView: typeof currentView) => {
    transitionRef.current?.play(() => {
      setCurrentView(nextView);
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('qrscan')} />;
      case 'qrscan':
        return <QRscan onComplete={(roomId) => { setRoomId(roomId);  setCurrentView('onboarding')}} />;
      case 'onboarding':
        return <Onboarding onComplete={(name) => { setUserName(name); setCurrentView('tuto'); }} />;
      case 'tuto':
        return <Tuto userName={userName} onComplete={(name) => { switchViewWithTransition('configurator'); }} />;
      case 'configurator':
        return <Configurator userName={userName} roomId={roomId}/>;
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      <TransitionOverlay ref={transitionRef} />
    </>
  );

}