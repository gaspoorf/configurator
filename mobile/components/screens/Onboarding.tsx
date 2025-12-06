import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

type Props = {
    onComplete: (userName: string) => void;
};

const ONBOARDING_STEPS = [
    { title: "Étape 1", description: "Comment s'appele votre héro ?" },
    { title: "Étape 2", description: "" },
    { title: "Étape 3", description: "Ta mission :                                Créer un écosystème capable de tenir tête aux changements climatiques."},
    { title: "Étape 4", description: "Tu vas devoir faire des choix. Des vrais ! Des décisions qui vont tout changer pour ta planète."},
    { title: "Étape 5", description: "Pas besoin d’être un.e écolo parfait.e. Juste… essaie de ne pas tout détruire ok ? Prêt.e ? Allez, on commence !"},
];

export default function Onboarding({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState("");


    const handleNext = () => {
        if (step < ONBOARDING_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(userName);
        }
    };

    const currentContent = {
        ...ONBOARDING_STEPS[step],
        description:
            step === 1
                ? `Félicitations, ${userName} ! Tu tiens littéralement le destin de la planete entre tes mains. Maintenant, c'est toi le boss !`
                : ONBOARDING_STEPS[step].description,
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* <Text style={styles.stepIndicator}>Étape {step + 1} / {ONBOARDING_STEPS.length}</Text> */}
                {/* <Text style={styles.title}>{currentContent.title}</Text> */}
                <Text style={styles.description}>{currentContent.description}</Text>
            </View>

            {step === 0 && (
                <TextInput
                    style={styles.input}
                    placeholder="ENTRER UN NOM"
                    value={userName}
                    onChangeText={setUserName}
                    placeholderTextColor="#00000017"
                />
            )}

            <Image
                source={require("../../assets/img/hero.png")}
                style={styles.image}
            />


            <TouchableOpacity
                style={[styles.button, !userName && step === 0 && styles.buttonDisabled, step === ONBOARDING_STEPS.length - 1 && styles.buttonFinish]}
                onPress={handleNext}
                disabled={step === 0 && !userName}
            >
                <Text style={styles.buttonText}>
                    {step === ONBOARDING_STEPS.length - 1 ? "Letsgo" : "→"}
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',

        padding: 40,
        paddingVertical: 80,
    },
    content: {
        alignItems: 'center',
        marginTop: 40,
    },
    stepIndicator: {
        fontSize: 14,
        color: '#a01515',
        marginBottom: 20,
        // textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 700,
        color: '#000000',
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 24,
        paddingHorizontal: 27,
        aspectRatio: 1,
        borderRadius: 100,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        boxShadow: "0 -3px 6px 0 rgba(0, 0, 0, 0.15) inset",
        position: "absolute",
        bottom: 50,
        right: 20,
        zIndex: 2,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonFinish: {
        width: '110%',
        height: 70,
        textAlign: 'center',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.15)",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        marginTop:  0,
        fontSize: 34,
        fontWeight: 700,
        color: '#000000',
        textAlign: "center",
        // textTransform: "uppercase",
    },
   
    image: {
        width: '150%',
        resizeMode: 'contain',
        position: 'absolute',
        bottom: '-100%',
        // transform: [{ translateX: -150 }, { translateY: -200 }],
        zIndex: 0,
        pointerEvents: 'none',
        
    },

});