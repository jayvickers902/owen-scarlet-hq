import { useState, useEffect, useCallback } from 'react'
// No external API needed — flavor analysis runs entirely in the browser

const INGREDIENTS = [
  { id: 'tomato',    name: 'Tomatoes',    emoji: '🍅', color: '#ef4444' },
  { id: 'garlic',    name: 'Garlic',      emoji: '🧄', color: '#fde68a' },
  { id: 'olive_oil', name: 'Olive Oil',   emoji: '🫒', color: '#84cc16' },
  { id: 'butter',    name: 'Butter',      emoji: '🧈', color: '#fbbf24' },
  { id: 'cream',     name: 'Cream',       emoji: '🥛', color: '#fef3c7' },
  { id: 'basil',     name: 'Fresh Basil', emoji: '🌿', color: '#4ade80' },
  { id: 'onion',     name: 'Onion',       emoji: '🧅', color: '#c4b5fd' },
  { id: 'lemon',     name: 'Lemon',       emoji: '🍋', color: '#fde047' },
  { id: 'parmesan',  name: 'Parmesan',    emoji: '🧀', color: '#f59e0b' },
  { id: 'chili',     name: 'Chili',       emoji: '🌶️', color: '#dc2626' },
  { id: 'wine',      name: 'White Wine',  emoji: '🍷', color: '#fef08a' },
  { id: 'anchovy',   name: 'Anchovies',   emoji: '🐟', color: '#b45309' },
  { id: 'capers',    name: 'Capers',      emoji: '🫙', color: '#86efac' },
  { id: 'mushroom',  name: 'Mushrooms',   emoji: '🍄', color: '#92400e' },
  { id: 'soy',       name: 'Soy Sauce',   emoji: '🥢', color: '#451a03' },
  { id: 'ginger',    name: 'Ginger',      emoji: '🌱', color: '#fed7aa' },
  { id: 'honey',     name: 'Honey',       emoji: '🍯', color: '#f59e0b' },
  { id: 'mustard',   name: 'Mustard',     emoji: '💛', color: '#eab308' },
  { id: 'stock',     name: 'Broth',       emoji: '🍲', color: '#a16207' },
  { id: 'vinegar',   name: 'Vinegar',     emoji: '🫗', color: '#fde68a' },
]

// Sorted most-specific (most needs) first so the best match wins
const SAUCES = [
  {
    needs: ['tomato', 'garlic', 'basil', 'olive_oil', 'onion'],
    name: 'Classic Marinara', emoji: '🍝', origin: '🇮🇹 Italian',
    color: '#ef4444', anim: 'simmer',
    description: "You made a classic Italian marinara! Garlic and onion build a savory base, olive oil adds silkiness, tomatoes bring a rich tang, and fresh basil brightens everything up. It's perfect on pasta, pizza, or for dipping bread.",
  },
  {
    needs: ['tomato', 'garlic', 'anchovy', 'capers', 'chili', 'olive_oil'],
    name: 'Puttanesca', emoji: '🫙', origin: '🇮🇹 Italian',
    color: '#b91c1c', anim: 'boil',
    description: "Puttanesca! The anchovies melt into the oil giving a deep savory flavor called umami, capers add a briny tang, chili brings heat, and tomatoes tie it all together. It's one of Italy's boldest pasta sauces — puttanesca means 'spicy ragamuffin style'!",
  },
  {
    needs: ['cream', 'parmesan', 'butter', 'garlic'],
    name: 'Alfredo Sauce', emoji: '🍝', origin: '🇮🇹 Italian',
    color: '#fef3c7', anim: 'blend',
    description: "A silky, indulgent Alfredo sauce! Butter and cream form a rich velvety base, parmesan melts in for salty, nutty depth, and garlic adds a savory punch. It's one of the most popular pasta sauces in the world — best poured over fettuccine!",
  },
  {
    needs: ['soy', 'ginger', 'honey', 'garlic'],
    name: 'Teriyaki Sauce', emoji: '🍱', origin: '🇯🇵 Japanese',
    color: '#92400e', anim: 'simmer',
    description: "Teriyaki! A classic Japanese sauce that's salty, sweet, and savory all at once. Soy sauce gives deep umami flavor, honey adds sweetness and a sticky glaze, ginger brings warmth, and garlic rounds it all out. Amazing on chicken, salmon, or vegetables.",
  },
  {
    needs: ['tomato', 'cream', 'onion', 'garlic'],
    name: 'Tomato Cream Sauce', emoji: '🍝', origin: '🇮🇹 Italian-American',
    color: '#fb923c', anim: 'blend',
    description: "A beautiful tomato cream sauce! Cream smooths out the sharp acidity of tomatoes, making it velvety and slightly sweet. Onion and garlic give it depth. This is similar to a 'vodka sauce' — a popular Italian-American classic.",
  },
  {
    needs: ['tomato', 'garlic', 'basil', 'olive_oil'],
    name: 'Simple Marinara', emoji: '🍅', origin: '🇮🇹 Italian',
    color: '#ef4444', anim: 'simmer',
    description: "A simple but delicious marinara! Just four ingredients create one of the world's most beloved sauces. Fresh tomatoes, garlic, basil, and olive oil — the very heart of Italian cooking. Goes with almost any pasta!",
  },
  {
    needs: ['tomato', 'garlic', 'chili'],
    name: 'Arrabbiata', emoji: '🌶️', origin: '🇮🇹 Italian (Roman)',
    color: '#dc2626', anim: 'boil',
    description: "Arrabbiata — Italian for 'angry' sauce! The chili peppers give it a fierce kick, while garlic and tomatoes keep it bold and simple. It's one of Rome's most famous pasta sauces. If you like heat, this is your sauce!",
  },
  {
    needs: ['garlic', 'butter', 'lemon'],
    name: 'Lemon Garlic Butter', emoji: '🍋', origin: '🇫🇷 French-inspired',
    color: '#fde047', anim: 'sizzle',
    description: "Lemon garlic butter is pure magic! Butter brings richness, garlic adds savory depth, and lemon juice brightens everything with a fresh zing. Amazing on shrimp, pasta, grilled fish, or vegetables — simple, fast, and absolutely delicious!",
  },
  {
    needs: ['mushroom', 'butter', 'stock'],
    name: 'Mushroom Sauce', emoji: '🍄', origin: '🇫🇷 French',
    color: '#78350f', anim: 'simmer',
    description: "A rich, earthy mushroom sauce! Butter helps brown the mushrooms to develop deep flavor, while broth adds body and savory depth. Incredible on steak, chicken, or egg noodles. Mushrooms have a special savory taste called umami — the fifth flavor!",
  },
  {
    needs: ['wine', 'butter', 'garlic'],
    name: 'White Wine Butter', emoji: '🍷', origin: '🇫🇷 French',
    color: '#fef08a', anim: 'blend',
    description: "Beurre blanc — a classic French white wine butter sauce! White wine cooks down with garlic, then butter is whisked in to create an incredibly silky, tangy sauce. It's a fancy restaurant staple often served with fish or chicken.",
  },
  {
    needs: ['soy', 'ginger', 'garlic'],
    name: 'Stir-fry Sauce', emoji: '🥢', origin: '🌏 Asian',
    color: '#92400e', anim: 'simmer',
    description: "A simple but powerful Asian stir-fry sauce! Soy provides salty umami, ginger adds warmth and a slight bite, and garlic rounds it all out. This trio is the base of countless Asian dishes — stir-fries, noodles, dumplings, and more!",
  },
  {
    needs: ['olive_oil', 'garlic'],
    name: 'Aglio e Olio', emoji: '🫒', origin: '🇮🇹 Italian (Roman)',
    color: '#84cc16', anim: 'sizzle',
    description: "Aglio e Olio — Italian for 'garlic and oil'! Garlic slowly toasts in olive oil until it becomes golden and sweet, then gets tossed with pasta. It's one of the simplest and most elegant pasta dishes ever invented — proof that less is more!",
  },
  {
    needs: ['vinegar', 'honey'],
    name: 'Agrodolce', emoji: '🍯', origin: '🇮🇹 Italian',
    color: '#f59e0b', anim: 'blend',
    description: "Agrodolce — Italian for 'sweet and sour'! Vinegar brings bright tartness while honey adds sweetness. This balance of opposites is a hallmark of Italian cooking, used as a glaze for meats and vegetables. It's also similar to Chinese sweet-and-sour sauce!",
  },
  {
    needs: ['garlic', 'butter'],
    name: 'Garlic Butter', emoji: '🧄', origin: '🌍 Universal',
    color: '#fbbf24', anim: 'sizzle',
    description: "Garlic butter — one of the world's great simple sauces! Butter brings richness and garlic infuses it with warm, savory flavor. You can put garlic butter on almost anything: bread, pasta, steak, shrimp, or vegetables. It's a cornerstone of cooking everywhere!",
  },
  {
    needs: ['lemon', 'butter'],
    name: 'Lemon Butter Sauce', emoji: '🍋', origin: '🇫🇷 French',
    color: '#fde047', anim: 'sizzle',
    description: "Lemon butter sauce — simple, bright, and delicious! Butter is rich and creamy while lemon juice cuts through with fresh tartness. They balance each other perfectly. Great on fish, pasta, asparagus, or chicken.",
  },
  {
    needs: ['honey', 'mustard'],
    name: 'Honey Mustard', emoji: '🍯', origin: '🇺🇸 American',
    color: '#eab308', anim: 'blend',
    description: "Honey mustard — a sweet and tangy all-star! Honey brings sweetness while mustard adds a sharp, spicy bite. Together they make a perfect balance that works as a dipping sauce, salad dressing, or glaze for chicken and pork.",
  },
  {
    needs: ['tomato', 'cream'],
    name: 'Tomato Cream', emoji: '🍅', origin: '🇮🇹 Italian',
    color: '#f97316', anim: 'blend',
    description: "Tomato and cream make a gorgeous rosy pink sauce! Cream smooths out the acidity of the tomatoes, making a sweeter, more mellow sauce. Add garlic and onion and you've got a full tomato cream sauce — one of the prettiest in Italian cooking!",
  },
]

const BUBBLE_COUNTS = { simmer: 3, boil: 11, blend: 0, sizzle: 0 }

// ── Flavor analysis (no API needed) ──────────────────────────────────
const FLAVOR_TAGS = {
  tomato:    ['tangy', 'savory'],
  garlic:    ['savory'],
  olive_oil: ['rich'],
  butter:    ['rich', 'creamy'],
  cream:     ['creamy', 'sweet'],
  basil:     ['herby'],
  onion:     ['savory', 'sweet'],
  lemon:     ['tangy'],
  parmesan:  ['salty', 'umami'],
  chili:     ['spicy'],
  wine:      ['tangy', 'sweet'],
  anchovy:   ['salty', 'umami'],
  capers:    ['tangy', 'salty'],
  mushroom:  ['savory', 'umami'],
  soy:       ['salty', 'umami'],
  ginger:    ['spicy'],
  honey:     ['sweet'],
  mustard:   ['tangy', 'spicy'],
  stock:     ['savory', 'rich'],
  vinegar:   ['tangy'],
}

const FLAVOR_COMBOS = {
  'savory+umami':  'deeply savory with layers of richness — chefs call this "umami", the fifth taste that makes food feel satisfying and complex.',
  'creamy+savory': 'rich and velvety smooth, with a satisfying savory warmth throughout.',
  'creamy+tangy':  'creamy with a bright tangy edge — the richness and zing balance each other really nicely.',
  'savory+tangy':  'bold and bright — savory depth with a tangy zing that keeps each bite lively.',
  'sweet+tangy':   'sweet and sour — opposites that attract! This balance is one of the most popular flavor combos in the world.',
  'savory+spicy':  'bold and fiery with a deep savory backbone — it would definitely wake up your taste buds!',
  'spicy+sweet':   'sweet heat — a famous combo used in sauces everywhere. The sweetness makes the spice more exciting!',
  'herby+savory':  'fresh and fragrant with a savory base — the herbs make it smell amazing while it cooks.',
  'herby+tangy':   'fresh, bright, and lively — herbs and tang together make a sauce that really pops.',
  'rich+savory':   'deeply rich and rounded — full of warm flavors that coat everything really nicely.',
  'rich+sweet':    'buttery and sweet — an indulgent, comforting combo.',
  'salty+umami':   'intensely savory with tons of depth. Salty + umami together create some of the most addictive flavors in cooking!',
  'savory+sweet':  'sweet and savory at the same time — a classic combo that makes you want to keep eating.',
  'rich+tangy':    'rich and tangy — the fat carries the flavor while the tang cuts through the heaviness perfectly.',
  'rich+umami':    'luxuriously deep and satisfying — richness and umami together is a power combo used in the best restaurant sauces.',
  'salty+tangy':   'sharp and punchy — salty and tangy together create a briny, zesty kick great for cutting through rich foods.',
}

function describeFlavors(added) {
  const counts = {}
  for (const ing of added) {
    for (const tag of FLAVOR_TAGS[ing.id] ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([f]) => f)
  if (!top.length) return null

  const comboKey = [top[0], top[1]].filter(Boolean).sort().join('+')
  const flavorDesc = FLAVOR_COMBOS[comboKey]
    ?? `${top.slice(0, 3).join(', ')} — an interesting and creative combination!`

  const ids = new Set(added.map(a => a.id))
  let suggestion
  if (ids.has('tomato'))                          suggestion = 'pasta or pizza'
  else if (ids.has('soy') || ids.has('ginger'))  suggestion = 'rice, noodles, or grilled chicken'
  else if (ids.has('cream') || ids.has('butter')) suggestion = 'pasta or pan-seared chicken'
  else if (ids.has('honey') || ids.has('mustard'))suggestion = 'chicken, pork, or as a dipping sauce'
  else if (ids.has('lemon') || ids.has('vinegar'))suggestion = 'fish or roasted vegetables'
  else if (ids.has('mushroom') || ids.has('stock'))suggestion = 'steak or egg noodles'
  else                                            suggestion = 'pasta, chicken, or roasted vegetables'

  const hasGoodBalance = top.length >= 3 || (top[1] && top[0] !== top[1])
  const verdict = hasGoodBalance
    ? 'This sounds like it could genuinely work — you might be onto something!'
    : 'Try adding one more ingredient to give it more depth and balance!'

  return `Your sauce would taste ${flavorDesc} Try it on ${suggestion}. ${verdict}`
}

function getSauce(added) {
  const ids = new Set(added.map(a => a.id))
  return SAUCES.find(s => s.needs.length === added.length && s.needs.every(n => ids.has(n))) ?? null
}

function blendColor(added) {
  if (!added.length) return '#3b1a08'
  let r = 0, g = 0, b = 0
  for (const ing of added) {
    const c = ing.color.replace('#', '')
    r += parseInt(c.slice(0, 2), 16)
    g += parseInt(c.slice(2, 4), 16)
    b += parseInt(c.slice(4, 6), 16)
  }
  return `rgb(${Math.round(r / added.length)},${Math.round(g / added.length)},${Math.round(b / added.length)})`
}

const ING_BY_ID = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]))

export default function SauceLab({ onBack }) {
  const [added, setAdded]           = useState([])
  const [sauce, setSauce]           = useState(null)
  const [animKey, setAnimKey]       = useState(0)
  const [chefNotes, setChefNotes]   = useState(null)
  const [showRecipes, setShowRecipes] = useState(false)

  useEffect(() => {
    const s = getSauce(added)
    if (s?.name !== sauce?.name) {
      setSauce(s)
      setAnimKey(k => k + 1)
      setChefNotes(null)
    }
  }, [added])

  function addIngredient(ing) {
    if (added.find(a => a.id === ing.id)) return
    setAdded(prev => [...prev, ing])
  }

  function reset() {
    setAdded([])
    setSauce(null)
    setChefNotes(null)
    setAnimKey(k => k + 1)
  }

  const tasteIt = useCallback(() => {
    setChefNotes(describeFlavors(added))
  }, [added])

  const liquidColor  = sauce ? sauce.color : blendColor(added)
  const liquidHeight = Math.min(10 + added.length * 9, 90)
  const anim         = sauce?.anim ?? null
  const bubbleCount  = BUBBLE_COUNTS[anim] ?? 0
  const isShaking    = anim === 'sizzle' || anim === 'boil'
  const isSteam      = anim === 'boil'
  const showTasteBtn = !sauce && added.length >= 2 && !chefNotes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 24, gap: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18, flex: 1 }}>🍳 Sauce Lab</div>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowRecipes(true)}>📖 Recipes</button>
      </div>

      {/* Recipe list modal */}
      {showRecipes && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(7,9,26,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 16px', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18, flex: 1 }}>📖 Sauce Recipes</div>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowRecipes(false)}>✕ Close</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SAUCES.map(s => (
                <div key={s.name} style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: `${s.color}18`, border: `1.5px solid ${s.color}55`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 13, color: s.color }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--txm)', marginLeft: 'auto' }}>{s.origin}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {s.needs.map(id => {
                      const ing = ING_BY_ID[id]
                      return (
                        <span key={id} style={{
                          padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                          background: `${ing.color}22`, border: `1.5px solid ${ing.color}66`,
                          color: ing.color,
                        }}>
                          {ing.emoji} {ing.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cooking pot */}
      <div style={{ position: 'relative', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Steam */}
        {isSteam && (
          <div style={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 20, pointerEvents: 'none' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'rgba(148,163,184,0.7)',
                animation: 'lab-steam 1.6s ease-out infinite',
                animationDelay: `${i * 0.45}s`,
              }} />
            ))}
          </div>
        )}

        {/* Pot with handles */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* Left handle */}
          <div style={{
            width: 22, height: 18, marginTop: 18,
            borderRadius: '8px 0 0 8px',
            background: 'rgba(255,255,255,0.08)',
            border: '3px solid rgba(255,255,255,0.22)',
            borderRight: 'none',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Pot rim */}
            <div style={{
              width: 200, height: 14,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '8px 8px 0 0',
              border: '3px solid rgba(255,255,255,0.22)',
              borderBottom: 'none',
            }} />

            {/* Pot body */}
            <div
              key={animKey}
              style={{
                width: 184, height: 155,
                border: '3px solid rgba(255,255,255,0.22)',
                borderTop: 'none',
                borderRadius: '0 0 40px 40px',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255,255,255,0.03)',
                animation: isShaking ? 'lab-shake 0.35s ease-in-out infinite' : 'none',
                boxShadow: sauce ? `0 0 35px ${liquidColor}55` : 'none',
                transition: 'box-shadow 0.5s',
              }}
            >
              {/* Liquid */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: added.length ? `${liquidHeight}%` : '0%',
                background: liquidColor,
                borderRadius: '0 0 37px 37px',
                transition: 'height 0.5s ease, background 0.6s ease',
                opacity: 0.88,
                animation: anim === 'blend' ? 'lab-swirl 3s ease-in-out infinite' : 'none',
              }} />

              {/* Bubbles */}
              {[...Array(bubbleCount)].map((_, i) => (
                <div key={`${animKey}-b${i}`} style={{
                  position: 'absolute',
                  bottom: `${4 + (i * 9) % 35}%`,
                  left: `${8 + (i * 17) % 76}%`,
                  width: 5 + (i % 3) * 4,
                  height: 5 + (i % 3) * 4,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.55)',
                  animation: `lab-bubble ${0.8 + (i % 3) * 0.4}s ease-in infinite`,
                  animationDelay: `${(i * 0.17) % 1.2}s`,
                }} />
              ))}
            </div>
          </div>

          {/* Right handle */}
          <div style={{
            width: 22, height: 18, marginTop: 18,
            borderRadius: '0 8px 8px 0',
            background: 'rgba(255,255,255,0.08)',
            border: '3px solid rgba(255,255,255,0.22)',
            borderLeft: 'none',
          }} />
        </div>

        {/* Sauce name label */}
        <div style={{ marginTop: 14, textAlign: 'center', minHeight: 56 }}>
          {sauce && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ fontSize: 28 }}>{sauce.emoji}</div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 15, color: sauce.color, marginTop: 4 }}>
                {sauce.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--txm)', marginTop: 2 }}>{sauce.origin}</div>
            </div>
          )}
          {!sauce && added.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 700 }}>Keep adding ingredients...</div>
          )}
          {added.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 700 }}>Add ingredients to your pot!</div>
          )}
        </div>
      </div>

      {/* Known sauce description */}
      {sauce && (
        <div style={{
          width: '100%', padding: '12px 16px', borderRadius: 10,
          background: `${sauce.color}22`, border: `1.5px solid ${sauce.color}66`,
          marginBottom: 16, fontSize: 13, color: 'var(--tx)', fontWeight: 600,
          lineHeight: 1.6, animation: 'fade-in 0.4s ease',
        }}>
          {sauce.description}
        </div>
      )}

      {/* Taste it button */}
      {showTasteBtn && (
        <button
          onClick={tasteIt}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.15))',
            border: '1.5px solid rgba(167,139,250,0.5)',
            color: 'var(--tx)', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', transition: 'all 0.2s',
            animation: 'fade-in 0.4s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(244,114,182,0.25))'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.15))'}
        >
          👨‍🍳 What would this taste like?
        </button>
      )}

      {/* Chef notes */}
      {chefNotes && (
        <div style={{
          width: '100%', padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(167,139,250,0.12)', border: '1.5px solid rgba(167,139,250,0.4)',
          fontSize: 13, color: 'var(--tx)', fontWeight: 600,
          lineHeight: 1.6, animation: 'fade-in 0.4s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 6, textTransform: 'uppercase' }}>
            👨‍🍳 Chef's Tasting Notes
          </div>
          {chefNotes}
        </div>
      )}

      {/* Current mix tags + reset */}
      {added.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, width: '100%', alignItems: 'center' }}>
          {added.map(ing => (
            <div key={ing.id} style={{
              padding: '4px 10px', borderRadius: 20,
              background: `${ing.color}22`, border: `1.5px solid ${ing.color}88`,
              fontSize: 12, fontWeight: 800, color: ing.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {ing.emoji} {ing.name}
            </div>
          ))}
          <button onClick={reset} style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800,
            background: 'transparent', border: '1.5px solid var(--brd2)', color: 'var(--txm)',
            cursor: 'pointer',
          }}>🗑 Reset</button>
        </div>
      )}

      {/* Ingredient grid */}
      <div style={{ width: '100%' }}>
        <div className="label" style={{ marginBottom: 10 }}>Ingredients</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {INGREDIENTS.map(ing => {
            const inPot = !!added.find(a => a.id === ing.id)
            return (
              <button key={ing.id} onClick={() => addIngredient(ing)} disabled={inPot}
                style={{
                  padding: '10px 4px', borderRadius: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: inPot ? `${ing.color}22` : 'var(--sur2)',
                  border: `1.5px solid ${inPot ? ing.color : 'var(--brd)'}`,
                  color: inPot ? ing.color : 'var(--txm)',
                  fontSize: 11, fontWeight: 800,
                  cursor: inPot ? 'not-allowed' : 'pointer',
                  opacity: inPot ? 0.55 : 1,
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 22 }}>{ing.emoji}</span>
                <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{ing.name}</span>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
