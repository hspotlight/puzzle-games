import { Link } from 'react-router-dom'

interface GameCard {
  title: string
  description: string
  path: string
  emoji: string
  available: boolean
}

const GAMES: GameCard[] = [
  {
    title: 'Unblock Me',
    description: 'Slide blocks to free the red piece from the grid.',
    path: '/unblock-me',
    emoji: '🔴',
    available: true,
  },
  {
    title: '8-Puzzle',
    description: 'Slide 8 tiles into order on a 3×3 grid — the classic sliding puzzle.',
    path: '/sliding-puzzle',
    emoji: '🔢',
    available: true,
  },
  {
    title: 'Flow Free',
    description: 'Connect matching colored dots and fill every cell on the grid.',
    path: '/flow-free',
    emoji: '🌈',
    available: true,
  },
  {
    title: 'Unblock Me — Learn',
    description: 'Learn BFS & DFS by watching algorithms solve the puzzle. 6 chapters from states to complexity.',
    path: '/unblock-me-v2',
    emoji: '🎓',
    available: true,
  },
]

export function HomePage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 42, color: '#ffcc80', marginBottom: 8 }}>Puzzle Games</h1>
      <p style={{ color: '#bcaaa4', marginBottom: 48, fontSize: 16 }}>
        Classic brain-teasers, playable in your browser.
      </p>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        {GAMES.map(game => (
          <Link
            key={game.path}
            to={game.available ? game.path : '#'}
            style={{ textDecoration: 'none', pointerEvents: game.available ? 'auto' : 'none' }}
          >
            <div
              style={{
                width: 200,
                padding: '28px 20px',
                background: game.available ? '#3e2723' : '#2a1f1c',
                borderRadius: 16,
                color: game.available ? '#fff' : '#6d4c41',
                border: `2px solid ${game.available ? '#8d6e63' : '#3e2723'}`,
                cursor: game.available ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (game.available) {
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = ''
                ;(e.currentTarget as HTMLElement).style.boxShadow = ''
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{game.emoji}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{game.title}</h2>
              <p style={{ margin: 0, fontSize: 13, color: game.available ? '#bcaaa4' : '#4e342e' }}>
                {game.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
