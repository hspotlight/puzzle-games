export interface Tile {
  id: string     // 'empty' for blank, 't1'–'t8' (or 't15') for numbered tiles
  value: number  // 0 for empty, 1–(n²−1) for numbered tiles
  row: number
  col: number
}

export interface GameState {
  gridSize: number
  tiles: Tile[]
  moves: number
  won: boolean
}

export interface MoveAction {
  tileId: string  // the numbered tile adjacent to the empty space that will slide
}
