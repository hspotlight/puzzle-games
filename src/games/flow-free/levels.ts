import type { GameState } from './types'

function level(
  gridSize: number,
  endpoints: Array<[string, number, number, number, number]>
): GameState {
  return {
    gridSize,
    endpoints: endpoints.flatMap(([color, r1, c1, r2, c2]) => [
      { colorId: color, row: r1, col: c1 },
      { colorId: color, row: r2, col: c2 },
    ]),
    paths: [],
    moves: 0,
    won: false,
  }
}

// ── Level 1: 4×4, 3 colors ────────────────────────────────
// Grid solution:
//   R  B  B  R
//   R  B  B  R
//   R  R  R  R
//   G  G  G  G
// red:   (0,0)→(1,0)→(2,0)→(2,1)→(2,2)→(2,3)→(1,3)→(0,3)  8 cells
// blue:  (0,1)→(0,2)→(1,2)→(1,1)                             4 cells
// green: (3,0)→(3,1)→(3,2)→(3,3)                             4 cells
// Total: 16/16 ✓

// ── Level 2: 4×4, 3 colors ────────────────────────────────
// Grid solution:
//   R  R  R  R
//   B  G  G  R
//   B  G  G  R
//   B  B  B  R
// red:   (0,0)→(0,1)→(0,2)→(0,3)→(1,3)→(2,3)→(3,3)  7 cells
// blue:  (1,0)→(2,0)→(3,0)→(3,1)→(3,2)               5 cells
// green: (1,1)→(1,2)→(2,2)→(2,1)                      4 cells
// Total: 16/16 ✓

// ── Level 3: 4×4, 4 colors ────────────────────────────────
// Grid solution:
//   R  G  G  B
//   R  G  G  B
//   R  Y  Y  B
//   R  Y  Y  B
// red:    (0,0)→(1,0)→(2,0)→(3,0)        4 cells
// blue:   (0,3)→(1,3)→(2,3)→(3,3)        4 cells
// green:  (0,1)→(0,2)→(1,2)→(1,1)        4 cells
// yellow: (2,1)→(2,2)→(3,2)→(3,1)        4 cells
// Total: 16/16 ✓

// ── Level 4: 5×5, 4 colors ────────────────────────────────
// Grid solution:
//   R  B  B  B  B
//   R  G  G  G  B
//   R  Y  Y  G  B
//   R  G  G  G  B
//   R  R  R  R  R
// red:    (0,0)→(1,0)→(2,0)→(3,0)→(4,0)→(4,1)→(4,2)→(4,3)→(4,4)  9 cells
// blue:   (0,1)→(0,2)→(0,3)→(0,4)→(1,4)→(2,4)→(3,4)               7 cells
// green:  (1,1)→(1,2)→(1,3)→(2,3)→(3,3)→(3,2)→(3,1)               7 cells
// yellow: (2,1)→(2,2)                                                2 cells
// Total: 25/25 ✓

// ── Level 5: 5×5, 4 colors ────────────────────────────────
// Grid solution:
//   R  R  R  R  R
//   B  G  G  G  R
//   B  G  G  G  R
//   B  B  B  B  R
//   B  B  B  B  R  ← wait, last row: (4,0-3)=B and (4,4)=R
// Actually:
//   R  R  R  R  R
//   B  G  G  G  R
//   B  G  G  G  R
//   B  B  B  B  R
//   B  B  B  B  R  — nope that's only 4 colors, let me re-verify:
// red:   (0,0)→(0,1)→(0,2)→(0,3)→(0,4)→(1,4)→(2,4)→(3,4)→(4,4)  9 cells
// blue:  (1,0)→(2,0)→(3,0)→(4,0)→(4,1)→(4,2)→(4,3)→(3,3)→(3,2)→(3,1)  10 cells
// green: (1,1)→(1,2)→(1,3)→(2,3)→(2,2)→(2,1)                     6 cells
// Total: 25/25 ✓

// ── Level 6: 5×5, 4 colors ────────────────────────────────
// Grid solution:
//   R  R  R  B  B
//   R  R  R  B  B
//   R  G  G  B  B
//   Y  Y  G  G  B
//   Y  Y  G  G  B  — wait (4,4)=B
// red:    (0,0)→(0,1)→(0,2)→(1,2)→(1,1)→(1,0)→(2,0)  7 cells
// blue:   (0,3)→(0,4)→(1,4)→(1,3)→(2,3)→(2,4)→(3,4)→(4,4)  8 cells
// green:  (2,1)→(2,2)→(3,2)→(3,3)→(4,3)→(4,2)  6 cells
// yellow: (3,0)→(4,0)→(4,1)→(3,1)  4 cells
// Total: 25/25 ✓

// ── Level 7: 5×5, 4 colors ────────────────────────────────
// Grid solution:
//   R  R  R  R  R
//   B  B  B  B  B
//   G  G  G  G  B
//   G  G  G  G  B
//   G  Y  Y  Y  B
// red:    (0,0)→(0,1)→(0,2)→(0,3)→(0,4)                                 5 cells
// blue:   (1,0)→(1,1)→(1,2)→(1,3)→(1,4)→(2,4)→(3,4)→(4,4)              8 cells
// green:  (2,0)→(2,1)→(2,2)→(2,3)→(3,3)→(3,2)→(3,1)→(3,0)→(4,0)       9 cells
// yellow: (4,1)→(4,2)→(4,3)                                              3 cells
// Total: 25/25 ✓

export const LEVELS: GameState[] = [
  // Level 1 — 4×4, 3 colors
  level(4, [
    ['red',   0, 0, 0, 3],
    ['blue',  0, 1, 1, 1],
    ['green', 3, 0, 3, 3],
  ]),

  // Level 2 — 4×4, 3 colors
  level(4, [
    ['red',   0, 0, 3, 3],
    ['blue',  1, 0, 3, 2],
    ['green', 1, 1, 2, 1],
  ]),

  // Level 3 — 4×4, 4 colors
  level(4, [
    ['red',    0, 0, 3, 0],
    ['blue',   0, 3, 3, 3],
    ['green',  0, 1, 1, 1],
    ['yellow', 2, 1, 3, 1],
  ]),

  // Level 4 — 5×5, 4 colors
  level(5, [
    ['red',    0, 0, 4, 4],
    ['blue',   0, 1, 3, 4],
    ['green',  1, 1, 3, 1],
    ['yellow', 2, 1, 2, 2],
  ]),

  // Level 5 — 5×5, 4 colors
  level(5, [
    ['red',   0, 0, 4, 4],
    ['blue',  1, 0, 3, 1],
    ['green', 1, 1, 2, 1],
  ]),

  // Level 6 — 5×5, 4 colors
  level(5, [
    ['red',    0, 0, 2, 0],
    ['blue',   0, 3, 4, 4],
    ['green',  2, 1, 4, 2],
    ['yellow', 3, 0, 3, 1],
  ]),

  // Level 7 — 5×5, 4 colors
  level(5, [
    ['red',    0, 0, 0, 4],
    ['blue',   1, 0, 4, 4],
    ['green',  2, 0, 4, 0],
    ['yellow', 4, 1, 4, 3],
  ]),
]
