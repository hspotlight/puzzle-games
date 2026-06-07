import type { Tile, GameState, MoveAction } from './types'

/** Build a 2D occupancy map: cell → tileId or null */
export function buildOccupancy(state: GameState): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: state.gridSize }, () =>
    Array(state.gridSize).fill(null)
  )
  for (const tile of state.tiles) {
    if (tile.value !== 0) grid[tile.row][tile.col] = tile.id
  }
  return grid
}

/** Find the empty (blank) tile */
export function findEmpty(state: GameState): Tile {
  return state.tiles.find(t => t.value === 0)!
}

function isAdjacent(tile: Tile, empty: Tile): boolean {
  return (
    (Math.abs(tile.row - empty.row) === 1 && tile.col === empty.col) ||
    (Math.abs(tile.col - empty.col) === 1 && tile.row === empty.row)
  )
}

/**
 * Returns {min: 0, max: 1} if the tile is adjacent to the empty space and can
 * slide, or {min: 0, max: 0} if it cannot move. The empty tile itself always
 * returns {min: 0, max: 0}.
 */
export function getMovableRange(
  tile: Tile,
  state: GameState,
  _occupancy?: (string | null)[][]
): { min: number; max: number } {
  if (tile.value === 0) return { min: 0, max: 0 }
  const empty = findEmpty(state)
  return isAdjacent(tile, empty) ? { min: 0, max: 1 } : { min: 0, max: 0 }
}

/** All tiles in correct position → solved */
function checkWin(tiles: Tile[], gridSize: number): boolean {
  for (const tile of tiles) {
    if (tile.value === 0) {
      if (tile.row !== gridSize - 1 || tile.col !== gridSize - 1) return false
    } else {
      const idx = tile.value - 1
      if (tile.row !== Math.floor(idx / gridSize) || tile.col !== idx % gridSize) return false
    }
  }
  return true
}

/** Apply a move and return the new state (immutable) */
export function applyMove(state: GameState, action: MoveAction): GameState {
  const tile = state.tiles.find(t => t.id === action.tileId)
  if (!tile || tile.value === 0) return state

  const empty = findEmpty(state)
  if (!isAdjacent(tile, empty)) return state

  const newTiles = state.tiles.map(t => {
    if (t.id === action.tileId) return { ...t, row: empty.row, col: empty.col }
    if (t.value === 0) return { ...t, row: tile.row, col: tile.col }
    return t
  })

  return { ...state, tiles: newTiles, moves: state.moves + 1, won: checkWin(newTiles, state.gridSize) }
}

/** Serialize state for BFS/DFS deduplication — sort by id for canonical form */
export function serializeState(state: GameState): string {
  return state.tiles
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(t => `${t.value}:${t.row},${t.col}`)
    .join('|')
}

/** All valid moves from the current state (tiles adjacent to empty) */
export function getLegalMoves(state: GameState): MoveAction[] {
  const empty = findEmpty(state)
  return state.tiles
    .filter(t => t.value !== 0 && isAdjacent(t, empty))
    .map(t => ({ tileId: t.id }))
}
