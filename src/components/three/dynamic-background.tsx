"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Mesh } from "three";

// 🔹 Floating shape with morphing & glow
function FloatingShape({
  position,
  size,
  color1,
  color2,
}: {
  position: [number, number, number];
  size: number;
  color1: string;
  color2: string;
}) {
  const meshRef = useRef<Mesh>(null!);

  const segments = 64;
  const geometryRef = useRef<THREE.CircleGeometry>(
    new THREE.CircleGeometry(size, segments)
  );

  const originalVertices = useRef(
    Array.from(geometryRef.current.attributes.position.array)
  );

  // Glow shader material with radial gradient
  const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        float dist = length(vUv);
        vec3 col = mix(color1, color2, dist);
        float alpha = smoothstep(0.8, 0.0, dist);
        gl_FragColor = vec4(col, alpha * 0.7);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const geom = geometryRef.current;
    const pos = geom.attributes.position.array as Float32Array;

    // Morph vertices over time
    for (let i = 0; i < pos.length; i += 3) {
      const origX = originalVertices.current[i];
      const origY = originalVertices.current[i + 1];
      pos[i] = origX + Math.sin(t + i) * 0.15 * size;
      pos[i + 1] = origY + Math.cos(t + i * 0.5) * 0.15 * size;
    }
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();

    // Float rotation
    meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.4;

    // Pulsing glow
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.2;
  });

  return <mesh ref={meshRef} geometry={geometryRef.current} material={shaderMat} />;
}

// 🔹 Full Background with glowing shapes
export function DynamicBackground() {
  const shapes = [
    {
      position: [0, 0, 0],
      color1: "#a78bfa",
      color2: "#6ee7b7",
      className: "top-0 left-0",
    },
    {
      position: [0, 0, 0],
      color1: "#f472b6",
      color2: "#60a5fa",
      className: "bottom-0 right-0",
    },
  ];

  return (
    <>
      {shapes.map((shape, idx) => (
        <div
          key={idx}
          className={`fixed ${shape.className} w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] pointer-events-none opacity-100 blur-3xl`}
        >
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={1.0} />
            <pointLight position={[1, 1, 3]} intensity={1.5} />
            <FloatingShape
              position={shape.position as [number, number, number]}
              size={2}
              color1={shape.color1}
              color2={shape.color2}
            />
          </Canvas>
        </div>
      ))}
    </>
  );
}
