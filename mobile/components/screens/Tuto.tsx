import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

type Props = {
    onComplete: (userName: string) => void;
};

const TUTO_STEPS = [
    { title: "Joue avec les boutons pour faconner ton monde", description: "" },
    { title: "Modifie tes choix quand tu veux (le destin, ca se réécrit)", description: "Tu t’es trompé ? Tu as changé d’avis ? Pas grave. Tu peux revenir sur n’importe quelle réponse." },
    { title: "", description: "Climat, faune, flaure… tout se construit en direct. Prépare-toi à voir ton univers se révéler."},
];

const TUTO_IMG = [
    require("../../assets/img/tuto1.png"),
    require("../../assets/img/tuto2.png"),
    require("../../assets/img/tuto3.png"),
];

export default function Tuto({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState("");


    const handleNext = () => {
        if (step < TUTO_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(userName);
        }
    };

    const handlePrev = () => {
        if (step <= TUTO_STEPS.length - 1) {
            setStep(step - 1);
        } else {
            onComplete(userName);
        }
    };

    const currentContent = {
        ...TUTO_STEPS[step],
        title:
            step === 2
                ? `Regarde l’univers de ${userName} se créer sous tes yeux !`
                : TUTO_STEPS[step].title,
        description:
            step === 0
                ? `Chaque question change un petit bout de l’univers de ${userName}. Pas de pression : teste, bidouille, amuse-toi.`
                : TUTO_STEPS[step].description,
        
    };

    return (
        <View style={styles.container}>


            {step === 0 && (
                <Image
                    source={require("../../assets/img/stickers/earth-sticker.png")}
                    style={styles.stickers1}
                />
            )}

            {step === 1 && ( 
                <Image
                    source={require("../../assets/img/stickers/btn-sticker.png")}
                    style={styles.stickers2}
                />
            )}

            {step === 2 && (
                <Image
                    source={require("../../assets/img/stickers/emoji-sticker.png")}
                    style={styles.stickers3}
                />
            )}

            
            <Image
                source={TUTO_IMG[step]}
                style={styles.image}
            />

            <View style={styles.content}>
                <Text style={styles.title}>{currentContent.title}</Text>
                <Text style={styles.description}>{currentContent.description}</Text>
            </View>


          
            <View style={styles.buttons}>

                {step === 0 && (
                    <TouchableOpacity
                        style={[styles.button, styles.button]}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>→</Text>
                    </TouchableOpacity>
                )}

                {step > 0 && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.button]}
                            onPress={handlePrev}
                        >
                            <Text style={styles.buttonText}>←</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.button]}
                            onPress={handleNext}
                        >
                            <Text style={styles.buttonText}>→</Text>
                        </TouchableOpacity>
                    </>
                )}

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#efede9',
        height: '100%',
        padding: 17,
    },
    content: {
        alignItems: 'center',
        marginTop: 40,
    },
    stepIndicator: {
        fontSize: 14,
        color: '#a01515',
        marginBottom: 20,
        letterSpacing: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    description: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 700,
        color: '#000000',
        paddingHorizontal: 36,
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        position: "absolute",
        bottom: 52,
        zIndex: 2,
        width: '110%',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#ffffff', 
        paddingVertical: 24, 
        paddingHorizontal: 27, 
        aspectRatio: 1, 
        borderRadius: 100, 
        bottom: 0,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
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
        width: '100%',
        resizeMode: 'contain',
        position: 'relative',
        pointerEvents: 'none',
        
    },

    stickers1: {
        position: 'absolute',
        top: -40,
        left: -30,
        zIndex: 2,
    }, 

    stickers2: {
        position: 'absolute',
        bottom: '37%',
        right: -30,
        zIndex: 2,
    },

    stickers3: {
        position: 'absolute',
        top: '3%',
        left: -30,
        zIndex: 2,
    }

});