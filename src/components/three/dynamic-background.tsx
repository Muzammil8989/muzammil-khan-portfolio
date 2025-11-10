"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Mesh } from "three";

// 🔹 Floating shape with morphing & glow
function FloatingShape({
  position,
  size,
  color1,
  color2,
  glowRadius = 1.25,     // wider = softer, larger halo
  glowIntensity = 1.4,   // higher = brighter
}: {
  position: [number, number, number];
  size: number;
  color1: string;
  color2: string;
  glowRadius?: number;
  glowIntensity?: number;
}) {
  const meshRef = useRef<Mesh>(null!);

  const segments = 64;
  const geometryRef = useRef(
    new THREE.CircleGeometry(size, segments)
  );

  const originalVertices = useRef(
    // copy vertex positions for morphing baseline
    Array.from(geometryRef.current.attributes.position.array)
  );

  // Glow shader material with radial gradient + opacity uniform
  const shaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color1: { value: new THREE.Color(color1) },
          color2: { value: new THREE.Color(color2) },
          uGlowRadius: { value: glowRadius },     // controls smoothstep falloff
          uGlowIntensity: { value: glowIntensity }, // scales alpha
          uOpacity: { value: 0.9 },               // animated in useFrame
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
          uniform float uGlowRadius;
          uniform float uGlowIntensity;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float dist = length(vUv);
            vec3 col = mix(color1, color2, dist);
            // Wider glow by pushing first arg above 1.0; smooth fade to the edge.
            float alpha = smoothstep(uGlowRadius, 0.0, dist) * uGlowIntensity * uOpacity;
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color1, color2, glowRadius, glowIntensity]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const geom = geometryRef.current;
    const pos = geom.attributes.position.array as Float32Array;

    // Morph vertices over time (gentle wobble)
    for (let i = 0; i < pos.length; i += 3) {
      const origX = originalVertices.current[i];
      const origY = originalVertices.current[i + 1];
      pos[i] = origX + Math.sin(t * 0.8 + i) * 0.15 * (size * 0.9);
      pos[i + 1] = origY + Math.cos(t * 0.5 + i * 0.5) * 0.15 * (size * 0.9);
    }
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();

    // Gentle float/rotation
    meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.45;

    // Pulse the glow
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uOpacity.value = 0.8 + Math.sin(t * 1.2) * 0.25; // 0.55–1.05
  });

  return (
    <mesh ref={meshRef} geometry={geometryRef.current} material={shaderMat} position={position} />
  );
}

// 🔹 Full Background with glowing shapes
export function DynamicBackground() {
  const shapes = [
    {
      position: [0, 0, 0] as [number, number, number],
      color1: "#a78bfa",
      color2: "#6ee7b7",
      className: "top-0 left-0",
    },
    {
      position: [0, 0, 0] as [number, number, number],
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
          className={`fixed ${shape.className} w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] pointer-events-none opacity-100 blur-[180px]`}
        >
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }} dpr={[1, 1.75]}>
            <ambientLight intensity={1.0} />
            <pointLight position={[1, 1, 3]} intensity={1.5} />
            <FloatingShape
              position={shape.position}
              size={4}               // ✅ Bigger circle
              color1={shape.color1}
              color2={shape.color2}
              glowRadius={1.25}      // ✅ Wider halo
              glowIntensity={1.6}    // ✅ Brighter glow
            />
          </Canvas>
        </div>
      ))}
    </>
  );
}
