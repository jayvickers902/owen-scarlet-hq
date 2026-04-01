import { useEffect, useCallback } from 'react'
import { getPlayerStyle } from '../constants'

const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function getWinner(board) {
  for (const [a,b,c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] }
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] }
  return null
}

function initState(members) {
  return {
    board: Array(9).fill(null),
    turn: members[0],
    result: null,
    markers: { [members[0]]: 'X', [members[1]]: 'O' },
  }
}

export default function TicTacToe({ room, playerName, updateRoom, onBack }) {
  const members = room.members || []
  const gs      = room.state?.ttt ?? initState(members)

  // Initialize state if not yet set
  useEffect(() => {
    if (!room.state?.ttt) {
      updateRoom({ state: { ...room.state, ttt: initState(members) } })
    }
  }, [])

  const myMarker = gs.markers?.[playerName]
  const isMyTurn = gs.turn === playerName
  const result   = gs.result ?? getWinner(gs.board)

  async function handleClick(idx) {
    if (!isMyTurn || gs.board[idx] || result) return
    const newBoard = [...gs.board]
    newBoard[idx] = myMarker
    const newResult = getWinner(newBoard)
    const nextTurn  = members.find(m => m !== playerName)
    await updateRoom({
      state: {
        ...room.state,
        ttt: {
          ...gs,
          board: newBoard,
          turn: newResult ? gs.turn : nextTurn,
          result: newResult ?? null,
        }
      }
    })
  }

  async function reset() {
    await updateRoom({ state: { ...room.state, ttt: initState(members) } })
  }

  const winLine = result?.line ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', maxWidth: 420, margin: '0 auto', width: '100%' }}>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 20, gap: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18, color: 'var(--tx)' }}>Tic Tac Toe</div>
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        {members.map(m => {
          const ps = getPlayerStyle(m)
          const marker = gs.markers?.[m]
          const active = !result && gs.turn === m
          return (
            <div key={m} style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, textAlign: 'center',
              background: active ? ps.dim : 'var(--sur)',
              border: `2px solid ${active ? ps.color : 'var(--brd)'}`,
              boxShadow: active ? `0 0 16px ${ps.glow}` : 'none',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: ps.color }}>{marker}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: ps.color, marginTop: 2 }}>{m}</div>
              {active && <div style={{ fontSize: 11, color: 'var(--txm)', marginTop: 4 }}>YOUR TURN</div>}
            </div>
          )
        })}
      </div>

      {/* Board */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, width: '100%', maxWidth: 320, marginBottom: 20,
      }}>
        {gs.board.map((cell, i) => {
          const isWin = winLine.includes(i)
          const owner = members.find(m => gs.markers[m] === cell)
          const ps    = owner ? getPlayerStyle(owner) : null
          return (
            <button key={i} onClick={() => handleClick(i)}
              style={{
                aspectRatio: '1', borderRadius: 10,
                background: isWin ? (ps?.dim ?? 'var(--sur2)') : 'var(--sur2)',
                border: `2px solid ${isWin ? (ps?.color ?? 'var(--brd2)') : 'var(--brd)'}`,
                fontSize: 40, fontWeight: 900,
                color: ps?.color ?? 'var(--txm)',
                cursor: isMyTurn && !cell && !result ? 'pointer' : 'default',
                boxShadow: isWin ? `0 0 20px ${ps?.glow}` : 'none',
                transition: 'all 0.15s',
              }}>
              {cell ?? ''}
            </button>
          )
        })}
      </div>

      {/* Status */}
      {result && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {result.winner === 'draw' ? (
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>It's a draw! 🤝</div>
          ) : (
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: getPlayerStyle(result.winner).color }}>
                {result.winner} wins! 🎉
              </div>
            </div>
          )}
          <button className="btn-gold" style={{ marginTop: 14, fontSize: 15 }} onClick={reset}>Play Again</button>
        </div>
      )}
      {!result && !isMyTurn && (
        <div style={{ color: 'var(--txm)', fontSize: 14, fontWeight: 700 }}>
          Waiting for {gs.turn}...
        </div>
      )}
    </div>
  )
}
