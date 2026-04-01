import { useState, useEffect } from 'react'
import { GAMES, getPlayerStyle } from '../constants'
import { useRoom } from '../useRoom'

export default function Lobby({ roomCode, playerName, onStartGame, onLeave }) {
  const { room, loading, updateRoom, leaveRoom } = useRoom(roomCode, playerName)
  const [selectedGame, setSelectedGame] = useState(null)

  // Detect when host starts a game
  useEffect(() => {
    if (room?.game && room?.state?.phase === 'playing') {
      onStartGame(room.game)
    }
  }, [room?.game, room?.state?.phase, onStartGame])

  async function handleLeave() {
    await leaveRoom()
    onLeave()
  }

  async function startGame() {
    if (!selectedGame || !isHost) return
    await updateRoom({ game: selectedGame, state: { phase: 'playing' } })
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--txm)', textAlign: 'center' }}>Connecting to room...</div>
  if (!room)   return <div style={{ padding: 32, color: '#f87171', textAlign: 'center' }}>Room not found.</div>

  const members  = room.members || []
  const isHost   = room.host === playerName
  const canStart = selectedGame && members.length >= 2

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 16px', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn-ghost" onClick={handleLeave} style={{ fontSize: 12 }}>← Leave</button>
        <div>
          <div className="label">Room Code</div>
          <div className="orb" style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em' }}>
            {roomCode}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="label">Playing as</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: getPlayerStyle(playerName).color }}>{playerName}</div>
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 12 }}>In this room</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {members.map(m => {
            const ps = getPlayerStyle(m)
            return (
              <div key={m} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 8,
                background: ps.dim, border: `1.5px solid ${ps.color}`,
                boxShadow: `0 0 10px ${ps.glow}`,
              }}>
                <span style={{ fontSize: 18 }}>{m === 'Owen' ? '🟢' : m === 'Scarlet' ? '🌸' : '⭐'}</span>
                <span style={{ fontWeight: 900, color: ps.color, fontSize: 15 }}>{m}</span>
                {m === room.host && <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700 }}>HOST</span>}
              </div>
            )
          })}
          {members.length < 2 && (
            <div style={{ color: 'var(--txd)', fontSize: 13, fontWeight: 600, padding: '8px 4px' }}>
              Waiting for your partner... share code <strong style={{ color: 'var(--gold)' }}>{roomCode}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Game picker */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 12 }}>Pick a game</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GAMES.map(g => {
            const sel = selectedGame === g.id
            return (
              <button key={g.id}
                onClick={() => isHost && setSelectedGame(g.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 10, border: `2px solid ${sel ? 'var(--purple)' : 'var(--brd)'}`,
                  background: sel ? 'rgba(167,139,250,0.12)' : 'transparent',
                  cursor: isHost ? 'pointer' : 'default', textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: sel ? '0 0 16px rgba(167,139,250,0.3)' : 'none',
                }}>
                <span style={{ fontSize: 28 }}>{g.emoji}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: sel ? 'var(--purple)' : 'var(--tx)' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--txm)', marginTop: 2 }}>{g.description}</div>
                </div>
              </button>
            )
          })}
        </div>
        {!isHost && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--txd)', textAlign: 'center' }}>Waiting for {room.host} to pick a game...</div>}
      </div>

      {isHost && (
        <button
          className="btn-gold"
          style={{ width: '100%', fontSize: 17, padding: '14px' }}
          disabled={!canStart}
          onClick={startGame}>
          🎮 Let's Play!
        </button>
      )}
      {!isHost && room.game && (
        <div style={{ textAlign: 'center', color: 'var(--purple)', fontWeight: 700, fontSize: 14 }}>
          {room.host} is starting the game...
        </div>
      )}
    </div>
  )
}
