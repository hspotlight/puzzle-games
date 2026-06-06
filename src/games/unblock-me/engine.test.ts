import { describe, it, expect } from 'vitest'
import { buildOccupancy, getMovableRange, applyMove, getLegalMoves, serializeState } from './engine'
import type { GameState } from './types'

const BASE: GameState = {
  gridSize: 6,
  exitRow: 2,
  moves: 0,
  won: false,
  blocks: [
    { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
    { id: 'blocker', row: 2, col: 3, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'vblock', row: 0, col: 2, length: 2, direction: 'vertical', isTarget: false },
  ],
}

describe('buildOccupancy', () => {
  it('marks occupied cells', () => {
    const grid = buildOccupancy(BASE)
    expect(grid[2][0]).toBe('target')
    expect(grid[2][1]).toBe('target')
    expect(grid[2][2]).toBe(null) // vblock only covers rows 0-1
    expect(grid[2][3]).toBe('blocker')
    expect(grid[0][2]).toBe('vblock')
    expect(grid[1][2]).toBe('vblock')
  })
})

describe('getMovableRange', () => {
  it('target can move right 1, blocked by vblock at col 2', () => {
    const target = BASE.blocks.find(b => b.id === 'target')!
    const range = getMovableRange(target, BASE)
    expect(range.min).toBe(0)
    expect(range.max).toBe(1)
  })

  it('vertical block cannot move up (at row 0) but can move down', () => {
    const vb = BASE.blocks.find(b => b.id === 'vblock')!
    const range = getMovableRange(vb, BASE)
    expect(range.min).toBe(0)
    expect(range.max).toBe(4)
  })
})

describe('applyMove', () => {
  it('moves target block right by 1', () => {
    const next = applyMove(BASE, { blockId: 'target', delta: 1 })
    const t = next.blocks.find(b => b.id === 'target')!
    expect(t.col).toBe(1)
    expect(next.moves).toBe(1)
    expect(next.won).toBe(false)
  })

  it('clamps move to available range', () => {
    const next = applyMove(BASE, { blockId: 'target', delta: 99 })
    const t = next.blocks.find(b => b.id === 'target')!
    expect(t.col).toBe(1)
  })

  it('detects win when target exits right', () => {
    const state: GameState = {
      gridSize: 4,
      exitRow: 1,
      moves: 0,
      won: false,
      blocks: [{ id: 'target', row: 1, col: 1, length: 2, direction: 'horizontal', isTarget: true }],
    }
    const next = applyMove(state, { blockId: 'target', delta: 1 })
    expect(next.won).toBe(true)
  })

  it('does not mutate original state', () => {
    const original = JSON.stringify(BASE)
    applyMove(BASE, { blockId: 'target', delta: 1 })
    expect(JSON.stringify(BASE)).toBe(original)
  })
})

describe('getLegalMoves', () => {
  it('returns moves for all blocks', () => {
    const moves = getLegalMoves(BASE)
    const ids = new Set(moves.map(m => m.blockId))
    expect(ids.has('target')).toBe(true)
    expect(ids.has('vblock')).toBe(true)
  })

  it('does not include delta=0', () => {
    const moves = getLegalMoves(BASE)
    expect(moves.every(m => m.delta !== 0)).toBe(true)
  })
})

describe('serializeState', () => {
  it('produces stable string regardless of block order', () => {
    const a = serializeState(BASE)
    const shuffled: GameState = {
      ...BASE,
      blocks: [BASE.blocks[2], BASE.blocks[0], BASE.blocks[1]],
    }
    expect(serializeState(shuffled)).toBe(a)
  })
})
