import { useState, useCallback, useRef } from 'react'
import { Grid } from './components/Grid'
import { SolverPanel } from './components/SolverPanel'
import type { GameState, MoveAction } from './types'
import { applyMove } from './engine'
import { LEVELS } from './levels'

export function UnblockMe() {
  const [state, setState] = useState<GameState>(() => LEVELS[0])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMove = useCallback((action: MoveAction) => {
    setState(prev => applyMove(prev, action))
  }, [])

  function handleReset() {
    if (animRef.current) clearTimeout(animRef.current)
    setState(LEVELS[0])
    setSelectedBlockId(null)
  }

  function handlePlaySolution(moves: MoveAction[]) {
    if (animRef.current) clearTimeout(animRef.current)
    setState(LEVELS[0])
    setSelectedBlockId(null)

    let current = LEVELS[0]
    moves.forEach((move, i) => {
      animRef.current = setTimeout(() => {
        current = applyMove(current, move)
        setState({ ...current })
      }, (i + 1) * 400)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
      <h1 style={{ color: '#ffcc80', marginBottom: 8, fontSize: 28 }}>Unblock Me</h1>
      <p style={{ color: '#bcaaa4', marginBottom: 24, fontSize: 14, textAlign: 'center' }}>
        Click a block to select it, then click where to move it (or use arrow keys).
        <br />Move the <span style={{ color: '#ef5350', fontWeight: 700 }}>red block</span> to the right exit.
      </p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <Grid
            state={state}
            onMove={handleMove}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#bcaaa4', fontSize: 14 }}>
            <span>Moves: <strong style={{ color: '#fff' }}>{state.moves}</strong></span>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid #8d6e63',
                color: '#bcaaa4',
                borderRadius: 6,
                padding: '3px 12px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <SolverPanel state={state} onPlaySolution={handlePlaySolution} />
      </div>

      {state.won && (
        <div
          style={{
            marginTop: 32,
            padding: '20px 40px',
            background: '#1b5e20',
            color: '#a5d6a7',
            borderRadius: 12,
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          🎉 Puzzle Solved in {state.moves} moves!
        </div>
      )}
    </div>
  )
}
