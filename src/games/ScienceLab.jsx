import { useState, useEffect } from 'react'

const INGREDIENTS = [
  { id: 'water',       name: 'Water',         emoji: '💧', color: '#60a5fa' },
  { id: 'vinegar',     name: 'Vinegar',       emoji: '🧪', color: '#fef08a' },
  { id: 'baking_soda', name: 'Baking Soda',   emoji: '🥄', color: '#e2e8f0' },
  { id: 'soap',        name: 'Dish Soap',     emoji: '🫧', color: '#c084fc' },
  { id: 'lemon',       name: 'Lemon Juice',   emoji: '🍋', color: '#fde68a' },
  { id: 'salt',        name: 'Salt',          emoji: '🧂', color: '#f1f5f9' },
  { id: 'red_dye',     name: 'Red Dye',       emoji: '🔴', color: '#ef4444' },
  { id: 'yellow_dye',  name: 'Yellow Dye',    emoji: '💛', color: '#eab308' },
  { id: 'blue_dye',    name: 'Blue Dye',      emoji: '🔵', color: '#3b82f6' },
  { id: 'heat',        name: 'Heat',          emoji: '🔥', color: '#f97316' },
  { id: 'ice',         name: 'Ice',           emoji: '🧊', color: '#bae6fd' },
  { id: 'cabbage',     name: 'Cabbage Juice', emoji: '🥬', color: '#86efac' },
  { id: 'glitter',     name: 'Glitter',       emoji: '✨', color: '#fbbf24' },
  { id: 'mentos',      name: 'Mentos',        emoji: '🍬', color: '#f9a8d4' },
  { id: 'cola',        name: 'Cola',          emoji: '🥤', color: '#7c2d12' },
]

// Sorted most-specific (most needs) first
const REACTIONS = [
  {
    needs: ['vinegar', 'baking_soda', 'soap'],
    name: 'Foam Monster!', emoji: '🌋',
    description: 'CO₂ from the acid-base reaction gets trapped in soap, creating a massive foam overflow!',
    color: '#fb923c', anim: 'eruption',
  },
  {
    needs: ['glitter', 'soap', 'water'],
    name: 'Galaxy Potion!', emoji: '🌌',
    description: 'Soap breaks surface tension and the glitter swirls like a tiny sparkling galaxy!',
    color: '#818cf8', anim: 'galaxy',
  },
  {
    needs: ['red_dye', 'yellow_dye', 'blue_dye'],
    name: 'Brown Muddle', emoji: '🤎',
    description: 'All three primary colors together make brown — they absorb almost all visible light!',
    color: '#78350f', anim: 'swirl',
  },
  {
    needs: ['cola', 'mentos'],
    name: 'Cola Geyser!', emoji: '🚀',
    description: 'Mentos has thousands of tiny pores that cause rapid CO₂ nucleation — launching cola skyward!',
    color: '#92400e', anim: 'eruption',
  },
  {
    needs: ['vinegar', 'baking_soda'],
    name: 'Volcanic Eruption!', emoji: '🌋',
    description: 'Acetic acid + sodium bicarbonate → CO₂ gas + water + sodium acetate. Rapid gas = fizzy eruption!',
    color: '#f97316', anim: 'eruption',
  },
  {
    needs: ['lemon', 'baking_soda'],
    name: 'Citrus Fizz!', emoji: '🍋',
    description: 'Citric acid in lemon juice reacts with baking soda, releasing CO₂ — same science as vinegar!',
    color: '#fde68a', anim: 'fizz',
  },
  {
    needs: ['cabbage', 'vinegar'],
    name: 'Acid Alert!', emoji: '🌹',
    description: 'Cabbage juice is a natural pH indicator! In acidic conditions (like vinegar) it turns vivid pink/red!',
    color: '#f43f5e', anim: 'glow',
  },
  {
    needs: ['cabbage', 'lemon'],
    name: 'Acid Alert!', emoji: '🌸',
    description: 'Lemon juice is acidic! The cabbage juice turns pink to reveal the hidden acid.',
    color: '#fb7185', anim: 'glow',
  },
  {
    needs: ['cabbage', 'baking_soda'],
    name: 'Base Blast!', emoji: '💚',
    description: 'In alkaline/basic conditions like baking soda, cabbage juice turns green/yellow. Basic chemistry!',
    color: '#4ade80', anim: 'glow',
  },
  {
    needs: ['soap', 'water'],
    name: 'Bubble Party!', emoji: '🫧',
    description: 'Soap molecules trap air in perfect spheres — the surface tension makes them beautifully round!',
    color: '#818cf8', anim: 'bubbles',
  },
  {
    needs: ['red_dye', 'blue_dye'],
    name: 'Purple Magic!', emoji: '🟣',
    description: 'Red + Blue = Purple! Mixing pigments combines their light-absorbing properties.',
    color: '#a855f7', anim: 'swirl',
  },
  {
    needs: ['yellow_dye', 'blue_dye'],
    name: 'Green Creation!', emoji: '🟢',
    description: 'Yellow + Blue = Green! Subtractive color mixing — each dye absorbs different wavelengths of light.',
    color: '#22c55e', anim: 'swirl',
  },
  {
    needs: ['red_dye', 'yellow_dye'],
    name: 'Orange Blend!', emoji: '🟠',
    description: 'Red + Yellow = Orange! The pigments combine to absorb blue light wavelengths.',
    color: '#f97316', anim: 'swirl',
  },
  {
    needs: ['heat', 'water'],
    name: 'Water Vapor!', emoji: '♨️',
    description: 'Heat gives water molecules enough energy to escape as steam — liquid turning to gas!',
    color: '#94a3b8', anim: 'steam',
  },
  {
    needs: ['ice', 'heat'],
    name: 'Phase Change!', emoji: '🌊',
    description: 'Ice absorbs heat energy and melts. Temperature stays constant during the phase transition!',
    color: '#7dd3fc', anim: 'melt',
  },
  {
    needs: ['salt', 'water'],
    name: 'Saline Solution', emoji: '⚡',
    description: 'Salt (NaCl) dissolves and splits into Na⁺ and Cl⁻ ions — making water electrically conductive!',
    color: '#93c5fd', anim: 'dissolve',
  },
  {
    needs: ['glitter', 'water'],
    name: 'Glitter Potion!', emoji: '✨',
    description: 'Glitter floats on water\'s surface tension, catching light and sparkling in every direction!',
    color: '#fbbf24', anim: 'galaxy',
  },
]

const BUBBLE_COUNTS = { eruption: 14, fizz: 8, bubbles: 7, glow: 0, swirl: 0, steam: 0, galaxy: 3, melt: 2, dissolve: 3 }

function getReaction(added) {
  const ids = new Set(added.map(a => a.id))
  return REACTIONS.find(r => r.needs.every(n => ids.has(n))) ?? null
}

function blendColor(added) {
  if (!added.length) return '#1e3a5f'
  let r = 0, g = 0, b = 0
  for (const ing of added) {
    r += parseInt(ing.color.slice(1, 3), 16)
    g += parseInt(ing.color.slice(3, 5), 16)
    b += parseInt(ing.color.slice(5, 7), 16)
  }
  return `rgb(${Math.round(r / added.length)},${Math.round(g / added.length)},${Math.round(b / added.length)})`
}

export default function ScienceLab({ onBack }) {
  const [added, setAdded]     = useState([])
  const [reaction, setReaction] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const r = getReaction(added)
    if (r?.name !== reaction?.name) {
      setReaction(r)
      setAnimKey(k => k + 1)
    }
  }, [added])

  function addIngredient(ing) {
    if (added.find(a => a.id === ing.id)) return
    setAdded(prev => [...prev, ing])
  }

  function reset() {
    setAdded([])
    setReaction(null)
    setAnimKey(k => k + 1)
  }

  const liquidColor  = reaction ? reaction.color : blendColor(added)
  const liquidHeight = Math.min(20 + added.length * 11, 95)
  const anim         = reaction?.anim ?? null
  const bubbleCount  = BUBBLE_COUNTS[anim] ?? 0
  const isShaking    = anim === 'eruption'
  const isGlowing    = anim === 'glow'
  const isSteam      = anim === 'steam'
  const isGalaxy     = anim === 'galaxy'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 24, gap: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18 }}>🔬 Science Lab</div>
      </div>

      {/* Beaker area */}
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

        {/* Galaxy sparkles */}
        {isGalaxy && (
          <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 140, height: 190, pointerEvents: 'none', zIndex: 2 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${12 + (i * 15) % 65}%`,
                top: `${10 + (i * 19) % 65}%`,
                fontSize: 13,
                animation: 'lab-spin 3s linear infinite',
                animationDelay: `${i * 0.5}s`,
              }}>✨</div>
            ))}
          </div>
        )}

        {/* Beaker rim */}
        <div style={{
          width: 156, height: 14,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '6px 6px 0 0',
          border: '3px solid rgba(255,255,255,0.22)',
          borderBottom: 'none',
        }} />

        {/* Beaker body */}
        <div
          key={animKey}
          style={{
            width: 140, height: 190,
            border: '3px solid rgba(255,255,255,0.22)',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            overflow: 'hidden',
            position: 'relative',
            background: 'rgba(255,255,255,0.03)',
            animation: isShaking ? 'lab-shake 0.35s ease-in-out infinite' : 'none',
            boxShadow: isGlowing ? `0 0 40px ${liquidColor}, 0 0 80px ${liquidColor}55` : 'none',
            transition: 'box-shadow 0.5s',
          }}
        >
          {/* Liquid fill */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: added.length ? `${liquidHeight}%` : '0%',
            background: liquidColor,
            borderRadius: '0 0 21px 21px',
            transition: 'height 0.5s ease, background 0.6s ease',
            opacity: 0.88,
            animation: (anim === 'swirl' || anim === 'galaxy') ? 'lab-swirl 3s ease-in-out infinite' : 'none',
          }} />

          {/* Bubbles */}
          {[...Array(bubbleCount)].map((_, i) => (
            <div key={`${animKey}-b${i}`} style={{
              position: 'absolute',
              bottom: `${4 + (i * 9) % 35}%`,
              left: `${8 + (i * 13) % 76}%`,
              width: 5 + (i % 3) * 4,
              height: 5 + (i % 3) * 4,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.55)',
              animation: `lab-bubble ${0.7 + (i % 3) * 0.35}s ease-in infinite`,
              animationDelay: `${(i * 0.13) % 1.1}s`,
            }} />
          ))}
        </div>

        {/* Reaction label */}
        <div style={{ marginTop: 14, textAlign: 'center', minHeight: 52 }}>
          {reaction && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ fontSize: 28 }}>{reaction.emoji}</div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 15, color: reaction.color, marginTop: 4 }}>
                {reaction.name}
              </div>
            </div>
          )}
          {!reaction && added.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 700 }}>Keep mixing...</div>
          )}
          {added.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 700 }}>Add ingredients to begin!</div>
          )}
        </div>
      </div>

      {/* Reaction description */}
      {reaction && (
        <div style={{
          width: '100%', padding: '12px 16px', borderRadius: 10,
          background: `${reaction.color}22`, border: `1.5px solid ${reaction.color}66`,
          marginBottom: 16, fontSize: 13, color: 'var(--tx)', fontWeight: 600,
          lineHeight: 1.6, animation: 'fade-in 0.4s ease',
        }}>
          {reaction.description}
        </div>
      )}

      {/* Current mix tags */}
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
            const inBeaker = !!added.find(a => a.id === ing.id)
            return (
              <button key={ing.id} onClick={() => addIngredient(ing)} disabled={inBeaker}
                style={{
                  padding: '10px 4px', borderRadius: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: inBeaker ? `${ing.color}22` : 'var(--sur2)',
                  border: `1.5px solid ${inBeaker ? ing.color : 'var(--brd)'}`,
                  color: inBeaker ? ing.color : 'var(--txm)',
                  fontSize: 11, fontWeight: 800,
                  cursor: inBeaker ? 'not-allowed' : 'pointer',
                  opacity: inBeaker ? 0.55 : 1,
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
