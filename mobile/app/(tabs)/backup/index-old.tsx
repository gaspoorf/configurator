import React, { useEffect, useState, Suspense, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import Slider from "@react-native-community/slider";
import * as THREE from "three";
//3d
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';
import { Mesh } from "three";
import { ThreeEvent } from "@react-three/fiber";

//taille du bigo
const { width, height } = Dimensions.get("window");

type Props = {
  url: string;
};




function Model({ goToStep }: { goToStep: (stepIndex: number) => void }) {
    const asset = Asset.fromModule(require("../../../assets/3d/keypad.glb"));
    if (!asset.localUri) asset.downloadAsync();

    const gltf = useGLTF(asset.localUri || asset.uri) as any;
    const groupRef = useRef<THREE.Group>(null);

    const dragging = useRef(false);
    const cursorRef = useRef<THREE.Object3D | null>(null);
    const planeRef = useRef<THREE.Plane | null>(null);
    const intersectionPoint = useRef(new THREE.Vector3());
    const dragOffset = useRef(new THREE.Vector3());

    useEffect(() => {
        if (!gltf?.scene) return;
    
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.userData = { name: child.name };
                if (child.name === "3") {
                cursorRef.current = child;
            
                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);
                
                planeRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                console.log("Curseur trouvé:", child.name, "position locale:", child.position, "position mondiale:", worldPos);
            }
        }
        });
    }, [gltf]);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        const clicked = e.object as THREE.Object3D & { userData?: { name?: string } };
        const name = clicked?.userData?.name;
        if (!name) return;

        if (name === "3") {
            e.stopPropagation();
            dragging.current = true;
            
            if (cursorRef.current && planeRef.current) {
                if (e.ray.intersectPlane(planeRef.current, intersectionPoint.current)) {
                const scaleFactor = 7;
                const worldPos = new THREE.Vector3();
                cursorRef.current.getWorldPosition(worldPos);
                
                dragOffset.current.set(
                    intersectionPoint.current.x / scaleFactor - cursorRef.current.position.x,
                    intersectionPoint.current.y / scaleFactor - cursorRef.current.position.y,
                    0
                );
                }
            }
      
            console.log("Bouton 3 touché !");
        } 
        else if (name === "0") goToStep(0);
        else if (name === "1") goToStep(1);
        else if (name === "2") goToStep(2);
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!dragging.current || !cursorRef.current || !planeRef.current) return;
    
        e.stopPropagation();
        if (e.ray.intersectPlane(planeRef.current, intersectionPoint.current)) {
            // divise par la scale 
            const scaleFactor = 7;
            
            const newX = THREE.MathUtils.clamp(
                intersectionPoint.current.x / scaleFactor - dragOffset.current.x,
                -1, // limit min
                1  // max
            );
            
            cursorRef.current.position.x = newX;

            console.log("Cursor X:", newX.toFixed(2));
        }
    };

    const handlePointerUp = () => {
        if (dragging.current) {
            dragging.current = false;
            console.log("Bouton 3 relâché !");
        }
    };


    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
        <primitive
            object={gltf.scene}
            scale={7}
        />
        </group>
    );
}



export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [serverMessage, setServerMessage] = useState("");
    const [plane, setPlane] = useState(10);
    const [transport, setTransport] = useState<"voiture" | "velo" | "train" | "avion" | null>(null);
    const [promptIA, setPromptIA] = useState(100);
    const [meat, setMeat] = useState(10);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [currentView, setCurrentView] = useState<"home" | "stepper">("home");
    const steps = ["Avion", "Transport", "Prompt IA", "Viande"];

    const [ws, setWs] = useState<WebSocket | null>(null);


    useEffect(() => {
        // const socket = new WebSocket("ws://172.20.10.4:3001");
        const socket = new WebSocket("ws://172.18.144.1:3001");
        
        setWs(socket);

        socket.onopen = () => {
            console.log("WebSocket connection opened");
            setIsConnected(true);
            socket.send(JSON.stringify({ type: "control", plane, transport, promptIA, meat }));
        };

        socket.onmessage = (e) => {
            setServerMessage(e.data);
        };

        socket.onerror = (e) => {
            console.log("WebSocket error:", e);
            setIsConnected(false);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        };

        return () => socket.close();
    }, []);

    const sendUpdate = (plane: number, transport: string | null, promptIA: number, meat: number) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(
            JSON.stringify({
                type: "control",
                plane: Math.round(plane),
                transport: transport,
                promptIA: Math.round(promptIA),
                meat: Math.round(meat)
            })
        );
    };


    // maj des valeurs
    const handlePlaneChange = (value: number) => {
        setPlane(value);
        sendUpdate(value, transport, promptIA, meat);
    };

    const handleTransportChange = (value: "voiture" | "velo" | "train" | "avion") => {
        setTransport(value);
        sendUpdate(plane, value, promptIA, meat);
    };

    const handlePromptIAChange = (value: number) => {
        setPromptIA(value);
        sendUpdate(plane, transport, value, meat);
    };

    const handleMeatChange = (value: number) => {
        setMeat(value);
        sendUpdate(plane, transport, promptIA, value);
    };

    // swipe de nav
    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const goToStep = (stepIndex: number) => {
        setCurrentStep(stepIndex);
        setCurrentView("stepper");
    };

    const renderStep = () => {
        switch (currentStep) {
        case 0:
            return (
            <View style={styles.sliderContainer}>
                <Text style={styles.label}>A quelle fréquence la civilisation prend elle l’avion ?{Math.round(plane)}</Text>
                <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={plane}
                onValueChange={handlePlaneChange}
                />
            </View>
            );
        case 1:
            return (
            <View>
                <Text>Sélectionne un moyen de transport :</Text>
                {["voiture", "velo", "train", "avion"].map((option) => (
                <TouchableOpacity
                    key={option}
                    onPress={() => handleTransportChange(option as any)}
                >
                    <Text style={styles.textOptions}>
                        {transport === option ? "✅ " : "◻️"}
                        {option}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>
            );
        case 2:
            return (
            <View style={styles.sliderContainer}>
                <Text style={styles.label}>A quelle fréquence la civilisation utilisent-elle l'IA ? {Math.round(promptIA)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={300}
                    step={1}
                    value={promptIA}
                    onValueChange={handlePromptIAChange}
                />
            </View>
            );
        case 3:
            return (
            <View style={styles.sliderContainer}>
                <Text style={styles.label}>A quelle fréquence la civilisation mange-elle de la viande ? {Math.round(meat)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={18}
                    step={1}
                    value={meat}
                    onValueChange={handleMeatChange}
                />
            </View>
            );
        default:
            return (
                <Text style={styles.doneText}>Configuration terminée ✅</Text>
            );
        }
    };

    const renderHome = () => (
        <View >
            <Text style={styles.title}>Tableau de bord</Text>
            <Text style={styles.status}>{isConnected ? "Connecté" : "Non connecté"}</Text>

            <View style={styles.canvas}>
                <Canvas
                    onCreated={(state) => {
                        state.gl.setClearColor("#fff");
                    }}
                >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[0, 20, 30]} intensity={2} />
                    <Suspense fallback={null}>
                        <Model goToStep={goToStep}/>
                    </Suspense>
                    <OrbitControls />
                </Canvas>
            </View>

            {/* <View style={styles.dashboard}>

                <View style={styles.dashboardList}>
                    <TouchableOpacity onPress={() => goToStep(0)} style={styles.item}>
                        <Text>Avion : {plane}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => goToStep(1)} style={styles.item}>
                        <Text>Transport : {transport ?? "non défini"}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dashboardList}>
                    <TouchableOpacity onPress={() => goToStep(2)} style={styles.item}>
                        <Text>IA : {promptIA}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => goToStep(3)} style={styles.item}>
                        <Text>Viande : {meat}</Text>
                    </TouchableOpacity>
                </View>
            </View> */}
        </View>
    );

    // --- Vue Stepper ---
    const renderStepper = () => (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                {steps.map((_, i) => (
                <View key={i} style={[styles.progressStep, i <= currentStep && styles.progressActive]} />
                ))}
            </View>

            {renderStep()}

            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => setCurrentView("home")} style={styles.button}>
                    <Text>Home</Text>
                </TouchableOpacity>

                {currentStep > 0 && (
                    <TouchableOpacity onPress={prevStep} style={styles.button}>
                        <Text>← Précédent</Text>
                    </TouchableOpacity>
                )}

                {currentStep < steps.length - 1 && (
                    <TouchableOpacity onPress={nextStep} style={styles.button}>
                        <Text>Suivant →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );


    return currentView === "home" ? renderHome() : renderStepper();
}

const styles = StyleSheet.create({
    canvas: {
        position: "absolute",
        width: width,
        height: height,
        top: 0,
        left: 0,
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    progressStep: {
        width: 40,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#333",
        marginHorizontal: 5,
    },
    progressActive: {
        backgroundColor: "#00ff99",
    },
    status: {
        color: "#000000",
        fontSize: 16,
        marginBottom: 10,
    },
    server: {
        color: "#0f0",
        fontSize: 14,
    },
    noMessage: {
        color: "#888",
        fontSize: 14,
    },
    sliderContainer: {
        width: "100%",
        alignItems: "center",
        marginVertical: 30,
    },
    label: {
        color: "#000000",
        fontSize: 18,
        marginBottom: 10,
    },
    slider: {
        width: 300,
        height: 40,
    },
    buttons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
    },
    button: {
        backgroundColor: "#00ff99",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: "#000",
        fontWeight: "bold",
    },
    doneText: {
        color: "#00ff99",
        fontSize: 20,
        marginVertical: 20,
    },
    textOptions: {
        color: "#000000",
        fontSize: 20,
        marginVertical: 15,
    },
    title: {
        fontSize: 20,
        color: "#000000",
        marginBottom: 20,
    },

    dashboard: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
    },

    dashboardList: {
        display: "flex",
        flexDirection: "row",
        gap: 5,
    }, 

    item: {
        aspectRatio: 1,
        width: 100,
        height: 100,
        borderColor: "#222",
        borderWidth: 1,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }
});