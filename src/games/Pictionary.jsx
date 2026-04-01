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

function pickWord() { return WORDS[Math.floor(Math.random() * WORDS.length)] }

export default function Pictionary({ room, playerName, updateRoom, onBack }) {
  const members     = room.members || []
  const gs          = room.state?.pict
  const canvasRef   = useRef(null)
  const drawingRef  = useRef(false)
  const strokeRef   = useRef([])
  const channelRef  = useRef(null)
  const [guess, setGuess]     = useState('')
  const [guessMsg, setGuessMsg] = useState('')
  const [remoteStrokes, setRemoteStrokes] = useState([])

  const isDrawer  = gs?.drawer === playerName
  const isGuesser = !isDrawer
  const phase     = gs?.phase ?? 'waiting'  // waiting | drawing | guessed | roundover
  const word      = gs?.word ?? ''

  // Subscribe to broadcast channel for strokes + guesses
  useEffect(() => {
    const ch = supabase.channel(`pict:${room.code}`)
    ch.on('broadcast', { event: 'stroke' }, ({ payload }) => {
      setRemoteStrokes(prev => [...prev, payload])
    })
    ch.on('broadcast', { event: 'clear' }, () => {
      setRemoteStrokes([])
      clearCanvas()
    })
    ch.subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [room.code])

  // Re-draw remote strokes whenever they update
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    remoteStrokes.forEach(pts => drawStroke(ctx, pts, '#a78bfa'))
  }, [remoteStrokes])

  // Sync canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width  = rect.width
    canvas.height = rect.height
  }, [])

  function drawStroke(ctx, pts, color) {
    if (!pts || pts.length < 2) return
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const canvas = canvasRef.current
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
    const pt = toRel(e)
    const prev = strokeRef.current[strokeRef.current.length - 1]
    strokeRef.current.push(pt)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const ps = getPlayerStyle(playerName)
    ctx.strokeStyle = ps.color
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(prev[0] * canvas.width, prev[1] * canvas.height)
    ctx.lineTo(pt[0] * canvas.width, pt[1] * canvas.height)
    ctx.stroke()
  }, [playerName])

  const handleMouseUp = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const pts = strokeRef.current
    if (pts.length >= 2) {
      channelRef.current?.send({ type: 'broadcast', event: 'stroke', payload: pts })
    }
    strokeRef.current = []
  }, [])

  function handleClear() {
    clearCanvas()
    setRemoteStrokes([])
    channelRef.current?.send({ type: 'broadcast', event: 'clear', payload: {} })
  }

  async function startRound() {
    const drawer = members[Math.floor(Math.random() * members.length)]
    const w = pickWord()
    setRemoteStrokes([])
    clearCanvas()
    await updateRoom({ state: { ...room.state, pict: { phase: 'drawing', drawer, word: w, guessedBy: null } } })
  }

  async function handleGuess() {
    if (!guess.trim()) return
    if (guess.trim().toLowerCase() === word.toLowerCase()) {
      setGuessMsg('🎉 You got it!')
      await updateRoom({ state: { ...room.state, pict: { ...gs, phase: 'guessed', guessedBy: playerName } } })
    } else {
      setGuessMsg('❌ Nope — try again!')
      setTimeout(() => setGuessMsg(''), 1500)
    }
    setGuess('')
  }

  const drawerPs = gs?.drawer ? getPlayerStyle(gs.drawer) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', maxWidth: 660, margin: '0 auto', width: '100%' }}>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 16, gap: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18 }}>🎨 Pictionary</div>
      </div>

      {/* Waiting / start */}
      {phase === 'waiting' && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 16, color: 'var(--txm)', marginBottom: 20, fontWeight: 700 }}>
            Ready to draw and guess?
          </div>
          <button className="btn-gold" style={{ fontSize: 16 }} onClick={startRound}>🎲 Start Round!</button>
        </div>
      )}

      {/* Drawing phase */}
      {(phase === 'drawing' || phase === 'guessed') && (
        <>
          {/* Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, width: '100%' }}>
            <div style={{
              padding: '8px 14px', borderRadius: 8,
              background: drawerPs?.dim, border: `1.5px solid ${drawerPs?.color}`,
              fontSize: 13, fontWeight: 800, color: drawerPs?.color,
            }}>
              ✏️ {gs.drawer} is drawing
            </div>
            {isDrawer && phase === 'drawing' && (
              <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(247,183,49,0.15)', border: '1.5px solid var(--gold)', fontSize: 15, fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                Word: {word}
              </div>
            )}
            {isGuesser && phase === 'drawing' && (
              <div style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 700 }}>
                Guess the word!
              </div>
            )}
            {phase === 'guessed' && (
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--owen)' }}>
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

          {isDrawer && phase === 'drawing' && (
            <button className="btn-ghost" style={{ marginBottom: 12, fontSize: 12 }} onClick={handleClear}>🗑 Clear Canvas</button>
          )}

          {isGuesser && phase === 'drawing' && (
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 12 }}>
              <input placeholder="Type your guess..." value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuess()}
                style={{ flex: 1 }} autoFocus
              />
              <button className="btn-gold" style={{ flexShrink: 0 }} onClick={handleGuess}>Guess!</button>
            </div>
          )}

          {guessMsg && <div style={{ fontWeight: 800, fontSize: 15, color: guessMsg.startsWith('🎉') ? 'var(--owen)' : '#f87171', marginBottom: 10 }}>{guessMsg}</div>}

          {phase === 'guessed' && (
            <button className="btn-gold" style={{ fontSize: 15 }} onClick={startRound}>🎲 Next Round!</button>
          )}
        </>
      )}
    </div>
  )
}
