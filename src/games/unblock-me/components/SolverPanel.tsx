import { useState, useEffect } from 'react'
import type { GameState, MoveAction } from '../types'
import { solve, type SolverAlgorithm } from '../solver'

interface Props {
  state: GameState
  levelIndex: number
  onPlaySolution: (moves: MoveAction[]) => void
}

export function SolverPanel({ state, levelIndex, onPlaySolution }: Props) {
  const [algorithm, setAlgorithm] = useState<SolverAlgorithm>('bfs')
  const [result, setResult] = useState<{ solved: boolean; moves: number; states: number } | null>(null)
  const [running, setRunning] = useState(false)

  // Clear result when level changes
  useEffect(() => { setResult(null) }, [levelIndex])

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

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: 6, border: 'none',
    background: active ? '#ff8f00' : '#5d4037',
    color: '#fff', cursor: 'pointer',
    fontWeight: active ? 700 : 400, fontSize: 13,
  })

  return (
    <div style={{
      padding: 16, background: '#3e2723', borderRadius: 10, color: '#fff',
      minWidth: 220, maxWidth: 260, width: '100%',
    }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#ffcc80' }}>Auto Solver</h3>

      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#a1887f', lineHeight: 1.5 }}>
        Choose an algorithm and watch the puzzle solve itself step by step.
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['bfs', 'dfs'] as SolverAlgorithm[]).map(alg => (
          <button key={alg} onClick={() => setAlgorithm(alg)} style={btnStyle(algorithm === alg)}>
            {alg.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#a1887f', marginBottom: 12, lineHeight: 1.4 }}>
        {algorithm === 'bfs'
          ? 'BFS — Breadth-First Search. Guaranteed shortest solution.'
          : 'DFS — Depth-First Search. Finds a solution fast, may not be shortest.'}
      </div>

      <button
        onClick={handleSolve}
        disabled={running || state.won}
        style={{
          width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
          background: state.won ? '#4caf50' : running ? '#5d4037' : '#e65100',
          color: '#fff', fontWeight: 700, cursor: (state.won || running) ? 'default' : 'pointer',
          fontSize: 14,
        }}
      >
        {running ? 'Solving…' : state.won ? '✓ Already Solved' : 'Solve & Animate'}
      </button>

      {result && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#ffcc80', lineHeight: 1.5 }}>
          {result.solved
            ? `✓ ${result.moves} move${result.moves !== 1 ? 's' : ''} · ${result.states.toLocaleString()} states explored`
            : `✗ No solution found (${result.states.toLocaleString()} states explored)`}
        </div>
      )}
    </div>
  )
}
