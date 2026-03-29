'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── Scale data for Demo 1 ──────────────────────────────────────────────────
const SCALES = [
  { id: 'human',    label: 'Human',         size: 1,           sizeLabel: '1 m',      unit: 'm',     color: '#94a3b8', info: 'Where you are now. Ordinary human scale — visible light, gravity, touch.',            force: 'Gravity, Electromagnetism' },
  { id: 'ant',      label: 'Ant',           size: 1e-3,        sizeLabel: '1 mm',     unit: 'm',     color: '#78716c', info: 'An ant navigates a world of texture and chemical signals. Its compound eyes see UV light.', force: 'Gravity, Surface tension' },
  { id: 'cell',     label: 'Cell',          size: 1e-5,        sizeLabel: '10 μm',    unit: 'm',     color: '#15803d', info: 'The cell membrane separates inside from outside. Proteins span the membrane like molecular machines.', force: 'Electromagnetism, Diffusion' },
  { id: 'protein',  label: 'Protein',       size: 1e-9,         sizeLabel: '1 nm',     unit: 'm',     color: '#0891b2', info: 'Proteins fold into precise 3D shapes determined by electromagnetic forces between amino acids.', force: 'Electromagnetism' },
  { id: 'atom',     label: 'Atom',          size: 1e-10,        sizeLabel: '0.1 nm',   unit: 'm',     color: '#7c3aed', info: 'The electron cloud defines the atom\'s size. The nucleus is 100,000× smaller — a basketball 10,000 km away.', force: 'Electromagnetism, Pauli exclusion' },
  { id: 'nucleus',  label: 'Nucleus',       size: 1e-15,        sizeLabel: '1 fm',     unit: 'm',     color: '#dc2626', info: 'Protons and neutrons packed by the strong nuclear force. If this were a basketball, electrons orbit 10,000 km away.', force: 'Strong force, Weak force' },
  { id: 'quark',    label: 'Quark',         size: 1e-18,        sizeLabel: '1 am',     unit: 'm',     color: '#ea580c', info: 'Quarks are point-like fundamental particles. They combine via the strong force to form protons and neutrons.', force: 'Strong force, Electroweak' },
]

// ─── D3: Logarithmic Scale Chart (27 orders of magnitude) ──────────────────
function LogScaleChart() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const w = 520, h = 100, m = { top: 8, right: 16, bottom: 24, left: 16 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    // Log scale from 10^-18 to 10^1 (20 orders of mag, visible range)
    const xScale = d3.scaleLog().domain([1e-18, 10]).range([0, iw])

    // Highlighted regions
    const regions = [
      { x1: 1e-18, x2: 1e-15, label: 'Quark',     color: 'rgba(234,88,12,0.2)' },
      { x1: 1e-15, x2: 1e-10, label: 'Nucleus–Atom', color: 'rgba(220,38,38,0.2)' },
      { x1: 1e-10, x2: 1e-5,  label: 'Atom–Cell',  color: 'rgba(124,58,237,0.2)' },
      { x1: 1e-5,  x2: 1,     label: 'Cell–Human',  color: 'rgba(20,128,56,0.2)' },
    ]
    regions.forEach(r => {
      g.append('rect')
        .attr('x', xScale(r.x1)).attr('width', xScale(r.x2) - xScale(r.x1))
        .attr('y', 0).attr('height', ih)
        .attr('fill', r.color)
    })

    // Grid lines at powers of 10
    const powers = d3.range(-18, 2)
    powers.forEach(p => {
      const x = xScale(Math.pow(10, p))
      g.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', 'rgba(255,255,255,0.06)')
        .attr('stroke-width', 1)
      g.append('text')
        .attr('x', x).attr('y', ih + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8')
        .attr('fill', 'rgba(255,255,255,0.25)')
        .attr('font-family', 'monospace')
        .text(`10^${p}`)
    })

    // Scale markers
    SCALES.forEach(s => {
      const x = xScale(s.size)
      g.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0).attr('y2', -4)
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
      g.append('circle')
        .attr('cx', x).attr('cy', -4).attr('r', 3)
        .attr('fill', s.color)
      g.append('text')
        .attr('x', x).attr('y', -8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9')
        .attr('fill', s.color)
        .attr('font-family', 'monospace')
        .text(s.sizeLabel)
    })

    // Arrow annotation: nucleus → electron cloud
    const nucleusX = xScale(1e-15)
    const atomX = xScale(1e-10)
    g.append('line')
      .attr('x1', nucleusX).attr('x2', atomX)
      .attr('y1', ih / 2).attr('y2', ih / 2)
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('marker-end', 'url(#arrowhead)')
    g.append('text')
      .attr('x', (nucleusX + atomX) / 2).attr('y', ih / 2 - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '7')
      .attr('fill', 'rgba(255,255,255,0.3)')
      .text('99.999% empty')

    // Arrow marker
    const defs = root.append('defs')
    const marker = defs.append('marker')
      .attr('id', 'arrowhead').attr('markerWidth', 6).attr('markerHeight', 4)
      .attr('refX', 6).attr('refY', 2).attr('orient', 'auto')
    marker.append('polygon').attr('points', '0 0, 6 2, 0 4').attr('fill', 'rgba(255,255,255,0.15)')

  }, [])

  return <svg ref={ref} className="w-full" />
}

// ─── Demo 1: Atomic Scale Journey ────────────────────────────────────────────
function AtomicScaleJourney() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [scale, setScale] = useState(1) // 1 = full view

  const drawScale = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, index: number, t: number) => {
    const s = SCALES[index]
    const zoom = Math.pow(10, -index)  // 1, 1e-3, 1e-5, ...

    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = 'rgba(2,6,23,0.9)'
    ctx.fillRect(0, 0, w, h)

    // Draw based on scale
    const cx = w / 2, cy = h / 2

    if (index === 0) {
      // Human: silhouette
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      // Body
      ctx.beginPath()
      ctx.ellipse(cx, cy - 40, 20, 60, 0, 0, Math.PI * 2)
      ctx.stroke()
      // Head
      ctx.beginPath()
      ctx.arc(cx, cy - 110, 18, 0, Math.PI * 2)
      ctx.stroke()
      // Label
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('YOU', cx, cy + 80)
    } else if (index === 1) {
      // Ant: simple body segments
      ctx.fillStyle = '#78716c'
      const ax = cx - 40, ay = cy + 10
      // Thorax
      ctx.beginPath()
      ctx.ellipse(ax, ay, 6, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      // Abdomen
      ctx.beginPath()
      ctx.ellipse(ax + 18, ay + 5, 10, 14, 0.3, 0, Math.PI * 2)
      ctx.fill()
      // Head
      ctx.beginPath()
      ctx.ellipse(ax - 10, ay - 5, 5, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      // Legs
      ctx.strokeStyle = '#78716c'
      ctx.lineWidth = 1.5
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(ax, ay + i * 4); ctx.lineTo(ax - 20, ay + i * 4 + 8); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ax, ay + i * 4); ctx.lineTo(ax + 5, ay + i * 4 + 8); ctx.stroke()
      }
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('ANT', cx, cy + 70)
    } else if (index === 2) {
      // Cell: membrane + nucleus
      ctx.strokeStyle = '#15803d'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(cx, cy, 120, 80, 0, 0, Math.PI * 2)
      ctx.stroke()
      // Nucleus
      ctx.fillStyle = 'rgba(20,128,56,0.3)'
      ctx.beginPath()
      ctx.ellipse(cx - 20, cy - 10, 35, 28, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.stroke()
      // Mitochondria dots
      ctx.fillStyle = 'rgba(249,115,22,0.5)'
      ;[[cx + 60, cy - 20], [cx + 50, cy + 30], [cx - 70, cy + 20]].forEach(([mx, my]) => {
        ctx.beginPath()
        ctx.ellipse(mx as number, my as number, 10, 5, 0.3, 0, Math.PI * 2)
        ctx.fill()
      })
      // Proteins
      ctx.fillStyle = '#0891b2'
      ;[[cx - 40, cy + 50], [cx + 20, cy - 50], [cx - 80, cy - 20]].forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(px as number, py as number, 4, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.fillStyle = '#15803d'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('CELL', cx, cy + 110)
    } else if (index === 3) {
      // Protein: folded chain
      ctx.strokeStyle = '#0891b2'
      ctx.lineWidth = 2
      const pts: [number, number][] = []
      for (let i = 0; i < 40; i++) {
        const angle = i * 0.8 + t
        const r = 20 + 15 * Math.sin(i * 0.3)
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle * 0.7)])
      }
      ctx.beginPath()
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
      ctx.stroke()
      // Alpha helix spirals
      ctx.strokeStyle = 'rgba(8,145,178,0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const bx = cx - 80 + i * 22
        ctx.beginPath()
        ctx.ellipse(bx, cy - 40, 8, 15, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = '#0891b2'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('PROTEIN', cx, cy + 90)
    } else if (index === 4) {
      // Atom: nucleus + electron shells
      // Nucleus (tiny!)
      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(220,38,38,0.4)'
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fill()
      // Electron shells
      const shellRadii = [40, 65, 90]
      shellRadii.forEach((r, si) => {
        ctx.strokeStyle = `rgba(124,58,237,${0.3 + si * 0.15})`
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        // Electrons
        const numElectrons = si + 1
        for (let e = 0; e < numElectrons; e++) {
          const angle = t * (1 + si * 0.5) + (e / numElectrons) * Math.PI * 2
          const ex = cx + r * Math.cos(angle)
          const ey = cy + r * Math.sin(angle)
          ctx.fillStyle = '#a855f7'
          ctx.shadowBlur = 8
          ctx.shadowColor = '#a855f7'
          ctx.beginPath()
          ctx.arc(ex, ey, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })
      // Scale annotation: "nucleus is 4px here"
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('nucleus = 4px radius', cx, h - 20)
      ctx.fillText('electron cloud = 180px radius', cx, h - 8)
      ctx.fillStyle = '#7c3aed'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('ATOM', cx, 30)
    } else if (index === 5) {
      // Nucleus: protons + neutrons packed
      const radius = 28
      const positions: [number, number][] = []
      // Pack 12 particles (6p + 6n) in 2D approximation
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const r = i < 6 ? 12 : 20
        positions.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
      }
      positions.forEach(([x, y], i) => {
        ctx.fillStyle = i < 6 ? '#dc2626' : '#9ca3af'
        ctx.shadowBlur = 6
        ctx.shadowColor = i < 6 ? '#dc2626' : '#9ca3af'
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('6 protons (red) + 6 neutrons (gray)', cx, h - 20)
      ctx.fillStyle = '#dc2626'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('NUCLEUS', cx, 30)
    } else if (index === 6) {
      // Quark: abstract point particles with gluon lines
      const qColors = ['#ea580c', '#22c55e', '#3b82f6']
      const qPos: [number, number, number][] = [[cx - 30, cy, 0], [cx + 20, cy - 25, 1], [cx + 20, cy + 25, 2]]
      // Gluon lines (strong force)
      ctx.strokeStyle = 'rgba(234,88,12,0.4)'
      ctx.lineWidth = 3
      qPos.forEach(([x1, y1]) => {
        qPos.forEach(([x2, y2]) => {
          if (x1 !== x2 || y1 !== y2) {
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        })
      })
      qPos.forEach(([x, y, ci]) => {
        ctx.fillStyle = qColors[ci]
        ctx.shadowBlur = 12
        ctx.shadowColor = qColors[ci]
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })
      ctx.fillStyle = 'rgba(234,88,12,0.5)'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('3 quarks bound by gluons (strong force)', cx, h - 20)
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('QUARK', cx, 30)
    }

    // Info panel at bottom
    ctx.fillStyle = 'rgba(15,23,42,0.8)'
    ctx.fillRect(0, h - 60, w, 60)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, h - 60, w, 60)
    ctx.fillStyle = s.color
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(s.label.toUpperCase(), 12, h - 42)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '10px monospace'
    // Word wrap
    const words = s.info.split(' ')
    let line = ''
    let lineY = h - 28
    words.forEach(word => {
      const test = line + word + ' '
      if (ctx.measureText(test).width > w - 24 && line !== '') {
        ctx.fillText(line, 12, lineY)
        line = word + ' '
        lineY += 12
      } else {
        line = test
      }
    })
    ctx.fillText(line, 12, lineY)

    ctx.fillStyle = s.color
    ctx.font = '9px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`Force: ${s.force}`, w - 12, h - 8)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    const t = 0

    const animate = () => {
      drawScale(ctx!, canvas.width, canvas.height, activeIndex, frame * 0.02)
      frame++
      if (frame > 1000) frame = 0
      requestAnimationFrame(animate)
    }
    const raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [activeIndex, drawScale])

  const goTo = (index: number) => {
    if (index < 0 || index >= SCALES.length || transitioning) return
    setTransitioning(true)
    setActiveIndex(index)
    setTimeout(() => setTransitioning(false), 400)
  }

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Atomic Scale Journey</h3>
      <p className="text-white/40 text-xs mb-4">Zoom through 18 orders of magnitude — from your hand to a quark. Each step reveals a different reality governed by different forces.</p>

      {/* D3 log scale chart */}
      <div className="mb-4 bg-slate-950/60 rounded-xl p-3 border border-white/5">
        <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Size comparison — 18 orders of magnitude</p>
        <LogScaleChart />
      </div>

      {/* Canvas visualization */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={340}
          className="w-full rounded-xl"
          style={{ background: '#020617' }}
        />

        {/* Breadcrumb navigation */}
        <div className="flex flex-wrap gap-1 mt-3 justify-center">
          {SCALES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                activeIndex === i
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
              style={{ borderLeftColor: activeIndex === i ? s.color : 'transparent', borderLeft: activeIndex === i ? '2px solid' : '2px solid transparent' }}
            >
              {s.sizeLabel}
            </button>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between mt-2">
          <button
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            ← Smaller
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === SCALES.length - 1}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            Larger →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── D3: Force Strength Comparison Chart ────────────────────────────────────
function ForceStrengthChart() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const w = 460, h = 110, m = { top: 8, right: 80, bottom: 20, left: 120 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const forces = [
      { name: 'Strong',    relative: 1,             color: '#dc2626', note: '10^38× gravity' },
      { name: 'EM',        relative: 1 / 1.2e-2,    color: '#7c3aed', note: '10^36× gravity' },
      { name: 'Weak',      relative: 1 / 3e-6,       color: '#0891b2', note: '10^32× gravity' },
      { name: 'Gravity',   relative: 1 / 1e-38,      color: '#94a3b8', note: '1× baseline' },
    ]
    // Use log scale
    const logForces = forces.map(f => ({ ...f, logVal: Math.log10(f.relative) }))
    const maxLog = Math.max(...logForces.map(f => f.logVal))
    const minLog = Math.min(...logForces.map(f => f.logVal))

    const xScale = d3.scaleLinear().domain([minLog, maxLog]).range([0, iw])

    // Grid lines
    ;[-38, -36, -32, 0].forEach(p => {
      const x = xScale(p)
      g.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', 'rgba(255,255,255,0.04)')
      g.append('text')
        .attr('x', x).attr('y', ih + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '7')
        .attr('fill', 'rgba(255,255,255,0.2)')
        .text(`10^${p}`)
    })

    // Bars
    logForces.forEach((f, i) => {
      const y = (i / logForces.length) * ih + ih / logForces.length / 2 - 8
      const barH = 16
      const barY = y - barH / 2
      const barW = xScale(f.logVal) - xScale(minLog)

      g.append('rect')
        .attr('x', 0).attr('y', barY)
        .attr('width', Math.max(barW, 2))
        .attr('height', barH)
        .attr('fill', f.color)
        .attr('opacity', 0.7)
        .attr('rx', 2)

      // Name
      g.append('text')
        .attr('x', -8).attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '10')
        .attr('fill', f.color)
        .attr('font-family', 'monospace')
        .text(f.name)

      // Note
      g.append('text')
        .attr('x', Math.max(barW + 4, 4)).attr('y', y + 4)
        .attr('font-size', '8')
        .attr('fill', 'rgba(255,255,255,0.3)')
        .attr('font-family', 'monospace')
        .text(f.note)
    })

  }, [])

  return <svg ref={ref} className="w-full" />
}

// ─── D3: Mechanoreceptor Chart ──────────────────────────────────────────────
function MechanoreceptorChart() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const w = 400, h = 100, m = { top: 8, right: 16, bottom: 24, left: 90 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const receptors = [
      { name: 'Merkel Disk',      depth: 'Shallow (0.05–0.1mm)', sensitivity: 0.8,  speed: 0.3, adaptation: 0.2, color: '#3b82f6' },
      { name: 'Meissner Corpuscle', depth: 'Shallow (0.1–0.5mm)', sensitivity: 0.6,  speed: 0.8, adaptation: 0.8, color: '#22c55e' },
      { name: 'Ruffini Ending',   depth: 'Deep (1–2mm)',          sensitivity: 0.5,  speed: 0.2, adaptation: 0.15, color: '#f97316' },
      { name: 'Pacinian Corpuscle', depth: 'Deep (2–3mm)',       sensitivity: 0.7,  speed: 0.6, adaptation: 0.95, color: '#dc2626' },
    ]

    const yScale = d3.scaleBand().domain(receptors.map(r => r.name)).range([0, ih]).padding(0.2)
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, iw])

    // Sensitivity bars
    receptors.forEach(r => {
      const y = yScale(r.name)!
      g.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', xScale(r.sensitivity))
        .attr('height', yScale.bandwidth())
        .attr('fill', r.color)
        .attr('opacity', 0.4)
        .attr('rx', 2)
      g.append('text')
        .attr('x', xScale(r.sensitivity) + 4).attr('y', y + yScale.bandwidth() / 2 + 4)
        .attr('font-size', '8')
        .attr('fill', r.color)
        .attr('font-family', 'monospace')
        .text(`${(r.sensitivity * 100).toFixed(0)}%`)
      // Adaptation indicator
      const adaptX = xScale(r.adaptation)
      g.append('line')
        .attr('x1', adaptX).attr('x2', adaptX)
        .attr('y1', y).attr('y2', y + yScale.bandwidth())
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2 2')
    })

    // Y axis labels
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .call(a => {
        a.select('.domain').remove()
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', '9').attr('font-family', 'monospace')
      })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.25)').attr('font-size', '7')
      })

    // Legend
    root.append('text').attr('x', m.left).attr('y', h - 4)
      .attr('font-size', '7').attr('fill', 'rgba(255,255,255,0.2)').attr('font-family', 'monospace')
      .text('sensitivity = bar | adaptation rate = dashed line (higher = faster adaptation)')
  }, [])

  return <svg ref={ref} className="w-full" />
}

// ─── Demo 2: Force Field Simulator ──────────────────────────────────────────
interface Charge {
  id: number
  x: number
  y: number
  polarity: 'positive' | 'negative'
  magnitude: number
}

function ForceFieldSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [charges, setCharges] = useState<Charge[]>([])
  const [chargeMagnitude, setChargeMagnitude] = useState(1)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const nextId = useRef(0)

  const k = 8.99e9 // Coulomb constant (normalized for viz)

  const placeCharge = useCallback((e: React.MouseEvent<HTMLCanvasElement>, polarity: 'positive' | 'negative') => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height
    setCharges(prev => [...prev, { id: nextId.current++, x, y, polarity, magnitude: chargeMagnitude }])
  }, [chargeMagnitude])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = 'rgba(2,6,23,0.95)'
    ctx.fillRect(0, 0, w, h)

    // Draw field lines
    if (showFieldLines && charges.length >= 1) {
      const fieldRes = 20
      for (let fx = 0; fx < w; fx += fieldRes) {
        for (let fy = 0; fy < h; fy += fieldRes) {
          let Ex = 0, Ey = 0
          charges.forEach(c => {
            const dx = fx - c.x, dy = fy - c.y
            const r2 = dx * dx + dy * dy + 1
            const r = Math.sqrt(r2)
            const E = (k * c.magnitude) / r2
            const sign = c.polarity === 'positive' ? 1 : -1
            Ex += sign * E * dx / r
            Ey += sign * E * dy / r
          })
          const E = Math.sqrt(Ex * Ex + Ey * Ey)
          if (E > 1e-6) {
            const nx = Ex / E, ny = Ey / E
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(E * 1e-8, 0.3)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(fx - nx * 4, fy - ny * 4)
            ctx.lineTo(fx + nx * 4, fy + ny * 4)
            ctx.stroke()
          }
        }
      }
    }

    // Draw field lines (streamlines from positive to negative)
    if (showFieldLines && charges.length >= 2) {
      const posCharges = charges.filter(c => c.polarity === 'positive')
      const negCharges = charges.filter(c => c.polarity === 'negative')
      posCharges.forEach(pos => {
        negCharges.forEach(neg => {
          // Draw ~12 field lines from pos to neg
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            let sx = pos.x + 15 * Math.cos(angle)
            let sy = pos.y + 15 * Math.sin(angle)
            ctx.strokeStyle = 'rgba(147,51,234,0.4)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(sx, sy)
            for (let step = 0; step < 200; step++) {
              let Ex = 0, Ey = 0
              ;[...charges, { x: neg.x, y: neg.y, magnitude: -pos.magnitude, polarity: 'negative' as const }].forEach(c => {
                const dx = sx - c.x, dy = sy - c.y
                const r2 = dx * dx + dy * dy + 10
                const r = Math.sqrt(r2)
                const E = (k * c.magnitude) / r2
                const sign = c.polarity === 'positive' ? 1 : -1
                Ex += sign * E * dx / r
                Ey += sign * E * dy / r
              })
              const E = Math.sqrt(Ex * Ex + Ey * Ey)
              if (E < 1e-10) break
              sx += (Ex / E) * 3
              sy += (Ey / E) * 3
              if (sx < 0 || sx > w || sy < 0 || sy > h) break
              const distNeg = Math.sqrt((sx - neg.x) ** 2 + (sy - neg.y) ** 2)
              if (distNeg < 15) break
              ctx.lineTo(sx, sy)
            }
            ctx.stroke()
          }
        })
      })
    }

    // Draw charges
    charges.forEach(c => {
      const r = 10 + c.magnitude * 5
      const color = c.polarity === 'positive' ? '#ef4444' : '#3b82f6'
      // Glow
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2)
      grad.addColorStop(0, color)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(c.x, c.y, r * 2, 0, Math.PI * 2)
      ctx.fill()
      // Core
      ctx.fillStyle = color
      ctx.shadowBlur = 12
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      // Symbol
      ctx.fillStyle = 'white'
      ctx.font = `bold ${r}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.polarity === 'positive' ? '+' : '−', c.x, c.y)
    })

    // Empty state hint
    if (charges.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Click canvas to place charges', w / 2, h / 2)
      ctx.font = '11px monospace'
      ctx.fillText('(+ = red, − = blue)', w / 2, h / 2 + 20)
    }

  }, [charges, showFieldLines])

  useEffect(() => {
    draw()
  }, [draw])

  const clearCharges = () => setCharges([])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Electromagnetic Force Field</h3>
      <p className="text-white/40 text-xs mb-4">Opposite charges attract, same charges repel. Click to place charges and watch the field lines form. This is the force behind every chemical bond and every sensation on your skin.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={560}
            height={300}
            className="w-full rounded-xl cursor-crosshair"
            style={{ background: '#020617', display: 'block', margin: '0 auto' }}
            onClick={(e) => placeCharge(e, charges.length % 2 === 0 ? 'positive' : 'negative')}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-52">
          <div>
            <label className="text-xs text-white/50 block mb-1">Charge magnitude: <span className="text-purple-400 font-mono">{chargeMagnitude.toFixed(1)}</span></label>
            <input type="range" min="0.5" max="5" step="0.1" value={chargeMagnitude} onChange={e => setChargeMagnitude(Number(e.target.value))} className="w-full accent-purple-400" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => placeCharge(e as unknown as React.MouseEvent<HTMLCanvasElement>, 'positive')}
              className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs text-white transition-colors"
            >
              + Positive
            </button>
            <button
              onClick={(e) => placeCharge(e as unknown as React.MouseEvent<HTMLCanvasElement>, 'negative')}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors"
            >
              − Negative
            </button>
          </div>
          <button
            onClick={clearCharges}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            Clear all
          </button>
          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
            <input type="checkbox" checked={showFieldLines} onChange={e => setShowFieldLines(e.target.checked)} className="accent-purple-400" />
            Show field lines
          </label>
          <div className="mt-2 text-[10px] text-white/30 leading-relaxed">
            <span className="text-red-400">red +</span> = positive charge (attracts −)
            <br />
            <span className="text-blue-400">blue −</span> = negative charge (attracts +)
            <br />
            Field lines: purple, 12 per pair
          </div>
          {/* D3 force strength chart */}
          <div className="mt-2 bg-slate-950/60 rounded-xl p-2 border border-white/5">
            <p className="text-[9px] text-white/25 mb-1 uppercase tracking-wider">Force strength ratio</p>
            <ForceStrengthChart />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 3: Solidity Explainer ─────────────────────────────────────────────
type Material = { name: string; dist_angstrom: number; color: string; desc: string }

const MATERIALS: Material[] = [
  { name: 'Diamond',  dist_angstrom: 1.54,  color: '#60a5fa', desc: 'Covalent bonds, shortest distance' },
  { name: 'Water',   dist_angstrom: 3.10,  color: '#38bdf8', desc: 'Hydrogen bonds, molecules slide' },
  { name: 'Rubber',  dist_angstrom: 5.0,   color: '#fb923c', desc: 'Van der Waals, long chains, flexible' },
  { name: 'Air',     dist_angstrom: 33.0,  color: '#94a3b8', desc: '~100× atomic diameter, mostly empty' },
]

function SolidityExplainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [approach, setApproach] = useState(80) // 0 = far apart, 100 = touching
  const [material, setMaterial] = useState(0)
  const [showElectrons, setShowElectrons] = useState(true)
  const frameRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2 - 20
    const maxDist = w * 0.4
    const dist = maxDist * (1 - approach / 100) * 0.5
    const mat = MATERIALS[material]

    // Normalized distance for physics (angstroms)
    const distAngstrom = (dist / maxDist) * 40 + 0.5

    // Pauli repulsion force (steep at close range)
    const sigma = mat.dist_angstrom
    const pauliRepulsion = distAngstrom < sigma ? Math.exp(-(sigma - distAngstrom) * 3) : 0

    // Background
    ctx.fillStyle = 'rgba(2,6,23,0.95)'
    ctx.fillRect(0, 0, w, h)

    // Draw electron clouds (Gaussian blobs)
    const drawAtom = (ax: number, ay: number, side: 'left' | 'right') => {
      const electronCount = 6
      const cloudRadius = 50 + (dist / maxDist) * 10

      // Cloud base
      const grad = ctx.createRadialGradient(ax, ay, 0, ax, ay, cloudRadius)
      grad.addColorStop(0, side === 'left' ? 'rgba(168,85,247,0.4)' : 'rgba(59,130,246,0.4)')
      grad.addColorStop(0.5, side === 'left' ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(ax, ay, cloudRadius, 0, Math.PI * 2)
      ctx.fill()

      // Nucleus
      ctx.fillStyle = side === 'left' ? '#dc2626' : '#3b82f6'
      ctx.shadowBlur = 8
      ctx.shadowColor = ctx.fillStyle as string
      ctx.beginPath()
      ctx.arc(ax, ay, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Electrons (orbiting)
      if (showElectrons) {
        for (let e = 0; e < electronCount; e++) {
          const angle = frameRef.current * 0.02 + (e / electronCount) * Math.PI * 2
          const er = cloudRadius * 0.6
          const ex = ax + er * Math.cos(angle)
          const ey = ay + er * Math.sin(angle)
          ctx.fillStyle = side === 'left' ? '#a855f7' : '#60a5fa'
          ctx.shadowBlur = 6
          ctx.shadowColor = ctx.fillStyle as string
          ctx.beginPath()
          ctx.arc(ex, ey, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Orbital ring
      ctx.strokeStyle = side === 'left' ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(ax, ay, cloudRadius * 0.6, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw both atoms
    drawAtom(cx - dist, cy, 'left')
    drawAtom(cx + dist, cy, 'right')

    // Pauli exclusion overlap zone
    if (pauliRepulsion > 0.1) {
      const overlapColor = `rgba(249,115,22,${pauliRepulsion * 0.6})`
      const midX = cx
      const midY = cy
      const overlapGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, 60)
      overlapGrad.addColorStop(0, overlapColor)
      overlapGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = overlapGrad
      ctx.beginPath()
      ctx.arc(midX, midY, 60, 0, Math.PI * 2)
      ctx.fill()

      // Pauli force arrows
      const arrowLen = 20 * pauliRepulsion
      ctx.strokeStyle = `rgba(249,115,22,${pauliRepulsion})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx - dist + 55, cy)
      ctx.lineTo(cx - dist + 55 + arrowLen, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + dist - 55, cy)
      ctx.lineTo(cx + dist - 55 - arrowLen, cy)
      ctx.stroke()

      // Force label
      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('PAULI REPULSION', cx, cy - 70)
      ctx.font = '10px monospace'
      ctx.fillStyle = 'rgba(249,115,22,0.8)'
      ctx.fillText('"You cannot occupy the same quantum state"', cx, cy - 55)
    } else if (approach > 20) {
      // Coulomb attraction zone (but not yet Pauli)
      ctx.fillStyle = 'rgba(16,185,129,0.3)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Electron clouds approaching...', cx, cy - 70)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillText('Pauli exclusion kicks in below 0.15 nm', cx, cy - 55)
    } else {
      ctx.fillStyle = 'rgba(148,163,184,0.4)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Atoms far apart — no interaction', cx, cy - 70)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillText(`Distance ≈ ${distAngstrom.toFixed(2)} Å`, cx, cy - 55)
    }

    // Distance indicator
    const barY = h - 80
    const barW = w * 0.6
    const barX = (w - barW) / 2
    ctx.fillStyle = 'rgba(15,23,42,0.8)'
    ctx.fillRect(barX - 10, barY - 15, barW + 20, 50)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.strokeRect(barX - 10, barY - 15, barW + 20, 50)

    // Interatomic distance bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(barX, barY, barW, 6)
    const fillW = barW * approach / 100
    ctx.fillStyle = approach > 60 ? '#f97316' : '#3b82f6'
    ctx.fillRect(barX, barY, fillW, 6)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${distAngstrom.toFixed(2)} Å`, cx, barY + 18)

    // Material comparison markers
    MATERIALS.forEach((m, i) => {
      const markerX = barX + (m.dist_angstrom / 40) * barW
      if (markerX >= barX && markerX <= barX + barW) {
        ctx.fillStyle = m.color
        ctx.beginPath()
        ctx.moveTo(markerX, barY - 4)
        ctx.lineTo(markerX - 3, barY - 8)
        ctx.lineTo(markerX + 3, barY - 8)
        ctx.fill()
      }
    })

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '8px monospace'
    ctx.fillText(`Distance scale: 0 → ${barX}Å → ${(w * 0.4 / barW * 40).toFixed(0)}Å`, cx, barY + 30)

    frameRef.current++
    requestAnimationFrame(draw)
  }, [approach, material, showElectrons])

  useEffect(() => {
    const raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [draw])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Why You Can&apos;t Walk Through Walls</h3>
      <p className="text-white/40 text-xs mb-4">When atoms get close, their electron clouds overlap and the Pauli exclusion principle kicks in — creating what we experience as solidity. Move the slider to watch it happen in real time.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full overflow-x-auto">
          <canvas ref={canvasRef} width={560} height={300} className="mx-auto rounded-xl" style={{ background: '#020617' }} />
        </div>
        <div className="flex flex-col gap-3 lg:w-52">
          <div>
            <label className="text-xs text-white/50 block mb-1">Approach distance: <span className="text-orange-400 font-mono">{approach}%</span></label>
            <input type="range" min="0" max="100" step="1" value={approach} onChange={e => setApproach(Number(e.target.value))} className="w-full accent-orange-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-2">Material</label>
            <div className="flex flex-col gap-1">
              {MATERIALS.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => setMaterial(i)}
                  className={`text-left px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    material === i ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <span style={{ color: m.color }}>●</span> {m.name} ({m.dist_angstrom} Å)
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
            <input type="checkbox" checked={showElectrons} onChange={e => setShowElectrons(e.target.checked)} className="accent-orange-400" />
            Show electrons orbiting
          </label>
          {/* Mechanoreceptor chart */}
          <div className="mt-2 bg-slate-950/60 rounded-xl p-2 border border-white/5">
            <p className="text-[9px] text-white/25 mb-1 uppercase tracking-wider">Mechanoreceptors in skin</p>
            <MechanoreceptorChart />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/25 mt-3 leading-relaxed">
        Your skin contains ~17,000 mechanoreceptors per hand. Each type detects a different aspect of the Pauli repulsion force between your skin atoms and the surface atoms — pressure, texture, vibration, stretch. Pain (nociceptors) fires when forces exceed safe thresholds.
      </p>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type DemoId = 'scale' | 'force' | 'solidity'

export default function AtomicScene() {
  const [active, setActive] = useState<DemoId>('scale')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Phase 2 · Atomic World · Understanding Nature
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Atomic World
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-base">
            You are 99.9999999% empty space. The quantum foundation of the material world — why atoms don&apos;t collapse, why you feel your skin, and why the four fundamental forces are the reason anything exists at all.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {([
            ['scale',     'Scale Journey',    'purple'],
            ['force',     'Force Fields',     'red'],
            ['solidity',  'Why Solidity',     'orange'],
          ] as [DemoId, string, string][]).map(([id, label, color]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={active === id ? {
                backgroundColor: id === 'scale' ? '#7c3aed' : id === 'force' ? '#dc2626' : '#ea580c',
                color: 'white',
              } : {
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Demo panels */}
        <div className="space-y-4">
          {active === 'scale'     && <AtomicScaleJourney />}
          {active === 'force'     && <ForceFieldSimulator />}
          {active === 'solidity' && <SolidityExplainer />}
        </div>

        {/* Blog connections */}
        <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Understanding Life Connections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-purple-400 font-medium mb-1">Empty Space = Chemistry</p>
              <p className="text-white/40 text-xs leading-relaxed">The emptiness of atoms is precisely what makes chemistry possible. Electrons occupying specific orbitals — never the same state — define every molecular bond in your body.</p>
              <a href="/blog/empty-space" className="text-purple-400 text-xs hover:text-purple-300 transition-colors mt-1 inline-block">→ Read: Empty Space</a>
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">Electromagnetism = Sensation</p>
              <p className="text-white/40 text-xs leading-relaxed">Touch is your nervous system reading electrostatic forces. Every sensation — pressure, texture, heat, pain — is electromagnetism translated by mechanoreceptors in your skin.</p>
              <a href="/blog/electric-self" className="text-red-400 text-xs hover:text-red-300 transition-colors mt-1 inline-block">→ Read: Electric Self</a>
            </div>
            <div>
              <p className="text-xs text-orange-400 font-medium mb-1">Four Forces = You</p>
              <p className="text-white/40 text-xs leading-relaxed">Every atom in your body exists because the strong force binds quarks, the weak force forged elements in stars, and gravity and electromagnetism shaped Earth. Remove one — and you disappear.</p>
              <a href="/blog/four-forces" className="text-orange-400 text-xs hover:text-orange-300 transition-colors mt-1 inline-block">→ Read: Four Forces</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
