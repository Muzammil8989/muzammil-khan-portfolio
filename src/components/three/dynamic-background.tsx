"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Mesh } from "three";

// ── Floating shape with morphing & glow ────────────────────────────────────────
function FloatingShape({
  position,
  size,
  color1,
  color2,
  glowRadius = 1.25,
  glowIntensity = 1.4,
  motionEnabled = true,
}: {
  position: [number, number, number];
  size: number;
  color1: string;
  color2: string;
  glowRadius?: number;
  glowIntensity?: number;
  motionEnabled?: boolean;
}) {
  const meshRef = useRef<Mesh>(null!);

  const segments = 64;

  // Geometry + baseline vertices (stable across renders)
  const geometry = useMemo(() => new THREE.CircleGeometry(size, segments), [size]);
  const originalVertices = useMemo(
    () => Array.from(geometry.attributes.position.array),
    [geometry]
  );

  const shaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color1: { value: new THREE.Color(color1) },
          color2: { value: new THREE.Color(color2) },
          uGlowRadius: { value: glowRadius },
          uGlowIntensity: { value: glowIntensity },
          uOpacity: { value: 0.9 },
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
    const geom = geometry;
    const pos = geom.attributes.position.array as Float32Array;

    if (motionEnabled) {
      for (let i = 0; i < pos.length; i += 3) {
        const ox = originalVertices[i];
        const oy = originalVertices[i + 1];
        pos[i] = ox + Math.sin(t * 0.8 + i) * 0.15 * (size * 0.9);
        pos[i + 1] = oy + Math.cos(t * 0.5 + i * 0.5) * 0.15 * (size * 0.9);
      }
      geom.attributes.position.needsUpdate = true;
      geom.computeVertexNormals();

      meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.45;

      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uOpacity.value = 0.8 + Math.sin(t * 1.2) * 0.25;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={shaderMat} position={position} />;
}

// ── Full responsive background with glowing shapes ─────────────────────────────
export default function DynamicBackground() {
  // Respect user's reduced motion
  const motionEnabled =
    typeof window === "undefined"
      ? true
      : !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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
          // Fixed in corners, non-interactive, responsive size + blur via CSS var + clamp
          className={`fixed ${shape.className} pointer-events-none opacity-100`}
          style={
            {
              // Scales from 240px (phones) to 640px (large) fluidly
              // tweak mid % to taste
              ["--bg-size" as any]: "clamp(240px, 35vw, 640px)",
            } as React.CSSProperties
          }
        >
          <div
            className="
              w-[var(--bg-size)] h-[var(--bg-size)]
              blur-[90px] sm:blur-[120px] md:blur-[160px] lg:blur-[200px]
            "
          >
            <Canvas
              camera={{ position: [0, 0, 3], fov: 50 }}
              dpr={[1, 2]} // cap DPR for perf
              gl={{ antialias: true }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0); // transparent background
              }}
            >
              <ambientLight intensity={1.0} />
              <pointLight position={[1, 1, 3]} intensity={1.5} />
              <FloatingShape
                position={shape.position}
                size={4}
                color1={shape.color1}
                color2={shape.color2}
                glowRadius={1.25}
                glowIntensity={1.6}
                motionEnabled={motionEnabled}
              />
            </Canvas>
          </div>
        </div>
      ))}
    </>
  );
}
