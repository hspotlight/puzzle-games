import type { Tile, GameState } from './types'

function level(gridSize: number, values: number[]): GameState {
  const tiles: Tile[] = values.map((value, index) => ({
    id: value === 0 ? 'empty' : `t${value}`,
    value,
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  }))
  return { gridSize, tiles, moves: 0, won: false }
}

// ─── Level 1 · 2 moves ───────────────────────────────────────────────────────
// 1 2 3       t5←, t6↑
// 4 _ 5
// 7 8 6
export const LEVEL_1 = level(3, [1, 2, 3, 4, 0, 5, 7, 8, 6])

// ─── Level 2 · 4 moves ───────────────────────────────────────────────────────
// 1 3 _       t3→, t2↑, t5←, t6↑
// 4 2 5
// 7 8 6
export const LEVEL_2 = level(3, [1, 3, 0, 4, 2, 5, 7, 8, 6])

// ─── Level 3 · 6 moves ───────────────────────────────────────────────────────
// 1 3 5       t6↓, t5↓, t3→, t2↑, t5←, t6↑
// 4 2 6
// 7 8 _
export const LEVEL_3 = level(3, [1, 3, 5, 4, 2, 6, 7, 8, 0])

// ─── Level 4 · 8 moves ───────────────────────────────────────────────────────
// 1 3 5       t2↑, t8←, then Level 3 solution (6 moves)
// 4 _ 6
// 7 2 8
export const LEVEL_4 = level(3, [1, 3, 5, 4, 0, 6, 7, 2, 8])

// ─── Level 5 · 10 moves ──────────────────────────────────────────────────────
// _ 3 5       t1↓, t4→, then Level 4 solution (8 moves)
// 1 4 6
// 7 2 8
export const LEVEL_5 = level(3, [0, 3, 5, 1, 4, 6, 7, 2, 8])

export const LEVELS: GameState[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5]
