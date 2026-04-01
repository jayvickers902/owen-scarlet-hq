import { useState } from 'react'
import { supabase } from '../supabase'
import { PLAYERS, getPlayerStyle, makeRoomCode } from '../constants'

export default function Home({ onEnterRoom }) {
  const [name, setName]         = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode]         = useState(null)   // 'create' | 'join'
  const [busy, setBusy]         = useState(false)
  const [err, setErr]           = useState('')

  async function createRoom() {
    if (!name.trim()) { setErr('Pick a name first!'); return }
    setBusy(true); setErr('')
    const code = makeRoomCode()
    const { error } = await supabase.from('rooms').insert({
      code,
      host: name.trim(),
      members: [name.trim()],
      game: null,
      state: {},
    })
    setBusy(false)
    if (error) { setErr('Oops — try again!'); return }
    onEnterRoom(code, name.trim())
  }

  async function joinRoom() {
    if (!name.trim()) { setErr('Pick a name first!'); return }
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 4) { setErr('Room codes are 4 characters!'); return }
    setBusy(true); setErr('')
    const { data, error } = await supabase
      .from('rooms').select('*').eq('code', code).single()
    if (error || !data) { setBusy(false); setErr("Couldn't find that room — check the code!"); return }
    const members = data.members || []
    if (!members.includes(name.trim())) {
      await supabase.from('rooms').update({ members: [...members, name.trim()] }).eq('code', code)
    }
    setBusy(false)
    onEnterRoom(code, name.trim())
  }

  const style = name ? getPlayerStyle(name) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', maxWidth: 480, margin: '0 auto', width: '100%' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36, animation: 'float 4s ease-in-out infinite' }}>
        <div style={{ fontSize: 52 }}>🚀</div>
        <h1 className="orb" style={{ fontSize: 26, fontWeight: 900, marginTop: 10, marginBottom: 4, letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--owen)' }} className="glow-owen">Owen</span>
          <span style={{ color: 'var(--txm)', margin: '0 8px', fontSize: 20 }}>&</span>
          <span style={{ color: 'var(--scarlet)' }} className="glow-scarlet">Scarlet</span>
        </h1>
        <div className="orb" style={{ fontSize: 13, color: 'var(--txm)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          HQ
        </div>
      </div>

      <div className="card-lg fade-in" style={{ width: '100%' }}>

        {/* Name picker */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ marginBottom: 10 }}>Who are you?</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {PLAYERS.map(p => {
              const ps = getPlayerStyle(p)
              const selected = name === p
              return (
                <button key={p} onClick={() => { setName(p); setErr('') }}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 'var(--radius-sm)',
                    fontFamily: 'Nunito', fontWeight: 900, fontSize: 16,
                    border: `2px solid ${selected ? ps.color : 'var(--brd2)'}`,
                    background: selected ? ps.dim : 'transparent',
                    color: selected ? ps.color : 'var(--txm)',
                    boxShadow: selected ? `0 0 16px ${ps.glow}` : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {p}
                </button>
              )
            })}
          </div>
          <input
            placeholder="Or type any name..."
            value={name}
            onChange={e => { setName(e.target.value); setErr('') }}
            style={style ? { borderColor: style.color } : {}}
          />
        </div>

        <div className="divider" />

        {/* Mode select */}
        {!mode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className={`btn-${name === 'Owen' ? 'owen' : name === 'Scarlet' ? 'scarlet' : 'gold'}`}
              style={{ width: '100%', fontSize: 16 }}
              onClick={() => { if (!name.trim()) { setErr('Pick a name first!'); return } setMode('create') }}>
              🚀 Create a Room
            </button>
            <button className="btn-ghost" style={{ width: '100%', fontSize: 14, padding: '12px' }}
              onClick={() => { if (!name.trim()) { setErr('Pick a name first!'); return } setMode('join') }}>
              🔑 Join with a Code
            </button>
          </div>
        )}

        {/* Create */}
        {mode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className={`btn-${name === 'Owen' ? 'owen' : name === 'Scarlet' ? 'scarlet' : 'gold'}`}
              style={{ width: '100%', fontSize: 16 }} disabled={busy} onClick={createRoom}>
              {busy ? 'Creating...' : '🚀 Launch Room!'}
            </button>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setMode(null)}>← Back</button>
          </div>
        )}

        {/* Join */}
        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              placeholder="4-letter room code"
              value={joinCode}
              maxLength={4}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setErr('') }}
              style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
              autoFocus
            />
            <button
              className={`btn-${name === 'Owen' ? 'owen' : name === 'Scarlet' ? 'scarlet' : 'gold'}`}
              style={{ width: '100%', fontSize: 16 }} disabled={busy || joinCode.length < 4} onClick={joinRoom}>
              {busy ? 'Joining...' : '🔑 Join Room!'}
            </button>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setMode(null)}>← Back</button>
          </div>
        )}

        {err && (
          <div style={{ marginTop: 12, textAlign: 'center', color: '#f87171', fontWeight: 700, fontSize: 13 }}>
            {err}
          </div>
        )}
      </div>
    </div>
  )
}
