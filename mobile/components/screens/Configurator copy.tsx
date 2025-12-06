import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as THREE from "three";

// 3D
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';

// Sensor 
import { Accelerometer } from 'expo-sensors';
import type { EventSubscription } from 'expo-modules-core';

// --- TYPES ---
type Props = {
    userName: string;
};

// --- GYROSCOPE CONTROLLER ---
export function GyroModelController({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
    const [{ x, y }, setData] = useState({ x: 0, y: 0 });
    const initialRef = useRef<{ x: number; y: number } | null>(null);
    const [subscription, setSubscription] = useState<EventSubscription | null>(null);

    useEffect(() => {
        setSubscription(
            Accelerometer.addListener(accel => {
                setData(accel);
                if (!initialRef.current) {
                    initialRef.current = { x: accel.x, y: accel.y };
                }
            })
        );
        Accelerometer.setUpdateInterval(50);
        return () => subscription?.remove();
    }, []);

    useFrame(() => {
        if (!groupRef.current || !initialRef.current) return;
        const relativeX = x - initialRef.current.x;
        const relativeY = y - initialRef.current.y;
        const targetRotationX = relativeY * - Math.PI; 
        const targetRotationY = relativeX * Math.PI; 

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, - targetRotationX, 0.01);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, - targetRotationY, 0.01);
    });
    return null;
}


const { width, height } = Dimensions.get("window");

const cameraPositions = [
    new THREE.Vector3(-6, 5, 19),
    new THREE.Vector3(3, 2, 20),
    new THREE.Vector3(-3, 1, 15),
    new THREE.Vector3(-3, 1, 13.5),
    new THREE.Vector3(-14, -8, 15),
    new THREE.Vector3(-2, -7, 16),
    new THREE.Vector3(8, 4, 17),
    new THREE.Vector3(-10, -15, 28),
    new THREE.Vector3(22, 0, 30),
];

const cameraRotation = [
    new THREE.Vector3(0, 0, -1.55),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1.55),
    new THREE.Vector3(0, 0, 0),
];

const cameraLookAt = [
    new THREE.Vector3(-2, 10, 0),
    new THREE.Vector3(8.5, 6.5, 0),
    new THREE.Vector3(0, 5.5, 0),
    new THREE.Vector3(-6, 5, 0),
    new THREE.Vector3(-5, -1, 0),
    new THREE.Vector3(0, -4, 0),
    new THREE.Vector3(7, -6, 0),
    new THREE.Vector3(1, -10, 0),
    new THREE.Vector3(-1, 0, 0),
];

// --- CAMERA ---
function CameraController({ index }: { index: number }) {
    const { camera } = useThree();
    const currentLookAt = useRef(new THREE.Vector3());
    const currentRoll = useRef(0);

    useFrame(() => {

        currentLookAt.current.lerp(cameraLookAt[index], 0.1);
        camera.position.lerp(cameraPositions[index], 0.1);
        camera.lookAt(currentLookAt.current);

        // 3. Rotation Z (Roll)
        const targetRoll = cameraRotation[index].z;
        currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, 0.1);
        camera.rotateZ(currentRoll.current);
    })
    return null
}

// --- FPS COUNTER ---
function FPSCounter({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
    const frameCount = useRef(0);
    const lastTime = useRef(Date.now());
    useFrame(() => {
        frameCount.current++;
        const currentTime = Date.now();
        if (currentTime >= lastTime.current + 1000) {
            onFpsUpdate(frameCount.current);
            frameCount.current = 0;
            lastTime.current = currentTime;
        }
    });
    return null;
}

// --- MODEL COMPONENT (OPTIMIZED) ---

type ModelProps = {
    goToStep: (stepIndex: number) => void;
    plane: number;
    onPlaneChange: (value: number) => void;
    transport: any;
    onTransportChange: (value: any) => void;
    promptIA: any;
    onPromptIAChange: () => void;
    meat: boolean;
    onMeatChange: () => void;
    products: number;
    onProductsChange: (value: number) => void;
    phone: any;
    onPhoneChange: (value: any) => void;
    energy: any;
    onEnergyChange: () => void;
    clothes: number;
    onClothesChange: (value: number) => void;
    isModelTurned: boolean;
};

function ModelComponent({ 
    plane, onPlaneChange, 
    onTransportChange, 
    promptIA, onPromptIAChange, 
    meat, onMeatChange, 
    products, onProductsChange, 
    phone, onPhoneChange, 
    energy, onEnergyChange, 
    clothes, onClothesChange, 
    isModelTurned 
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/configurator-color.glb"));
    if (!asset.localUri) asset.downloadAsync();

    const gltf = useGLTF(asset.localUri || asset.uri) as any;

    // State pour le drag
    const dragging1 = useRef(false);
    const dragging5 = useRef(false);
    const dragging8 = useRef(false);

    // Refs Objets & Plans
    const cursorRef = useRef<THREE.Object3D | null>(null);
    const planeRef = useRef<THREE.Plane | null>(null);
    const cursor5Ref = useRef<THREE.Object3D | null>(null);
    const plane5Ref = useRef<THREE.Plane | null>(null);
    const cursor8Ref = useRef<THREE.Object3D | null>(null);
    const plane8Ref = useRef<THREE.Plane | null>(null);

    // Refs Mathématiques (Optimisation GC)
    const intersectionPoint = useRef(new THREE.Vector3());
    const localPoint = useRef(new THREE.Vector3());
    const dragOffset = useRef(new THREE.Vector3());
    const groupRef = useRef<THREE.Group>(null);

    // Refs Throttling
    const lastCallTime = useRef(0);
    const lastValue1 = useRef(plane);
    const lastValue5 = useRef(products);
    const lastValue8 = useRef(clothes);

    // Sync des valeurs externes avec les refs internes pour éviter des closures périmées
    useEffect(() => { lastValue1.current = plane; }, [plane]);
    useEffect(() => { lastValue5.current = products; }, [products]);
    useEffect(() => { lastValue8.current = clothes; }, [clothes]);

    // Refs Boutons
    const pressed2Button = useRef<string | null>(null);
    const button2Refs = useRef<{ [key: string]: THREE.Object3D | null }>({ "2a": null, "2b": null, "2c": null });
    const pressed3Button = useRef<string | null>(null);
    const button3Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});
    const pressed4Button = useRef<string | null>(null);
    const button4Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});
    const pressed6Button = useRef<string | null>(null);
    const button6Refs = useRef<{ [key: string]: THREE.Object3D | null }>({ "6a": null, "6b": null });
    const pressed7Button = useRef<string | null>(null);
    const button7Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});

    // --- INITIALISATION SCENE ---
    useEffect(() => {
        if (!gltf?.scene) return;
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.userData = { name: child.name };
                const worldPos = new THREE.Vector3();
                
                if (child.name === "1") {
                    cursorRef.current = child;
                    child.getWorldPosition(worldPos);
                    // Plan aligné avec l'objet
                    planeRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } else if (child.name === "5") {
                    cursor5Ref.current = child;
                    child.getWorldPosition(worldPos);
                    plane5Ref.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } else if (child.name === "8") {
                    cursor8Ref.current = child;
                    child.getWorldPosition(worldPos);
                    plane8Ref.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } 
                // Boutons
                else if (["2a", "2b", "2c"].includes(child.name)) {
                    button2Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "3") {
                    button3Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.z;
                } else if (child.name === "4") {
                    button4Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.z;
                } else if (["6a", "6b"].includes(child.name)) {
                    button6Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "7") {
                    button7Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.z;
                }
            }
        });
    }, [gltf]);

    // --- ANIMATIONS GLOBALES ---
    useFrame(() => {
        // Rotation Modèle
        if (groupRef.current) {
            const targetY = isModelTurned ? -2.5 : 0;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.03);
        }

        // Anim Bouton 2
        Object.entries(button2Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed2Button.current === name) ? ref.userData.initialZ - 0.3 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });

        // Anim Bouton 3
        Object.entries(button3Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const idx = promptIA === "low" ? 0 : promptIA === "mid" ? 1 : 2;
            const targetY = ref.userData.initialRotate - [0, 1.7, 3.4][idx];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        });
        // Anim Bouton 4
        Object.entries(button4Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = meat ? ref.userData.initialRotate - 0.5 : ref.userData.initialRotate;
            ref.rotation.z = THREE.MathUtils.lerp(ref.rotation.z, targetZ, 0.2);
        });
        // Anim Bouton 6
        Object.entries(button6Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed6Button.current === name) ? ref.userData.initialZ - 0.2 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });
        // Anim Bouton 7
        Object.entries(button7Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const idx = energy === "low" ? 0 : energy === "mid" ? 1 : 2;
            const targetY = ref.userData.initialRotate - [0, 1.7, 3.4][idx];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        });
    });

    // --- GESTION DU DRAG (POINTER DOWN) ---
    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        const clicked = e.object as THREE.Object3D & { userData?: { name?: string } };
        const name = clicked?.userData?.name;
        if (!name) return;

        // CRUCIAL: Capture le pointeur pour éviter la perte de focus si on glisse hors de l'objet
        (e.target as Element).setPointerCapture(e.pointerId);

        // Helper: Calcule l'offset initial en tenant compte de la rotation du groupe (World -> Local)
        const setupDrag = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            e.stopPropagation();
            if (e.ray.intersectPlane(plane, intersectionPoint.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersectionPoint.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    dragOffset.current.set(
                        localPoint.current.x - cursor.position.x,
                        localPoint.current.y - cursor.position.y,
                        0
                    );
                }
            }
        };

        if (name === "1" && cursorRef.current && planeRef.current) {
            dragging1.current = true;
            setupDrag(cursorRef.current, planeRef.current);
        } else if (name === "5" && cursor5Ref.current && plane5Ref.current) {
            dragging5.current = true;
            setupDrag(cursor5Ref.current, plane5Ref.current);
        } else if (name === "8" && cursor8Ref.current && plane8Ref.current) {
            dragging8.current = true;
            setupDrag(cursor8Ref.current, plane8Ref.current);
        } 
        // Gestion des clicks boutons
        else if (["2a", "2b", "2c"].includes(name)) {
            pressed2Button.current = name;
            const mapping: any = { "2a": "voiture", "2b": "bus", "2c": "train" };
            onTransportChange(mapping[name]);
        } else if (name === "3") {
            pressed3Button.current = name;
            onPromptIAChange();
        } else if (name === "4") {
            pressed4Button.current = name;
            onMeatChange();
        } else if (["6a", "6b"].includes(name)) {
            pressed6Button.current = name;
            const mapping: any = { "6a": "IPhone 17", "6b": "Nokia 3310" };
            onPhoneChange(mapping[name]);
        } else if (name === "7") {
            pressed7Button.current = name;
            onEnergyChange();
        }
    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange]);


    // --- GESTION DU MOUVEMENT (USEFRAME) ---
    // Remplace onPointerMove pour éviter le Raycasting coûteux sur la géométrie
    useFrame((state) => {
        if (!dragging1.current && !dragging5.current && !dragging8.current) return;

        const now = Date.now();
        const THROTTLE_DELAY = 50; 

        // Update Raycaster avec la position actuelle du doigt
        state.raycaster.setFromCamera(state.pointer, state.camera);

        // Helper: Obtient la position locale corrigée
        const getLocalPosition = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            // On intersecte seulement le plan mathématique (très rapide)
            if (state.raycaster.ray.intersectPlane(plane, intersectionPoint.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersectionPoint.current);
                    // Conversion World -> Local pour contrer la rotation Gyro
                    cursor.parent.worldToLocal(localPoint.current);
                    return localPoint.current;
                }
            }
            return null;
        };

        // 1
        if (dragging1.current && cursorRef.current && planeRef.current) {
            const pos = getLocalPosition(cursorRef.current, planeRef.current);
            if (pos) {
                const min = -4, max = 1;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));
                
                cursorRef.current.position.x = newX;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, min, max, 0, 10);
                    onPlaneChange(val);
                    lastValue1.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        // 5
        if (dragging5.current && cursor5Ref.current && plane5Ref.current) {
            const pos = getLocalPosition(cursor5Ref.current, plane5Ref.current);
            if (pos) {
                const min = -3.5, max = 0.7;
                let newY = Math.max(min, Math.min(max, pos.y - dragOffset.current.y));

                cursor5Ref.current.position.y = newY;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newY, min, max, 0, 5);
                    onProductsChange(val);
                    lastValue5.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        // 8
        if (dragging8.current && cursor8Ref.current && plane8Ref.current) {
            const pos = getLocalPosition(cursor8Ref.current, plane8Ref.current);
            if (pos) {
                const min = -4.2, max = 4.5;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));

                cursor8Ref.current.position.x = newX;
 
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, min, max, 0, 4);
                    onClothesChange(val);
                    lastValue8.current = val;
                    lastCallTime.current = now;
                }
            }
        }
    });

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        
        if (dragging1.current) {
            dragging1.current = false;
            onPlaneChange(lastValue1.current); // Sync finale
        }
        if (dragging5.current) {
            dragging5.current = false;
            onProductsChange(lastValue5.current);
        }
        if (dragging8.current) {
            dragging8.current = false;
            onClothesChange(lastValue8.current);
        }
    };

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            // PAS DE onPointerMove ici, tout est dans useFrame
        >
            <primitive object={gltf.scene} scale={2} />
        </group>
    );
}

// MEMOIZATION DU MODELE
const Model = React.memo(ModelComponent);

// --- APPLICATION PRINCIPALE ---

export default function App({ userName }: Props) {
    const [isConnected, setIsConnected] = useState(false);
    const [serverMessage, setServerMessage] = useState("");
    const [plane, setPlane] = useState(10);
    const [transport, setTransport] = useState<"voiture" | "velo" | "train" | null>(null);
    const [promptIA, setPromptIA] = useState<"low" | "mid" | "high" | null>(null);
    const [energy, setEnergy] = useState<"low" | "mid" | "high" | null>(null);
    const [meat, setMeat] = useState(false);
    const [products, setProducts] = useState(5);
    const [phone, setPhone] = useState<"IPhone 17" | "Nokia 3310"| null>(null);
    const [clothes, setClothes] = useState(5);

    const [fps, setFps] = useState(0);
    const [isModelTurned, setIsModelTurned] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Avion", "Transport", "Prompt IA", "Viande", "Produits", "Téléphone", "Energie", "Vêtements"];
    const [camIndex, setCamIndex] = useState(0);

    const [ws, setWs] = useState<WebSocket | null>(null);

    // WebSocket Setup
    useEffect(() => {
        // const socket = new WebSocket("ws://172.20.10.4:3001");
        setWs(socket);
        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            socket.send(JSON.stringify({ type: "control", plane, transport, promptIA, meat, products, phone, energy, clothes }));
        };
        socket.onmessage = (e) => setServerMessage(e.data);
        socket.onerror = () => setIsConnected(false);
        socket.onclose = () => setIsConnected(false);
        return () => socket.close();
    }, []);

    const lastSendTime = useRef(0);
    const SEND_THROTTLE = 50;

    // Fonction d'envoi stable
    const sendUpdate = useCallback((_plane: number, _transport: any, _promptIA: any, _meat: boolean, _products: number, _phone: any, _energy: any, _clothes: number) => {
        const now = Date.now();
        if (now - lastSendTime.current < SEND_THROTTLE) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "control",
            plane: Math.round(_plane),
            transport: _transport,
            promptIA: _promptIA,
            meat: _meat,
            products: Math.round(_products),
            phone: _phone,
            energy: _energy,
            clothes: Math.round(_clothes), 
        }));
        lastSendTime.current = now;
    }, [ws]);

    // Handlers (Wrapped in useCallback)
    const handlePlaneChange = useCallback((v: number) => {
        setPlane(v); sendUpdate(v, transport, promptIA, meat, products, phone, energy, clothes);
    }, [transport, promptIA, meat, products, phone, energy, clothes, sendUpdate]);

    const handleTransportChange = useCallback((v: any) => {
        setTransport(v); sendUpdate(plane, v, promptIA, meat, products, phone, energy, clothes);
    }, [plane, promptIA, meat, products, phone, energy, clothes, sendUpdate]);

    const togglePromptIA = useCallback(() => {
        setPromptIA(prev => {
            const next = prev === "high" ? "low" : prev === "low" ? "mid" : "high";
            sendUpdate(plane, transport, next, meat, products, phone, energy, clothes);
            return next;
        });
    }, [plane, transport, meat, products, phone, energy, clothes, sendUpdate]);

    const toggleMeat = useCallback(() => {
        setMeat(prev => {
            const next = !prev;
            sendUpdate(plane, transport, promptIA, next, products, phone, energy, clothes);
            return next;
        });
    }, [plane, transport, promptIA, products, phone, energy, clothes, sendUpdate]);

    const handleProductsChange = useCallback((v: number) => {
        setProducts(v); sendUpdate(plane, transport, promptIA, meat, v, phone, energy, clothes);
    }, [plane, transport, promptIA, meat, phone, energy, clothes, sendUpdate]);

    const handlePhoneChange = useCallback((v: any) => {
        setPhone(v); sendUpdate(plane, transport, promptIA, meat, products, v, energy, clothes);
    }, [plane, transport, promptIA, meat, products, energy, clothes, sendUpdate]);

    const toggleEnergy = useCallback(() => {
        setEnergy(prev => {
            const next = prev === "high" ? "low" : prev === "low" ? "mid" : "high";
            sendUpdate(plane, transport, promptIA, meat, products, phone, next, clothes);
            return next;
        });
    }, [plane, transport, promptIA, meat, products, phone, clothes, sendUpdate]);

    const handleClothesChange = useCallback((v: number) => {
        setClothes(v); sendUpdate(plane, transport, promptIA, meat, products, phone, energy, v);
    }, [plane, transport, promptIA, meat, products, phone, energy, sendUpdate]);

    // Nav
    const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    const goToStep = useCallback((i: number) => setCurrentStep(i), []);
    
    const nextCam = () => setCamIndex(i => (i + 1) % cameraPositions.length);
    const prevCam = () => setCamIndex(i => (i - 1 + cameraPositions.length) % cameraPositions.length);

    // Helpers Rendu UI
    const getQuestionText = () => {
        switch (currentStep) {
            case 0: return `À quelle Fréquence ${userName} prend l'avion ? ${Math.round(plane)}`;
            case 1: return `Comment ${userName} se déplace au quotidien ?`;
            case 2: return `À quelle Fréquence ${userName} utilisate l'Inteligence Artificielle ? ${promptIA}`;
            case 3: return `${userName} mange beaucoup de viande ?`;
            case 4: return `${userName} mange local ? Ou ses produits ont fait 3x le tour du globe avant d'arriver dans son assiette ?`;
            case 5: return `${userName} s'équipe d'un IPhone 17, ou se contente d'un Nokia 3310 ?`;
            case 6: return `Consommation énergie`;
            case 7: return `À quelle Fréquence ${userName} achete des vêtements ? ${Math.round(clothes)}`;
            default: return "Configuration terminée";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.fpsContainer}>
                <Text style={styles.fpsText}>FPS: {fps}</Text>
            </View>

            

            {!isModelTurned && (
                <View style={styles.sliderContainer}>
                    {/* <Text style={styles.question}>Question {currentStep + 1}</Text> */}
                    <Text style={styles.label}>{getQuestionText()}</Text>
                </View>
            )}

            <Image
                source={require("../../assets/img/hero.png")}
                style={styles.image}
            />

            <View style={styles.canvas}>
                <Canvas camera={{ position: [0, 0, 15] }} onCreated={(state) => state.gl.setClearColor("#fff")}>
                    <FPSCounter onFpsUpdate={setFps} />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[0, 20, 30]} intensity={2} />
                    
                    <Suspense fallback={null}>
                        <Model 
                            goToStep={goToStep} 
                            plane={plane} onPlaneChange={handlePlaneChange} 
                            transport={transport} onTransportChange={handleTransportChange}
                            meat={meat} onMeatChange={toggleMeat}
                            promptIA={promptIA} onPromptIAChange={togglePromptIA}
                            products={products} onProductsChange={handleProductsChange} 
                            phone={phone} onPhoneChange={handlePhoneChange}
                            energy={energy} onEnergyChange={toggleEnergy}
                            clothes={clothes} onClothesChange={handleClothesChange} 
                            isModelTurned={isModelTurned} 
                        />
                    </Suspense>
                    <CameraController index={camIndex} />
                </Canvas>
            </View> 

            {!isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep > 0 && (
                        <TouchableOpacity onPress={() => { prevCam(); prevStep(); setIsModelTurned(false) }} style={styles.button}>
                            <Text style={styles.buttonText}>←</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep < steps.length - 1 && (
                        <TouchableOpacity onPress={() => { nextCam(); nextStep(); }} style={styles.button}>
                            <Text style={styles.buttonText}>→</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={() => { nextCam(); nextStep(); setIsModelTurned(true) }} style={styles.button}>
                            <Text style={styles.buttonText}>Terminer</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    canvas: {
        position: "absolute",
        width: width,
        height: height,
        top: 0,
        left: 0,
        zIndex: 0
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    fpsContainer: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 5,
        borderRadius: 5
    },
    fpsText: {
        color: "#fff",
        fontWeight: "bold"
    },
    sliderContainer: {
        width: "100%",
        marginVertical: 30,
        position: "absolute",
        top: 30,
        backgroundColor: "#FAFAF9",
        borderRadius: 24,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40, 

        zIndex: 1,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 4
    },
    image: {
        width: 250,
        height: 250,
        transform: [{ scale: -1 }],
        position: "absolute",
        top: -90,
        zIndex: 2,
        resizeMode: "contain",
        marginBottom: 10,
    }, 
    question: {
        color: "#000000",
        opacity: 0.5,
        fontSize: 10,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center"
    },
    label: {
        color: "#000000",
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700"
    },
    buttons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        position: "absolute",
        bottom: 50,
        zIndex: 2
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 24,
        paddingHorizontal: 27,
        borderRadius: 100,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3.84
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
});




