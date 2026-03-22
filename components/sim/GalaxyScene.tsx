'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── GLSL Vertex Shader ──────────────────────────────────────────────────────
const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uSize;

  attribute float aScale;
  attribute vec3 aColor;
  attribute vec3 aRandomness;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Slow rotation
    float angle = uTime * 0.1;
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    modelPosition.xy *= rot;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Size scales with distance for depth
    gl_PointSize = uSize * aScale * (300.0 / -viewPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);

    vColor = aColor;
    vAlpha = aScale;
  }
`

// ─── GLSL Fragment Shader ─────────────────────────────────────────────────────
const fragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Discard square corners → circular particles
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    // Soft falloff
    float alpha = 1.0 - (dist * 2.0);
    alpha = pow(alpha, 1.5);

    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`

interface GalaxyProps {
  count?: number
  arms?: number
  radius?: number
  thickness?: number
}

function Galaxy({ count = 20000, arms = 3, radius = 8, thickness = 1.2 }: GalaxyProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { positions, colors, scales, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Spiral arm selection
      const arm = i % arms
      const armAngle = (arm / arms) * Math.PI * 2

      // Distance from center (bias toward core)
      const r = Math.pow(Math.random(), 0.5) * radius

      // Spiral angle based on distance
      const spiralAngle = armAngle + (r / radius) * Math.PI * 2.5

      // Add scatter perpendicular to arm
      const scatter = (Math.random() - 0.5) * (r / radius) * 0.8
      const scatterAngle = spiralAngle + Math.PI / 2

      positions[i3] = Math.cos(spiralAngle) * r + Math.cos(scatterAngle) * scatter
      positions[i3 + 1] = (Math.random() - 0.5) * thickness * (1 - r / radius)
      positions[i3 + 2] = Math.sin(spiralAngle) * r + Math.sin(scatterAngle) * scatter

      // Color gradient: blue-white core → orange-red arms
      const t = r / radius
      if (t < 0.15) {
        // Core: bright blue-white
        colors[i3] = 0.8 + Math.random() * 0.2
        colors[i3 + 1] = 0.9 + Math.random() * 0.1
        colors[i3 + 2] = 1.0
      } else if (t < 0.4) {
        // Inner disk: blue-white
        const s = (t - 0.15) / 0.25
        colors[i3] = 0.7 + s * 0.1
        colors[i3 + 1] = 0.8 + s * 0.1
        colors[i3 + 2] = 1.0 - s * 0.2
      } else if (t < 0.7) {
        // Mid disk: yellow-white
        const s = (t - 0.4) / 0.3
        colors[i3] = 1.0
        colors[i3 + 1] = 0.9 - s * 0.3
        colors[i3 + 2] = 0.8 - s * 0.6
      } else {
        // Outer arms: orange-red
        const s = (t - 0.7) / 0.3
        colors[i3] = 1.0
        colors[i3 + 1] = 0.5 - s * 0.4
        colors[i3 + 2] = 0.2 - s * 0.2
      }

      scales[i] = Math.random() * 0.8 + 0.2
      randoms[i3] = (Math.random() - 0.5) * 0.1
      randoms[i3 + 1] = (Math.random() - 0.5) * 0.1
      randoms[i3 + 2] = (Math.random() - 0.5) * 0.1
    }

    return { positions, colors, scales, randoms }
  }, [count, arms, radius, thickness])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          args={[randoms, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uSize: { value: 30 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface ControlsProps {
  arms: number
  density: number
  onArmsChange: (n: number) => void
  onDensityChange: (n: number) => void
}

function ControlPanel({ arms, density, onArmsChange, onDensityChange }: ControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl px-5 py-4 text-white w-56 border border-white/10">
      <h3 className="text-sm font-semibold mb-3 text-white/80">Galaxy Controls</h3>

      <div className="mb-4">
        <label className="text-xs text-white/60 mb-1 block">
          Spiral Arms: <span className="text-white font-mono">{arms}</span>
        </label>
        <input
          type="range"
          min={2}
          max={6}
          step={1}
          value={arms}
          onChange={e => onArmsChange(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">
          Star Density: <span className="text-white font-mono">{density}K</span>
        </label>
        <input
          type="range"
          min={5}
          max={30}
          step={5}
          value={density}
          onChange={e => onDensityChange(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
      </div>
    </div>
  )
}

export default function GalaxyScene() {
  const [arms, setArms] = useState(3)
  const [density, setDensity] = useState(20)

  return (
    <div className="w-full relative" style={{ height: '80vh' }}>
      <Canvas
        camera={{ position: [0, 10, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#020208']} />

        <Galaxy count={density * 1000} arms={arms} radius={8} thickness={1.2} />

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={25}
          autoRotate
          autoRotateSpeed={0.15}
        />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <ControlPanel
        arms={arms}
        density={density}
        onArmsChange={setArms}
        onDensityChange={setDensity}
      />

      <div className="absolute bottom-4 left-4 text-white/40 text-xs">
        Drag to rotate · Scroll to zoom · Adjust controls to reshape the galaxy
      </div>
    </div>
  )
}
