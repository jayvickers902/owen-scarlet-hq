import { useState, useCallback } from 'react'
import StarField from './components/StarField'
import Home from './components/Home'
import Lobby from './components/Lobby'
import TicTacToe from './games/TicTacToe'
import Pictionary from './games/Pictionary'
import ScienceLab from './games/ScienceLab'
import { useRoom } from './useRoom'

// Game screen wrapper — loads room state and passes it down
function GameScreen({ gameId, roomCode, playerName, onBack }) {
  const { room, loading, updateRoom } = useRoom(roomCode, playerName)
  if (loading || !room) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--txm)' }}>Loading...</div>

  const props = { room, playerName, updateRoom, onBack }

  if (gameId === 'tictactoe')  return <TicTacToe  {...props} />
  if (gameId === 'pictionary') return <Pictionary {...props} />
  if (gameId === 'sciencelab') return <ScienceLab playerName={playerName} onBack={onBack} />
  return <div style={{ padding: 40, color: 'var(--txm)' }}>Unknown game.</div>
}

export default function App() {
  const [screen, setScreen]       = useState('home')   // home | lobby | game
  const [roomCode, setRoomCode]   = useState(null)
  const [playerName, setPlayer]   = useState(null)
  const [gameId, setGameId]       = useState(null)

  function enterRoom(code, name) {
    setRoomCode(code)
    setPlayer(name)
    setScreen('lobby')
  }

  const startGame = useCallback((id) => {
    setGameId(id)
    setScreen('game')
  }, [])

  function backToLobby() { setScreen('lobby') }
  function backToHome()  { setRoomCode(null); setPlayer(null); setGameId(null); setScreen('home') }

  return (
    <>
      <StarField />
      <div className="app">
        {screen === 'home' && (
          <Home onEnterRoom={enterRoom} />
        )}
        {screen === 'lobby' && (
          <Lobby
            roomCode={roomCode}
            playerName={playerName}
            onStartGame={startGame}
            onLeave={backToHome}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            gameId={gameId}
            roomCode={roomCode}
            playerName={playerName}
            onBack={backToLobby}
          />
        )}
      </div>
    </>
  )
}
