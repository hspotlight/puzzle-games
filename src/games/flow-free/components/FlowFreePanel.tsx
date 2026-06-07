import { useState } from 'react'
import type { GameState, MoveAction } from '../types'
import type { SolverAlgorithm } from '../solver'

interface FlowFreePanelProps {
  state: GameState
  onSolved: (moves: MoveAction[]) => void
}

export function FlowFreePanel({ state, onSolved }: FlowFreePanelProps) {
  const [algorithm, setAlgorithm] = useState<SolverAlgorithm>('bfs')
  const [status, setStatus] = useState<string>('')
  const [solving, setSolving] = useState(false)

  async function handleSolve() {
    setSolving(true)
    setStatus('Solving…')
    const { solve } = await import('../solver')
    const result = solve(state, algorithm)
    setSolving(false)
    if (result.solved) {
      setStatus(`Solved in ${result.moves.length} moves (${result.statesExplored} states explored)`)
      onSolved(result.moves)
    } else {
      setStatus(`No solution found (${result.statesExplored} states explored)`)
    }
  }

  return (
    <div
      style={{
        background: '#3e2723',
        borderRadius: 12,
        padding: '16px',
        border: '1px solid #5d4037',
        minWidth: 200,
      }}
    >
      <h3 style={{ color: '#ffcc80', margin: '0 0 12px', fontSize: 14 }}>Auto Solver</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['bfs', 'dfs'] as SolverAlgorithm[]).map(alg => (
          <button
            key={alg}
            onClick={() => setAlgorithm(alg)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: algorithm === alg ? '#ff8f00' : '#5d4037',
              color: algorithm === alg ? '#1a0f0a' : '#bcaaa4',
            }}
          >
            {alg.toUpperCase()}
          </button>
        ))}
      </div>

      <button
        onClick={handleSolve}
        disabled={solving || state.won}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 8,
          border: 'none',
          cursor: solving || state.won ? 'default' : 'pointer',
          background: solving || state.won ? '#5d4037' : '#e65100',
          color: solving || state.won ? '#bcaaa4' : '#fff',
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 10,
        }}
      >
        {solving ? 'Solving…' : 'Solve & Animate'}
      </button>

      {status && (
        <p style={{ color: '#bcaaa4', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{status}</p>
      )}

      <div style={{ marginTop: 12, borderTop: '1px solid #5d4037', paddingTop: 12 }}>
        <p style={{ color: '#bcaaa4', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#ffcc80' }}>BFS</strong> — finds shortest solution (fewest moves)
          <br />
          <strong style={{ color: '#ffcc80' }}>DFS</strong> — finds any solution faster on large grids
        </p>
      </div>
    </div>
  )
}
