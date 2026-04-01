import { useRef, useEffect, useState, useCallback } from 'react'
import { getPlayerStyle } from '../constants'
import { supabase } from '../supabase'

const WORDS = [
  'cat','dog','house','tree','sun','moon','star','car','boat','fish',
  'bird','flower','cake','pizza','rainbow','butterfly','elephant','rocket',
  'penguin','guitar','castle','dragon','unicorn','robot','ice cream',
  'dinosaur','volcano','submarine','tornado','waterfall','basketball',
  'spaceship','pirate','mermaid','wizard','snowman','bicycle','mountain',
  'lighthouse','treasure','strawberry',
]

const PALETTE = [
  '#111111','#ef4444','#f97316','#eab308','#22c55e',
  '#3b82f6','#a855f7','#ec4899','#92400e','#ffffff',
]

const BRUSH_SIZES = [2, 5, 10, 18]

function pickWord() { return WORDS[Math.floor(Math.random() * WORDS.length)] }

function maskWord(word, hints) {
  return word.split('').map((ch, i) => {
    if (ch === ' ') return '   '
    return hints?.includes(i) ? ch : '_'
  }).join(' ')
}

export default function Pictionary({ room, playerName, updateRoom, onBack }) {
  const members    = room.members || []
  const gs         = room.state?.pict
  const canvasRef  = useRef(null)
  const drawingRef = useRef(false)
  const strokeRef  = useRef([])
  const channelRef = useRef(null)

  const [guess, setGuess]         = useState('')
  const [guessMsg, setGuessMsg]   = useState('')
  const [remoteStrokes, setRemoteStrokes] = useState([])
  const [guessLog, setGuessLog]   = useState([])
  const [drawColor, setDrawColor] = useState('#111111')
  const [brushSize, setBrushSize] = useState(5)

  const isDrawer = gs?.drawer === playerName
  const phase    = gs?.phase ?? 'waiting'
  const word     = gs?.word ?? ''
  const hints    = gs?.hints ?? []
  const scores   = gs?.scores ?? {}

  // Subscribe to broadcast channel
  useEffect(() => {
    const ch = supabase.channel(`pict:${room.code}`)
    ch.on('broadcast', { event: 'stroke' }, ({ payload }) => {
      setRemoteStrokes(prev => [...prev, payload])
    })
    ch.on('broadcast', { event: 'clear' }, () => {
      setRemoteStrokes([])
      clearCanvas()
    })
    ch.on('broadcast', { event: 'guess' }, ({ payload }) => {
      setGuessLog(prev => [...prev, payload])
    })
    ch.subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [room.code])

  // Re-draw remote strokes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    remoteStrokes.forEach(s => drawStroke(ctx, s.pts, s.color, s.size))
  }, [remoteStrokes])

  // Sync canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width  = rect.width
    canvas.height = rect.height
  }, [])

  function drawStroke(ctx, pts, color, size) {
    if (!pts || pts.length < 2) return
    const canvas = canvasRef.current
    ctx.strokeStyle = color ?? '#111111'
    ctx.lineWidth   = size ?? 5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    ctx.moveTo(pts[0][0] * canvas.width, pts[0][1] * canvas.height)
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0] * canvas.width, pts[i][1] * canvas.height)
    }
    ctx.stroke()
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  function toRel(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height]
  }

  const handleMouseDown = useCallback((e) => {
    if (!isDrawer || phase !== 'drawing') return
    drawingRef.current = true
    strokeRef.current = [toRel(e)]
  }, [isDrawer, phase])

  const handleMouseMove = useCallback((e) => {
    if (!drawingRef.current) return
    const pt   = toRel(e)
    const prev = strokeRef.current[strokeRef.current.length - 1]
    strokeRef.current.push(pt)
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.strokeStyle = drawColor
    ctx.lineWidth   = brushSize
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    ctx.moveTo(prev[0] * canvas.width, prev[1] * canvas.height)
    ctx.lineTo(pt[0] * canvas.width, pt[1] * canvas.height)
    ctx.stroke()
  }, [drawColor, brushSize])

  const handleMouseUp = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const pts = strokeRef.current
    if (pts.length >= 2) {
      channelRef.current?.send({
        type: 'broadcast', event: 'stroke',
        payload: { pts, color: drawColor, size: brushSize },
      })
    }
    strokeRef.current = []
  }, [drawColor, brushSize])

  function handleClear() {
    clearCanvas()
    setRemoteStrokes([])
    channelRef.current?.send({ type: 'broadcast', event: 'clear', payload: {} })
  }

  async function startRound() {
    const round  = (gs?.round ?? -1) + 1
    const drawer = members[round % members.length]
    const w      = pickWord()
    setRemoteStrokes([])
    setGuessLog([])
    clearCanvas()
    await updateRoom({
      state: {
        ...room.state,
        pict: {
          phase: 'drawing', drawer, word: w,
          guessedBy: null, hints: [], round,
          scores: gs?.scores ?? {},
        },
      },
    })
  }

  async function handleGuess() {
    if (!guess.trim()) return
    const correct = guess.trim().toLowerCase() === word.toLowerCase()
    const entry   = { player: playerName, guess: guess.trim(), correct }
    channelRef.current?.send({ type: 'broadcast', event: 'guess', payload: entry })
    setGuessLog(prev => [...prev, entry])
    if (correct) {
      setGuessMsg('🎉 You got it!')
      const newScores = { ...scores, [playerName]: (scores[playerName] ?? 0) + 1 }
      await updateRoom({ state: { ...room.state, pict: { ...gs, phase: 'guessed', guessedBy: playerName, scores: newScores } } })
    } else {
      setGuessMsg('❌ Nope — try again!')
      setTimeout(() => setGuessMsg(''), 1500)
    }
    setGuess('')
  }

  async function giveHint() {
    const unrevealed = word.split('').map((ch, i) => i).filter(i => word[i] !== ' ' && !hints.includes(i))
    if (unrevealed.length === 0) return
    const revealIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    await updateRoom({ state: { ...room.state, pict: { ...gs, hints: [...hints, revealIdx] } } })
  }

  const drawerPs  = gs?.drawer ? getPlayerStyle(gs.drawer) : null
  const allHinted = word.length > 0 && word.split('').every((ch, i) => ch === ' ' || hints.includes(i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', maxWidth: 660, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 16, gap: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18 }}>🎨 Pictionary</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {members.map(m => {
            const ps = getPlayerStyle(m)
            return (
              <div key={m} style={{ padding: '4px 10px', borderRadius: 6, background: ps.dim, border: `1.5px solid ${ps.color}`, fontSize: 12, fontWeight: 800, color: ps.color }}>
                {m}: {scores[m] ?? 0}
              </div>
            )
          })}
        </div>
      </div>

      {/* Waiting */}
      {phase === 'waiting' && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 16, color: 'var(--txm)', marginBottom: 20, fontWeight: 700 }}>Ready to draw and guess?</div>
          <button className="btn-gold" style={{ fontSize: 16 }} onClick={startRound}>🎲 Start Round!</button>
        </div>
      )}

      {/* Drawing / Guessed */}
      {(phase === 'drawing' || phase === 'guessed') && (
        <>
          {/* Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, width: '100%', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', borderRadius: 8, background: drawerPs?.dim, border: `1.5px solid ${drawerPs?.color}`, fontSize: 13, fontWeight: 800, color: drawerPs?.color }}>
              ✏️ {gs.drawer} is drawing
            </div>
            {isDrawer && phase === 'drawing' && (
              <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(247,183,49,0.15)', border: '1.5px solid var(--gold)', fontSize: 15, fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                Word: {word}
              </div>
            )}
            {!isDrawer && phase === 'drawing' && (
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.18em', color: 'var(--tx)', fontFamily: 'monospace' }}>
                {maskWord(word, hints)}
              </div>
            )}
            {phase === 'guessed' && (
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--gold)' }}>
                🎉 {gs.guessedBy} guessed it! The word was <span style={{ color: 'var(--gold)' }}>{word}</span>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', borderRadius: 12, overflow: 'hidden', background: '#f8f8ff', marginBottom: 12, border: '2px solid var(--brd2)' }}>
            <canvas ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDrawer && phase === 'drawing' ? 'crosshair' : 'default' }}
            />
          </div>

          {/* Drawer controls */}
          {isDrawer && phase === 'drawing' && (
            <div style={{ width: '100%', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Color palette */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setDrawColor(c)} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, padding: 0, flexShrink: 0,
                    border: drawColor === c ? '3px solid var(--gold)' : '2px solid rgba(0,0,0,0.3)',
                    boxShadow: drawColor === c ? '0 0 8px rgba(247,183,49,0.6)' : 'none',
                  }} />
                ))}
              </div>
              {/* Brush size */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--txm)', marginRight: 2, textTransform: 'uppercase' }}>Size</span>
                {BRUSH_SIZES.map(s => (
                  <button key={s} onClick={() => setBrushSize(s)} style={{
                    width: 34, height: 34, borderRadius: 6, padding: 0,
                    background: brushSize === s ? 'var(--sur3)' : 'var(--sur2)',
                    border: brushSize === s ? '2px solid var(--gold)' : '1.5px solid var(--brd2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      borderRadius: '50%',
                      background: drawColor === '#ffffff' ? '#999' : drawColor,
                      width: Math.min(s * 2.2, 22), height: Math.min(s * 2.2, 22),
                    }} />
                  </button>
                ))}
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={handleClear}>🗑 Clear</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={giveHint} disabled={allHinted}>
                  💡 Give Hint
                </button>
              </div>
            </div>
          )}

          {/* Guesser input */}
          {!isDrawer && phase === 'drawing' && (
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 12 }}>
              <input placeholder="Type your guess..." value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuess()}
                style={{ flex: 1 }} autoFocus
              />
              <button className="btn-gold" style={{ flexShrink: 0 }} onClick={handleGuess}>Guess!</button>
            </div>
          )}

          {guessMsg && (
            <div style={{ fontWeight: 800, fontSize: 15, color: guessMsg.startsWith('🎉') ? '#4ade80' : '#f87171', marginBottom: 10 }}>
              {guessMsg}
            </div>
          )}

          {/* Guess log */}
          {guessLog.length > 0 && (
            <div style={{ width: '100%', background: 'var(--sur)', border: '1px solid var(--brd)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, maxHeight: 130, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--txm)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guesses</div>
              {guessLog.map((g, i) => {
                const ps = getPlayerStyle(g.player)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: ps.color, flexShrink: 0 }}>{g.player}</span>
                    <span style={{ fontSize: 13, color: g.correct ? '#4ade80' : 'var(--txm)' }}>{g.guess}</span>
                    {g.correct && <span style={{ fontSize: 12 }}>✓</span>}
                  </div>
                )
              })}
            </div>
          )}

          {phase === 'guessed' && (
            <button className="btn-gold" style={{ fontSize: 15 }} onClick={startRound}>🎲 Next Round!</button>
          )}
        </>
      )}
    </div>
  )
}
