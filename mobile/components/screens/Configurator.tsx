import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as THREE from "three";
import { io, Socket } from "socket.io-client";
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';


type Props = {
    userName: string;
    roomId: string;
};

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

// CAMERA
function CameraController({ index }: { index: number }) {
    const { camera } = useThree();
    const currentLookAt = useRef(new THREE.Vector3());
    const currentRoll = useRef(0);

    useFrame(() => {
        currentLookAt.current.lerp(cameraLookAt[index], 0.1);
        camera.position.lerp(cameraPositions[index], 0.1);
        camera.lookAt(currentLookAt.current);

        const targetRoll = cameraRotation[index].z;
        currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, 0.1);
        camera.rotateZ(currentRoll.current);
    })
    return null
}

// FPS 
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


type ModelProps = {
    goToStep: (stepIndex: number) => void;
    plane: number;
    onPlaneChange: (value: number) => void;
    transport: any;
    onTransportChange: (value: any) => void;
    promptIA: number;
    onPromptIAChange: () => void;
    meat: boolean;
    onMeatChange: () => void;
    products: number;
    onProductsChange: (value: number) => void;
    phone: any;
    onPhoneChange: (value: any) => void;
    energy: number;
    onEnergyChange: () => void;
    clothes: number;
    onClothesChange: (value: number) => void;
    isModelTurned: boolean;
    onReveal: (overrides?: any) => void; // REVEAL
    onCameraMovement: (type: string, value: number) => void; //movements
    onCameraZoom: (type: string, value: number) => void; //zooom
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
    isModelTurned,
    onReveal,
    onCameraMovement,
    onCameraZoom
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/configurator-color.glb"));
    if (!asset.localUri) asset.downloadAsync();

    const gltf = useGLTF(asset.localUri || asset.uri) as any;

    const dragging1 = useRef(false);
    const dragging5 = useRef(false);
    const dragging8 = useRef(false);
    const draggingMovements = useRef(false);
    const draggingZoom = useRef(false);

    const cursorRef = useRef<THREE.Object3D | null>(null);
    const planeRef = useRef<THREE.Plane | null>(null);
    const cursor5Ref = useRef<THREE.Object3D | null>(null);
    const plane5Ref = useRef<THREE.Plane | null>(null);
    const cursor8Ref = useRef<THREE.Object3D | null>(null);
    const plane8Ref = useRef<THREE.Plane | null>(null);
    const cursorMovementsRef = useRef<THREE.Object3D | null>(null);
    const planeMovementsRef = useRef<THREE.Plane | null>(null);
    const cursorZoomRef = useRef<THREE.Object3D | null>(null);
    const planeZoomRef = useRef<THREE.Plane | null>(null);

    const intersectionPoint = useRef(new THREE.Vector3());
    const localPoint = useRef(new THREE.Vector3());
    const dragOffset = useRef(new THREE.Vector3());
    const groupRef = useRef<THREE.Group>(null);

    const lastCallTime = useRef(0);
    const lastValue1 = useRef(plane);
    const lastValue5 = useRef(products);
    const lastValue8 = useRef(clothes);


    useEffect(() => { lastValue1.current = plane; }, [plane]);
    useEffect(() => { lastValue5.current = products; }, [products]);
    useEffect(() => { lastValue8.current = clothes; }, [clothes]);

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

    useEffect(() => {
        if (!gltf?.scene) return;
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.userData = { name: child.name };
                const worldPos = new THREE.Vector3();
                
                if (child.name === "1") {
                    cursorRef.current = child;
                    child.getWorldPosition(worldPos);
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
                else if (["2a", "2b", "2c"].includes(child.name)) {
                    button2Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "3") {
                    button3Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.y;
                } else if (child.name === "4") {
                    button4Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.z;
                } else if (["6a", "6b"].includes(child.name)) {
                    button6Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "7") {
                    button7Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.y;
                }




                /// mouvements de camera
                else if (child.name === "movements") {
                    console.log("found movements");
                    cursorMovementsRef.current = child;
                    child.getWorldPosition(worldPos);
                    planeMovementsRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                
                    child.userData.initialX = child.position.x;
                    child.userData.initialY = child.position.y;
                }

                /// mouvements de camera
                else if (child.name === "zoom") {
                    console.log("found movements");
                    cursorZoomRef.current = child;
                    child.getWorldPosition(worldPos);
                    planeZoomRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                }
            }
        });
    }, [gltf]);

    useFrame(() => {
        if (groupRef.current) {
            const targetY = isModelTurned ? -2.5 : 0;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.03);
        }

        Object.entries(button2Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed2Button.current === name) ? ref.userData.initialZ - 0.3 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });

        Object.entries(button3Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const index = promptIA === 0 ? 0 : promptIA === 33 ? 1 : promptIA === 66 ? 2 : 3;
            const targetY = ref.userData.initialRotate - [0, 1.7, 3.4, 5][index];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        });

        Object.entries(button4Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = meat ? ref.userData.initialRotate - 0.5 : ref.userData.initialRotate;
            ref.rotation.z = THREE.MathUtils.lerp(ref.rotation.z, targetZ, 0.2);
        });

        Object.entries(button6Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed6Button.current === name) ? ref.userData.initialZ - 0.2 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });

        Object.entries(button7Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const index = energy === 0 ? 0 : energy === 33 ? 1 : energy === 66 ? 2 : 3;
            const targetY = ref.userData.initialRotate - [0, 1.7, 3.4, 5][index];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        });


        //retour joystick
        if (!draggingMovements.current && cursorMovementsRef.current) {
            const cursor = cursorMovementsRef.current;
            const targetX = cursor.userData.initialX ?? 0;
            const targetY = cursor.userData.initialY ?? 0;
            
            cursor.position.x = THREE.MathUtils.lerp(cursor.position.x, targetX, 0.15);
            cursor.position.y = THREE.MathUtils.lerp(cursor.position.y, targetY, 0.15);
        }
    });

    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        const clicked = e.object as THREE.Object3D & { userData?: { name?: string } };
        const name = clicked?.userData?.name;
        if (!name) return;

        (e.target as Element).setPointerCapture(e.pointerId);

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
        else if (["2a", "2b", "2c"].includes(name)) {
            pressed2Button.current = name;
            const mapping: any = { "2a": "100", "2b": "50", "2c": "0" }; //voiture, bus, pied
            const newTransport = mapping[name];
            onTransportChange({ transport: newTransport });
            onReveal(); // Envoyer REVEAL
            console.log(newTransport)
        } else if (name === "3") {
            pressed3Button.current = name;
            const newPromptIA = promptIA === 0 ? 33 : promptIA === 33 ? 66 : promptIA === 66 ? 100 : 0;
            onPromptIAChange();
            onReveal({ promptIA: newPromptIA }); 
            console.log(newPromptIA)
        } else if (name === "4") {
            pressed4Button.current = name;
            const newMeat = !meat;
            onMeatChange();
            onReveal({ meat: newMeat });
            console.log(newMeat)
        } else if (["6a", "6b"].includes(name)) {
            pressed6Button.current = name;
            const mapping: any = { "6a": 100, "6b": 0 }; // Iphone 17 ou Nokia
            const newPhone = mapping[name];
            onPhoneChange(newPhone);
            onReveal({ phone: newPhone });
            console.log(newPhone)
        } else if (name === "7") {
            pressed7Button.current = name;
            const newEnergy = energy === 0 ? 33 : energy === 33 ? 66 : energy === 66 ? 100 : 0;
            onEnergyChange();
            onReveal({ energy: newEnergy });
            console.log(newEnergy)
        }


        // movements camera
        else if (name === "movements" && cursorMovementsRef.current && planeMovementsRef.current) {
            draggingMovements.current = true;
            setupDrag(cursorMovementsRef.current, planeMovementsRef.current);
        }

        // movements camera
        else if (name === "zoom" && cursorZoomRef.current && planeZoomRef.current) {
            draggingZoom.current = true;
            setupDrag(cursorZoomRef.current, planeZoomRef.current);
        }

    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange, onReveal, onCameraMovement, onCameraZoom]);

    useFrame((state) => {
        if (!dragging1.current && !dragging5.current && !dragging8.current && !draggingMovements.current && !draggingZoom.current) return;

        const now = Date.now();
        const THROTTLE_DELAY = 50; 

        state.raycaster.setFromCamera(state.pointer, state.camera);

        const getLocalPosition = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            if (state.raycaster.ray.intersectPlane(plane, intersectionPoint.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersectionPoint.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    return localPoint.current;
                }
            }
            return null;
        };

        if (dragging1.current && cursorRef.current && planeRef.current) {
            const pos = getLocalPosition(cursorRef.current, planeRef.current);
            if (pos) {
                const min = -4, max = 1;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));
                
                cursorRef.current.position.x = newX;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, min, max, 0, 100);
                    onPlaneChange(val);
                    lastValue1.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        if (dragging5.current && cursor5Ref.current && plane5Ref.current) {
            const pos = getLocalPosition(cursor5Ref.current, plane5Ref.current);
            if (pos) {
                const min = -3.5, max = 0.7;
                let newY = Math.max(min, Math.min(max, pos.y - dragOffset.current.y));

                cursor5Ref.current.position.y = newY;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newY, min, max, 0, 100);
                    onProductsChange(val);
                    lastValue5.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        if (dragging8.current && cursor8Ref.current && plane8Ref.current) {
            const pos = getLocalPosition(cursor8Ref.current, plane8Ref.current);
            if (pos) {
                const min = -4.2, max = 4.5;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));

                cursor8Ref.current.position.x = newX;
 
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, min, max, 0, 100);
                    onClothesChange(val);
                    lastValue8.current = val;
                    lastCallTime.current = now;
                }
            }
        }



        if (draggingMovements.current && cursorMovementsRef.current && planeMovementsRef.current) {
            const pos = getLocalPosition(cursorMovementsRef.current, planeMovementsRef.current);
            if (pos) {
                const minX = -2, maxX = 0;
                const minY = -3.5, maxY = -1.5;
                let newX = Math.max(minX, Math.min(maxX, pos.x - dragOffset.current.x));
                let newY = Math.max(minY, Math.min(maxY, pos.y - dragOffset.current.y));

                cursorMovementsRef.current.position.x = newX;
                cursorMovementsRef.current.position.y = newY;


                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const valX = THREE.MathUtils.mapLinear(newX, minX, maxX, 0, 10);
                    const valY = THREE.MathUtils.mapLinear(newY, minY, maxY, 0, 10);
                    
                    // LEFT/RIGHT
                    if (valX < 4.5) {
                        const leftValue = THREE.MathUtils.mapLinear(valX, 0, 4.5, 10, 0);
                        onCameraMovement("CAMERA_RIGHT", leftValue);
                        console.log("LEFT", leftValue);
                    } else if (valX > 5.5) {
                        const rightValue = THREE.MathUtils.mapLinear(valX, 5.5, 10, 0, 10);
                        onCameraMovement("CAMERA_LEFT", rightValue);
                        console.log("RIGHT", rightValue);
                    }
                
                    // FORWARD/BACK
                    if (valY < 4.5) {
                        const backValue = THREE.MathUtils.mapLinear(valY, 0, 4.5, 10, 0);
                        onCameraMovement("CAMERA_BACK", backValue);
                        console.log("BACK", backValue);
                    } else if (valY > 5.5) {
                        const forwardValue = THREE.MathUtils.mapLinear(valY, 5.5, 10, 0, 10);
                        onCameraMovement("CAMERA_FORWARD", forwardValue);
                        console.log("FORWARD", forwardValue);
                    }

                    lastCallTime.current = now;
                }


            }
        }

        if (draggingZoom.current && cursorZoomRef.current && planeZoomRef.current) {
            const pos = getLocalPosition(cursorZoomRef.current, planeZoomRef.current);
            if (pos) {
                const min = -5, max = -0.3;
                let newY = Math.max(min, Math.min(max, pos.y - dragOffset.current.y));

                cursorZoomRef.current.position.y = newY;
                
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    // 🆕 Valeur entre -10 et 10
                    const zoomValue = THREE.MathUtils.mapLinear(newY, min, max, -10, 10);
                    onCameraZoom("CAMERA_ZOOM", zoomValue);
                    console.log("ZOOM", zoomValue);
                    
                    lastCallTime.current = now;
                }
            }
        }



    });

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        
        if (dragging1.current) {
            dragging1.current = false;
            onPlaneChange(lastValue1.current);
            onReveal(); //REVEAL 
        }
        if (dragging5.current) {
            dragging5.current = false;
            onProductsChange(lastValue5.current);
            console.log(products);
            onReveal(); 
        }
        if (dragging8.current) {
            dragging8.current = false;
            onClothesChange(lastValue8.current);
            console.log(clothes);
            onReveal(); 
        }
        if (draggingMovements.current) {
            draggingMovements.current = false;
            onCameraMovement("CAMERA_LEFT", 0);
            onCameraMovement("CAMERA_RIGHT", 0);
            onCameraMovement("CAMERA_FORWARD", 0);
            onCameraMovement("CAMERA_BACK", 0);
        }
        if (draggingZoom.current) {
            draggingZoom.current = false;
        }
    };

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <primitive object={gltf.scene} scale={2} />
        </group>
    );
}

const Model = React.memo(ModelComponent);

const SOCKET_URL = "http://172.20.10.14:4000/";

export default function App({ userName, roomId }: Props) {
    const [isConnected, setIsConnected] = useState(false);
    const [plane, setPlane] = useState(10);
    const [transport, setTransport] = useState<"100" | "50" | "0" | 0>(0); // voiture:100 bus:50 pied:0
    const [promptIA, setPromptIA] = useState<0 | 33 | 66 | 100>(0);
    const [energy, setEnergy] = useState<0 | 33 | 66 | 100>(0);
    const [meat, setMeat] = useState(false);
    const [products, setProducts] = useState(5);
    const [phone, setPhone] = useState<"IPhone 17" | "Nokia 3310"| 0>(0);
    const [clothes, setClothes] = useState(5);

    const [fps, setFps] = useState(0);
    const [isModelTurned, setIsModelTurned] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Avion", "Transport", "Prompt IA", "Viande", "Produits", "Téléphone", "Energie", "Vêtements"];
    const [camIndex, setCamIndex] = useState(0);

    const socketRef = useRef<Socket | null>(null);

    console.log("Room ID:", roomId);

   
    // Socket.io 
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ Socket.io connecté");
            setIsConnected(true);
            
            socket.emit("join-room", roomId);
            console.log(`📍 Rejoint la room: ${roomId}`);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket.io déconnecté");
            setIsConnected(false);
        });

    
        socket.on("update-client", (data) => {
            console.log("📥 Mise à jour reçue:", data);
        });

        return () => {
            socket.disconnect();
        };
    }, [userName, roomId]);

    // envoyer REVEAL
    const sendReveal = useCallback((overrides = {}) => {
        if (!socketRef.current || !isConnected) return;

        const payload = {
            type: "REVEAL"
        };
        
        socketRef.current.emit("action-client", {
            roomId,
            payload
        });

        console.log("REVEAL envoyé", payload);
    }, [isConnected, roomId, plane, transport, promptIA, meat, products, phone, energy, clothes]);

    
    
    // envoyer VALIDATE_FORM
    const sendValidateForm = useCallback(() => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit("action-client", {
            roomId,
            payload: {
                type: "VALIDATE_FORM",
                data: {
                    plane: Math.round(plane),
                    transport,
                    promptIA,
                    meat,
                    products: Math.round(products),
                    phone,
                    energy,
                    clothes: Math.round(clothes),
                },
                
            }
        });

        console.log("VALIDATE_FORM envoyé");
    }, [isConnected, roomId, plane, transport, promptIA, meat, products, phone, energy, clothes]);


    // envoyer camera movements
    const sendCameraMovement = useCallback((type: string, value: number) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit("action-client", {
            roomId,
            payload: {
                type,
                data:{
                    strength: value,
                }
            }
        });

        console.log(`${type} envoyé:`, value);
    }, [isConnected, roomId]);

    // envoyer camera movements
    const sendCameraZoom = useCallback((type: string, value: number) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit("action-client", {
            roomId,
            payload: {
                type,
                data:{
                    value: value,
                }
            }
        });

        console.log(`${type} envoyé:`, value);
    }, [isConnected, roomId]);


    // Handlers
    const handlePlaneChange = useCallback((v: number) => {
        setPlane(v);
    }, []);

    const handleTransportChange = useCallback((v: any) => {
        setTransport(v);
    }, []);

    const togglePromptIA = useCallback(() => {
        setPromptIA(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, []);

    const toggleMeat = useCallback(() => {
        setMeat(prev => !prev);
    }, []);

    const handleProductsChange = useCallback((v: number) => {
        setProducts(v);
    }, []);

    const handlePhoneChange = useCallback((v: any) => {
        setPhone(v);
    }, []);

    const toggleEnergy = useCallback(() => {
        setEnergy(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, [])

    const handleClothesChange = useCallback((v: number) => {
        setClothes(v);
    }, []);

    // Nav
    const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    const goToStep = useCallback((i: number) => setCurrentStep(i), []);
    
    const nextCam = () => setCamIndex(i => (i + 1) % cameraPositions.length);
    const prevCam = () => setCamIndex(i => (i - 1 + cameraPositions.length) % cameraPositions.length);

    const getQuestionText = () => {
        switch (currentStep) {
            case 0: return `À quelle Fréquence ${userName} prend l'avion ? ${Math.round(plane)}`;
            case 1: return `Comment ${userName} se déplace au quotidien ?`;
            case 2: return `À quelle Fréquence ${userName} utilise l'Intelligence Artificielle ? ${promptIA}`;
            case 3: return `${userName} mange beaucoup de viande ?`;
            case 4: return `${userName} mange local ? Ou ses produits ont fait 3x le tour du globe avant d'arriver dans son assiette ?`;
            case 5: return `${userName} s'équipe d'un IPhone 17, ou se contente d'un Nokia 3310 ?`;
            case 6: return `À quelle température ${userName} chauffe son logement ?`;
            case 7: return `À quelle Fréquence ${userName} achète des vêtements ? ${Math.round(clothes)}`;
            default: return "Configuration terminée";
        }
    };

    const handleFinish = () => {
        nextCam();
        nextStep();
        setIsModelTurned(true);
        sendValidateForm(); // VALIDATE_FORM
    };

    return (
        <View style={styles.container}>
            <View style={styles.fpsContainer}>
                <Text style={styles.fpsText}>FPS: {fps}</Text>
                <Text style={styles.fpsText}>{isConnected ? "WS Connecté" : "WS Déconnecté"}</Text>
            </View>

            {!isModelTurned && (
                <View style={styles.sliderContainer}>
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
                            onReveal={sendReveal} // passer le callback REVEAL
                            onCameraMovement={sendCameraMovement}
                            onCameraZoom={sendCameraZoom}
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
                        <TouchableOpacity onPress={handleFinish} style={styles.button}>
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