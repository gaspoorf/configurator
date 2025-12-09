import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

type Props = {
  onComplete: (userName: string) => void;
};

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  { title: "Étape 1", description: "Comment s'appelle votre héro ?" },
  { title: "Étape 2", description: "" },
  { title: "", description: "Ta mission : Créer un écosystème capable de tenir tête aux changements climatiques." },
  { title: "", description: "Tu vas devoir faire des choix. Des vrais ! Des décisions qui vont tout changer pour ta planète." },
  { title: "", description: "Pas besoin d'être un.e écolo parfait.e. Juste… essaie de ne pas tout détruire ok ? Prêt.e ? Allez, on commence !" },
];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const video = useRef(null);

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(userName);
    }
  };

  const currentContent = useMemo(() => ({
    ...ONBOARDING_STEPS[step],
    description:
      step === 1
        ? `Félicitations, ${userName} ! Tu tiens littéralement le destin de la planète entre tes mains. Maintenant, c'est toi le boss !`
        : ONBOARDING_STEPS[step].description,
  }), [step, userName]);

  return (
    <View style={styles.container}>
      
      <Video
        ref={video}
        style={styles.video}
        source={require('../../assets/videos/dance.mp4')}
        isLooping={true}
        isMuted={true}
        shouldPlay={true}
        resizeMode={ResizeMode.COVER}
        useNativeControls={false}
      />


      <View style={styles.content}>
        <Text style={styles.description}>{currentContent.description}</Text>
      </View>
      
      {step === 0 && (
        <TextInput
          style={styles.input}
          placeholder="ENTRER UN NOM"
          value={userName}
          onChangeText={setUserName}
          placeholderTextColor="#00000050" 
        />
      )}

      <TouchableOpacity
        style={[
          styles.button,
          !userName && step === 0 && styles.buttonDisabled,
          step === ONBOARDING_STEPS.length - 1 && styles.buttonFinish,
        ]}
        onPress={handleNext}
        disabled={step === 0 && !userName}
      >
        <Text style={styles.buttonText}>
          {step === ONBOARDING_STEPS.length - 1 ? 'Letsgo' : '→'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F3EF', 
    alignItems: 'center', 
    padding: 40, 
    paddingVertical: 80,
    position: 'relative',
  },
  content: { 
    alignItems: 'center', 
    marginTop: 40,
    zIndex: 1, 
  },
  description: { 
    textAlign: 'center', 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000',

    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  button: { 
    backgroundColor: '#ffffff', 
    paddingVertical: 24, 
    paddingHorizontal: 27, 
    aspectRatio: 1, 
    borderRadius: 100, 
    position: "absolute", 
    bottom: 50, 
    right: 20, 
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  buttonDisabled: { 
    backgroundColor: '#ccc',
    opacity: 0.7 
  },
  buttonFinish: { 
    width: '112%', 
    height: 70, 
    borderRadius: 35, 
    aspectRatio: undefined,
  
    alignSelf: 'center',
    position: 'absolute', 
    marginBottom: 0,
    bottom: 50,
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  input: { 
    borderColor: '#000', 
    padding: 10, 
    width: '100%', 
    marginTop: 20, 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#000', 
    textAlign: "center",
    zIndex: 1,
  },
  video: {
    bottom: 0,
    position: 'absolute', 
    width: '130%',
    height: '100%',
    zIndex: 0, 
  },
});