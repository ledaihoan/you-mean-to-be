'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

// ─── Biome Data ───────────────────────────────────────────────────────────────

interface Biome {
  id: string
  name: string
  color: string
  tempRange: string
  precipitation: string
  flora: string[]
  fauna: string[]
  areaPercent: number
  threat: string
}

const BIOMES: Biome[] = [
  {
    id: 'tropical',
    name: 'Tropical Rainforest',
    color: '#15803d',
    tempRange: '20–29°C',
    precipitation: '2000–4500 mm/yr',
    flora: ['Ceiba trees', 'Epiphytes', 'Vines', 'Ferns'],
    fauna: ['Jaguar', 'Toucan', 'Red-eyed tree frog', 'Sloth'],
    areaPercent: 6,
    threat: 'Deforestation for agriculture',
  },
  {
    id: 'temperate',
    name: 'Temperate Forest',
    color: '#22c55e',
    tempRange: '0–22°C',
    precipitation: '750–1500 mm/yr',
    flora: ['Oak', 'Maple', 'Beech', 'Ferns', 'Moss'],
    fauna: ['Deer', 'Black bear', 'Fox', 'Owl'],
    areaPercent: 8,
    threat: 'Urban expansion, logging',
  },
  {
    id: 'boreal',
    name: 'Boreal / Taiga',
    color: '#6b7280',
    tempRange: '-40–20°C',
    precipitation: '300–900 mm/yr',
    flora: ['Spruce', 'Pine', 'Fir', 'Moss', 'Lichen'],
    fauna: ['Moose', 'Wolverine', 'Lynx', 'Boreal owl'],
    areaPercent: 11,
    threat: 'Permafrost thaw, logging',
  },
  {
    id: 'arid',
    name: 'Arid / Desert',
    color: '#ca8a04',
    tempRange: '-5–50°C',
    precipitation: '<250 mm/yr',
    flora: ['Cacti', 'Succulents', 'Desert shrubs', 'Xerophytes'],
    fauna: ['Fennec fox', 'Camel', 'Rattlesnake', 'Horned lizard'],
    areaPercent: 20,
    threat: 'Desertification, water depletion',
  },
  {
    id: 'grassland',
    name: 'Grassland / Savanna',
    color: '#a3e635',
    tempRange: '-20–40°C',
    precipitation: '250–750 mm/yr',
    flora: ['Grasses', 'Acacia', 'Baobab', 'Wildflowers'],
    fauna: ['Zebra', 'Giraffe', 'Lion', 'Prairie dog'],
    areaPercent: 20,
    threat: 'Agricultural conversion, overgrazing',
  },
  {
    id: 'tundra',
    name: 'Tundra',
    color: '#bfdbfe',
    tempRange: '-50–10°C',
    precipitation: '150–250 mm/yr',
    flora: ['Moss', 'Lichen', 'Sedges', 'Dwarf shrubs'],
    fauna: ['Caribou', 'Arctic fox', 'Snowy owl', 'Polar bear'],
    areaPercent: 10,
    threat: 'Permafrost melt, habitat loss',
  },
  {
    id: 'freshwater',
    name: 'Freshwater',
    color: '#0ea5e9',
    tempRange: '0–30°C',
    precipitation: 'N/A',
    flora: ['Reeds', 'Water lilies', 'Algae', 'Phytoplankton'],
    fauna: ['Salmon', 'Hippo', 'Crocodile', 'Beaver', 'River dolphin'],
    areaPercent: 1,
    threat: 'Pollution, damming, overfishing',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    color: '#1e40af',
    tempRange: '-2–30°C',
    precipitation: 'N/A',
    flora: ['Phytoplankton', 'Kelp', 'Seaweed', 'Seagrass'],
    fauna: ['Whale', 'Shark', 'Dolphin', 'Tuna', 'Coral reef fish'],
    areaPercent: 24,
    threat: 'Overfishing, acidification, plastic',
  },
]

// ─── Food Chain Data ─────────────────────────────────────────────────────────

interface Species {
  id: string
  name: string
  trophic: number
  color: string
  pop: number
  prey: string[]
  description: string
}

const SPECIES: Species[] = [
  // Producers
  { id: 'grass', name: 'Grass', trophic: 1, color: '#22c55e', pop: 1000, prey: [], description: 'Primary producer. Converts sunlight into energy via photosynthesis. Foundation of the grassland food chain.' },
  { id: 'shrub', name: 'Shrubs', trophic: 1, color: '#15803d', pop: 800, prey: [], description: 'Woody plants that provide food and shelter for herbivores. Drought-resistant and fire-adapted.' },
  // Primary Consumers
  { id: 'rabbit', name: 'Rabbit', trophic: 2, color: '#f97316', pop: 200, prey: [], description: 'Primary consumer. Reproduces rapidly — a single pair can produce 800 offspring per year in ideal conditions.' },
  { id: 'mouse', name: 'Mouse', trophic: 2, color: '#fb923c', pop: 300, prey: [], description: 'Small rodent that eats seeds and insects. Keystone prey for many predators.' },
  { id: 'grasshopper', name: 'Grasshopper', trophic: 2, color: '#fbbf24', pop: 500, prey: [], description: 'Herbivorous insect that can consume its body weight in vegetation daily. Important plant population regulator.' },
  // Secondary Consumers
  { id: 'snake', name: 'Snake', trophic: 3, color: '#a855f7', pop: 50, prey: ['mouse', 'rabbit'], description: 'Secondary consumer. Constrictor that swallows prey whole. Can survive on 6–8 meals per year.' },
  { id: 'hawk', name: 'Hawk', trophic: 3, color: '#6366f1', pop: 30, prey: ['mouse', 'rabbit', 'grasshopper'], description: 'Raptor with exceptional eyesight. Can spot a mouse from 100 meters altitude. Apex of the small predator chain.' },
  // Tertiary Consumers
  { id: 'fox', name: 'Fox', trophic: 4, color: '#ef4444', pop: 15, prey: ['rabbit', 'mouse', 'grasshopper'], description: 'Opportunistic omnivore. Hunts rabbits and mice but also eats berries and carrion. Adaptable to many environments.' },
  { id: 'eagle', name: 'Eagle', trophic: 4, color: '#b91c1c', pop: 5, prey: ['rabbit', 'snake', 'fox'], description: 'Apex predator of the grassland. Mate for life. Can carry prey up to 4 kg in its talons.' },
  // Decomposers
  { id: 'worm', name: 'Earthworm', trophic: 5, color: '#92400e', pop: 2000, prey: [], description: 'Decomposer. Processes leaf litter into rich soil. A single acre can contain over 1 million earthworms.' },
]

// ─── Biome Globe (R3F) ─────────────────────────────────────────────────────────

function GlobeMesh({ selectedBiome, onSelect, climateShift }: {
  selectedBiome: string | null
  onSelect: (id: string | null) => void
  climateShift: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05
  })

  // Shift biome positions based on climate (simplified: shift "latitude")
  const getLatShift = () => climateShift * 0.15

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e3a5f"
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Biome zone overlays */}
      {BIOMES.map((biome, i) => {
        // Distribute biome zones across the sphere
        const lat = (i / BIOMES.length) * Math.PI * 2 + getLatShift()
        const lon = ((i * 1.618) % 2) * Math.PI - Math.PI

        const phi = Math.PI - ((i / BIOMES.length) * Math.PI)
        const theta = (i * 2.4) % (Math.PI * 2)

        const pos = new THREE.Vector3(
          2.01 * Math.sin(phi) * Math.cos(theta),
          2.01 * Math.cos(phi),
          2.01 * Math.sin(phi) * Math.sin(theta)
        )

        const isSelected = selectedBiome === biome.id

        return (
          <group key={biome.id} position={pos}>
            <Sphere args={[isSelected ? 0.18 : 0.12, 16, 16]} onClick={(e) => {
              e.stopPropagation()
              onSelect(selectedBiome === biome.id ? null : biome.id)
            }}>
              <meshStandardMaterial
                color={biome.color}
                emissive={biome.color}
                emissiveIntensity={isSelected ? 0.8 : 0.3}
                transparent
                opacity={0.9}
              />
            </Sphere>
            {isSelected && (
              <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
                <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-white/20">
                  {biome.name}
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

function BiomeExplorer() {
  const [selectedBiome, setSelectedBiome] = useState<string | null>(null)
  const [climateShift, setClimateShift] = useState(0)
  const selected = BIOMES.find(b => b.id === selectedBiome)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Biome Explorer</h3>
        <p className="text-white/50 text-sm">Click a biome zone to learn about it. Drag to rotate the globe.</p>
      </div>

      <div className="relative bg-slate-900/50 rounded-2xl overflow-hidden" style={{ height: '380px' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GlobeMesh selectedBiome={selectedBiome} onSelect={setSelectedBiome} climateShift={climateShift} />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {BIOMES.map(b => (
            <div
              key={b.id}
              onClick={() => setSelectedBiome(selectedBiome === b.id ? null : b.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer transition-all ${
                selectedBiome === b.id ? 'bg-white/20' : 'bg-black/40'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-white/70">{b.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Climate slider */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Climate temperature shift</span>
          <span className="text-emerald-400 text-sm font-mono">{climateShift > 0 ? '+' : ''}{climateShift}°C</span>
        </div>
        <input
          type="range"
          min={-5}
          max={5}
          value={climateShift}
          onChange={e => setClimateShift(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-white/30 text-xs mt-1">
          <span>Cooler</span>
          <span>Warmer</span>
        </div>
        {climateShift !== 0 && (
          <p className="text-amber-400 text-xs mt-2">
            +{climateShift}°C shifts tropical biomes poleward. Some Arctic species lose &gt;50% habitat.
          </p>
        )}
      </div>

      {/* Selected biome info */}
      {selected && (
        <div className="bg-slate-800/60 rounded-xl p-5 border border-white/10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: selected.color }} />
            <div>
              <h4 className="text-white font-semibold">{selected.name}</h4>
              <p className="text-white/40 text-xs">{selected.areaPercent}% of Earth&apos;s surface</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-1">Temperature</p>
              <p className="text-white/80">{selected.tempRange}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Precipitation</p>
              <p className="text-white/80">{selected.precipitation}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-white/40 text-xs mb-1">Typical plants</p>
            <p className="text-white/80 text-sm">{selected.flora.join(', ')}</p>
          </div>
          <div className="mt-2">
            <p className="text-white/40 text-xs mb-1">Typical animals</p>
            <p className="text-white/80 text-sm">{selected.fauna.join(', ')}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-amber-400 text-xs">
              <span className="text-white/40">Threat: </span>{selected.threat}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Food Chain Web (D3) ──────────────────────────────────────────────────────

function FoodChainWeb() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [removed, setRemoved] = useState<string[]>([])

  const draw = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    d3.select(svg).selectAll('*').remove()

    const w = svg.parentElement?.clientWidth || 600
    const h = 500
    d3.select(svg).attr('width', w).attr('height', h)

    // Filter removed species
    const active = SPECIES.filter(s => !removed.includes(s.id))

    // Create nodes with fixed positions by trophic level
    const nodeMap = new Map<string, { x: number; y: number }>()
    const byTrophic = [1, 2, 3, 4, 5].map(tl => active.filter(s => s.trophic === tl))
    byTrophic.forEach((level, i) => {
      const y = 60 + i * 85
      level.forEach((s, j) => {
        const x = (j + 1) * (w / (level.length + 1))
        nodeMap.set(s.id, { x, y })
      })
    })

    // Draw energy arrows
    const g = d3.select(svg).append('g')
    active.forEach(s => {
      if (s.prey.length === 0) return
      s.prey.forEach(preyId => {
        const prey = active.find(x => x.id === preyId)
        if (!prey || removed.includes(preyId)) return
        const from = nodeMap.get(preyId)
        const to = nodeMap.get(s.id)
        if (!from || !to) return

        g.append('line')
          .attr('x1', from.x).attr('y1', from.y)
          .attr('x2', to.x).attr('y2', to.y)
          .attr('stroke', 'rgba(255,255,255,0.12)')
          .attr('stroke-width', 1)
          .attr('marker-end', 'url(#arrowhead)')

        // 10% label at midpoint
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        g.append('text')
          .attr('x', mx).attr('y', my - 4)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(255,255,255,0.25)')
          .attr('font-size', '8')
          .text('10%')
      })
    })

    // Arrowhead def
    const defs = d3.select(svg).append('defs')
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'rgba(255,255,255,0.2)')

    // Draw nodes
    active.forEach(s => {
      const pos = nodeMap.get(s.id)
      if (!pos) return
      const isSelected = selected === s.id
      const isDimmed = selected && s.id !== selected && !SPECIES.find(sp => sp.id === s.id)?.prey.includes(selected!) &&
        !SPECIES.find(sp => sp.id === selected)?.prey.includes(s.id) &&
        s.id !== selected

      const group = g.append('g')
        .attr('transform', `translate(${pos.x},${pos.y})`)
        .style('cursor', 'pointer')
        .on('click', () => setSelected(isSelected ? null : s.id))

      group.append('circle')
        .attr('r', isSelected ? 22 : 18)
        .attr('fill', s.color)
        .attr('opacity', isDimmed ? 0.2 : 0.8)
        .attr('stroke', isSelected ? '#ffffff' : 'rgba(255,255,255,0.3)')
        .attr('stroke-width', isSelected ? 2 : 1)

      group.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '9')
        .attr('font-weight', '600')
        .text(s.name)

      // Trophic level label
      const trophicLabels = ['', 'Producer', 'Pri. Cons.', 'Sec. Cons.', 'Ter. Cons.', 'Decomposer']
      group.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -24)
        .attr('fill', 'rgba(255,255,255,0.3)')
        .attr('font-size', '8')
        .text(trophicLabels[s.trophic] || '')
    })

  }, [selected, removed])

  useEffect(() => { draw() }, [draw])

  const selectedSpecies = SPECIES.find(s => s.id === selected)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Food Chain Web</h3>
        <p className="text-white/50 text-sm">Click a species to highlight its connections. Color = trophic level. 10% labels show energy transfer efficiency.</p>
      </div>

      <div className="relative">
        <svg ref={svgRef} className="w-full rounded-xl bg-slate-900/50" style={{ height: 380 }} />

        {/* Trophic level legend */}
        <div className="absolute top-2 right-2 bg-black/60 rounded-lg p-2 text-xs">
          {[
            { label: 'Producer', color: '#22c55e' },
            { label: 'Primary Consumer', color: '#f97316' },
            { label: 'Secondary Consumer', color: '#6366f1' },
            { label: 'Tertiary Consumer', color: '#ef4444' },
            { label: 'Decomposer', color: '#92400e' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/50">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Species removal controls */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <p className="text-white/50 text-xs mb-2">Remove species (ecological experiment):</p>
        <div className="flex flex-wrap gap-1.5">
          {SPECIES.filter(s => s.trophic < 5).map(s => (
            <button
              key={s.id}
              onClick={() => setRemoved(r => r.includes(s.id) ? r.filter(x => x !== s.id) : [...r, s.id])}
              className={`px-2 py-1 rounded text-xs transition-all ${
                removed.includes(s.id)
                  ? 'bg-red-900/50 text-red-400/50 line-through'
                  : 'bg-slate-700 text-white/70 hover:bg-slate-600'
              }`}
              style={{ borderColor: removed.includes(s.id) ? 'transparent' : s.color, border: '1px solid' }}
            >
              {s.name}
            </button>
          ))}
        </div>
        {removed.length > 0 && (
          <p className="text-amber-400 text-xs mt-2">
            Removing {removed.join(', ')} disrupts {SPECIES.filter(s => removed.some(r => s.prey.includes(r))).length} predator(s). In reality, cascade effects ripple through the entire ecosystem.
          </p>
        )}
      </div>

      {/* Selected species info */}
      {selectedSpecies && (
        <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSpecies.color }} />
            <h4 className="text-white font-semibold">{selectedSpecies.name}</h4>
            <span className="text-white/40 text-xs">Trophic level {selectedSpecies.trophic}</span>
          </div>
          <p className="text-white/60 text-sm">{selectedSpecies.description}</p>
          {selectedSpecies.prey.length > 0 && (
            <p className="text-white/40 text-xs mt-2">Prey: {selectedSpecies.prey.map(p => SPECIES.find(s => s.id === p)?.name).join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Ecosystem Balance (Lotka-Volterra) ───────────────────────────────────────

function EcosystemBalance() {
  const chartRef = useRef<SVGSVGElement>(null)
  const animRef = useRef<number>(0)
  const [herbivores, setHerbivores] = useState(80)
  const [wolves, setWolves] = useState(15)
  const [herbGrowth, setHerbGrowth] = useState(0.4)   // α: herbivore birth rate
  const [wolfMortality, setWolfMortality] = useState(0.02) // δ: wolf death rate
  const [predation, setPredation] = useState(0.003)   // β: predation rate
  const [reproduction, setReproduction] = useState(0.002) // γ: wolf reproduction per prey eaten
  const [running, setRunning] = useState(true)

  const populations = useRef<{ t: number; H: number; W: number }[]>([])
  const H = useRef(herbivores)
  const W = useRef(wolves)

  // Refs to hold latest param values for animation loop
  const paramsRef = useRef({ herbGrowth, wolfMortality, predation, reproduction })
  useEffect(() => {
    paramsRef.current = { herbGrowth, wolfMortality, predation, reproduction }
  }, [herbGrowth, wolfMortality, predation, reproduction])

  const drawChart = useCallback(() => {
    const svg = chartRef.current
    if (!svg) return
    const w = svg.parentElement?.clientWidth || 600
    const h = 280
    d3.select(svg).attr('width', w).attr('height', h).selectAll('*').remove()

    const m = { top: 10, right: 16, bottom: 28, left: 40 }
    const iw = w - m.left - m.right
    const ih = h - m.top - m.bottom

    const data = populations.current
    if (data.length < 2) return

    const tMax = data[data.length - 1].t
    const allPops = data.flatMap(d => [d.H, d.W])
    const popMax = Math.max(...allPops) * 1.1

    const xScale = d3.scaleLinear().domain([Math.max(0, tMax - 300), tMax]).range([0, iw])
    const yScale = d3.scaleLinear().domain([0, popMax]).range([ih, 0])

    const g = d3.select(svg).append('g').attr('transform', `translate(${m.left},${m.top})`)

    // Grid
    g.append('g').call(d3.axisLeft(yScale).ticks(4).tickSize(-iw).tickFormat(() => ''))
      .call(a => a.select('.domain').remove())
      .selectAll('line').attr('stroke', 'rgba(255,255,255,0.04)')

    // Axes
    g.append('g').attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}`))
      .call(a => { a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'); a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9') })

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .call(a => { a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'); a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9') })

    g.append('text').attr('x', -ih / 2).attr('y', -30).attr('transform', 'rotate(-90)').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '10').text('Population')

    // Herbivore line
    const lineGen = d3.line<{ t: number; H: number }>()
      .x(d => xScale(d.t)).y(d => yScale(d.H))
    g.append('path').datum(data.map(d => ({ t: d.t, H: d.H })))
      .attr('d', lineGen).attr('fill', 'none').attr('stroke', '#22c55e').attr('stroke-width', 2).attr('opacity', 0.8)

    // Wolf line
    const lineGenW = d3.line<{ t: number; W: number }>()
      .x(d => xScale(d.t)).y(d => yScale(d.W))
    g.append('path').datum(data.map(d => ({ t: d.t, W: d.W })))
      .attr('d', lineGenW).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2).attr('opacity', 0.8)
  }, [])

  // Reset populations when initial values change
  useEffect(() => {
    H.current = herbivores
    W.current = wolves
    populations.current = [{ t: 0, H: H.current, W: W.current }]
  }, [herbivores, wolves])

  // Main animation loop
  useEffect(() => {
    cancelAnimationFrame(animRef.current)
    if (!running) return

    const dt = 0.5
    const simulate = () => {
      const p = paramsRef.current
      // Lotka-Volterra equations
      // dH/dt = αH - βHW  (herbivores grow, die by predation)
      // dW/dt = δβHW - γW (wolves grow with prey, die naturally)
      const dH = (p.herbGrowth * H.current - p.predation * H.current * W.current) * dt
      const dW = (p.reproduction * H.current * W.current - p.wolfMortality * W.current) * dt

      H.current = Math.max(1, H.current + dH)
      W.current = Math.max(0.1, W.current + dW)

      const t = populations.current.length * dt
      populations.current.push({ t, H: H.current, W: W.current })
      if (populations.current.length > 500) populations.current.shift()

      drawChart()
      animRef.current = requestAnimationFrame(simulate)
    }
    animRef.current = requestAnimationFrame(simulate)

    return () => cancelAnimationFrame(animRef.current)
  }, [running, drawChart])

  // Redraw when paused
  useEffect(() => {
    if (!running) drawChart()
  }, [running, drawChart])

  const resetSim = useCallback(() => {
    H.current = herbivores
    W.current = wolves
    populations.current = [{ t: 0, H: H.current, W: W.current }]
    cancelAnimationFrame(animRef.current)
    setRunning(true)
  }, [herbivores, wolves])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Ecosystem Balance Simulator</h3>
        <p className="text-white/50 text-sm">Lotka-Volterra predator-prey dynamics. Adjust parameters and watch populations oscillate.</p>
      </div>

      <svg ref={chartRef} className="w-full rounded-xl bg-slate-900/50" style={{ height: 280 }} />

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-emerald-500" />
          <span className="text-white/50 text-xs">Herbivores</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-red-500" />
          <span className="text-white/50 text-xs">Wolves</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Initial herbivores</span>
            <span className="text-emerald-400 text-xs font-mono">{herbivores}</span>
          </div>
          <input type="range" min={10} max={200} value={herbivores} onChange={e => setHerbivores(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Initial wolves</span>
            <span className="text-red-400 text-xs font-mono">{wolves}</span>
          </div>
          <input type="range" min={1} max={50} value={wolves} onChange={e => setWolves(Number(e.target.value))} className="w-full accent-red-500" />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Herbivore growth (α)</span>
            <span className="text-white/60 text-xs font-mono">{herbGrowth.toFixed(3)}</span>
          </div>
          <input type="range" min={1} max={80} value={herbGrowth * 100} onChange={e => setHerbGrowth(Number(e.target.value) / 100)} className="w-full accent-emerald-500" />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Wolf mortality (δ)</span>
            <span className="text-white/60 text-xs font-mono">{wolfMortality.toFixed(3)}</span>
          </div>
          <input type="range" min={1} max={80} value={wolfMortality * 100} onChange={e => setWolfMortality(Number(e.target.value) / 100)} className="w-full accent-red-500" />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Predation rate (β)</span>
            <span className="text-white/60 text-xs font-mono">{predation.toFixed(4)}</span>
          </div>
          <input type="range" min={1} max={80} value={predation * 1000} onChange={e => setPredation(Number(e.target.value) / 1000)} className="w-full accent-orange-500" />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex justify-between mb-1">
            <span className="text-white/50 text-xs">Wolf reproduction (γ)</span>
            <span className="text-white/60 text-xs font-mono">{reproduction.toFixed(4)}</span>
          </div>
          <input type="range" min={1} max={80} value={reproduction * 1000} onChange={e => setReproduction(Number(e.target.value) / 1000)} className="w-full accent-orange-500" />
        </div>
      </div>

      {/* Educational */}
      <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5">
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-emerald-400 font-semibold">Why oscillations?</span> More herbivores → more food → wolf population rises. More wolves → more predation → herbivores crash. Fewer herbivores → wolves starve → population drops. Rinse and repeat. This is the <span className="text-white/60">10% rule</span>: only ~10% of energy passes up each trophic level.
        </p>
      </div>

      <button
        onClick={resetSim}
        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-lg text-sm transition-colors"
      >
        Reset simulation
      </button>
    </div>
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

const DEMOS = [
  { id: 'biome', label: 'Biome Explorer', component: BiomeExplorer },
  { id: 'food', label: 'Food Chain Web', component: FoodChainWeb },
  { id: 'ecosystem', label: 'Ecosystem Balance', component: EcosystemBalance },
]

export default function EarthScene() {
  const [activeDemo, setActiveDemo] = useState('biome')
  const ActiveDemo = DEMOS.find(d => d.id === activeDemo)!.component

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
        <div className="mb-4">
          <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Phase 2D · Simulation</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Why Life Exists
        </h1>
        <p className="text-white/50 max-w-xl leading-relaxed">
          Earth is a cosmic accident worth protecting. Explore the biome zones that cover our planet, the food chains that sustain them, and the predator-prey dynamics that keep ecosystems in balance.
        </p>
        <div className="flex gap-2 mt-4">
          <a href="/blog/goldilocks-accident" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            The Goldilocks Accident →
          </a>
          <span className="text-white/20">·</span>
          <a href="/blog/carbon-chain-life" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Carbon Chain of Life →
          </a>
          <span className="text-white/20">·</span>
          <a href="/blog/energy-gradient-life" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Energy Gradient →
          </a>
        </div>
      </div>

      {/* Demo tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex gap-1 bg-slate-800/40 p-1 rounded-xl w-fit mb-6">
          {DEMOS.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDemo(d.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeDemo === d.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active demo */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <ActiveDemo />
      </div>
    </div>
  )
}
