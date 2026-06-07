export type ColorId = string  // e.g. 'red', 'blue', 'green', 'yellow', 'orange'

export interface Endpoint {
  row: number
  col: number
  colorId: ColorId
}

export interface FlowPath {
  colorId: ColorId
  cells: Array<{ row: number; col: number }>  // ordered from endpoint A to B
}

export interface GameState {
  gridSize: number
  endpoints: Endpoint[]   // fixed dot positions (2 per color)
  paths: FlowPath[]       // current drawn paths (one per active color)
  moves: number
  won: boolean
}

// A MoveAction extends a path by one cell or removes a path
export interface MoveAction {
  colorId: ColorId
  // Full new cell list for this color's path (replaces existing)
  cells: Array<{ row: number; col: number }>
}
