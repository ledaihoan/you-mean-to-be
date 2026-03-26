'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── Food Database ───────────────────────────────────────────────────────────

interface Food {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  category: string
}

const FOODS: Food[] = [
  // Proteins
  { name: 'Chicken breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, category: 'protein' },
  { name: 'Eggs (2 large)', calories: 156, protein: 12, carbs: 1, fat: 10, category: 'protein' },
  { name: 'Greek yogurt (200g)', calories: 130, protein: 17, carbs: 6, fat: 4, category: 'protein' },
  { name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 2, fat: 4.5, category: 'protein' },
  { name: 'Ground beef (100g)', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein' },
  // Carbs
  { name: 'Brown rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8, category: 'carbs' },
  { name: 'Oatmeal (1 cup)', calories: 158, protein: 6, carbs: 27, fat: 3, category: 'carbs' },
  { name: 'Sweet potato (medium)', calories: 103, protein: 2, carbs: 24, fat: 0.1, category: 'carbs' },
  { name: 'Whole wheat bread (2 slices)', calories: 160, protein: 8, carbs: 30, fat: 2, category: 'carbs' },
  { name: 'Banana (medium)', calories: 105, protein: 1, carbs: 27, fat: 0.4, category: 'carbs' },
  { name: 'Apple (medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'carbs' },
  // Fats
  { name: 'Avocado (half)', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fat' },
  { name: 'Almonds (30g)', calories: 170, protein: 6, carbs: 6, fat: 15, category: 'fat' },
  { name: 'Olive oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'fat' },
  { name: 'Dark chocolate (30g)', calories: 170, protein: 2, carbs: 13, fat: 12, category: 'fat' },
  { name: 'Peanut butter (2 tbsp)', calories: 188, protein: 8, carbs: 6, fat: 16, category: 'fat' },
  // Vegetables
  { name: 'Broccoli (100g)', calories: 34, protein: 3, carbs: 7, fat: 0.4, category: 'veg' },
  { name: 'Spinach (100g)', calories: 23, protein: 3, carbs: 4, fat: 0.4, category: 'veg' },
  { name: 'Carrots (100g)', calories: 41, protein: 1, carbs: 10, fat: 0.2, category: 'veg' },
  { name: 'Tomato (medium)', calories: 22, protein: 1, carbs: 5, fat: 0.2, category: 'veg' },
  { name: 'Cucumber (100g)', calories: 15, protein: 0.7, carbs: 4, fat: 0.1, category: 'veg' },
  // Dairy
  { name: 'Milk (250ml)', calories: 103, protein: 8, carbs: 12, fat: 2.4, category: 'dairy' },
  { name: 'Cheddar cheese (30g)', calories: 121, protein: 7, carbs: 0.4, fat: 10, category: 'dairy' },
  // Grains
  { name: 'Quinoa (1 cup)', calories: 222, protein: 8, carbs: 39, fat: 3.5, category: 'carbs' },
  { name: 'Lentils (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 0.8, category: 'carbs' },
  { name: 'Chickpeas (1 cup)', calories: 269, protein: 15, carbs: 45, fat: 4, category: 'carbs' },
  { name: 'Orange (medium)', calories: 62, protein: 1, carbs: 15, fat: 0.2, category: 'carbs' },
]

const FOOD_COLORS: Record<string, string> = {
  protein: '#ef4444',
  carbs: '#f97316',
  fat: '#eab308',
  veg: '#22c55e',
  dairy: '#3b82f6',
}

// ─── Energy Pyramid Data ─────────────────────────────────────────────────────

interface TrophicLevel {
  name: string
  kcalPerDay: number
  description: string
  examples: string
}

const TROPHIC_LEVELS: TrophicLevel[] = [
  { name: 'Producers', kcalPerDay: 10000, description: 'Plants convert sunlight into stored energy via photosynthesis', examples: 'Wheat, rice, vegetables, fruits' },
  { name: 'Primary Consumers', kcalPerDay: 1000, description: 'Herbivores eat plants, absorbing ~10% of plant energy', examples: 'Rabbits, deer, cattle, locusts' },
  { name: 'Secondary Consumers', kcalPerDay: 100, description: 'Small carnivores eat herbivores, ~10% transfer again', examples: 'Foxes, snakes, small birds' },
  { name: 'Tertiary Consumers', kcalPerDay: 10, description: 'Apex predators eat secondary consumers, ~10% of that', examples: 'Wolves, eagles, sharks' },
]

// ─── Mifflin-St Jeor BMR ─────────────────────────────────────────────────────

function calcBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number {
  if (sex === 'male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryactive: 1.9,
}

// ─── Demo 1: Macro Calculator ───────────────────────────────────────────────

function MacroCalculator() {
  const pieRef = useRef<SVGSVGElement>(null)
  const barRef = useRef<SVGSVGElement>(null)

  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [activity, setActivity] = useState('moderate')
  const [proteinRatio, setProteinRatio] = useState(30)
  const [carbRatio, setCarbRatio] = useState(40)
  const [fatRatio, setFatRatio] = useState(30)

  const bmr = calcBMR(weight, height, age, sex)
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])

  const proteinG = Math.round((tdee * (proteinRatio / 100)) / 4)
  const carbsG = Math.round((tdee * (carbRatio / 100)) / 4)
  const fatG = Math.round((tdee * (fatRatio / 100)) / 9)

  const drawPie = useCallback(() => {
    const svg = pieRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 300
    const h = rect.height || 300
    const cx = w / 2, cy = h / 2
    const r = Math.min(cx, cy) - 20

    d3.select(svg).selectAll('*').remove()

    const data = [
      { label: 'Protein', value: proteinG, color: '#ef4444', kcal: proteinG * 4 },
      { label: 'Carbs', value: carbsG, color: '#f97316', kcal: carbsG * 4 },
      { label: 'Fat', value: fatG, color: '#eab308', kcal: fatG * 9 },
    ]

    const pie = d3.pie<typeof data[0]>().value(d => d.value).sort(null)
    const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>().innerRadius(r * 0.45).outerRadius(r)

    const g = d3.select(svg).append('g').attr('transform', `translate(${cx},${cy})`)

    g.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', '1.1rem')
      .attr('font-weight', 'bold')
      .text(tdee.toLocaleString())
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('font-size', '0.7rem')
      .text('kcal/day')

  }, [proteinG, carbsG, fatG, tdee])

  const drawBar = useCallback(() => {
    const svg = barRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 400
    const h = rect.height || 120

    d3.select(svg).selectAll('*').remove()

    const data = [
      { label: 'Protein', kcal: proteinG * 4, color: '#ef4444' },
      { label: 'Carbs', kcal: carbsG * 4, color: '#f97316' },
      { label: 'Fat', kcal: fatG * 9, color: '#eab308' },
    ]

    const margin = { top: 10, right: 10, bottom: 28, left: 40 }
    const iw = w - margin.left - margin.right
    const ih = h - margin.top - margin.bottom

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, iw]).padding(0.3)
    const y = d3.scaleLinear().domain([0, Math.max(...data.map(d => d.kcal)) * 1.1]).range([ih, 0])

    const g = d3.select(svg).append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.kcal))
      .attr('width', x.bandwidth())
      .attr('height', d => ih - y(d.kcal))
      .attr('fill', d => d.color)
      .attr('opacity', 0.85)
      .attr('rx', 4)

    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g2 => g2.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .selectAll('text')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('font-size', '0.65rem')

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}`))
      .call(g2 => g2.select('.domain').remove())
      .call(g2 => g2.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)'))
      .selectAll('text')
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('font-size', '0.6rem')
  }, [proteinG, carbsG, fatG])

  useEffect(() => { drawPie() }, [drawPie])
  useEffect(() => { drawBar() }, [drawBar])

  return (
    <div className="space-y-6">
      <p className="text-white/50 text-sm leading-relaxed">
        Your body is a calorie-burning engine. Use the Mifflin-St Jeor equation to calculate your Basal Metabolic Rate — the calories your body burns just staying alive — then adjust your macro split to see how the energy distributes.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="space-y-1">
          <span className="text-white/40 text-xs">Weight (kg)</span>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={30} max={200} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400/50" />
        </label>
        <label className="space-y-1">
          <span className="text-white/40 text-xs">Height (cm)</span>
          <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} min={100} max={220} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400/50" />
        </label>
        <label className="space-y-1">
          <span className="text-white/40 text-xs">Age</span>
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={10} max={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400/50" />
        </label>
        <label className="space-y-1">
          <span className="text-white/40 text-xs">Sex</span>
          <select value={sex} onChange={e => setSex(e.target.value as 'male' | 'female')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400/50">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-white/40 text-xs">Activity</span>
          <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400/50">
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="veryactive">Very Active</option>
          </select>
        </label>
      </div>

      {/* BMR / TDEE Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <p className="text-white/40 text-xs mb-1">BMR</p>
          <p className="text-2xl font-bold text-white">{Math.round(bmr)}</p>
          <p className="text-white/30 text-xs">kcal/day (at rest)</p>
        </div>
        <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20 text-center">
          <p className="text-orange-400/60 text-xs mb-1">TDEE</p>
          <p className="text-2xl font-bold text-orange-400">{tdee.toLocaleString()}</p>
          <p className="text-white/30 text-xs">kcal/day (with activity)</p>
        </div>
      </div>

      {/* Macro Split Sliders */}
      <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Macro Split</h4>
          <span className="text-white/30 text-xs">{proteinRatio + carbRatio + fatRatio}%</span>
        </div>

        {[
          { label: 'Protein', value: proteinRatio, set: setProteinRatio, color: '#ef4444', grams: proteinG, perKcal: 4 },
          { label: 'Carbs', value: carbRatio, set: setCarbRatio, color: '#f97316', grams: carbsG, perKcal: 4 },
          { label: 'Fat', value: fatRatio, set: setFatRatio, color: '#eab308', grams: fatG, perKcal: 9 },
        ].map(m => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.label}
              </span>
              <span className="text-white/50 text-xs">{m.value}% · {m.grams}g</span>
            </div>
            <input
              type="range" min={5} max={70} value={m.value}
              onChange={e => m.set(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
          <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Macro Distribution</h4>
          <svg ref={pieRef} className="w-full" style={{ height: 240 }} />
          <div className="flex justify-center gap-4 mt-2">
            {[
              { label: 'Protein', color: '#ef4444' },
              { label: 'Carbs', color: '#f97316' },
              { label: 'Fat', color: '#eab308' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-white/40 text-xs">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
          <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Calorie Breakdown</h4>
          <svg ref={barRef} className="w-full" style={{ height: 120 }} />
          <p className="text-white/30 text-xs text-center mt-2">kcal from each macro</p>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 2: Meal Builder ─────────────────────────────────────────────────────

function MealBuilder() {
  const barRef = useRef<SVGSVGElement>(null)
  const pieRef = useRef<SVGSVGElement>(null)

  const [meal, setMeal] = useState<Food[]>([])
  const [category, setCategory] = useState<string>('all')
  const [servingSizes, setServingSizes] = useState<Record<number, number>>({})

  const addFood = (food: Food) => {
    const id = food.name + Date.now()
    setMeal(prev => [...prev, food])
    setServingSizes(prev => ({ ...prev, [meal.length]: 1 }))
  }

  const removeFood = (index: number) => {
    setMeal(prev => prev.filter((_, i) => i !== index))
    setServingSizes(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const updateServing = (index: number, size: number) => {
    setServingSizes(prev => ({ ...prev, [index]: size }))
  }

  const totals = meal.reduce(
    (acc, food, i) => {
      const serving = servingSizes[i] ?? 1
      return {
        calories: acc.calories + food.calories * serving,
        protein: acc.protein + food.protein * serving,
        carbs: acc.carbs + food.carbs * serving,
        fat: acc.fat + food.fat * serving,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const drawBar = useCallback(() => {
    const svg = barRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 400
    const h = rect.height || 160

    d3.select(svg).selectAll('*').remove()

    const data = [
      { label: 'Calories', value: totals.calories, color: '#f97316', unit: 'kcal', scale: 1 },
      { label: 'Protein', value: totals.protein, color: '#ef4444', unit: 'g', scale: 4 },
      { label: 'Carbs', value: totals.carbs, color: '#f97316', unit: 'g', scale: 4 },
      { label: 'Fat', value: totals.fat, color: '#eab308', unit: 'g', scale: 9 },
    ]

    const margin = { top: 8, right: 12, bottom: 30, left: 55 }
    const iw = w - margin.left - margin.right
    const ih = h - margin.top - margin.bottom

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, iw]).padding(0.35)
    const maxVal = Math.max(data[0].value * 1.1, 1)
    const y = d3.scaleLinear().domain([0, Math.max(maxVal, 2000)]).range([ih, 0])

    const g = d3.select(svg).append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value * d.scale))
      .attr('width', x.bandwidth())
      .attr('height', d => ih - y(d.value * d.scale))
      .attr('fill', d => d.color)
      .attr('opacity', 0.8)
      .attr('rx', 4)

    // Labels on bars
    g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value * d.scale) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', '0.6rem')
      .text(d => `${Math.round(d.value)}${d.unit}`)

    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g2 => g2.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .selectAll('text')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('font-size', '0.6rem')

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}`))
      .call(g2 => g2.select('.domain').remove())
      .call(g2 => g2.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)'))
      .selectAll('text')
      .attr('fill', 'rgba(255,255,255,0.35)')
      .attr('font-size', '0.55rem')

  }, [totals])

  const drawPie = useCallback(() => {
    const svg = pieRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 300
    const h = rect.height || 300
    const cx = w / 2, cy = h / 2
    const r = Math.min(cx, cy) - 15

    d3.select(svg).selectAll('*').remove()

    if (totals.protein + totals.carbs + totals.fat === 0) {
      const g = d3.select(svg).append('g').attr('transform', `translate(${cx},${cy})`)
      g.append('circle').attr('r', r * 0.7).attr('fill', 'rgba(255,255,255,0.03)')
      g.append('text').attr('text-anchor', 'middle').attr('dy', '0.3em')
        .attr('fill', 'rgba(255,255,255,0.2)').attr('font-size', '0.75rem')
        .text('Add foods to see macros')
      return
    }

    const data = [
      { label: 'Protein', value: totals.protein, color: '#ef4444' },
      { label: 'Carbs', value: totals.carbs, color: '#f97316' },
      { label: 'Fat', value: totals.fat, color: '#eab308' },
    ]

    const pie = d3.pie<typeof data[0]>().value(d => d.value).sort(null)
    const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>().innerRadius(r * 0.5).outerRadius(r)

    const g = d3.select(svg).append('g').attr('transform', `translate(${cx},${cy})`)

    g.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)

  }, [totals])

  useEffect(() => { drawBar() }, [drawBar])
  useEffect(() => { drawPie() }, [drawPie])

  const categories = ['all', 'protein', 'carbs', 'fat', 'veg', 'dairy']
  const filteredFoods = FOODS.filter(f => category === 'all' || f.category === category)

  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm leading-relaxed">
        Build your daily meals and track macros in real time. The 10% energy rule from ecology applies here too — every step up the food chain costs energy. Eating lower on the chain is more efficient.
      </p>

      {/* Food selector */}
      <div>
        <div className="flex gap-1 flex-wrap mb-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${category === c ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
          {filteredFoods.map((food, i) => (
            <button key={i} onClick={() => addFood(food)}
              className="text-left p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs group">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FOOD_COLORS[food.category] ?? '#888' }} />
                <span className="text-orange-400/0 group-hover:text-orange-400 text-[10px]">+add</span>
              </div>
              <p className="text-white/70 mt-1 leading-tight">{food.name}</p>
              <p className="text-white/30 text-[10px]">{food.calories}kcal · P{food.protein}C{food.carbs}F{food.fat}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current meal */}
      {meal.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 max-h-[180px] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white/50 text-xs font-semibold">Today&apos;s Meals</h4>
            <button onClick={() => { setMeal([]); setServingSizes({}) }} className="text-orange-400/50 hover:text-orange-400 text-xs">clear</button>
          </div>
          <div className="space-y-1">
            {meal.map((food, i) => {
              const serving = servingSizes[i] ?? 1
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FOOD_COLORS[food.category] }} />
                    <span className="text-white/60">{food.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0.5} max={10} step={0.5} value={serving}
                      onChange={e => updateServing(i, Number(e.target.value))}
                      className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/50 text-center text-xs" />
                    <span className="text-white/30 w-16 text-right">{Math.round(food.calories * serving)}kcal</span>
                    <button onClick={() => removeFood(i)} className="text-white/20 hover:text-red-400/60">×</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
          <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Daily Totals</h4>
          <svg ref={barRef} className="w-full" style={{ height: 160 }} />
        </div>
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
          <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Macro Ratio</h4>
          <svg ref={pieRef} className="w-full" style={{ height: 160 }} />
        </div>
      </div>

      {meal.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Calories', value: Math.round(totals.calories), color: '#f97316' },
            { label: 'Protein', value: Math.round(totals.protein), color: '#ef4444', unit: 'g' },
            { label: 'Carbs', value: Math.round(totals.carbs), color: '#f97316', unit: 'g' },
            { label: 'Fat', value: Math.round(totals.fat), color: '#eab308', unit: 'g' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-lg p-2 border border-white/10">
              <p className="text-white/30 text-[10px]">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/30 text-[10px]">{s.unit ?? 'kcal'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Demo 3: Energy Pyramid ──────────────────────────────────────────────────

function EnergyPyramid() {
  const svgRef = useRef<SVGSVGElement>(null)
  const sankeyRef = useRef<SVGSVGElement>(null)

  const [transferEfficiency, setTransferEfficiency] = useState(10)
  const [producerEnergy, setProducerEnergy] = useState(10000)

  const drawPyramid = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 400
    const h = rect.height || 300

    d3.select(svg).selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 30, left: 20 }
    const iw = w - margin.left - margin.right
    const ih = h - margin.top - margin.bottom

    const levels = [
      { name: 'Producers', energy: producerEnergy, color: '#22c55e', examples: 'Wheat, rice, vegetables' },
      { name: 'Primary Consumers', energy: producerEnergy * (transferEfficiency / 100), color: '#f97316', examples: 'Rabbits, deer, cattle' },
      { name: 'Secondary Consumers', energy: producerEnergy * Math.pow(transferEfficiency / 100, 2), color: '#eab308', examples: 'Foxes, snakes' },
      { name: 'Tertiary Consumers', energy: producerEnergy * Math.pow(transferEfficiency / 100, 3), color: '#ef4444', examples: 'Wolves, eagles' },
    ]

    const maxEnergy = levels[0].energy
    const barH = ih / levels.length - 6
    const maxBarW = iw * 0.6

    const g = d3.select(svg).append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    levels.forEach((level, i) => {
      const y = i * (barH + 6)
      const barW = (level.energy / maxEnergy) * maxBarW

      // Bar
      g.append('rect')
        .attr('x', (iw - barW) / 2)
        .attr('y', y)
        .attr('width', barW)
        .attr('height', barH)
        .attr('fill', level.color)
        .attr('opacity', 0.75)
        .attr('rx', 4)

      // Energy label
      g.append('text')
        .attr('x', (iw + barW) / 2 + 8)
        .attr('y', y + barH / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.7)')
        .attr('font-size', '0.6rem')
        .text(`${Math.round(level.energy).toLocaleString()} kcal`)

      // Level name
      g.append('text')
        .attr('x', (iw - barW) / 2 - 8)
        .attr('y', y + barH / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', level.color)
        .attr('font-size', '0.6rem')
        .attr('font-weight', '600')
        .text(level.name)

      // Arrow
      if (i < levels.length - 1) {
        const arrowY = y + barH + 3
        const arrowX = iw / 2
        g.append('text')
          .attr('x', arrowX)
          .attr('y', arrowY)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(255,255,255,0.2)')
          .attr('font-size', '0.55rem')
          .text(`~${transferEfficiency}% transfer`)
      }
    })

    // Legend
    g.append('text')
      .attr('x', iw / 2)
      .attr('y', ih + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.25)')
      .attr('font-size', '0.6rem')
      .text(`Eating lower on the food chain is ${(100 / transferEfficiency).toFixed(1)}× more energy-efficient than eating meat`)

  }, [producerEnergy, transferEfficiency])

  const drawSankey = useCallback(() => {
    const svg = sankeyRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const w = rect.width || 400
    const h = rect.height || 200

    d3.select(svg).selectAll('*').remove()

    const nodes = [
      { id: 'sun', name: '☀️ Sun', color: '#eab308' },
      { id: 'producer', name: '🌿 Producers', color: '#22c55e' },
      { id: 'primary', name: '🦌 Primary', color: '#f97316' },
      { id: 'secondary', name: '🦊 Secondary', color: '#eab308' },
      { id: 'tertiary', name: '🐺 Tertiary', color: '#ef4444' },
      { id: 'heat', name: '💨 Heat Loss', color: '#64748b' },
    ]

    const links = [
      { source: 'sun', target: 'producer', value: producerEnergy },
      { source: 'producer', target: 'primary', value: producerEnergy * (transferEfficiency / 100) },
      { source: 'producer', target: 'heat', value: producerEnergy * (1 - transferEfficiency / 100) },
      { source: 'primary', target: 'secondary', value: producerEnergy * Math.pow(transferEfficiency / 100, 2) },
      { source: 'primary', target: 'heat', value: producerEnergy * (transferEfficiency / 100) * (1 - transferEfficiency / 100) },
      { source: 'secondary', target: 'tertiary', value: producerEnergy * Math.pow(transferEfficiency / 100, 3) },
      { source: 'secondary', target: 'heat', value: producerEnergy * Math.pow(transferEfficiency / 100, 2) * (1 - transferEfficiency / 100) },
      { source: 'tertiary', target: 'heat', value: producerEnergy * Math.pow(transferEfficiency / 100, 3) * (1 - transferEfficiency / 100) },
    ]

    const margin = { top: 10, right: 60, bottom: 10, left: 10 }
    const iw = w - margin.left - margin.right
    const ih = h - margin.top - margin.bottom

    const nodeIds = nodes.map(n => n.id)
    const nodeIndex = Object.fromEntries(nodeIds.map((id, i) => [id, i]))
    const sankeyNodes = nodes.map(n => ({ ...n, y0: 0, y1: 0, sourceLinks: [], targetLinks: [] }))
    const sankeyLinks = links
      .filter(l => l.value > 0)
      .map(l => ({ ...l, source: nodeIndex[l.source], target: nodeIndex[l.target] }))

    // Calculate y positions
    let y = 0
    const step = ih / nodes.length
    sankeyNodes.forEach(n => {
      n.y0 = y
      n.y1 = y + step - 2
      y += step
    })

    const g = d3.select(svg).append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Links
    sankeyLinks.forEach(link => {
      const sn = sankeyNodes[link.source] as typeof sankeyNodes[0]
      const tn = sankeyNodes[link.target] as typeof sankeyNodes[0]
      const lx = iw * 0.3
      const lw = iw * 0.25

      g.append('path')
        .attr('d', `M${lx},${(sn.y0 + sn.y1) / 2} C${lx + lw / 3},${(sn.y0 + sn.y1) / 2} ${lx + lw * 2 / 3},${(tn.y0 + tn.y1) / 2} ${lx + lw},${(tn.y0 + tn.y1) / 2}`)
        .attr('stroke', 'rgba(255,255,255,0.08)')
        .attr('stroke-width', Math.max(1, link.value / 100))
        .attr('fill', 'none')
    })

    // Nodes
    sankeyNodes.forEach((node, i) => {
      const nx = i === 0 ? 0 : iw - 40
      g.append('rect')
        .attr('x', nx)
        .attr('y', node.y0)
        .attr('width', 40)
        .attr('height', Math.max(4, node.y1 - node.y0))
        .attr('fill', node.color)
        .attr('opacity', 0.7)
        .attr('rx', 3)

      g.append('text')
        .attr('x', nx + 44)
        .attr('y', (node.y0 + node.y1) / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.6)')
        .attr('font-size', '0.6rem')
        .text(node.name)
    })

  }, [producerEnergy, transferEfficiency])

  useEffect(() => { drawPyramid() }, [drawPyramid])
  useEffect(() => { drawSankey() }, [drawSankey])

  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm leading-relaxed">
        Energy flows through ecosystems in a pyramid — each level receives ~10% of the previous level&apos;s energy. The rest is lost as heat. This is why apex predators are always rare, and why eating plants is more energy-efficient than eating animals.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-white/40 text-xs">Producer Energy</span>
            <span className="text-white/50 text-xs">{producerEnergy.toLocaleString()} kcal/day</span>
          </div>
          <input type="range" min={5000} max={20000} step={1000} value={producerEnergy}
            onChange={e => setProducerEnergy(Number(e.target.value))}
            className="w-full accent-orange-400" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-white/40 text-xs">Transfer Efficiency</span>
            <span className="text-white/50 text-xs">{transferEfficiency}%</span>
          </div>
          <input type="range" min={1} max={25} value={transferEfficiency}
            onChange={e => setTransferEfficiency(Number(e.target.value))}
            className="w-full accent-orange-400" />
        </div>
      </div>

      {/* Pyramid */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
        <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Trophic Energy Pyramid</h4>
        <svg ref={svgRef} className="w-full" style={{ height: 300 }} />
      </div>

      {/* Sankey */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-white/10">
        <h4 className="text-white/40 text-xs mb-2 text-center font-medium">Energy Flow Diagram</h4>
        <svg ref={sankeyRef} className="w-full" style={{ height: 200 }} />
        <p className="text-white/30 text-xs text-center mt-1">Most energy is lost as heat at every transfer — life runs on a leaky bucket</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-2">
        {TROPHIC_LEVELS.map((level, i) => (
          <div key={level.name} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{
                backgroundColor: ['#22c55e', '#f97316', '#eab308', '#ef4444'][i]
              }} />
              <span className="text-white/60 text-xs font-semibold">{level.name}</span>
            </div>
            <p className="text-white/30 text-[10px] leading-relaxed">{level.description}</p>
            <p className="text-white/20 text-[10px] mt-1">{level.examples}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type DemoId = 'macro' | 'meal' | 'pyramid'

const tabs: [DemoId, string, string][] = [
  ['macro', 'Macro Calculator', '#f97316'],
  ['meal', 'Meal Builder', '#ef4444'],
  ['pyramid', 'Energy Pyramid', '#22c55e'],
]

export default function NutritionScene() {
  const [active, setActive] = useState<DemoId>('macro')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mathematics of Metabolism</h1>
            <p className="text-white/40 text-sm">Phase 2C · What You Are Is What You Ate</p>
          </div>
        </div>

        <p className="text-white/50 text-sm leading-relaxed max-w-2xl mb-6">
          Your body runs on food the way a fire runs on oxygen — a controlled, continuous chemical reaction. These three interactive tools let you explore how energy flows from sunlight through ecosystems into your cells, and how your body distributes that energy across protein, carbs, and fat.
        </p>

        {/* Tab navigation */}
        <div className="flex gap-1.5">
          {tabs.map(([id, label, color]) => (
            <button key={id} onClick={() => setActive(id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: active === id ? color + '20' : 'rgba(255,255,255,0.05)',
                color: active === id ? 'white' : 'rgba(255,255,255,0.45)',
                border: `1px solid ${active === id ? color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active demo */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white/[0.03] rounded-2xl p-4 sm:p-6 border border-white/10">
          {active === 'macro' && <MacroCalculator />}
          {active === 'meal' && <MealBuilder />}
          {active === 'pyramid' && <EnergyPyramid />}
        </div>
      </div>

      {/* Blog connections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <h3 className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-4">Understanding Life Through Nutrition</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <a href="/blog/metabolism-fire" className="group block bg-white/[0.03] rounded-2xl p-5 border border-white/10 hover:border-red-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-400/70 text-xs font-medium">Blog Post 1</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-red-300 transition-colors">Your Body Is a Slow Fire</h4>
            <p className="text-white/30 text-xs leading-relaxed">Metabolism as controlled combustion — how mitochondria extract energy from food, and why you are literally burning fuel.</p>
          </a>
          <a href="/blog/hunger-hormones" className="group block bg-white/[0.03] rounded-2xl p-5 border border-white/10 hover:border-orange-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-orange-400/70 text-xs font-medium">Blog Post 2</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-orange-300 transition-colors">The Hunger Hormone Orchestra</h4>
            <p className="text-white/30 text-xs leading-relaxed">Leptin, ghrelin, and insulin — how hormones regulate appetite, and why obesity is a hormone regulation problem, not a willpower problem.</p>
          </a>
          <a href="/blog/soil-to-cell" className="group block bg-white/[0.03] rounded-2xl p-5 border border-white/10 hover:border-green-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400/70 text-xs font-medium">Blog Post 3</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-green-300 transition-colors">From Soil to Cell</h4>
            <p className="text-white/30 text-xs leading-relaxed">Why you cannot make your own food — the fundamental energy constraint of heterotrophy, and why every carbon atom in you was once a plant.</p>
          </a>
        </div>
      </div>
    </div>
  )
}
