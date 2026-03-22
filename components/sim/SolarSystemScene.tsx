'use client'

import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'

const PLANETS = [
  { name: 'Mercury', color: '#9E9E9E', radius: 0.034, distance: 0.39, speed: 4.74, facts: 'Smallest planet. No atmosphere. Temperature swings from -180°C to 430°C.' },
  { name: 'Venus', color: '#E8C97A', radius: 0.085, distance: 0.72, speed: 3.50, facts: 'Hottest planet. Thick CO₂ atmosphere. Retrograde rotation.' },
  { name: 'Earth', color: '#2196F3', radius: 0.090, distance: 1.0, speed: 2.98, facts: 'Our home. Only planet with liquid water on surface. One moon.' },
  { name: 'Mars', color: '#E57373', radius: 0.048, distance: 1.52, speed: 2.41, facts: 'The Red Planet. Olympus Mons — tallest volcano in the solar system.' },
  { name: 'Jupiter', color: '#D4A373', radius: 0.28, distance: 2.77, speed: 1.31, facts: 'Largest planet. Great Red Spot — storm raging for 400+ years. 95 moons.' },
  { name: 'Saturn', color: '#F5DEB3', radius: 0.24, distance: 4.00, speed: 0.97, facts: 'Famous rings made of ice and rock. Density less than water.' },
  { name: 'Uranus', color: '#80DEEA', radius: 0.15, distance: 5.20, speed: 0.68, facts: 'Ice giant. Rotates on its side. Blue-green from methane.' },
  { name: 'Neptune', color: '#3F51B5', radius: 0.14, distance: 6.10, speed: 0.54, facts: 'Windiest planet. 1,600+ km/h winds. 14 known moons.' },
]

interface PlanetProps {
  planet: typeof PLANETS[0]
  selected: string | null
  onSelect: (name: string | null) => void
}

function Planet({ planet, selected, onSelect }: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <group>
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.002, planet.distance + 0.002, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Planet */}
      <mesh
        ref={ref}
        position={[planet.distance, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(selected === planet.name ? null : planet.name) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={selected === planet.name ? 0.5 : hovered ? 0.3 : 0.1}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Selected indicator */}
      {selected === planet.name && (
        <mesh position={[planet.distance, 0, 0]}>
          <sphereGeometry args={[planet.radius * 1.3, 32, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={0.15} transparent />
        </mesh>
      )}
    </group>
  )
}

interface InfoOverlayProps {
  planet: typeof PLANETS[0] | null
  onClose: () => void
}

function InfoOverlay({ planet, onClose }: InfoOverlayProps) {
  if (!planet) return null
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white rounded-xl px-6 py-4 max-w-sm text-center backdrop-blur-sm border border-white/20">
      <button
        onClick={onClose}
        className="absolute top-2 right-3 text-white/60 hover:text-white text-lg"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-1">{planet.name}</h2>
      <p className="text-sm text-white/80">{planet.facts}</p>
    </div>
  )
}

export default function SolarSystemScene() {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedPlanet = PLANETS.find(p => p.name === selected) ?? null

  return (
    <div className="w-full h-full relative" style={{ height: '80vh' }}>
      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <color attach="background" args={['#050510']} />

        {/* Lighting */}
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFF5D0" />

        {/* Sun */}
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={2} />
        </mesh>
        {/* Sun glow */}
        <mesh>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshBasicMaterial color="#FFA500" opacity={0.08} transparent />
        </mesh>

        {/* Planets */}
        {PLANETS.map(planet => (
          <Planet
            key={planet.name}
            planet={planet}
            selected={selected}
            onSelect={setSelected}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      <InfoOverlay planet={selectedPlanet} onClose={() => setSelected(null)} />

      {/* Instructions */}
      <div className="absolute top-4 left-4 text-white/50 text-sm">
        Drag to rotate · Scroll to zoom · Click planet for facts
      </div>
    </div>
  )
}
