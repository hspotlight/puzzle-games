import { useState } from 'react'
import type { GameState, MoveAction } from '../types'
import { solve, type SolverAlgorithm } from '../solver'

interface Props {
  state: GameState
  onPlaySolution: (moves: MoveAction[]) => void
}

export function SolverPanel({ state, onPlaySolution }: Props) {
  const [algorithm, setAlgorithm] = useState<SolverAlgorithm>('bfs')
  const [result, setResult] = useState<{ solved: boolean; moves: number; states: number } | null>(null)
  const [running, setRunning] = useState(false)

  function handleSolve() {
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const r = solve(state, algorithm)
      setResult({ solved: r.solved, moves: r.moves.length, states: r.statesExplored })
      if (r.solved) onPlaySolution(r.moves)
      setRunning(false)
    }, 10)
  }

  return (
    <div style={{ marginTop: 24, padding: 16, background: '#3e2723', borderRadius: 10, color: '#fff', minWidth: 260 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#ffcc80' }}>Auto Solver</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['bfs', 'dfs'] as SolverAlgorithm[]).map(alg => (
          <button
            key={alg}
            onClick={() => setAlgorithm(alg)}
            style={{
              padding: '4px 14px',
              borderRadius: 6,
              border: 'none',
              background: algorithm === alg ? '#ff8f00' : '#5d4037',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: algorithm === alg ? 700 : 400,
            }}
          >
            {alg.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        onClick={handleSolve}
        disabled={running || state.won}
        style={{
          width: '100%',
          padding: '8px 0',
          borderRadius: 8,
          border: 'none',
          background: state.won ? '#4caf50' : '#e65100',
          color: '#fff',
          fontWeight: 700,
          cursor: state.won ? 'default' : 'pointer',
          fontSize: 14,
        }}
      >
        {running ? 'Solving…' : state.won ? 'Already Solved!' : 'Solve & Animate'}
      </button>
      {result && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#ffcc80' }}>
          {result.solved
            ? `✓ Solved in ${result.moves} move${result.moves !== 1 ? 's' : ''} (${result.states} states explored)`
            : `✗ No solution found (${result.states} states explored)`}
        </div>
      )}
    </div>
  )
}
