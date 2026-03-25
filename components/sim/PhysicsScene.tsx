'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── D3: Period vs Length Chart ───────────────────────────────────────────────
function PendulumPeriodChart({ gravity, length }: { gravity: number; length: number }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return

    const w = 380, h = 120, m = { top: 8, right: 16, bottom: 22, left: 36 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    // Map slider length (50-250px) to physics length (0.1-5m)
    const lengthM = ((length - 50) / 200) * 4.9 + 0.1

    const xScale = d3.scaleLinear().domain([0.1, 5]).range([0, iw])
    const tAtCurrent = 2 * Math.PI * Math.sqrt(lengthM / gravity)
    const tMax = 2 * Math.PI * Math.sqrt(5 / 1)
    const yScale = d3.scaleLinear().domain([0, tMax]).range([ih, 0])

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}m`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9')
      })

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => `${d}s`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9')
      })

    // T = 2π√(L/g) curve
    const pts: [number, number][] = []
    for (let L = 0.1; L <= 5; L += 0.05) {
      pts.push([L, 2 * Math.PI * Math.sqrt(L / gravity)])
    }

    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))

    g.append('path')
      .datum(pts)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6)

    // Current point
    g.append('circle')
      .attr('cx', xScale(lengthM))
      .attr('cy', yScale(tAtCurrent))
      .attr('r', 4)
      .attr('fill', '#93c5fd')
      .attr('filter', 'drop-shadow(0 0 4px rgba(147,197,253,0.8))')

    g.append('text')
      .attr('x', xScale(lengthM) + 6)
      .attr('y', yScale(tAtCurrent) - 4)
      .attr('fill', '#93c5fd')
      .attr('font-size', '9')
      .attr('font-family', 'monospace')
      .text(`T=${tAtCurrent.toFixed(2)}s`)

  }, [gravity, length])

  return <svg ref={ref} className="w-full" />
}

// ─── Demo 1: Pendulum Lab ────────────────────────────────────────────────────
function PendulumLab() {
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<number>(0)
  const [gravity, setGravity] = useState(9.8)
  const [length, setLength] = useState(150)
  const [damping, setDamping] = useState(0.99)
  const [running, setRunning] = useState(true)

  const angleRef = useRef(Math.PI / 4)
  const velocityRef = useRef(0)

  useEffect(() => {
    angleRef.current = Math.PI / 4
    velocityRef.current = 0
  }, [gravity, length])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const cx = 200
    const pivotY = 40
    const pivot = { x: cx, y: pivotY }
    const bobRadius = 12

    const dt = 0.016

    const draw = () => {
      if (running) {
        const alpha = (-gravity / length) * Math.sin(angleRef.current)
        velocityRef.current += alpha * dt
        velocityRef.current *= damping
        angleRef.current += velocityRef.current * dt
      }

      const bobX = pivot.x + length * Math.sin(angleRef.current)
      const bobY = pivot.y + length * Math.cos(angleRef.current)

      const svgNS = 'http://www.w3.org/2000/svg'
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      // Trail
      const trailSteps = 40
      for (let t = 0; t < trailSteps; t++) {
        const trailAngle = angleRef.current - velocityRef.current * t * 0.02
        const tx = pivot.x + length * Math.sin(trailAngle)
        const ty = pivot.y + length * Math.cos(trailAngle)
        const alpha = (1 - t / trailSteps) * 0.4
        const trail = document.createElementNS(svgNS, 'circle')
        trail.setAttribute('cx', String(tx))
        trail.setAttribute('cy', String(ty))
        trail.setAttribute('r', String(bobRadius * 0.4 * (1 - t / trailSteps)))
        trail.setAttribute('fill', `rgba(59,130,246,${alpha})`)
        svg.appendChild(trail)
      }

      // String
      const line = document.createElementNS(svgNS, 'line')
      line.setAttribute('x1', String(pivot.x))
      line.setAttribute('y1', String(pivot.y))
      line.setAttribute('x2', String(bobX))
      line.setAttribute('y2', String(bobY))
      line.setAttribute('stroke', 'rgba(255,255,255,0.6)')
      line.setAttribute('stroke-width', '2')
      svg.appendChild(line)

      // Pivot
      const pivotEl = document.createElementNS(svgNS, 'circle')
      pivotEl.setAttribute('cx', String(pivot.x))
      pivotEl.setAttribute('cy', String(pivot.y))
      pivotEl.setAttribute('r', '5')
      pivotEl.setAttribute('fill', '#ffffff')
      svg.appendChild(pivotEl)

      // Bob
      const grad = document.createElementNS(svgNS, 'radialGradient')
      grad.setAttribute('id', 'bobGrad')
      const stop1 = document.createElementNS(svgNS, 'stop')
      stop1.setAttribute('offset', '0%')
      stop1.setAttribute('stop-color', '#93c5fd')
      const stop2 = document.createElementNS(svgNS, 'stop')
      stop2.setAttribute('offset', '100%')
      stop2.setAttribute('stop-color', '#3b82f6')
      grad.appendChild(stop1)
      grad.appendChild(stop2)
      const defs = document.createElementNS(svgNS, 'defs')
      defs.appendChild(grad)
      svg.insertBefore(defs, svg.firstChild)

      const bob = document.createElementNS(svgNS, 'circle')
      bob.setAttribute('cx', String(bobX))
      bob.setAttribute('cy', String(bobY))
      bob.setAttribute('r', String(bobRadius))
      bob.setAttribute('fill', 'url(#bobGrad)')
      bob.setAttribute('filter', 'drop-shadow(0 0 6px rgba(59,130,246,0.8))')
      svg.appendChild(bob)

      // Energy bars
      const ke = 0.5 * velocityRef.current ** 2
      const pe = -gravity * length * (Math.cos(angleRef.current) - 1)
      const te = ke + pe

      const barY = 260
      const barW = 120
      const barH = 10
      const maxE = gravity * length * 2

      const keBar = document.createElementNS(svgNS, 'rect')
      keBar.setAttribute('x', String(cx - barW / 2))
      keBar.setAttribute('y', String(barY))
      keBar.setAttribute('width', String(Math.min(ke / maxE, 1) * barW))
      keBar.setAttribute('height', String(barH))
      keBar.setAttribute('fill', '#f97316')
      svg.appendChild(keBar)

      const peBar = document.createElementNS(svgNS, 'rect')
      peBar.setAttribute('x', String(cx - barW / 2))
      peBar.setAttribute('y', String(barY + barH + 2))
      peBar.setAttribute('width', String(Math.min(Math.abs(pe) / maxE, 1) * barW))
      peBar.setAttribute('height', String(barH))
      peBar.setAttribute('fill', '#22c55e')
      svg.appendChild(peBar)

      const labelStyle = { fontSize: '10', fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }

      const keLabel = document.createElementNS(svgNS, 'text')
      keLabel.setAttribute('x', String(cx + barW / 2 + 4))
      keLabel.setAttribute('y', String(barY + 8))
      Object.entries(labelStyle).forEach(([k, v]) => keLabel.setAttribute(k, v))
      keLabel.textContent = `KE: ${ke.toFixed(1)}`
      svg.appendChild(keLabel)

      const peLabel = document.createElementNS(svgNS, 'text')
      peLabel.setAttribute('x', String(cx + barW / 2 + 4))
      peLabel.setAttribute('y', String(barY + barH + 10))
      Object.entries(labelStyle).forEach(([k, v]) => peLabel.setAttribute(k, v))
      peLabel.textContent = `PE: ${pe.toFixed(1)}`
      svg.appendChild(peLabel)

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gravity, length, damping, running])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Pendulum Lab</h3>
      <p className="text-white/40 text-xs mb-4">Simple harmonic motion — the heartbeat of physical law. Adjust parameters and watch energy trade between kinetic and potential.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full overflow-x-auto rounded-xl bg-slate-950/80 pb-2">
          <svg ref={svgRef} width="400" height="320" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-3 lg:w-48">
          <div>
            <label className="text-xs text-white/50 block mb-1">Gravity: <span className="text-blue-400 font-mono">{gravity.toFixed(1)} m/s²</span></label>
            <input type="range" min="1" max="20" step="0.1" value={gravity} onChange={e => setGravity(Number(e.target.value))} className="w-full accent-blue-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Length: <span className="text-blue-400 font-mono">{length}px</span></label>
            <input type="range" min="50" max="250" step="5" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-blue-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Damping: <span className="text-blue-400 font-mono">{(1 - damping) * 100}%/frame</span></label>
            <input type="range" min="0.9" max="1" step="0.001" value={damping} onChange={e => setDamping(Number(e.target.value))} className="w-full accent-blue-400" />
          </div>
          <button
            onClick={() => { angleRef.current = Math.PI / 3; velocityRef.current = 0 }}
            className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            Release from 60°
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors"
          >
            {running ? 'Pause' : 'Resume'}
          </button>
          <div className="mt-2 text-[10px] text-white/30 leading-relaxed">
            <span className="text-orange-400">KE</span> = kinetic energy (orange)
            <br />
            <span className="text-green-400">PE</span> = potential energy (green)
          </div>
        </div>
      </div>

      {/* D3 Period vs Length Chart */}
      <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-white/5">
        <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Period vs Length (T = 2π√(L/g))</p>
        <PendulumPeriodChart gravity={gravity} length={length} />
      </div>
    </div>
  )
}

// ─── Demo 2: Wave Superposition ────────────────────────────────────────────
function WaveSuperposition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [amplitude, setAmplitude] = useState(60)
  const [frequency, setFrequency] = useState(3)
  const [numWaves, setNumWaves] = useState(2)
  const [phaseOffset, setPhaseOffset] = useState(0)
  const animRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  const drawWaves = useCallback((t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

    // Wave sources
    const sources = Array.from({ length: numWaves }, (_, i) => ({
      x: w / (numWaves + 1) * (i + 1),
      y: h / 2,
      phase: (i * phaseOffset * Math.PI) / numWaves,
    }))

    // Draw individual waves (faded)
    sources.forEach((src, i) => {
      ctx.beginPath()
      ctx.strokeStyle = `rgba(255,255,255,0.08)`
      ctx.lineWidth = 1
      for (let x = 0; x < w; x++) {
        const y = h / 2 + amplitude * Math.sin(frequency * ((x - src.x) / w) * Math.PI * 2 + t + src.phase)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Source dot
      ctx.beginPath()
      ctx.arc(src.x, src.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(34,${197 + i * 20},${94},0.6)`
      ctx.fill()
    })

    // Sum wave
    ctx.beginPath()
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 8
    ctx.shadowColor = '#22d3ee'
    for (let x = 0; x < w; x++) {
      const sum = sources.reduce((acc, src) => {
        return acc + amplitude * Math.sin(frequency * ((x - src.x) / w) * Math.PI * 2 + t + src.phase)
      }, 0)
      const y = h / 2 + sum / numWaves
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Sum wave fill
    ctx.beginPath()
    ctx.fillStyle = 'rgba(34,211,238,0.05)'
    ctx.lineTo(w, h / 2); ctx.lineTo(w, h)
    ctx.lineTo(0, h); ctx.lineTo(0, h / 2)
    for (let x = 0; x < w; x++) {
      const sum = sources.reduce((acc, src) => {
        return acc + amplitude * Math.sin(frequency * ((x - src.x) / w) * Math.PI * 2 + t + src.phase)
      }, 0)
      const y = h / 2 + sum / numWaves
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.fill()

    timeRef.current = t
  }, [amplitude, frequency, numWaves, phaseOffset])

  useEffect(() => {
    let start = 0
    const animate = (ts: number) => {
      if (!start) start = ts
      const t = (ts - start) / 1000
      drawWaves(t * 2)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [drawWaves])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Wave Superposition</h3>
      <p className="text-white/40 text-xs mb-4">Where two waves meet, they add. Constructive interference amplifies; destructive cancels. This is how your ears separate voices in a crowded room.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full overflow-x-auto rounded-xl bg-slate-950/80 pb-2">
          <canvas ref={canvasRef} width="600" height="280" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-3 lg:w-48">
          <div>
            <label className="text-xs text-white/50 block mb-1">Amplitude: <span className="text-cyan-400 font-mono">{amplitude}px</span></label>
            <input type="range" min="10" max="100" step="5" value={amplitude} onChange={e => setAmplitude(Number(e.target.value))} className="w-full accent-cyan-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Frequency: <span className="text-cyan-400 font-mono">{frequency}</span></label>
            <input type="range" min="1" max="8" step="0.5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-cyan-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Wave sources: <span className="text-cyan-400 font-mono">{numWaves}</span></label>
            <input type="range" min="1" max="5" step="1" value={numWaves} onChange={e => setNumWaves(Number(e.target.value))} className="w-full accent-cyan-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Phase offset: <span className="text-cyan-400 font-mono">{phaseOffset}π</span></label>
            <input type="range" min="0" max="2" step="0.1" value={phaseOffset} onChange={e => setPhaseOffset(Number(e.target.value))} className="w-full accent-cyan-400" />
          </div>
          <div className="mt-2 text-[10px] text-white/30 leading-relaxed">
            <span className="text-cyan-400">cyan</span> = sum wave (result)
            <br />
            dashed = individual waves
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 3: Spring-Mass Oscillator ────────────────────────────────────────
function SpringMassOscillator() {
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<number>(0)
  const phaseRef = useRef<HTMLCanvasElement>(null)
  const phaseHistory = useRef<[number, number][]>([])
  const [springK, setSpringK] = useState(0.3)
  const [mass, setMass] = useState(2)
  const [dampingRatio, setDampingRatio] = useState(0.1)
  const posRef = useRef<number>(0)
  const velRef = useRef<number>(0)

  const reset = useCallback(() => {
    posRef.current = 100
    velRef.current = 0
    phaseHistory.current = []
  }, [])

  useEffect(() => {
    reset()
  }, [springK, mass, dampingRatio, reset])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const svgNS = 'http://www.w3.org/2000/svg'
    const anchorX = 300
    const anchorY = 60
    const restLength = 120
    const maxDisp = 180

    const dt = 0.016

    const draw = () => {
      const force = -springK * posRef.current - dampingRatio * velRef.current
      velRef.current += (force / mass) * dt
      posRef.current += velRef.current * dt

      const bobY = anchorY + restLength + posRef.current
      const bobSize = 12 + mass * 4

      while (svg.firstChild) svg.removeChild(svg.firstChild)

      // Defs
      const defs = document.createElementNS(svgNS, 'defs')
      const grad = document.createElementNS(svgNS, 'radialGradient')
      grad.setAttribute('id', 'springBob')
      const s1 = document.createElementNS(svgNS, 'stop')
      s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#fca5a5')
      const s2 = document.createElementNS(svgNS, 'stop')
      s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#ef4444')
      grad.appendChild(s1); grad.appendChild(s2)
      defs.appendChild(grad)
      svg.appendChild(defs)

      // Wall
      const wall = document.createElementNS(svgNS, 'rect')
      wall.setAttribute('x', String(anchorX - 30))
      wall.setAttribute('y', String(anchorY - 10))
      wall.setAttribute('width', '60')
      wall.setAttribute('height', '10')
      wall.setAttribute('fill', '#64748b')
      svg.appendChild(wall)

      // Spring coil
      const springSegments = 16
      const coilHeight = bobY - anchorY
      let springPath = `M ${anchorX} ${anchorY}`
      for (let i = 0; i <= springSegments; i++) {
        const y = anchorY + (coilHeight * i) / springSegments
        const x = anchorX + (i % 2 === 0 ? -12 : 12)
        springPath += ` L ${x} ${y}`
      }
      springPath += ` L ${anchorX} ${bobY - bobSize / 2}`

      const springPathEl = document.createElementNS(svgNS, 'path')
      springPathEl.setAttribute('d', springPath)
      springPathEl.setAttribute('stroke', '#94a3b8')
      springPathEl.setAttribute('stroke-width', '2')
      springPathEl.setAttribute('fill', 'none')
      svg.appendChild(springPathEl)

      // Mass bob
      const bob = document.createElementNS(svgNS, 'circle')
      bob.setAttribute('cx', String(anchorX))
      bob.setAttribute('cy', String(bobY))
      bob.setAttribute('r', String(bobSize))
      bob.setAttribute('fill', 'url(#springBob)')
      bob.setAttribute('filter', 'drop-shadow(0 0 8px rgba(239,68,68,0.6))')
      svg.appendChild(bob)

      // Mass label
      const massLabel = document.createElementNS(svgNS, 'text')
      massLabel.setAttribute('x', String(anchorX))
      massLabel.setAttribute('y', String(bobY + 4))
      massLabel.setAttribute('text-anchor', 'middle')
      massLabel.setAttribute('font-size', '10')
      massLabel.setAttribute('fill', 'white')
      massLabel.setAttribute('font-family', 'monospace')
      massLabel.textContent = `${mass}kg`
      svg.appendChild(massLabel)

      // Equilibrium line (dashed)
      const eqY = anchorY + restLength
      const eqLine = document.createElementNS(svgNS, 'line')
      eqLine.setAttribute('x1', String(anchorX - 100))
      eqLine.setAttribute('y1', String(eqY))
      eqLine.setAttribute('x2', String(anchorX + 100))
      eqLine.setAttribute('y2', String(eqY))
      eqLine.setAttribute('stroke', 'rgba(255,255,255,0.1)')
      eqLine.setAttribute('stroke-dasharray', '4 4')
      svg.appendChild(eqLine)

      // Displacement bar
      const barH = Math.abs(posRef.current)
      const barX = anchorX + 50
      const barY = Math.min(eqY, bobY)
      const dispBar = document.createElementNS(svgNS, 'rect')
      dispBar.setAttribute('x', String(barX))
      dispBar.setAttribute('y', String(barY))
      dispBar.setAttribute('width', '6')
      dispBar.setAttribute('height', String(barH))
      dispBar.setAttribute('fill', posRef.current > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)')
      svg.appendChild(dispBar)

      // Stats
      const statsY = 300
      const period = (2 * Math.PI / Math.sqrt(springK / mass)).toFixed(2)
      const freq = (1 / parseFloat(period)).toFixed(3)

      const stats = [
        `x = ${posRef.current.toFixed(1)}px`,
        `v = ${velRef.current.toFixed(1)}`,
        `T = ${period}s`,
        `f = ${freq}Hz`,
      ]
      stats.forEach((stat, i) => {
        const t = document.createElementNS(svgNS, 'text')
        t.setAttribute('x', '20')
        t.setAttribute('y', String(statsY + i * 14))
        t.setAttribute('font-size', '11')
        t.setAttribute('fill', 'rgba(255,255,255,0.4)')
        t.setAttribute('font-family', 'monospace')
        t.textContent = stat
        svg.appendChild(t)
      })

      // Energy bars (KE and PE)
      const ke = 0.5 * mass * velRef.current ** 2
      const pe = 0.5 * springK * posRef.current ** 2
      const maxE = 0.5 * mass * (180 / dt) ** 2 + 0.5 * springK * 180 ** 2
      const barY2 = statsY + 60
      const barW2 = 100
      const barH2 = 8
      const keBar2 = document.createElementNS(svgNS, 'rect')
      keBar2.setAttribute('x', String(anchorX - barW2 / 2))
      keBar2.setAttribute('y', String(barY2))
      keBar2.setAttribute('width', String(Math.min(ke / maxE, 1) * barW2))
      keBar2.setAttribute('height', String(barH2))
      keBar2.setAttribute('fill', '#f97316')
      svg.appendChild(keBar2)
      const peBar2 = document.createElementNS(svgNS, 'rect')
      peBar2.setAttribute('x', String(anchorX - barW2 / 2))
      peBar2.setAttribute('y', String(barY2 + barH2 + 2))
      peBar2.setAttribute('width', String(Math.min(pe / maxE, 1) * barW2))
      peBar2.setAttribute('height', String(barH2))
      peBar2.setAttribute('fill', '#22c55e')
      svg.appendChild(peBar2)
      const keLabel2 = document.createElementNS(svgNS, 'text')
      keLabel2.setAttribute('x', String(anchorX + barW2 / 2 + 4))
      keLabel2.setAttribute('y', String(barY2 + 7))
      keLabel2.setAttribute('font-size', '9')
      keLabel2.setAttribute('fill', 'rgba(255,255,255,0.4)')
      keLabel2.setAttribute('font-family', 'monospace')
      keLabel2.textContent = `KE`
      svg.appendChild(keLabel2)
      const peLabel2 = document.createElementNS(svgNS, 'text')
      peLabel2.setAttribute('x', String(anchorX + barW2 / 2 + 4))
      peLabel2.setAttribute('y', String(barY2 + barH2 + 9))
      peLabel2.setAttribute('font-size', '9')
      peLabel2.setAttribute('fill', 'rgba(255,255,255,0.4)')
      peLabel2.setAttribute('font-family', 'monospace')
      peLabel2.textContent = `PE`
      svg.appendChild(peLabel2)

      // Phase space plot
      const phaseCanvas = phaseRef.current
      if (phaseCanvas) {
        const pCtx = phaseCanvas.getContext('2d')
        if (pCtx) {
          pCtx.fillStyle = 'rgba(15,23,42,0.3)'
          pCtx.fillRect(0, 0, phaseCanvas.width, phaseCanvas.height)
          // Axes
          pCtx.strokeStyle = 'rgba(255,255,255,0.08)'
          pCtx.lineWidth = 1
          pCtx.beginPath()
          pCtx.moveTo(phaseCanvas.width / 2, 0)
          pCtx.lineTo(phaseCanvas.width / 2, phaseCanvas.height)
          pCtx.moveTo(0, phaseCanvas.height / 2)
          pCtx.lineTo(phaseCanvas.width, phaseCanvas.height / 2)
          pCtx.stroke()
          // Axis labels
          pCtx.fillStyle = 'rgba(255,255,255,0.2)'
          pCtx.font = '8px monospace'
          pCtx.fillText('v', 4, 10)
          pCtx.fillText('x', phaseCanvas.width - 10, phaseCanvas.height - 4)
          // Track history
          phaseHistory.current.push([posRef.current, velRef.current])
          if (phaseHistory.current.length > 300) phaseHistory.current.shift()
          const pts = phaseHistory.current
          if (pts.length > 1) {
            const xRange = 180, vRange = 180 / 0.016
            for (let i = 1; i < pts.length; i++) {
              const alpha = i / pts.length
              pCtx.beginPath()
              pCtx.strokeStyle = `rgba(239,68,68,${alpha * 0.7})`
              pCtx.lineWidth = 1
              const x1 = (pts[i - 1][0] / xRange + 1) * phaseCanvas.width / 2
              const y1 = (-pts[i - 1][1] / vRange + 1) * phaseCanvas.height / 2
              const x2 = (pts[i][0] / xRange + 1) * phaseCanvas.width / 2
              const y2 = (-pts[i][1] / vRange + 1) * phaseCanvas.height / 2
              pCtx.moveTo(x1, y1)
              pCtx.lineTo(x2, y2)
              pCtx.stroke()
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [springK, mass, dampingRatio])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Spring-Mass Oscillator</h3>
      <p className="text-white/40 text-xs mb-4">Hooke&apos;s law in action — the same physics governing a heart chamber filling, a building swaying in wind, and atoms vibrating in molecules.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full overflow-x-auto rounded-xl bg-slate-950/80 pb-2">
          <svg ref={svgRef} width="400" height="420" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Phase Space (x vs v)</p>
            <canvas ref={phaseRef} width="120" height="120" className="rounded-lg" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }} />
          </div>
          <div className="text-[10px] text-white/30 leading-relaxed mt-1">
            <span className="text-orange-400">KE</span> = kinetic energy (orange)
            <br />
            <span className="text-green-400">PE</span> = potential energy (green)
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:w-48">
          <div>
            <label className="text-xs text-white/50 block mb-1">Spring constant (k): <span className="text-red-400 font-mono">{springK.toFixed(2)}</span></label>
            <input type="range" min="0.05" max="1" step="0.01" value={springK} onChange={e => setSpringK(Number(e.target.value))} className="w-full accent-red-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Mass: <span className="text-red-400 font-mono">{mass}kg</span></label>
            <input type="range" min="0.5" max="5" step="0.1" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full accent-red-400" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Damping: <span className="text-red-400 font-mono">{dampingRatio.toFixed(2)}</span></label>
            <input type="range" min="0" max="0.5" step="0.01" value={dampingRatio} onChange={e => setDampingRatio(Number(e.target.value))} className="w-full accent-red-400" />
          </div>
          <button
            onClick={reset}
            className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            Pull & Release
          </button>
          <div className="mt-2 text-[10px] text-white/30 leading-relaxed">
            <span className="text-red-400">red</span> = stretched (v &gt; 0)
            <br />
            <span className="text-green-400">green</span> = compressed (v &lt; 0)
            <br />
            T = 2π√(m/k) · f = 1/T
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Physics Page ───────────────────────────────────────────────────────
type DemoId = 'pendulum' | 'waves' | 'spring'

export default function PhysicsScene() {
  const [active, setActive] = useState<DemoId>('pendulum')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Phase 2 · Physics · Understanding Life
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Physics Simulations
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-base">
            Physical laws govern everything alive. These three simulations explore the foundational patterns — oscillation, interference, and harmonic motion — that echo through biological systems from cells to ecosystems.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {([
            ['pendulum', 'Pendulum Lab', 'blue'],
            ['waves', 'Wave Superposition', 'cyan'],
            ['spring', 'Spring-Mass Oscillator', 'red'],
          ] as [DemoId, string, string][]).map(([id, label, color]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                active === id
                  ? `bg-${color}-600 text-white`
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
              style={active !== id ? {} : {
                backgroundColor: id === 'pendulum' ? '#2563eb' : id === 'waves' ? '#0891b2' : '#dc2626',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Demo panels */}
        <div className="space-y-4">
          {active === 'pendulum' && <PendulumLab />}
          {active === 'waves' && <WaveSuperposition />}
          {active === 'spring' && <SpringMassOscillator />}
        </div>

        {/* Understanding Life connection */}
        <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Understanding Life Connections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-blue-400 font-medium mb-1">Circadian Rhythms</p>
              <p className="text-white/40 text-xs leading-relaxed">The pendulum&apos;s natural period inspired Huygens — and your body&apos;s master clock runs on similar cycles. Every cell in your body has molecular oscillators that tick roughly every 24 hours.</p>
            </div>
            <div>
              <p className="text-xs text-cyan-400 font-medium mb-1">Neural Waves</p>
              <p className="text-white/40 text-xs leading-relaxed">When sound waves from multiple sources reach your ears, your brain performs superposition to locate each sound. The same mathematics governs EEG brain wave analysis.</p>
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">Muscle Springs</p>
              <p className="text-white/40 text-xs leading-relaxed">Tendons act like springs — they store elastic energy when stretched and release it. The spring-mass equation describes how your legs spring you forward with remarkable efficiency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
