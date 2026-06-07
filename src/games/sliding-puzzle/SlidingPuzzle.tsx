import { useState, useCallback, useReducer, useRef, useEffect } from 'react'
import { Grid } from './components/Grid'
import { SlidingPuzzlePanel } from './components/SlidingPuzzlePanel'
import { HowToPlay } from './components/HowToPlay'
import type { GameState, MoveAction } from './types'
import { applyMove } from './engine'
import { LEVELS } from './levels'

const MIN_CELL = 64
const MAX_CELL = 100
const GRID_PADDING = 16
const GRID_GAP = 6

function useCellSize(gridSize: number) {
  const [cellSize, setCellSize] = useState(MAX_CELL)

  useEffect(() => {
    function update() {
      const available = Math.min(window.innerWidth - 96, 480)
      const computed = Math.floor((available - GRID_PADDING * 2 - GRID_GAP * (gridSize - 1)) / gridSize)
      setCellSize(Math.max(MIN_CELL, Math.min(MAX_CELL, computed)))
    }
    update()
    let timer: ReturnType<typeof setTimeout>
    const handler = () => { clearTimeout(timer); timer = setTimeout(update, 150) }
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('resize', handler); clearTimeout(timer) }
  }, [gridSize])

  return cellSize
}

interface GamePageState {
  levelIndex: number
  state: GameState
}

type Action =
  | { type: 'LOAD_LEVEL'; index: number }
  | { type: 'MOVE'; action: MoveAction }
  | { type: 'SET_STATE'; state: GameState }

function reducer(page: GamePageState, action: Action): GamePageState {
  switch (action.type) {
    case 'LOAD_LEVEL':
      return { levelIndex: action.index, state: LEVELS[action.index] }
    case 'MOVE':
      return { ...page, state: applyMove(page.state, action.action) }
    case 'SET_STATE':
      return { ...page, state: action.state }
  }
}

export function SlidingPuzzle() {
  const [{ levelIndex, state }, dispatch] = useReducer(reducer, {
    levelIndex: 0,
    state: LEVELS[0],
  })
  const [showHelp, setShowHelp] = useState(false)
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const cellSize = useCellSize(state.gridSize)

  function cancelAnimation() {
    animTimers.current.forEach(clearTimeout)
    animTimers.current = []
  }

  const handleMove = useCallback((action: MoveAction) => {
    dispatch({ type: 'MOVE', action })
  }, [])

  function loadLevel(idx: number) {
    cancelAnimation()
    dispatch({ type: 'LOAD_LEVEL', index: idx })
  }

  function handleReset() {
    cancelAnimation()
    dispatch({ type: 'LOAD_LEVEL', index: levelIndex })
  }

  function handlePlaySolution(moves: MoveAction[]) {
    cancelAnimation()
    const base = LEVELS[levelIndex]
    dispatch({ type: 'SET_STATE', state: base })

    let current = base
    moves.forEach((move, i) => {
      const id = setTimeout(() => {
        current = applyMove(current, move)
        dispatch({ type: 'SET_STATE', state: { ...current } })
      }, (i + 1) * 450)
      animTimers.current.push(id)
    })
  }

  const gridPx = state.gridSize * cellSize + (state.gridSize - 1) * GRID_GAP + GRID_PADDING * 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h1 style={{ color: '#ffcc80', margin: 0, fontSize: 26 }}>8-Puzzle</h1>
        <button
          onClick={() => setShowHelp(true)}
          title="How to play"
          style={{
            background: '#5d4037', border: '1px solid #8d6e63', color: '#ffcc80',
            borderRadius: '50%', width: 30, height: 30, cursor: 'pointer',
            fontSize: 15, fontWeight: 700, lineHeight: '28px', padding: 0,
          }}
        >?</button>
      </div>

      <p style={{ color: '#bcaaa4', marginBottom: 20, fontSize: 13, textAlign: 'center', maxWidth: 380 }}>
        Slide the tiles into order. Only{' '}
        <span style={{ color: '#ff8f00', fontWeight: 700 }}>highlighted tiles</span>{' '}
        adjacent to the blank space can move.
      </p>

      {/* Level selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, maxWidth: gridPx + 40 }}>
        {LEVELS.map((_, i) => (
          <button
            key={i}
            onClick={() => loadLevel(i)}
            style={{
              width: 34, height: 34, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: i === levelIndex ? '#e65100' : '#3e2723',
              color: i === levelIndex ? '#fff' : '#bcaaa4',
              cursor: 'pointer',
              outline: i === levelIndex ? '2px solid #ff8f00' : 'none',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Game area */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <Grid
            state={state}
            onMove={handleMove}
            cellSize={cellSize}
          />

          {/* Move counter + nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, width: gridPx }}>
            <span style={{ color: '#bcaaa4', fontSize: 14 }}>
              Level {levelIndex + 1} &nbsp;·&nbsp; Moves: <strong style={{ color: '#fff' }}>{state.moves}</strong>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {levelIndex > 0 && (
                <NavBtn onClick={() => loadLevel(levelIndex - 1)}>← Prev</NavBtn>
              )}
              <NavBtn onClick={handleReset}>Reset</NavBtn>
              {levelIndex < LEVELS.length - 1 && (
                <NavBtn onClick={() => loadLevel(levelIndex + 1)}>Next →</NavBtn>
              )}
            </div>
          </div>
        </div>

        <SlidingPuzzlePanel
          state={state}
          levelIndex={levelIndex}
          onPlaySolution={handlePlaySolution}
        />
      </div>

      {/* Win banner */}
      {state.won && (
        <div style={{
          marginTop: 28, padding: '18px 32px',
          background: '#1b5e20', color: '#a5d6a7',
          borderRadius: 12, fontSize: 20, fontWeight: 700, textAlign: 'center',
        }}>
          🎉 Level {levelIndex + 1} solved in {state.moves} moves!
          {levelIndex < LEVELS.length - 1 && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => loadLevel(levelIndex + 1)}
                style={{
                  background: '#4caf50', border: 'none', color: '#fff',
                  padding: '8px 24px', borderRadius: 8, fontSize: 15,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Next Level →
              </button>
            </div>
          )}
        </div>
      )}

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: '1px solid #8d6e63', color: '#bcaaa4',
        borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
      }}
    >
      {children}
    </button>
  )
}
