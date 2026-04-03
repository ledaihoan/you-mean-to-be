'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── Types ───────────────────────────────────────────────────────────────────

type DemoId = 'prediction' | 'self' | 'time'
type MentalState = 'anxiety' | 'calm' | 'focused' | 'meditation'
type PatternType = 'alternating' | 'repeating' | 'additive' | 'fibonacci'
type TimeCondition = 'none' | 'countdown' | 'distraction'
type Shape = 'circle' | 'square' | 'triangle'
type Phase = 'showing' | 'predict' | 'feedback'

// ─── Demo 1: Prediction Engine ───────────────────────────────────────────────

const SHAPES: Shape[] = ['circle', 'square', 'triangle']
const SHAPE_COLORS = ['#3b82f6', '#f97316', '#22c55e']

const PATTERNS: Record<PatternType, { label: string; difficulty: number }> = {
  alternating: { label: 'Alternating (A-B)', difficulty: 1 },
  repeating: { label: 'Repeating (A-B-C)', difficulty: 2 },
  additive: { label: 'Additive (+2)', difficulty: 3 },
  fibonacci: { label: 'Fibonacci (φ)', difficulty: 4 },
}

function generateSequence(pattern: PatternType, length: number): Shape[] {
  switch (pattern) {
    case 'alternating':
      return Array.from({ length }, (_, i) => SHAPES[i % 2])
    case 'repeating':
      return Array.from({ length }, (_, i) => SHAPES[i % 3])
    case 'additive': {
      // Each element is sum of previous two (mod 3)
      const seq: Shape[] = [SHAPES[0], SHAPES[1]]
      for (let i = 2; i < length; i++) {
        const idx = (SHAPES.indexOf(seq[i - 1]) + SHAPES.indexOf(seq[i - 2])) % 3
        seq.push(SHAPES[idx])
      }
      return seq
    }
    case 'fibonacci': {
      // Fibonacci numbers modulo 3 produce sequence: 1,1,2,0,2,2,1,0,1,1...
      const fibMod: number[] = [1, 1]
      for (let i = 2; i < 30; i++) fibMod.push((fibMod[i - 1] + fibMod[i - 2]) % 3)
      return Array.from({ length }, (_, i) => SHAPES[fibMod[i]])
    }
  }
}

function PredictionEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  const [pattern, setPattern] = useState<PatternType>('alternating')
  const [sequence, setSequence] = useState<Shape[]>([])
  const [showIdx, setShowIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('predict')
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState<{ round: number; accuracy: number }[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [started, setStarted] = useState(false)

  const showLen = pattern === 'alternating' ? 4 : pattern === 'repeating' ? 6 : pattern === 'additive' ? 6 : 8
  const nextShape = sequence.length > 0 ? sequence[sequence.length] : null

  // Draw sequence on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const padding = 20
    const spacing = (w - padding * 2) / Math.max(showLen + 1, 6)

    // Draw shown shapes
    for (let i = 0; i < showIdx; i++) {
      const shape = sequence[i]
      if (!shape) continue
      const x = padding + spacing * (i + 0.5)
      const y = h / 2 - 20
      const size = 28
      ctx.globalAlpha = phase === 'feedback' && i === showLen ? 0.3 : 1
      ctx.fillStyle = SHAPE_COLORS[SHAPES.indexOf(shape)]
      ctx.beginPath()
      if (shape === 'circle') ctx.arc(x, y, size, 0, Math.PI * 2)
      else if (shape === 'square') ctx.roundRect(x - size, y - size, size * 2, size * 2, 4)
      else {
        ctx.moveTo(x, y - size)
        ctx.lineTo(x + size, y + size)
        ctx.lineTo(x - size, y + size)
        ctx.closePath()
      }
      ctx.fill()

      // Index label
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(String(i + 1), x, y + size + 14)
      ctx.globalAlpha = 1
    }

    // Draw "?" placeholder for prediction
    if (phase === 'predict' && showIdx === showLen) {
      const x = padding + spacing * (showLen + 0.5)
      const y = h / 2 - 20
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 28, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = 'bold 24px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', x, y)
    }

    // Show answer with feedback
    if (phase === 'feedback' && nextShape) {
      const x = padding + spacing * (showLen + 0.5)
      const y = h / 2 - 20
      const correctShape = nextShape
      ctx.fillStyle = feedback === 'correct' ? '#22c55e' : '#ef4444'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      if (correctShape === 'circle') ctx.arc(x, y, 28, 0, Math.PI * 2)
      else if (correctShape === 'square') ctx.roundRect(x - 28, y - 28, 56, 56, 4)
      else {
        ctx.moveTo(x, y - 28)
        ctx.lineTo(x + 28, y + 28)
        ctx.lineTo(x - 28, y + 28)
        ctx.closePath()
      }
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Watch the pattern, then predict the next shape', 10, 8)
  })

  // D3 line chart
  useEffect(() => {
    const svg = chartRef.current
    if (!svg || history.length < 2) return
    const w = 320, h = 80, m = { top: 8, right: 12, bottom: 18, left: 28 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    const xScale = d3.scaleLinear().domain([1, history.length]).range([0, iw])
    const yScale = d3.scaleLinear().domain([0, 1]).range([ih, 0])

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(xScale).ticks(Math.min(history.length, 5)).tickFormat(d => `R${d}`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '8')
      })

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '8')
      })

    const line = d3.line<{ round: number; accuracy: number }>()
      .x(d => xScale(d.round))
      .y(d => yScale(d.accuracy))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 2)
      .attr('d', line)

    g.selectAll('circle')
      .data(history)
      .join('circle')
      .attr('cx', d => xScale(d.round))
      .attr('cy', d => yScale(d.accuracy))
      .attr('r', 3)
      .attr('fill', '#a855f7')
  }, [history])

  const startRound = useCallback(() => {
    const seq = generateSequence(pattern, showLen + 1)
    setSequence(seq)
    setShowIdx(0)
    setPhase('showing')
    setFeedback(null)
    setStarted(true)

    // Animate showing one at a time
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i >= showLen) {
        clearInterval(interval)
        setPhase('predict')
        setShowIdx(showLen)
      } else {
        setShowIdx(i)
      }
    }, 600)
  }, [pattern, showLen])

  const handleGuess = useCallback((shape: Shape) => {
    if (phase !== 'predict' || !nextShape) return
    const isCorrect = shape === nextShape
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setCorrect(c => c + (isCorrect ? 1 : 0))
    setTotal(t => {
      const newTotal = t + 1
      const accuracy = (c => c + (isCorrect ? 1 : 0))(correct) / newTotal
      setHistory(h => [...h, { round: newTotal, accuracy }])
      return newTotal
    })
    setTimeout(() => {
      setPhase('showing')
      setSequence([])
      setShowIdx(0)
      setFeedback(null)
      const seq = generateSequence(pattern, showLen + 1)
      setSequence(seq)
      let i = 0
      const interval = setInterval(() => {
        i++
        if (i >= showLen) {
          clearInterval(interval)
          setPhase('predict')
          setShowIdx(showLen)
        } else {
          setShowIdx(i)
        }
      }, 600)
    }, 1200)
  }, [phase, nextShape, correct, pattern, showLen])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={pattern}
          onChange={e => { setPattern(e.target.value as PatternType); setStarted(false) }}
          className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg focus:outline-none focus:border-purple-500"
        >
          {Object.entries(PATTERNS).map(([k, v]) => (
            <option key={k} value={k}>{v.label} (Lvl {v.difficulty})</option>
          ))}
        </select>
        <button
          onClick={startRound}
          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {started ? 'Next Round' : 'Start'}
        </button>
        <span className="text-white/40 text-xs">
          {correct}/{total} correct
          {total > 0 && ` · ${((correct / total) * 100).toFixed(0)}%`}
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={100}
        className="w-full rounded-xl bg-slate-900/80 border border-white/[0.06]"
      />

      {/* Prediction buttons */}
      {phase === 'predict' && (
        <div className="flex items-center justify-center gap-4">
          <p className="text-white/50 text-sm mr-2">Your prediction:</p>
          {SHAPES.map((shape, i) => (
            <button
              key={shape}
              onClick={() => handleGuess(shape)}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: SHAPE_COLORS[i] + '33', border: `2px solid ${SHAPE_COLORS[i]}` }}
            >
              <span className="text-lg">
                {shape === 'circle' ? '●' : shape === 'square' ? '■' : '▲'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <p className={`text-center text-sm font-medium ${feedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? '✓ Correct!' : `✗ Wrong — it was ${nextShape}`}
        </p>
      )}

      {/* D3 Accuracy Chart */}
      {history.length >= 2 && (
        <div className="border border-white/[0.06] rounded-xl p-3 bg-slate-900/50">
          <p className="text-white/40 text-xs mb-2">Prediction accuracy over rounds</p>
          <svg ref={chartRef} />
        </div>
      )}
      {history.length < 2 && history.length > 0 && (
        <p className="text-white/20 text-xs text-center">Run 2+ rounds to see accuracy chart</p>
      )}
    </div>
  )
}

// ─── Demo 2: Self Constructor ─────────────────────────────────────────────────

interface BrainRegion {
  id: string
  name: string
  role: string
  activation: Record<MentalState, number>
  // Approximate canvas coordinates (brain cross-section, top-down-ish view)
  cx: number
  cy: number
  rx: number
  ry: number
}

const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: 'prefrontal',
    name: 'Prefrontal Cortex',
    role: 'Constructs the narrative self — plans, imagines future, generates internal monologue. The "storyteller" of consciousness. Active during self-referential thinking and social prediction.',
    activation: { anxiety: 0.6, calm: 0.8, focused: 0.9, meditation: 0.4 },
    cx: 320, cy: 60,
    rx: 90, ry: 45,
  },
  {
    id: 'limbic',
    name: 'Limbic System',
    role: 'Emotional hub — processes fear, pleasure, motivation. Includes the amygdala (threat detection) and hippocampus (memory encoding). Drives the "felt sense" of experience before thought catches up.',
    activation: { anxiety: 0.95, calm: 0.3, focused: 0.5, meditation: 0.2 },
    cx: 320, cy: 130,
    rx: 85, ry: 40,
  },
  {
    id: 'cortex',
    name: 'Sensory Cortex',
    role: 'Processes raw sensory input — sight, sound, touch. The "receiver" that the prefrontal cortex then interprets through prediction. Bottom-up data meets top-down expectation.',
    activation: { anxiety: 0.7, calm: 0.5, focused: 0.9, meditation: 0.2 },
    cx: 320, cy: 200,
    rx: 110, ry: 55,
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    role: 'Prediction machine — compares expected movement/ sensation with actual. Coordinates unconscious predictions that free up the cortex for conscious thought. "Auto-pilot" for most of your actions.',
    activation: { anxiety: 0.8, calm: 0.6, focused: 0.85, meditation: 0.5 },
    cx: 380, cy: 155,
    rx: 45, ry: 55,
  },
  {
    id: 'brainstem',
    name: 'Brainstem',
    role: 'Homeostatic control — heart rate, breathing, arousal. The "engine" that keeps you running. All conscious experience rides on this ancient foundation. Regulates your energy level and alertness.',
    activation: { anxiety: 0.9, calm: 0.4, focused: 0.7, meditation: 0.3 },
    cx: 320, cy: 265,
    rx: 50, ry: 30,
  },
]

function SelfConstructor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<BrainRegion | null>(null)
  const [mentalState, setMentalState] = useState<MentalState>('calm')

  const mentalStateLabels: Record<MentalState, { label: string; color: string }> = {
    anxiety: { label: 'Anxiety', color: '#ef4444' },
    calm: { label: 'Calm', color: '#22c55e' },
    focused: { label: 'Focused', color: '#3b82f6' },
    meditation: { label: 'Meditation', color: '#a855f7' },
  }

  // Draw brain
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Brain outline
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(w / 2, 160, 140, 115, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Draw regions
    BRAIN_REGIONS.forEach(region => {
      const activation = region.activation[mentalState]
      const isSelected = selected?.id === region.id
      const baseColor = isSelected ? '#a855f7' : '#6366f1'
      const alpha = 0.15 + activation * 0.7

      ctx.fillStyle = baseColor
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.ellipse(region.cx, region.cy, region.rx, region.ry, 0, 0, Math.PI * 2)
      ctx.fill()

      if (isSelected) {
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Activation indicator
      if (activation > 0.1) {
        ctx.globalAlpha = activation * 0.5
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.ellipse(region.cx, region.cy, region.rx + 5, region.ry + 5, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.globalAlpha = 1

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = `${isSelected ? 'bold ' : ''}10px system-ui`
      ctx.textAlign = 'center'
      ctx.fillText(region.name.split(' ')[0], region.cx, region.cy + 4)
    })
  }, [selected, mentalState])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    for (const region of BRAIN_REGIONS) {
      const dx = (x - region.cx) / region.rx
      const dy = (y - region.cy) / region.ry
      if (dx * dx + dy * dy <= 1) {
        setSelected(prev => prev?.id === region.id ? null : region)
        return
      }
    }
    setSelected(null)
  }, [])

  return (
    <div className="space-y-4">
      {/* Mental state slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-xs">Mental State</p>
          <span className="text-xs font-medium" style={{ color: mentalStateLabels[mentalState].color }}>
            {mentalStateLabels[mentalState].label}
          </span>
        </div>
        <div className="flex gap-2">
          {(Object.keys(mentalStateLabels) as MentalState[]).map(state => (
            <button
              key={state}
              onClick={() => setMentalState(state)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                mentalState === state
                  ? 'border-white/30 text-white'
                  : 'border-white/[0.06] text-white/40 hover:text-white/70'
              }`}
              style={mentalState === state ? {
                backgroundColor: mentalStateLabels[state].color + '22',
                borderColor: mentalStateLabels[state].color + '55',
              } : {}}
            >
              {mentalStateLabels[state].label}
            </button>
          ))}
        </div>
      </div>

      {/* Brain canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={320}
        onClick={handleCanvasClick}
        className="w-full rounded-xl bg-slate-900/80 border border-white/[0.06] cursor-pointer"
      />
      <p className="text-white/30 text-xs text-center">Click a brain region to learn its role in self-construction</p>

      {/* Region info panel */}
      {selected && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-white font-semibold text-sm">{selected.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Activation:</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all"
                  style={{ width: `${selected.activation[mentalState] * 100}%` }}
                />
              </div>
              <span className="text-purple-400 text-xs font-medium">
                {(selected.activation[mentalState] * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <p className="text-white/55 text-xs leading-relaxed">{selected.role}</p>
        </div>
      )}
    </div>
  )
}

// ─── Demo 3: Time Perception Lab ────────────────────────────────────────────

interface TimeTrial {
  estimate: number
  condition: TimeCondition
  actual: number
}

const CONDITION_LABELS: Record<TimeCondition, string> = {
  none: 'No cue',
  countdown: 'Countdown',
  distraction: 'Distraction',
}

const CONDITION_COLORS: Record<TimeCondition, string> = {
  none: '#ef4444',
  countdown: '#3b82f6',
  distraction: '#22c55e',
}

function TimePerceptionLab() {
  const chartRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [condition, setCondition] = useState<TimeCondition>('none')
  const [phase, setPhase] = useState<'idle' | 'timing' | 'estimating'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [trials, setTrials] = useState<TimeTrial[]>([])
  const [currentEstimate, setCurrentEstimate] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const TARGET = 10

  // D3 box plot
  useEffect(() => {
    const svg = chartRef.current
    if (!svg) return

    const w = 380, h = 140, m = { top: 12, right: 16, bottom: 36, left: 40 }
    const iw = w - m.left - m.right, ih = h - m.top - m.bottom

    const conditions: TimeCondition[] = ['none', 'countdown', 'distraction']
    const xScale = d3.scaleBand()
      .domain(conditions)
      .range([0, iw])
      .padding(0.3)
    const xBox = d3.scaleBand()
      .domain(conditions)
      .range([0, iw])
      .padding(0.5)

    const allEstimates = trials.map(t => t.estimate)
    const maxErr = Math.max(Math.abs(TARGET - 2), ...allEstimates.map(e => Math.abs(e - TARGET)), 2)
    const yMin = Math.max(0, TARGET - maxErr)
    const yMax = TARGET + maxErr
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([ih, 0])

    const root = d3.select(svg)
    root.selectAll('*').remove()
    root.attr('width', w).attr('height', h)

    const g = root.append('g').attr('transform', `translate(${m.left},${m.top})`)

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}s`))
      .call(a => {
        a.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)')
        a.selectAll('text').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9')
      })

    // Target line
    g.append('line')
      .attr('x1', 0).attr('x2', iw)
      .attr('y1', yScale(TARGET)).attr('y2', yScale(TARGET))
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-dasharray', '4,4')

    g.append('text')
      .attr('x', iw + 4).attr('y', yScale(TARGET) + 3)
      .attr('fill', 'rgba(255,255,255,0.3)')
      .attr('font-size', '8')
      .text('10s')

    // Box plots per condition
    conditions.forEach(cond => {
      const condTrials = trials.filter(t => t.condition === cond)
      if (condTrials.length === 0) return

      const estimates = condTrials.map(t => t.estimate).sort((a, b) => a - b)
      const q1 = d3.quantile(estimates, 0.25) ?? estimates[0]
      const med = d3.quantile(estimates, 0.5) ?? estimates[0]
      const q3 = d3.quantile(estimates, 0.75) ?? estimates[0]
      const min = estimates[0]
      const max = estimates[estimates.length - 1]

      const bx = xScale(cond)!
      const bw = xBox.bandwidth()
      const color = CONDITION_COLORS[cond]

      // Whiskers
      g.append('line').attr('x1', bx + bw / 2).attr('x2', bx + bw / 2)
        .attr('y1', yScale(min)).attr('y2', yScale(q1))
        .attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.7)
      g.append('line').attr('x1', bx + bw / 2).attr('x2', bx + bw / 2)
        .attr('y1', yScale(q3)).attr('y2', yScale(max))
        .attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.7)

      // Box
      g.append('rect')
        .attr('x', bx).attr('y', yScale(q3))
        .attr('width', bw).attr('height', yScale(q1) - yScale(q3))
        .attr('fill', color).attr('opacity', 0.25)
        .attr('stroke', color).attr('stroke-width', 1.5)

      // Median
      g.append('line')
        .attr('x1', bx).attr('x2', bx + bw)
        .attr('y1', yScale(med)).attr('y2', yScale(med))
        .attr('stroke', color).attr('stroke-width', 2)

      // X label
      g.append('text')
        .attr('x', bx + bw / 2).attr('y', ih + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '9')
        .text(`${CONDITION_LABELS[cond]} (n=${estimates.length})`)
    })

    // Dots for individual estimates
    conditions.forEach(cond => {
      const condTrials = trials.filter(t => t.condition === cond)
      const bx = xScale(cond)!
      const bw = xBox.bandwidth()
      condTrials.forEach((trial, i) => {
        const jitter = (Math.random() - 0.5) * bw * 0.4
        g.append('circle')
          .attr('cx', bx + bw / 2 + jitter)
          .attr('cy', yScale(trial.estimate))
          .attr('r', 3)
          .attr('fill', CONDITION_COLORS[cond])
          .attr('opacity', 0.6)
      })
    })
  }, [trials])

  const startTrial = useCallback(() => {
    setPhase('timing')
    setElapsed(0)
    setIsRunning(true)
    setCurrentEstimate(0)

    timerRef.current = setInterval(() => {
      setElapsed(e => e + 0.1)
    }, 100)

    if (condition === 'countdown') {
      setCountdown(TARGET)
      let c = TARGET
      const cdInterval = setInterval(() => {
        c -= 1
        if (c > 0) setCountdown(c)
        else {
          setCountdown(null)
          clearInterval(cdInterval)
        }
      }, 1000)
    }
  }, [condition])

  const stopTrial = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRunning(false)
    const estimate = Math.round(elapsed * 10) / 10
    setTrials(ts => [...ts, { estimate, condition, actual: TARGET }])
    setPhase('idle')
  }, [elapsed, condition])

  return (
    <div className="space-y-4">
      {/* Condition selector */}
      <div className="flex items-center gap-3">
        <span className="text-white/50 text-xs">Condition:</span>
        {(['none', 'countdown', 'distraction'] as TimeCondition[]).map(cond => (
          <button
            key={cond}
            onClick={() => { setCondition(cond); setPhase('idle') }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              condition === cond
                ? 'border-white/30 text-white'
                : 'border-white/[0.06] text-white/40 hover:text-white/70'
            }`}
            style={condition === cond ? {
              backgroundColor: CONDITION_COLORS[cond] + '22',
              borderColor: CONDITION_COLORS[cond] + '44',
            } : {}}
          >
            {CONDITION_LABELS[cond]}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center py-6 rounded-xl bg-slate-900/60 border border-white/[0.06]">
        <div className="text-5xl font-mono text-white mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {phase === 'timing' ? elapsed.toFixed(1) : phase === 'idle' && trials.length > 0 ? '—' : '0.0'}s
        </div>
        <p className="text-white/30 text-xs mb-4">
          {condition === 'countdown' ? 'Say "stop" when you think 10 seconds have passed' :
           condition === 'distraction' ? 'Count backwards from 20 by 3s out loud (20, 17, 14...)' :
           'Press stop when you think 10 seconds have passed'}
        </p>
        {countdown !== null && (
          <p className="text-blue-400 text-2xl font-bold mb-2">{countdown}</p>
        )}
        {phase === 'timing' ? (
          <button
            onClick={stopTrial}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-medium rounded-lg transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startTrial}
            className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors"
          >
            Start Trial
          </button>
        )}
      </div>

      {/* Box plot */}
      {trials.length > 0 && (
        <div className="border border-white/[0.06] rounded-xl p-3 bg-slate-900/50">
          <p className="text-white/40 text-xs mb-2">
            Time estimates — {trials.length} trial{trials.length !== 1 ? 's' : ''} total
          </p>
          <svg ref={chartRef} />
        </div>
      )}

      {/* Trial summary */}
      {trials.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {(['none', 'countdown', 'distraction'] as TimeCondition[]).map(cond => {
            const ct = trials.filter(t => t.condition === cond)
            if (ct.length === 0) return null
            const avg = ct.reduce((s, t) => s + t.estimate, 0) / ct.length
            const err = avg - TARGET
            return (
              <div key={cond} className="flex items-center gap-2 text-xs">
                <span style={{ color: CONDITION_COLORS[cond] }}>{CONDITION_LABELS[cond]}:</span>
                <span className="text-white/60">avg {avg.toFixed(1)}s</span>
                <span className={err > 0 ? 'text-amber-400' : 'text-blue-400'}>
                  ({err > 0 ? '+' : ''}{err.toFixed(1)}s)
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────

const DEMOS: { id: DemoId; label: string; description: string; accent: string }[] = [
  { id: 'prediction', label: 'Prediction Engine', description: 'Your brain is a prediction machine — see how it anticipates patterns', accent: 'from-purple-500 to-pink-600' },
  { id: 'self', label: 'Self Constructor', description: 'Click brain regions to discover how the self is assembled', accent: 'from-blue-500 to-indigo-600' },
  { id: 'time', label: 'Time Perception Lab', description: 'Why a boring minute feels longer than an exciting one', accent: 'from-emerald-500 to-teal-600' },
]

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function BrainScene() {
  const [active, setActive] = useState<DemoId>('prediction')

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-6 text-center">
        <p className="text-purple-400 text-sm font-medium tracking-wide uppercase mb-3">
          Simulation 7 of 7
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Brain &amp; Consciousness
        </h1>
        <p className="text-white/45 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
          The brain is not a camera recording reality — it is a story machine that generates predictions,
          constructs the self, and warps the flow of time. Three demos that reveal how your mind works.
        </p>
      </div>

      {/* Demo tabs */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DEMOS.map(demo => (
            <button
              key={demo.id}
              onClick={() => setActive(demo.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                active === demo.id
                  ? 'border-white/20 text-white'
                  : 'border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10'
              }`}
              style={active === demo.id ? {
                background: `linear-gradient(135deg, ${demo.accent.split(' ')[1].replace('from-', '#').replace('-500', '50').replace('-600', '99') || '#6366f1'}22, transparent)`,
              } : {}}
            >
              <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${demo.accent}`} />
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          {active === 'prediction' && <PredictionEngine />}
          {active === 'self' && <SelfConstructor />}
          {active === 'time' && <TimePerceptionLab />}
        </div>

        {/* Science summary */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-white font-semibold mb-3 text-sm">What this reveals</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-white/45">
            <div>
              <p className="font-medium text-white/60 mb-1">Prediction Engine</p>
              <p>The brain minimizes surprise — it runs a predictive model and only processes mismatches. This is why optical illusions work: your brain predicted the wrong color.</p>
            </div>
            <div>
              <p className="font-medium text-white/60 mb-1">Self Constructor</p>
              <p>There is no pre-existing self waiting to be discovered. The feeling of &ldquo;I&rdquo; is actively generated in real time by the prefrontal cortex and default mode network.</p>
            </div>
            <div>
              <p className="font-medium text-white/60 mb-1">Time Perception Lab</p>
              <p>Subjective time is constructed from memory encoding. Novel experiences feel longer because they leave more memory traces. This is why childhood summers feel endless.</p>
            </div>
          </div>
        </div>

        {/* Related articles */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a href="/blog/brain-predicts-reality" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            → Your Brain Does Not See Reality
          </a>
          <a href="/blog/self-as-story" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            → The Self Is a Story
          </a>
          <a href="/blog/time-flows-doesnt" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            → Why Time Flows and Does Not
          </a>
        </div>
      </div>
    </main>
  )
}
