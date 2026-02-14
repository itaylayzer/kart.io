import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAssetStore } from "@/store/useAssetLoader";
import * as THREE from "three";
import { Environment, Float, ContactShadows } from "@react-three/drei";

const namesToColor = [
    "Object_43",
    "Object_41",
    "Object_87",
    "Object_85",
    "Object_68",
    "Object_70",
    "Object_83",
    "Object_62",
    "Object_66",
    "Object_72",
    "Object_64",
    "Object_79",
    "Object_89",
    "Object_81",
];

function Model({ color }: { color?: string }) {
    const { gltf } = useAssetStore();
    const meshRef = useRef<THREE.Group>(null!);

    // Retrieve the pre-loaded kart model
    const scene = gltf["car"] ? gltf["car"].scene.clone() : null;

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005; // Slower spin
            meshRef.current.position.y =
                Math.sin(state.clock.elapsedTime) * 0.05;
        }
    });

    if (!scene) return null;

    // Apply color only to specific parts if provided
    scene.traverse((child: any) => {
        if (child.isMesh) {
            if (namesToColor.includes(child.name)) {
                // Clone material to avoid affecting shared assets
                // Using MeshStandardMaterial for better lighting reaction
                if (color) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 0.5,
                        roughness: 0.4,
                        metalness: 0.6,
                    });
                }
            }
        }
    });

    scene.getObjectByName("Back_18")!.visible = false;

    return (
        <primitive
            object={scene}
            ref={meshRef}
            scale={1}
            position={[0, -0.5, 0]}
            rotation={[0.2, 0, 0]}
        />
    );
}

export default function KartViewer({ color }: { color?: string }) {
    return (
        <div className="w-full h-[300px] md:h-[400px] relative">
            <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.25}
                    penumbra={1}
                    intensity={2}
                />
                <pointLight
                    position={[-10, 0, -10]}
                    intensity={2}
                    color="#ffffff"
                />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                    <Model color={color} />
                </Float>

                <ContactShadows
                    resolution={1024}
                    scale={20}
                    blur={2}
                    opacity={0.4}
                    far={10}
                    color="#000000"
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
