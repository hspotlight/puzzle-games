import type { Block, GameState, MoveAction } from './types'

/** Build a 2D occupancy map: cell -> blockId */
export function buildOccupancy(state: GameState): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: state.gridSize }, () =>
    Array(state.gridSize).fill(null)
  )
  for (const block of state.blocks) {
    for (let i = 0; i < block.length; i++) {
      const r = block.direction === 'vertical' ? block.row + i : block.row
      const c = block.direction === 'horizontal' ? block.col + i : block.col
      if (r >= 0 && r < state.gridSize && c >= 0 && c < state.gridSize) {
        grid[r][c] = block.id
      }
    }
  }
  return grid
}

/** Returns how many steps the block can move in the negative (-) and positive (+) direction */
export function getMovableRange(
  block: Block,
  state: GameState,
  prebuiltOccupancy?: (string | null)[][]
): { min: number; max: number } {
  const grid = prebuiltOccupancy ?? buildOccupancy(state)
  let min = 0
  let max = 0

  if (block.direction === 'horizontal') {
    let c = block.col - 1
    while (c >= 0 && grid[block.row][c] === null) { min--; c-- }
    c = block.col + block.length
    while (c < state.gridSize && grid[block.row][c] === null) { max++; c++ }
  } else {
    let r = block.row - 1
    while (r >= 0 && grid[r][block.col] === null) { min--; r-- }
    r = block.row + block.length
    while (r < state.gridSize && grid[r][block.col] === null) { max++; r++ }
  }

  return { min, max }
}

/** Apply a move and return the new state (immutable) */
export function applyMove(state: GameState, action: MoveAction): GameState {
  const block = state.blocks.find(b => b.id === action.blockId)
  if (!block) return state

  const { min, max } = getMovableRange(block, state)
  const clampedDelta = Math.max(min, Math.min(max, action.delta))
  if (clampedDelta === 0) return state

  const newBlocks = state.blocks.map(b => {
    if (b.id !== action.blockId) return b
    return {
      ...b,
      row: b.direction === 'vertical' ? b.row + clampedDelta : b.row,
      col: b.direction === 'horizontal' ? b.col + clampedDelta : b.col,
    }
  })

  const targetBlock = newBlocks.find(b => b.isTarget)!
  const won = targetBlock.direction === 'horizontal' &&
    targetBlock.col + targetBlock.length >= state.gridSize

  return { ...state, blocks: newBlocks, moves: state.moves + 1, won }
}

/** Serialize state for use as BFS/DFS hash key */
export function serializeState(state: GameState): string {
  return state.blocks
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(b => `${b.id}:${b.row},${b.col}`)
    .join('|')
}

/** Get all valid single-step moves from this state */
export function getLegalMoves(state: GameState): MoveAction[] {
  const moves: MoveAction[] = []
  for (const block of state.blocks) {
    const { min, max } = getMovableRange(block, state)
    for (let delta = min; delta <= max; delta++) {
      if (delta !== 0) moves.push({ blockId: block.id, delta })
    }
  }
  return moves
}
