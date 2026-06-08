import { useReducer, useState, useEffect, useCallback } from 'react'
import { LEVELS } from './levels'
import { applyMove, buildOccupancy, isPathComplete, getNeighbors } from './engine'
import type { GameState, MoveAction, ColorId } from './types'
import { Grid, FlowFreePanel, HowToPlay } from './components'

const MIN_CELL = 44
const MAX_CELL = 72
const GRID_PADDING = 12
const GRID_GAP = 4

function useCellSize(gridSize: number) {
  const [cellSize, setCellSize] = useState(MAX_CELL)
  useEffect(() => {
    function update() {
      const available = Math.min(window.innerWidth - 96, 480)
      const computed = Math.floor(
        (available - GRID_PADDING * 2 - GRID_GAP * (gridSize - 1)) / gridSize
      )
      setCellSize(Math.max(MIN_CELL, Math.min(MAX_CELL, computed)))
    }
    update()
    let timer: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(update, 150)
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      clearTimeout(timer)
    }
  }, [gridSize])
  return cellSize
}

interface PageState {
  levelIndex: number
  game: GameState
  activeColor: ColorId | null
}

type Action =
  | { type: 'LOAD_LEVEL'; index: number }
  | { type: 'APPLY_MOVE'; action: MoveAction }
  | { type: 'SET_ACTIVE'; color: ColorId | null }
  | { type: 'SET_STATE'; state: GameState }

function reducer(page: PageState, action: Action): PageState {
  switch (action.type) {
    case 'LOAD_LEVEL':
      return {
        levelIndex: action.index,
        game: LEVELS[action.index],
        activeColor: null,
      }
    case 'APPLY_MOVE':
      return {
        ...page,
        game: applyMove(page.game, action.action),
      }
    case 'SET_ACTIVE':
      return { ...page, activeColor: action.color }
    case 'SET_STATE':
      return { ...page, game: action.state, activeColor: null }
    default:
      return page
  }
}

export function FlowFree() {
  const [page, dispatch] = useReducer(reducer, {
    levelIndex: 0,
    game: LEVELS[0],
    activeColor: null,
  })
  const [showHelp, setShowHelp] = useState(false)

  const cellSize = useCellSize(page.game.gridSize)

  // When user presses down on a cell, start drawing that color's path
  const handleCellPointerDown = useCallback(
    (row: number, col: number) => {
      const { game } = page
      // Check if this cell is an endpoint
      const ep = game.endpoints.find(e => e.row === row && e.col === col)
      if (ep) {
        // Start fresh path from this endpoint
        dispatch({ type: 'SET_ACTIVE', color: ep.colorId })
        dispatch({
          type: 'APPLY_MOVE',
          action: { colorId: ep.colorId, cells: [{ row, col }] },
        })
        return
      }
      // Check if this cell is on an existing path — start from nearest end
      const occ = buildOccupancy(game)
      const colorId = occ[row][col]
      if (colorId) {
        const path = game.paths.find(p => p.colorId === colorId)
        if (path) {
          const head = path.cells[0]
          const tail = path.cells[path.cells.length - 1]
          const distHead = Math.abs(head.row - row) + Math.abs(head.col - col)
          const distTail = Math.abs(tail.row - row) + Math.abs(tail.col - col)
          // Truncate path to the clicked cell from the nearer end
          let newCells: Array<{ row: number; col: number }>
          if (distHead <= distTail) {
            const idx = path.cells.findIndex(c => c.row === row && c.col === col)
            newCells = path.cells.slice(idx)
          } else {
            const idx = path.cells.findIndex(c => c.row === row && c.col === col)
            newCells = path.cells.slice(0, idx + 1)
          }
          dispatch({ type: 'SET_ACTIVE', color: colorId })
          dispatch({ type: 'APPLY_MOVE', action: { colorId, cells: newCells } })
        }
      }
    },
    [page]
  )

  // When pointer enters a new cell during drag, extend active path
  const handleCellPointerEnter = useCallback(
    (row: number, col: number) => {
      const { activeColor, game } = page
      if (!activeColor || game.won) return

      const path = game.paths.find(p => p.colorId === activeColor)
      if (!path || path.cells.length === 0) return

      const tail = path.cells[path.cells.length - 1]

      // Check if new cell is adjacent to tail
      const neighbors = getNeighbors(tail.row, tail.col, game.gridSize)
      const isAdjacent = neighbors.some(n => n.row === row && n.col === col)
      if (!isAdjacent) return

      // Backtrack if stepping onto second-to-last cell
      if (path.cells.length >= 2) {
        const prev = path.cells[path.cells.length - 2]
        if (prev.row === row && prev.col === col) {
          dispatch({
            type: 'APPLY_MOVE',
            action: { colorId: activeColor, cells: path.cells.slice(0, -1) },
          })
          return
        }
      }

      // Don't revisit own path
      if (path.cells.some(c => c.row === row && c.col === col)) return

      // Don't step on occupied cells (other colors)
      const occ = buildOccupancy(game)
      const cellColor = occ[row][col]
      if (cellColor !== null && cellColor !== activeColor) return

      // Don't step on endpoint dots of other colors (even if no path drawn yet)
      const isOtherColorEndpoint = game.endpoints.some(
        e => e.row === row && e.col === col && e.colorId !== activeColor
      )
      if (isOtherColorEndpoint) return

      // Allow stepping on our own endpoint (to complete)
      const newCells = [...path.cells, { row, col }]
      dispatch({ type: 'APPLY_MOVE', action: { colorId: activeColor, cells: newCells } })
    },
    [page]
  )

  const handlePointerUp = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE', color: null })
  }, [])

  function handleSolved(moves: MoveAction[]) {
    let state = page.game
    let i = 0
    function step() {
      if (i >= moves.length) return
      state = applyMove(state, moves[i++])
      dispatch({ type: 'SET_STATE', state })
      if (!state.won) setTimeout(step, 180)
    }
    setTimeout(step, 50)
  }

  const { game, levelIndex } = page
  const totalColors = new Set(game.endpoints.map(e => e.colorId)).size
  const completedColors = game.paths.filter(p => isPathComplete(p, game)).length
  const occ = buildOccupancy(game)
  let filledCells = 0
  for (let r = 0; r < game.gridSize; r++)
    for (let c = 0; c < game.gridSize; c++)
      if (occ[r][c] !== null) filledCells++
  const totalCells = game.gridSize * game.gridSize
  const pipePct = Math.round((filledCells / totalCells) * 100)

  return (
    <div
      style={{
        padding: '24px 16px',
        maxWidth: 800,
        margin: '0 auto',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: '#ffcc80', textAlign: 'center', margin: '0 0 4px', fontSize: 28 }}>
        Flow Free
      </h1>
      <p style={{ color: '#bcaaa4', textAlign: 'center', margin: '0 0 20px', fontSize: 13 }}>
        Connect matching colors · fill every cell
      </p>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 16,
          fontSize: 13,
          color: '#bcaaa4',
        }}
      >
        <span>
          Flows:{' '}
          <strong style={{ color: '#ffcc80' }}>
            {completedColors}/{totalColors}
          </strong>
        </span>
        <span>
          Moves: <strong style={{ color: '#ffcc80' }}>{game.moves}</strong>
        </span>
        <span>
          Pipe: <strong style={{ color: '#ffcc80' }}>{pipePct}%</strong>
        </span>
      </div>

      {/* Level selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {LEVELS.map((_lvl, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: 'LOAD_LEVEL', index: i })}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: i === levelIndex ? '#ff8f00' : '#3e2723',
              color: i === levelIndex ? '#1a0f0a' : '#bcaaa4',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Grid
            state={game}
            cellSize={cellSize}
            activeColor={page.activeColor}
            onCellPointerDown={handleCellPointerDown}
            onCellPointerEnter={handleCellPointerEnter}
            onPointerUp={handlePointerUp}
          />

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => dispatch({ type: 'LOAD_LEVEL', index: Math.max(0, levelIndex - 1) })}
              disabled={levelIndex === 0}
              style={navBtnStyle(levelIndex > 0)}
            >
              ← Prev
            </button>
            <button
              onClick={() => dispatch({ type: 'LOAD_LEVEL', index: levelIndex })}
              style={navBtnStyle(true)}
            >
              Reset
            </button>
            <button onClick={() => setShowHelp(true)} style={navBtnStyle(true)}>
              ?
            </button>
            <button
              onClick={() =>
                dispatch({ type: 'LOAD_LEVEL', index: Math.min(LEVELS.length - 1, levelIndex + 1) })
              }
              disabled={levelIndex === LEVELS.length - 1}
              style={navBtnStyle(levelIndex < LEVELS.length - 1)}
            >
              Next →
            </button>
          </div>
        </div>

        <FlowFreePanel state={game} onSolved={handleSolved} />
      </div>

      {/* Win banner */}
      {game.won && (
        <div
          style={{
            marginTop: 24,
            padding: '20px',
            background: '#1b5e20',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px solid #388e3c',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <p style={{ color: '#a5d6a7', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>
            Solved in {game.moves} moves!
          </p>
          {levelIndex < LEVELS.length - 1 && (
            <button
              onClick={() => dispatch({ type: 'LOAD_LEVEL', index: levelIndex + 1 })}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#43a047',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Next Level →
            </button>
          )}
        </div>
      )}

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}

function navBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: enabled ? 'pointer' : 'default',
    background: enabled ? '#5d4037' : '#3e2723',
    color: enabled ? '#bcaaa4' : '#4e342e',
    fontWeight: 600,
    fontSize: 13,
  }
}
