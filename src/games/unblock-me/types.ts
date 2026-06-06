export type Direction = 'horizontal' | 'vertical'

export interface Block {
  id: string
  row: number    // top-left row (0-indexed)
  col: number    // top-left col (0-indexed)
  length: number // number of cells occupied
  direction: Direction
  isTarget: boolean // the red block to move out
}

export interface GameState {
  gridSize: number
  blocks: Block[]
  // target block exits from the right edge at its row
  exitRow: number
  moves: number
  won: boolean
}

export interface MoveAction {
  blockId: string
  delta: number // positive = down/right, negative = up/left
}
