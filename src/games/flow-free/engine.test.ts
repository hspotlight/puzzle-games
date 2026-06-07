import { describe, it, expect } from 'vitest'
import { buildOccupancy, getNeighbors, applyMove, serializeState, getLegalMoves, isPathComplete } from './engine'
import type { GameState, FlowPath } from './types'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    gridSize: 4,
    endpoints: [
      { colorId: 'red', row: 0, col: 0 },
      { colorId: 'red', row: 3, col: 3 },
      { colorId: 'blue', row: 0, col: 3 },
      { colorId: 'blue', row: 3, col: 0 },
    ],
    paths: [],
    moves: 0,
    won: false,
    ...overrides,
  }
}

// ---- buildOccupancy ----

describe('buildOccupancy', () => {
  it('returns all nulls for empty state', () => {
    const state = makeState()
    const occ = buildOccupancy(state)
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        expect(occ[r][c]).toBeNull()
  })

  it('fills cells covered by a path', () => {
    const state = makeState({
      paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }],
    })
    const occ = buildOccupancy(state)
    expect(occ[0][0]).toBe('red')
    expect(occ[0][1]).toBe('red')
    expect(occ[0][2]).toBeNull()
  })

  it('handles multiple paths without overlap', () => {
    const state = makeState({
      paths: [
        { colorId: 'red', cells: [{ row: 0, col: 0 }] },
        { colorId: 'blue', cells: [{ row: 1, col: 1 }] },
      ],
    })
    const occ = buildOccupancy(state)
    expect(occ[0][0]).toBe('red')
    expect(occ[1][1]).toBe('blue')
    expect(occ[0][1]).toBeNull()
  })

  it('has correct grid dimensions', () => {
    const state = makeState({ gridSize: 5 })
    const occ = buildOccupancy(state)
    expect(occ.length).toBe(5)
    expect(occ[0].length).toBe(5)
  })
})

// ---- getNeighbors ----

describe('getNeighbors', () => {
  it('returns 4 neighbors for center cell', () => {
    const n = getNeighbors(2, 2, 5)
    expect(n).toHaveLength(4)
  })

  it('returns 2 neighbors for corner cell', () => {
    const n = getNeighbors(0, 0, 4)
    expect(n).toHaveLength(2)
  })

  it('returns 3 neighbors for edge cell', () => {
    const n = getNeighbors(0, 2, 4)
    expect(n).toHaveLength(3)
  })

  it('does not return out-of-bounds cells', () => {
    const n = getNeighbors(0, 0, 3)
    for (const c of n) {
      expect(c.row).toBeGreaterThanOrEqual(0)
      expect(c.col).toBeGreaterThanOrEqual(0)
    }
  })
})

// ---- applyMove ----

describe('applyMove', () => {
  it('adds a new path for the color', () => {
    const state = makeState()
    const next = applyMove(state, { colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] })
    expect(next.paths).toHaveLength(1)
    expect(next.paths[0].colorId).toBe('red')
  })

  it('replaces existing path for same color', () => {
    const state = makeState({
      paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }] }],
    })
    const next = applyMove(state, { colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] })
    expect(next.paths).toHaveLength(1)
    expect(next.paths[0].cells).toHaveLength(2)
  })

  it('increments move counter', () => {
    const state = makeState()
    const next = applyMove(state, { colorId: 'red', cells: [{ row: 0, col: 0 }] })
    expect(next.moves).toBe(1)
  })

  it('does not mutate original state', () => {
    const state = makeState()
    const snapshot = JSON.stringify(state)
    applyMove(state, { colorId: 'red', cells: [{ row: 0, col: 0 }] })
    expect(JSON.stringify(state)).toBe(snapshot)
  })

  it('removes path when cells array is empty', () => {
    const state = makeState({
      paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }] }],
    })
    const next = applyMove(state, { colorId: 'red', cells: [] })
    expect(next.paths.find(p => p.colorId === 'red')).toBeUndefined()
  })

  it('detects win condition when all cells filled and all paths complete', () => {
    // 2x2 grid, 2 colors connecting all 4 cells
    const state: GameState = {
      gridSize: 2,
      endpoints: [
        { colorId: 'red', row: 0, col: 0 },
        { colorId: 'red', row: 1, col: 0 },
        { colorId: 'blue', row: 0, col: 1 },
        { colorId: 'blue', row: 1, col: 1 },
      ],
      paths: [
        { colorId: 'blue', cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }] },
      ],
      moves: 0,
      won: false,
    }
    const next = applyMove(state, {
      colorId: 'red',
      cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }],
    })
    expect(next.won).toBe(true)
  })
})

// ---- serializeState ----

describe('serializeState', () => {
  it('same state produces same string', () => {
    const state = makeState({
      paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }],
    })
    expect(serializeState(state)).toBe(serializeState(state))
  })

  it('different paths produce different strings', () => {
    const a = makeState({ paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }] }] })
    const b = makeState({ paths: [{ colorId: 'red', cells: [{ row: 1, col: 0 }] }] })
    expect(serializeState(a)).not.toBe(serializeState(b))
  })

  it('is order-independent — path array order does not matter', () => {
    const a = makeState({
      paths: [
        { colorId: 'red', cells: [{ row: 0, col: 0 }] },
        { colorId: 'blue', cells: [{ row: 1, col: 1 }] },
      ],
    })
    const b = makeState({
      paths: [
        { colorId: 'blue', cells: [{ row: 1, col: 1 }] },
        { colorId: 'red', cells: [{ row: 0, col: 0 }] },
      ],
    })
    expect(serializeState(a)).toBe(serializeState(b))
  })
})

// ---- getLegalMoves ----

describe('getLegalMoves', () => {
  it('returns moves for all colors when no paths exist', () => {
    const state = makeState()
    const moves = getLegalMoves(state)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('can extend an existing path', () => {
    const state = makeState({
      paths: [{ colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }],
    })
    const moves = getLegalMoves(state)
    const redExtensions = moves.filter(m => m.colorId === 'red' && m.cells.length > 2)
    expect(redExtensions.length).toBeGreaterThan(0)
  })

  it('does not extend into occupied cells of another color', () => {
    const state = makeState({
      paths: [
        { colorId: 'red', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
        { colorId: 'blue', cells: [{ row: 0, col: 2 }, { row: 0, col: 3 }] },
      ],
    })
    const moves = getLegalMoves(state)
    // red should not be able to extend into blue cells
    const illegalRedMove = moves.find(
      m => m.colorId === 'red' && m.cells.some(c => c.row === 0 && c.col === 2)
    )
    expect(illegalRedMove).toBeUndefined()
  })
})

// ---- isPathComplete ----

describe('isPathComplete', () => {
  it('returns true when path connects both endpoints', () => {
    const state = makeState()
    const path: FlowPath = {
      colorId: 'red',
      cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 3, col: 3 }],
    }
    // endpoints are at (0,0) and (3,3)
    expect(isPathComplete(path, state)).toBe(true)
  })

  it('returns false when path does not reach second endpoint', () => {
    const state = makeState()
    const path: FlowPath = {
      colorId: 'red',
      cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    }
    expect(isPathComplete(path, state)).toBe(false)
  })

  it('returns false for single-cell path', () => {
    const state = makeState()
    const path: FlowPath = { colorId: 'red', cells: [{ row: 0, col: 0 }] }
    expect(isPathComplete(path, state)).toBe(false)
  })
})
