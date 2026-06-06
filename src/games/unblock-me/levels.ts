import type { GameState } from './types'

function level(exitRow: number, blocks: GameState['blocks']): GameState {
  return { gridSize: 6, exitRow, moves: 0, won: false, blocks }
}

// ─── Level 1 · Intro · 3 moves ───────────────────────────────────────────────
// vA blocks col2 (move up1); vB blocks col4 (move down1); then target slides out.
export const LEVEL_1 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocks col2; ↑1
  { id: 'vB',  row: 2, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks col4; ↓1
  { id: 'h0',  row: 0, col: 3, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'hC',  row: 4, col: 1, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'vD',  row: 3, col: 0, length: 3, direction: 'vertical',   isTarget: false },
  { id: 'h5',  row: 5, col: 2, length: 3, direction: 'horizontal', isTarget: false },
])
// vA up1: (0,2) free ✓ → clears (2,2). vB down1: (4,4) free ✓ → clears (2,4).
// Path (2,2)(2,3)(2,4)(2,5) all clear. Solution: vA↑1, vB↓1, target→4. 3 moves.

// ─── Level 2 · Easy · 3 moves ────────────────────────────────────────────────
// Two independent blockers at col2 and col4, each move freely.
export const LEVEL_2 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // ↑1
  { id: 'vB',  row: 1, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // ↑1
  { id: 'h0',  row: 0, col: 0, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'h3',  row: 3, col: 2, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'v5a', row: 4, col: 0, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'h5b', row: 5, col: 2, length: 3, direction: 'horizontal', isTarget: false },
])
// vA↑1 clears col2; vB↑1 clears col4. Solution: vA↑1, vB↑1, target→4. 3 moves.

// ─── Level 3 · Easy-Medium · 4 moves ─────────────────────────────────────────
// hB blocks vA from going up. Move hB left first, then vA up.
// vC at col4 goes up2 independently.
export const LEVEL_3 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocks col2
  { id: 'hB',  row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑; ←2
  { id: 'vC',  row: 2, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks col4; ↑2
  { id: 'hD',  row: 3, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // decoy (blocks vA↓)
  { id: 'h4',  row: 4, col: 0, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'v5',  row: 3, col: 5, length: 3, direction: 'vertical',   isTarget: false },
])
// hB←2 frees (0,2); vA↑1 clears (2,2); vC↑2 → (0,4)(1,4) clears (2,4).
// Solution: hB←2, vA↑1, vC↑2, target→4. 4 moves.

// ─── Level 4 · Medium · 5 moves ──────────────────────────────────────────────
// Chain A (col2): hP←2 → vA↑1.  Chain B (col4): hD←2 → vC↓1.
export const LEVEL_4 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'hP',  row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑
  { id: 'vC',  row: 2, col: 4, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'hD',  row: 4, col: 4, length: 2, direction: 'horizontal', isTarget: false }, // blocks vC↓
  { id: 'v3',  row: 3, col: 1, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'h5',  row: 5, col: 0, length: 3, direction: 'horizontal', isTarget: false },
])
// hP←2→(0,0)(0,1); vA↑1→(0,2)(1,2) clears (2,2).
// hD←2→(4,2)(4,3); vC↓1→(3,4)(4,4) clears (2,4).
// Solution: hP←2, vA↑1, hD←2, vC↓1, target→4. 5 moves.

// ─── Level 5 · Medium · 4 moves · exitRow=4 ──────────────────────────────────
// Exit from a lower row. hB blocks both vA and vC from clearing row4.
// hB→right frees (2,2) and (2,3) so vA↑1 and vC↑1 can clear row4.
export const LEVEL_5 = level(4, [
  { id: 'target', row: 4, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 3, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocks (4,2)
  { id: 'vC',  row: 3, col: 3, length: 2, direction: 'vertical',   isTarget: false }, // blocks (4,3)
  { id: 'hB',  row: 2, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑ and vC↑
  { id: 'h0',  row: 0, col: 0, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'v0',  row: 0, col: 4, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'h1',  row: 1, col: 2, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'h5',  row: 5, col: 4, length: 2, direction: 'horizontal', isTarget: false },
])
// hB→2 → (2,4)(2,5); frees (2,2)(2,3). vA↑1 clears (4,2). vC↑1 clears (4,3).
// Solution: hB→2, vA↑1, vC↑1, target→4. 4 moves.

// ─── Level 6 · Medium · 5 moves ──────────────────────────────────────────────
// Three-step chain (vD↓3 → hP→2 → vA↑1) clears col2; vB↓2 clears col3.
export const LEVEL_6 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocker col2
  { id: 'hP',  row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑
  { id: 'vD',  row: 0, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks hP→
  { id: 'vB',  row: 2, col: 3, length: 2, direction: 'vertical',   isTarget: false }, // blocker col3
  { id: 'hF',  row: 3, col: 0, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'hG',  row: 5, col: 0, length: 3, direction: 'horizontal', isTarget: false },
])
// vD↓3→(3,4)(4,4); frees (0,4). hP→2→(0,4)(0,5); frees (0,2). vA↑1 clears (2,2).
// vB↓2→(4,3)(5,3); clears (2,3). (5,3) free ✓.
// Solution: vD↓3, hP→2, vA↑1, vB↓2, target→4. 5 moves.

// ─── Level 7 · Medium-Hard · 5 moves · exitRow=1 ─────────────────────────────
// Exit near top. vA (col2): needs hC moved first. vB (col4): needs vX moved first.
// Solution: hC←2, vA↓2, vX↓1, vB↓2, target→4. 5 moves.
export const LEVEL_7 = level(1, [
  { id: 'target', row: 1, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 0, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocks col2; ↓2
  { id: 'hC',  row: 2, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↓; ←2
  { id: 'vB',  row: 0, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks col4; ↓2
  { id: 'vX',  row: 3, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // limits vB↓ range; ↓1
  { id: 'hF',  row: 4, col: 0, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'hG',  row: 5, col: 0, length: 3, direction: 'horizontal', isTarget: false },
])
// hC←2→(2,0)(2,1); frees (2,2)(2,3). vA↓2→(2,2)(3,2); clears (1,2).
// vX↓1→(4,4)(5,4); frees (3,4). vB↓2→(2,4)(3,4); clears (1,4).
// Path (1,2)(1,3)(1,4)(1,5) clear. Solution: hC←2, vA↓2, vX↓1, vB↓2, target→4.

// ─── Level 8 · Hard · 6 moves ────────────────────────────────────────────────
// Chain A (col2): vD↓3 → hP→2 → vA↑1.  Chain B (col3): hX←2 → vB↓2.
export const LEVEL_8 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocker col2
  { id: 'hP',  row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑
  { id: 'vD',  row: 0, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks hP→
  { id: 'vB',  row: 2, col: 3, length: 2, direction: 'vertical',   isTarget: false }, // blocker col3
  { id: 'hX',  row: 4, col: 3, length: 2, direction: 'horizontal', isTarget: false }, // blocks vB↓
  { id: 'h5',  row: 5, col: 0, length: 3, direction: 'horizontal', isTarget: false },
])
// vD↓3→(3,4)(4,4); hP→2→(0,4)(0,5); vA↑1 clears (2,2).
// hX←2→(4,1)(4,2); vB↓2→(4,3)(5,3) clears (2,3). (5,3) free ✓.
// Solution: vD↓3, hP→2, vA↑1, hX←2, vB↓2, target→4. 6 moves.

// ─── Level 9 · Hard · 6 moves · exitRow=3 ────────────────────────────────────
// Move hX first to let vD go far enough, then chain: vD↓3 → hP→2 → vA↑1;
// then vB↓1. Solution: hX←2, vD↓3, hP→2, vA↑1, vB↓1, target→4. 6 moves.
export const LEVEL_9 = level(3, [
  { id: 'target', row: 3, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'vA',  row: 2, col: 2, length: 2, direction: 'vertical',   isTarget: false }, // blocks (3,2)
  { id: 'hP',  row: 1, col: 2, length: 2, direction: 'horizontal', isTarget: false }, // blocks vA↑
  { id: 'vD',  row: 1, col: 4, length: 2, direction: 'vertical',   isTarget: false }, // blocks hP→
  { id: 'vB',  row: 3, col: 3, length: 2, direction: 'vertical',   isTarget: false }, // blocks (3,3)
  { id: 'hX',  row: 5, col: 3, length: 2, direction: 'horizontal', isTarget: false }, // limits vD & vB↓
  { id: 'h0',  row: 0, col: 0, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'hF',  row: 4, col: 0, length: 2, direction: 'horizontal', isTarget: false },
])
// hX←2→(5,1)(5,2); frees (5,3)(5,4). vD now can go ↓3→(4,4)(5,4). Frees (1,4)(2,4) & (3,4).
// hP→2→(1,4)(1,5); frees (1,2)(1,3). vA↑1→(1,2)(2,2); clears (3,2).
// vB↓1→(4,3)(5,3); clears (3,3). (5,3) freed ✓.
// Path (3,2)(3,3)(3,4)(3,5) all clear. 6 moves.

// ─── Level 10 · Expert · 7 moves ─────────────────────────────────────────────
// Three independent chains each needing 1 prep move:
// Chain A (col2): hPA←2 → vA↑1.
// Chain B (col3): hPB←2 → vB↓1.
// Chain C (col4): hPC←3 → vC↓2.
// Solution: hPC←3, vC↓2, hPA←2, vA↑1, hPB←2, vB↓1, target→4. 7 moves.
export const LEVEL_10 = level(2, [
  { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  // Chain A
  { id: 'vA',  row: 1, col: 2, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'hPA', row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false },
  // Chain B
  { id: 'vB',  row: 2, col: 3, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'hPB', row: 4, col: 3, length: 2, direction: 'horizontal', isTarget: false },
  // Chain C
  { id: 'vC',  row: 1, col: 4, length: 2, direction: 'vertical',   isTarget: false },
  { id: 'hPC', row: 3, col: 4, length: 2, direction: 'horizontal', isTarget: false },
])
// hPC←3→(3,1)(3,2); (3,4)(3,5) freed. vC↓2→(3,4)(4,4); (1,4)(2,4) freed.
// hPA←2→(0,0)(0,1); (0,2) freed. vA↑1→(0,2)(1,2); (2,2) freed.
// hPB←2→(4,1)(4,2); (4,3) freed. vB↓1→(3,3)(4,3); (2,3) freed.
// Path (2,2)(2,3)(2,4)(2,5) all clear. 7 moves.

export const LEVELS: GameState[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10,
]
