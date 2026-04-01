export const PLAYERS = ['Owen', 'Scarlet']

export const PLAYER_COLORS = {
  Owen:    { color: '#60a5fa', dim: 'rgba(96,165,250,0.18)', glow: 'rgba(96,165,250,0.4)', text: '#020c1f', cls: 'owen' },
  Scarlet: { color: '#f472b6', dim: 'rgba(244,114,182,0.18)', glow: 'rgba(244,114,182,0.4)', text: '#2d0015', cls: 'scarlet' },
}

export const DEFAULT_COLOR = { color: '#a78bfa', dim: 'rgba(167,139,250,0.18)', glow: 'rgba(167,139,250,0.4)', text: '#1a1040', cls: 'purple' }

export function getPlayerStyle(name) {
  return PLAYER_COLORS[name] ?? DEFAULT_COLOR
}

export const GAMES = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    emoji: '⭕',
    description: 'Classic X\'s and O\'s — first to three wins!',
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: 'pictionary',
    name: 'Pictionary',
    emoji: '🎨',
    description: 'Draw it — can your partner guess what it is?',
    minPlayers: 2,
    maxPlayers: 4,
  },
]

export function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}
