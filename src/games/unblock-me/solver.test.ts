import { describe, it, expect } from 'vitest'
import { solve } from './solver'
import type { GameState } from './types'

const TRIVIAL: GameState = {
  gridSize: 4,
  exitRow: 1,
  moves: 0,
  won: false,
  blocks: [{ id: 'target', row: 1, col: 1, length: 2, direction: 'horizontal', isTarget: true }],
}

const ONE_BLOCKER: GameState = {
  gridSize: 4,
  exitRow: 1,
  moves: 0,
  won: false,
  blocks: [
    { id: 'target', row: 1, col: 0, length: 2, direction: 'horizontal', isTarget: true },
    { id: 'vb', row: 0, col: 2, length: 2, direction: 'vertical', isTarget: false },
  ],
}

describe('BFS solver', () => {
  it('solves trivial puzzle in 1 move', () => {
    const r = solve(TRIVIAL, 'bfs')
    expect(r.solved).toBe(true)
    expect(r.moves.length).toBe(1)
    expect(r.moves[0].blockId).toBe('target')
  })

  it('solves one-blocker puzzle', () => {
    const r = solve(ONE_BLOCKER, 'bfs')
    expect(r.solved).toBe(true)
    expect(r.moves.length).toBeGreaterThan(1)
  })

  it('returns already-solved state instantly', () => {
    const r = solve({ ...TRIVIAL, won: true }, 'bfs')
    expect(r.solved).toBe(true)
    expect(r.moves.length).toBe(0)
    expect(r.statesExplored).toBe(0)
  })
})

describe('DFS solver', () => {
  it('solves trivial puzzle', () => {
    const r = solve(TRIVIAL, 'dfs')
    expect(r.solved).toBe(true)
  })
})
