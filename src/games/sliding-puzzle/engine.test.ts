import { describe, it, expect } from 'vitest'
import {
  buildOccupancy,
  getMovableRange,
  applyMove,
  serializeState,
  getLegalMoves,
  findEmpty,
} from './engine'
import type { GameState } from './types'

// Solved 3x3: 1 2 3 / 4 5 6 / 7 8 _
const SOLVED: GameState = {
  gridSize: 3,
  moves: 0,
  won: true,
  tiles: [
    { id: 't1', value: 1, row: 0, col: 0 },
    { id: 't2', value: 2, row: 0, col: 1 },
    { id: 't3', value: 3, row: 0, col: 2 },
    { id: 't4', value: 4, row: 1, col: 0 },
    { id: 't5', value: 5, row: 1, col: 1 },
    { id: 't6', value: 6, row: 1, col: 2 },
    { id: 't7', value: 7, row: 2, col: 0 },
    { id: 't8', value: 8, row: 2, col: 1 },
    { id: 'empty', value: 0, row: 2, col: 2 },
  ],
}

// Level 1: 1 2 3 / 4 _ 5 / 7 8 6   (empty at 1,1)
const L1: GameState = {
  gridSize: 3,
  moves: 0,
  won: false,
  tiles: [
    { id: 't1', value: 1, row: 0, col: 0 },
    { id: 't2', value: 2, row: 0, col: 1 },
    { id: 't3', value: 3, row: 0, col: 2 },
    { id: 't4', value: 4, row: 1, col: 0 },
    { id: 'empty', value: 0, row: 1, col: 1 },
    { id: 't5', value: 5, row: 1, col: 2 },
    { id: 't7', value: 7, row: 2, col: 0 },
    { id: 't8', value: 8, row: 2, col: 1 },
    { id: 't6', value: 6, row: 2, col: 2 },
  ],
}

// ── buildOccupancy ────────────────────────────────────────────────────────────

describe('buildOccupancy', () => {
  it('places all tiles at their row/col', () => {
    const occ = buildOccupancy(L1)
    expect(occ[0][0]).toBe('t1')
    expect(occ[0][1]).toBe('t2')
    expect(occ[1][2]).toBe('t5')
    expect(occ[2][2]).toBe('t6')
  })

  it('marks empty cell as null', () => {
    const occ = buildOccupancy(L1)
    expect(occ[1][1]).toBeNull()
  })

  it('has correct dimensions for a 3x3 grid', () => {
    const occ = buildOccupancy(L1)
    expect(occ.length).toBe(3)
    expect(occ[0].length).toBe(3)
  })

  it('solved state has null only at (2,2)', () => {
    const occ = buildOccupancy(SOLVED)
    let nullCount = 0
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        if (occ[r][c] === null) nullCount++
    expect(nullCount).toBe(1)
    expect(occ[2][2]).toBeNull()
  })
})

// ── getMovableRange ───────────────────────────────────────────────────────────

describe('getMovableRange', () => {
  it('returns {min:0, max:1} for a tile directly left of empty', () => {
    // In L1, t4 is at (1,0) and empty is at (1,1) — t4 can slide right
    const t4 = L1.tiles.find(t => t.id === 't4')!
    expect(getMovableRange(t4, L1)).toEqual({ min: 0, max: 1 })
  })

  it('returns {min:0, max:1} for a tile directly right of empty', () => {
    // In L1, t5 is at (1,2) and empty is at (1,1) — t5 can slide left
    const t5 = L1.tiles.find(t => t.id === 't5')!
    expect(getMovableRange(t5, L1)).toEqual({ min: 0, max: 1 })
  })

  it('returns {min:0, max:1} for a tile directly above empty', () => {
    // In L1, t2 is at (0,1) and empty is at (1,1) — t2 can slide down
    const t2 = L1.tiles.find(t => t.id === 't2')!
    expect(getMovableRange(t2, L1)).toEqual({ min: 0, max: 1 })
  })

  it('returns {min:0, max:1} for a tile directly below empty', () => {
    // In L1, t8 is at (2,1) and empty is at (1,1) — t8 can slide up
    const t8 = L1.tiles.find(t => t.id === 't8')!
    expect(getMovableRange(t8, L1)).toEqual({ min: 0, max: 1 })
  })

  it('returns {min:0, max:0} for a tile not adjacent to empty', () => {
    const t1 = L1.tiles.find(t => t.id === 't1')!
    expect(getMovableRange(t1, L1)).toEqual({ min: 0, max: 0 })
  })

  it('returns {min:0, max:0} for a tile diagonally adjacent', () => {
    // t7 is at (2,0) — diagonal to empty (1,1)
    const t7 = L1.tiles.find(t => t.id === 't7')!
    expect(getMovableRange(t7, L1)).toEqual({ min: 0, max: 0 })
  })

  it('returns {min:0, max:0} for the empty tile itself', () => {
    const empty = L1.tiles.find(t => t.id === 'empty')!
    expect(getMovableRange(empty, L1)).toEqual({ min: 0, max: 0 })
  })
})

// ── applyMove ─────────────────────────────────────────────────────────────────

describe('applyMove', () => {
  it('slides the tile into the empty space', () => {
    const next = applyMove(L1, { tileId: 't5' })
    const t5 = next.tiles.find(t => t.id === 't5')!
    expect(t5.row).toBe(1)
    expect(t5.col).toBe(1)
  })

  it('moves the empty space to where the tile was', () => {
    const next = applyMove(L1, { tileId: 't5' })
    const empty = findEmpty(next)
    expect(empty.row).toBe(1)
    expect(empty.col).toBe(2)
  })

  it('increments the move counter', () => {
    const next = applyMove(L1, { tileId: 't5' })
    expect(next.moves).toBe(1)
  })

  it('does not mutate the original state', () => {
    const originalTiles = JSON.stringify(L1.tiles)
    applyMove(L1, { tileId: 't5' })
    expect(JSON.stringify(L1.tiles)).toBe(originalTiles)
  })

  it('returns the same state if tileId is not adjacent to empty', () => {
    const next = applyMove(L1, { tileId: 't1' })
    expect(next).toBe(L1)
  })

  it('returns the same state for an invalid tileId', () => {
    const next = applyMove(L1, { tileId: 'nonexistent' })
    expect(next).toBe(L1)
  })

  it('detects win when tiles reach solved configuration', () => {
    // From L1: slide t5 left, then slide t6 up → solved
    const step1 = applyMove(L1, { tileId: 't5' })
    const step2 = applyMove(step1, { tileId: 't6' })
    expect(step2.won).toBe(true)
  })

  it('does not set won for a non-solved state', () => {
    const next = applyMove(L1, { tileId: 't5' })
    expect(next.won).toBe(false)
  })
})

// ── serializeState ────────────────────────────────────────────────────────────

describe('serializeState', () => {
  it('produces the same string for the same state', () => {
    expect(serializeState(L1)).toBe(serializeState(L1))
  })

  it('produces different strings for different states', () => {
    const next = applyMove(L1, { tileId: 't5' })
    expect(serializeState(L1)).not.toBe(serializeState(next))
  })

  it('is order-independent — tile array order does not matter', () => {
    const shuffled: GameState = { ...L1, tiles: [...L1.tiles].reverse() }
    expect(serializeState(L1)).toBe(serializeState(shuffled))
  })

  it('solved state serializes consistently', () => {
    const s = serializeState(SOLVED)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })
})

// ── getLegalMoves ─────────────────────────────────────────────────────────────

describe('getLegalMoves', () => {
  it('returns exactly 4 moves when empty is in the center', () => {
    // L1 has empty at (1,1) — all 4 neighbours are valid tiles
    const moves = getLegalMoves(L1)
    expect(moves.length).toBe(4)
  })

  it('returns exactly 2 moves when empty is in a corner', () => {
    // SOLVED has empty at (2,2) — only (1,2) and (2,1) are adjacent
    const moves = getLegalMoves(SOLVED)
    expect(moves.length).toBe(2)
  })

  it('only includes tiles actually adjacent to empty', () => {
    const moves = getLegalMoves(L1)
    const ids = moves.map(m => m.tileId)
    expect(ids).toContain('t2')   // above empty
    expect(ids).toContain('t4')   // left of empty
    expect(ids).toContain('t5')   // right of empty
    expect(ids).toContain('t8')   // below empty
    expect(ids).not.toContain('t1') // not adjacent
    expect(ids).not.toContain('empty')
  })

  it('never includes the empty tile itself', () => {
    const moves = getLegalMoves(L1)
    expect(moves.every(m => m.tileId !== 'empty')).toBe(true)
  })
})
