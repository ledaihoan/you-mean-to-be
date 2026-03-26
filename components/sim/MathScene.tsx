'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── Demo 1: Function Grapher ────────────────────────────────────────────────
function FunctionGrapher() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [terms, setTerms] = useState([
    { type: 'sin', amp: 1, freq: 1, phase: 0, offset: 0, color: '#3b82f6', enabled: true },
    { type: 'sin', amp: 0.5, freq: 3, phase: 0, offset: 0, color: '#f97316', enabled: true },
    { type: 'sin', amp: 0, freq: 5, phase: 0, offset: 0, color: '#22c55e', enabled: false },
  ])

  const evalAt = useCallback((x: number) => {
    let sum = 0
    terms.forEach(t => {
      if (!t.enabled && t.type !== 'exp') return
      switch (t.type) {
        case 'sin': sum += t.amp * Math.sin(t.freq * x + t.phase); break
        case 'cos': sum += t.amp * Math.cos(t.freq * x + t.phase); break
        case 'poly': sum += t.amp * x * x; break
        case 'exp': sum += t.amp * Math.exp(x / t.freq); break
      }
    })
    return sum + terms.reduce((acc, t) => acc + (t.enabled ? t.offset : 0), 0)
  }, [terms])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    const cx = w / 2, cy = h / 2
    const scaleX = w / (Math.PI * 4)
    const scaleY = h / 8

    ctx.clearRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = -4; i <= 4; i++) {
      const x = cx + i * (w / 8)
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      const y = cy + i * (h / 8)
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke()

    // Tick labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = '10px monospace'
    for (let i = -4; i <= 4; i++) {
      const label = i === 0 ? '0' : `${i}π`
      ctx.fillText(label, cx + i * (w / 8) - 6, cy + 14)
    }

    // Sum curve
    ctx.beginPath()
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 6
    ctx.shadowColor = '#a855f7'
    for (let px = 0; px < w; px++) {
      const x = (px - cx) / scaleX
      const y = cy - evalAt(x) * scaleY
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Individual curves
    terms.forEach(t => {
      if (!t.enabled) return
      ctx.globalAlpha = 0.25
      ctx.beginPath()
      ctx.strokeStyle = t.color
      ctx.lineWidth = 1.5
      for (let px = 0; px < w; px++) {
        const x = (px - cx) / scaleX
        let y: number
        switch (t.type) {
          case 'sin': y = cy - t.amp * Math.sin(t.freq * x + t.phase) * scaleY; break
          case 'cos': y = cy - t.amp * Math.cos(t.freq * x + t.phase) * scaleY; break
          case 'poly': y = cy - t.amp * x * x * scaleY / 4; break
          case 'exp': y = cy - t.amp * Math.exp(x / 3) * scaleY / 4; break
          default: y = cy
        }
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    })

  }, [terms, evalAt])

  const toggle = (i: number) => setTerms(ts => ts.map((t, idx) => idx === i ? { ...t, enabled: !t.enabled } : t))
  const update = (i: number, key: string, val: number) => setTerms(ts => ts.map((t, idx) => idx === i ? { ...t, [key]: val } : t))

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Function Grapher</h3>
      <p className="text-white/40 text-xs mb-4">Stack sine, cosine, polynomial, and exponential terms. Watch the purple sum curve emerge in real time.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full rounded-xl bg-slate-950/80 overflow-x-auto pb-2">
          <canvas ref={canvasRef} width="600" height="300" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-2 lg:w-52 overflow-y-auto max-h-[360px] pr-1">
          {terms.map((t, i) => (
            <div key={i} className={`rounded-lg p-2 border transition-colors ${t.enabled ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between mb-2">
                <select
                  value={t.type}
                  onChange={e => setTerms(ts => ts.map((x, idx) => idx === i ? { ...x, type: e.target.value } : x))}
                  className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-white/10 outline-none"
                >
                  <option value="sin">sin</option>
                  <option value="cos">cos</option>
                  <option value="poly">x²</option>
                  <option value="exp">eˣ</option>
                </select>
                <button onClick={() => toggle(i)} className={`text-xs px-2 py-0.5 rounded border ${t.enabled ? 'border-purple-500/50 text-purple-400' : 'border-white/10 text-white/30'}`}>
                  {t.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {t.enabled && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-white/30 w-8">amp</span>
                    <input type="range" min="0" max="2" step="0.05" value={t.amp} onChange={e => update(i, 'amp', Number(e.target.value))} className="flex-1 accent-purple-400" />
                    <span className="text-[9px] text-white/40 font-mono w-10 text-right">{t.amp.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-white/30 w-8">freq</span>
                    <input type="range" min="1" max="10" step="0.5" value={t.freq} onChange={e => update(i, 'freq', Number(e.target.value))} className="flex-1 accent-purple-400" />
                    <span className="text-[9px] text-white/40 font-mono w-10 text-right">{t.freq.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-white/30 w-8">phase</span>
                    <input type="range" min="-3.14" max="3.14" step="0.1" value={t.phase} onChange={e => update(i, 'phase', Number(e.target.value))} className="flex-1 accent-purple-400" />
                    <span className="text-[9px] text-white/40 font-mono w-10 text-right">{t.phase.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Demo 2: Fibonacci + Golden Spiral ─────────────────────────────────────
function FibonacciExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [depth, setDepth] = useState(12)
  const [animFrame, setAnimFrame] = useState(0)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const [phi, setPhi] = useState(0)
  const [fibs, setFibs] = useState<number[]>([])

  const PHI = (1 + Math.sqrt(5)) / 2

  useEffect(() => {
    // Fibonacci sequence
    const seq: number[] = [1, 1]
    for (let i = 2; i <= depth; i++) seq.push(seq[i - 1] + seq[i - 2])
    setFibs(seq)
    setPhi(seq[seq.length - 1] / seq[seq.length - 2])
  }, [depth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    const size = Math.min(w, h) - 20
    const ox = (w - size) / 2, oy = (h - size) / 2

    let frame = 0
    const maxFrames = depth * 6

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = 'rgba(15,23,42,0.1)'
      ctx.fillRect(0, 0, w, h)

      const seq: number[] = [1, 1]
      for (let i = 2; i <= depth; i++) seq.push(seq[i - 1] + seq[i - 2])
      const max = seq[seq.length - 1]

      const colors = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#06b6d4', '#eab308']

      // Draw squares + arcs
      let x = ox, y = oy
      let dir = 0 // 0=right, 1=down, 2=left, 3=up

      const drawArc = (cx: number, cy: number, r: number, d: number) => {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(147,197,253,0.6)`
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 3
        ctx.shadowColor = '#93c5fd'
        const sa = d === 0 ? -Math.PI / 2 : d === 1 ? 0 : d === 2 ? Math.PI / 2 : Math.PI
        ctx.arc(cx, cy, r, sa, sa + Math.PI / 2)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      for (let i = 0; i < Math.min(depth, frame / 6 + 1); i++) {
        const s = (seq[i] / max) * size
        const color = colors[i % colors.length]

        // Square
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6
        ctx.strokeRect(x, y, s, s)
        ctx.globalAlpha = 0.15
        ctx.fillStyle = color
        ctx.fillRect(x, y, s, s)
        ctx.globalAlpha = 1

        // Number
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = `${Math.max(8, Math.min(14, s / 4))}px monospace`
        ctx.fillText(`${seq[i]}`, x + s / 2 - 8, y + s / 2 + 4)

        // Arc
        const cx = dir === 0 ? x : dir === 2 ? x + s : x + s
        const cy = dir === 1 ? y : dir === 3 ? y + s : y + s
        const arcCX = dir === 0 ? x : dir === 2 ? x + s : x + s / 2
        const arcCY = dir === 1 ? y : dir === 3 ? y + s : y + s / 2
        if (i <= frame / 6) drawArc(arcCX, arcCY, s, dir)

        // Move
        if (dir === 0) { y += s }
        else if (dir === 1) { x -= s }
        else if (dir === 2) { y -= s }
        else { x += s }
        dir = (dir + 1) % 4
      }

      frame++
      if (frame > maxFrames) frame = 0
      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [depth, animFrame])

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Fibonacci + Golden Spiral</h3>
      <p className="text-white/40 text-xs mb-4">Nature&apos;s favorite sequence: 1, 1, 2, 3, 5, 8, 13... Each square&apos;s side length is the sum of the previous two. The ratio of consecutive terms approaches φ = 1.618.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full rounded-xl bg-slate-950/80 overflow-hidden pb-2">
          <canvas ref={canvasRef} width="380" height="380" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-3 lg:w-48">
          <div>
            <label className="text-xs text-white/50 block mb-1">Sequence depth: <span className="text-yellow-400 font-mono">{depth}</span></label>
            <input type="range" min="1" max="16" step="1" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full accent-yellow-400" />
          </div>
          <button
            onClick={() => setAnimFrame(f => f + 1)}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs text-white transition-colors"
          >
            Replay
          </button>
          <div className="bg-slate-950/60 rounded-lg p-2 border border-white/5">
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Golden Ratio</p>
            <p className="text-xl font-mono text-yellow-400">φ = {phi.toFixed(6)}</p>
            <p className="text-[9px] text-white/30 mt-1">(1 + √5) / 2 = 1.618034...</p>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-2 border border-white/5">
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Sequence</p>
            <div className="flex flex-wrap gap-1">
              {fibs.slice(0, 10).map((n, i) => (
                <span key={i} className="text-[9px] font-mono text-white/50">{n}</span>
              ))}
              {fibs.length > 10 && <span className="text-[9px] text-white/20">...</span>}
            </div>
          </div>
          <div className="text-[10px] text-white/30 leading-relaxed mt-1">
            F(n) = F(n-1) + F(n-2)
            <br />
            Ratio → φ as n → ∞
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 3: Mandelbrot Explorer ─────────────────────────────────────────────
function MandelbrotExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [maxIter, setMaxIter] = useState(80)
  const [zoomLevel, setZoomLevel] = useState(1)
  const centerRef = useRef({ x: -0.5, y: 0 })
  const [stats, setStats] = useState({ cx: -0.5, cy: 0, zoom: 1 })

  const drawMandelbrot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    const img = ctx.createImageData(w, h)
    const data = img.data
    const max = maxIter
    const zoom = zoomLevel

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x0 = centerRef.current.x + (px - w / 2) / (w * zoom)
        const y0 = centerRef.current.y + (py - h / 2) / (h * zoom)
        let x = 0, y = 0, iter = 0
        while (x * x + y * y <= 4 && iter < max) {
          const xt = x * x - y * y + x0
          y = 2 * x * y + y0
          x = xt
          iter++
        }
        const idx = (py * w + px) * 4
        if (iter === max) {
          data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 10; data[idx + 3] = 255
        } else {
          const t = iter / max
          const hue = 200 + t * 160
          const sat = 80
          const light = 10 + t * 50
          const rgb = hslToRgb(hue, sat, light)
          data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2]; data[idx + 3] = 255
        }
      }
    }
    ctx.putImageData(img, 0, 0)
    setStats({ cx: centerRef.current.x, cy: centerRef.current.y, zoom: zoomLevel })
  }, [maxIter, zoomLevel])

  useEffect(() => { drawMandelbrot() }, [drawMandelbrot])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const px = (e.clientX - rect.left) * (canvas.width / rect.width)
    const py = (e.clientY - rect.top) * (canvas.height / rect.height)
    const w = canvas.width, h = canvas.height
    centerRef.current.x += (px - w / 2) / (w * zoomLevel)
    centerRef.current.y += (py - h / 2) / (h * zoomLevel)
    setZoomLevel(z => z * 2)
  }

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Mandelbrot Explorer</h3>
      <p className="text-white/40 text-xs mb-4">Click anywhere on the fractal to zoom in 2×. The infinite complexity emerges from one simple rule: z = z² + c. Each color represents how quickly (or slowly) points escape to infinity.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full rounded-xl bg-slate-950/80 overflow-hidden pb-2">
          <canvas
            ref={canvasRef}
            width="380"
            height="380"
            className="mx-auto cursor-crosshair"
            onClick={handleClick}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-48">
          <div>
            <label className="text-xs text-white/50 block mb-1">Max iterations: <span className="text-pink-400 font-mono">{maxIter}</span></label>
            <input type="range" min="20" max="200" step="10" value={maxIter} onChange={e => setMaxIter(Number(e.target.value))} className="w-full accent-pink-400" />
            <p className="text-[9px] text-white/20 mt-0.5">Higher = more detail, slower</p>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Zoom: <span className="text-pink-400 font-mono">{zoomLevel.toFixed(1)}×</span></label>
            <input type="range" min="1" max="256" step="1" value={zoomLevel} onChange={e => setZoomLevel(Number(e.target.value))} className="w-full accent-pink-400" />
          </div>
          <button
            onClick={() => { centerRef.current = { x: -0.5, y: 0 }; setZoomLevel(1) }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-white/70 transition-colors"
          >
            Reset View
          </button>
          <div className="bg-slate-950/60 rounded-lg p-2 border border-white/5">
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Center</p>
            <p className="text-xs font-mono text-white/50">x: {stats.cx.toFixed(8)}</p>
            <p className="text-xs font-mono text-white/50">y: {stats.cy.toFixed(8)}</p>
          </div>
          <div className="text-[10px] text-white/30 leading-relaxed">
            z = z² + c
            <br />
            Click to zoom in 2×
            <br />
            {maxIter} iterations
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 4: Fourier Waveform Builder ───────────────────────────────────────
function FourierWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [harmonics, setHarmonics] = useState([
    { amp: 1.0, freq: 1, phase: 0, enabled: true },
    { amp: 0.0, freq: 3, phase: 0, enabled: true },
    { amp: 0.0, freq: 5, phase: 0, enabled: true },
    { amp: 0.0, freq: 7, phase: 0, enabled: true },
    { amp: 0.0, freq: 9, phase: 0, enabled: true },
  ])
  const timeRef = useRef(0)
  const animRef = useRef<number>(0)
  const frameRef = useRef<number>(0)

  const evalSum = useCallback((t: number) => {
    return harmonics.reduce((sum, h) => {
      if (!h.enabled) return sum
      return sum + h.amp * Math.sin(h.freq * t + h.phase)
    }, 0)
  }, [harmonics])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    const scaleY = h / 6

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

      // Zero line
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

      const t = timeRef.current
      const phase = t * 2

      // Composite waveform
      ctx.beginPath()
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 6
      ctx.shadowColor = '#06b6d4'
      for (let px = 0; px < w; px++) {
        const sum = harmonics.reduce((s, h) => {
          if (!h.enabled) return s
          return s + h.amp * Math.sin(h.freq * ((px / w) * Math.PI * 4 + phase) + h.phase)
        }, 0)
        const y = h / 2 - sum * scaleY
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Individual harmonics (faded)
      const colors = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899']
      harmonics.forEach((harm, i) => {
        if (!harm.enabled || harm.amp === 0) return
        ctx.beginPath()
        ctx.strokeStyle = colors[i % colors.length]
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.2
        for (let px = 0; px < w; px++) {
          const y = h / 2 - harm.amp * Math.sin(harm.freq * ((px / w) * Math.PI * 4 + phase) + harm.phase) * scaleY
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      timeRef.current += 0.01
      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [harmonics, evalSum])

  const toggle = (i: number) => setHarmonics(h => h.map((x, idx) => idx === i ? { ...x, enabled: !x.enabled } : x))
  const update = (i: number, key: string, val: number) => setHarmonics(h => h.map((x, idx) => idx === i ? { ...x, [key]: val } : x))

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-1">Fourier Waveform Builder</h3>
      <p className="text-white/40 text-xs mb-4">Stack harmonic sine waves to approximate any periodic shape. Your cochlea does this in reverse — decomposing sound into its frequency components in milliseconds.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full rounded-xl bg-slate-950/80 overflow-x-auto pb-2">
          <canvas ref={canvasRef} width="600" height="200" className="mx-auto" />
        </div>
        <div className="flex flex-col gap-2 lg:w-52 overflow-y-auto max-h-[220px] pr-1">
          <div className="text-[9px] text-white/20 mb-1 uppercase tracking-wider">Harmonics</div>
          {harmonics.map((h, i) => (
            <div key={i} className={`flex items-center gap-1 p-1 rounded border ${h.enabled ? 'border-white/10 bg-white/5' : 'border-white/5'}`}>
              <button onClick={() => toggle(i)} className={`w-6 text-[9px] rounded ${h.enabled ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/30'}`}>{i + 1}×</button>
              <input type="range" min="0" max="1" step="0.05" value={h.amp} onChange={e => update(i, 'amp', Number(e.target.value))} className="flex-1 accent-cyan-400" />
              <span className="text-[9px] font-mono text-white/40 w-8 text-right">{h.amp.toFixed(2)}</span>
            </div>
          ))}
          <div className="text-[9px] text-white/20 mt-1">Σ Aₙ sin(nωt + φₙ)</div>
        </div>
      </div>
    </div>
  )
}

// ─── Utility: HSL → RGB ──────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

// ─── Main Math Scene ─────────────────────────────────────────────────────────
type DemoId = 'grapher' | 'fibonacci' | 'mandelbrot' | 'fourier'

export default function MathScene() {
  const [active, setActive] = useState<DemoId>('grapher')

  const tabs: [DemoId, string, string][] = [
    ['grapher', 'Function Grapher', '#a855f7'],
    ['fibonacci', 'Fibonacci Spiral', '#f59e0b'],
    ['mandelbrot', 'Mandelbrot', '#ec4899'],
    ['fourier', 'Fourier Builder', '#06b6d4'],
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Phase 2 · Mathematics · Understanding Life
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Mathematics Simulations
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-base">
            Mathematics is the invisible architecture of the living world. These simulations reveal how simple mathematical rules generate the patterns, complexity, and information processing we see everywhere in biology.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(([id, label, color]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: active === id ? color : 'rgba(255,255,255,0.05)',
                color: active === id ? 'white' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${active === id ? color + '60' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Demo panels */}
        <div className="space-y-4">
          {active === 'grapher' && <FunctionGrapher />}
          {active === 'fibonacci' && <FibonacciExplorer />}
          {active === 'mandelbrot' && <MandelbrotExplorer />}
          {active === 'fourier' && <FourierWaveform />}
        </div>

        {/* Understanding Life connection */}
        <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Understanding Life Connections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-yellow-400 font-medium mb-1">Golden Proportions</p>
              <p className="text-white/40 text-xs leading-relaxed">Sunflower seed heads, nautilus shells, and human body proportions all converge on φ = 1.618. Evolution discovered this ratio independently across every kingdom of life — not because it&apos;s aesthetically pleasing, but because it maximizes packing efficiency.</p>
            </div>
            <div>
              <p className="text-xs text-pink-400 font-medium mb-1">Fractal Networks</p>
              <p className="text-white/40 text-xs leading-relaxed">Your lungs, blood vessels, and brain neurons are all fractal networks. The same branching logic — self-similar at every scale — creates maximum surface area in minimum space. The bronchial tree alone has ~23 generations of branching.</p>
            </div>
            <div>
              <p className="text-xs text-cyan-400 font-medium mb-1">Frequency Analysis</p>
              <p className="text-white/40 text-xs leading-relaxed">Your cochlea contains 3,000+ hair cells, each tuned to a specific frequency. In milliseconds, it performs a biological Fourier transform — decomposing sound into its component frequencies. This is how you hear your name in a noisy room.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
