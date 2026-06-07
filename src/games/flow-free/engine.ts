import type { GameState, MoveAction, FlowPath, ColorId } from './types'

// Returns a 2D grid mapping cell → colorId (or null if empty)
export function buildOccupancy(state: GameState): (ColorId | null)[][] {
  const grid: (ColorId | null)[][] = Array.from({ length: state.gridSize }, () =>
    new Array(state.gridSize).fill(null)
  )
  for (const path of state.paths) {
    for (const cell of path.cells) {
      grid[cell.row][cell.col] = path.colorId
    }
  }
  return grid
}

// Returns all cells adjacent (up/down/left/right) to (row, col) within bounds
export function getNeighbors(
  row: number,
  col: number,
  gridSize: number
): Array<{ row: number; col: number }> {
  const result: Array<{ row: number; col: number }> = []
  if (row > 0) result.push({ row: row - 1, col })
  if (row < gridSize - 1) result.push({ row: row + 1, col })
  if (col > 0) result.push({ row, col: col - 1 })
  if (col < gridSize - 1) result.push({ row, col: col + 1 })
  return result
}

// Returns a new state with the path for action.colorId replaced by action.cells
export function applyMove(state: GameState, action: MoveAction): GameState {
  const newPaths = state.paths.filter(p => p.colorId !== action.colorId)
  if (action.cells.length > 0) {
    newPaths.push({ colorId: action.colorId, cells: action.cells })
  }

  const newState: GameState = {
    ...state,
    paths: newPaths,
    moves: state.moves + 1,
    won: false,
  }

  newState.won = checkWin(newState)
  return newState
}

function checkWin(state: GameState): boolean {
  const colors = [...new Set(state.endpoints.map(e => e.colorId))]
  // Every color must have a complete path connecting its two endpoints
  for (const color of colors) {
    const path = state.paths.find(p => p.colorId === color)
    if (!path || path.cells.length < 2) return false
    if (!isPathComplete(path, state)) return false
  }
  // All cells must be covered
  const total = state.gridSize * state.gridSize
  const occ = buildOccupancy(state)
  let covered = 0
  for (let r = 0; r < state.gridSize; r++)
    for (let c = 0; c < state.gridSize; c++)
      if (occ[r][c] !== null) covered++
  return covered === total
}

// A path is complete when both endpoints of its color are in the path (at ends)
export function isPathComplete(path: FlowPath, state: GameState): boolean {
  if (path.cells.length < 2) return false
  const eps = state.endpoints.filter(e => e.colorId === path.colorId)
  if (eps.length !== 2) return false
  const head = path.cells[0]
  const tail = path.cells[path.cells.length - 1]
  const matchesEp = (cell: { row: number; col: number }, ep: { row: number; col: number }) =>
    cell.row === ep.row && cell.col === ep.col
  return (
    (matchesEp(head, eps[0]) && matchesEp(tail, eps[1])) ||
    (matchesEp(head, eps[1]) && matchesEp(tail, eps[0]))
  )
}

export function serializeState(state: GameState): string {
  const sorted = [...state.paths]
    .sort((a, b) => a.colorId.localeCompare(b.colorId))
    .map(p => `${p.colorId}:${p.cells.map(c => `${c.row},${c.col}`).join(';')}`)
    .join('|')
  return sorted
}

// Returns all valid next moves: for each color, try extending the current path
// by one cell in each direction, or starting a fresh path from each endpoint.
export function getLegalMoves(state: GameState): MoveAction[] {
  const moves: MoveAction[] = []
  const occ = buildOccupancy(state)
  const colors = [...new Set(state.endpoints.map(e => e.colorId))]

  for (const color of colors) {
    const path = state.paths.find(p => p.colorId === color)
    const eps = state.endpoints.filter(e => e.colorId === color)

    if (!path || path.cells.length === 0) {
      // Start path from either endpoint
      for (const ep of eps) {
        const neighbors = getNeighbors(ep.row, ep.col, state.gridSize)
        for (const n of neighbors) {
          const cellOcc = occ[n.row][n.col]
          const isSameColorEp = eps.some(e => e.row === n.row && e.col === n.col)
          const isOtherColorEp = state.endpoints.some(
            e => e.row === n.row && e.col === n.col && e.colorId !== color
          )
          // Can only step onto empty cells or same-color endpoint; never other dots
          if (isOtherColorEp) continue
          if (cellOcc === null || isSameColorEp) {
            moves.push({ colorId: color, cells: [{ row: ep.row, col: ep.col }, n] })
          }
        }
      }
    } else {
      // Extend from head or tail
      for (const isHead of [true, false]) {
        const tip = isHead ? path.cells[0] : path.cells[path.cells.length - 1]
        const other = isHead ? path.cells[1] : path.cells[path.cells.length - 2]
        const neighbors = getNeighbors(tip.row, tip.col, state.gridSize)

        for (const n of neighbors) {
          // Don't backtrack
          if (other && n.row === other.row && n.col === other.col) continue
          // Don't revisit own path
          if (path.cells.some(c => c.row === n.row && c.col === n.col)) continue

          const cellOcc = occ[n.row][n.col]
          const isTargetEp = eps.some(e => e.row === n.row && e.col === n.col)
          const isOtherColorEp = state.endpoints.some(
            e => e.row === n.row && e.col === n.col && e.colorId !== color
          )

          // Can only step onto empty cells or own target endpoint; never other dots
          if (isOtherColorEp) continue
          if (cellOcc !== null && !isTargetEp) continue

          const newCells = isHead
            ? [n, ...path.cells]
            : [...path.cells, n]

          moves.push({ colorId: color, cells: newCells })
        }
      }

      // Also allow clearing this path
      moves.push({ colorId: color, cells: [] })
    }
  }

  return moves
}
