import type { GameState } from './types'

export const LEVEL_1: GameState = {
  gridSize: 6,
  exitRow: 2,
  moves: 0,
  won: false,
  blocks: [
    { id: 'target', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
    { id: 'h0a', row: 0, col: 2, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'h0b', row: 0, col: 4, length: 1, direction: 'vertical',   isTarget: false },
    { id: 'h1a', row: 1, col: 0, length: 3, direction: 'horizontal', isTarget: false },
    { id: 'v2a', row: 2, col: 2, length: 2, direction: 'vertical',   isTarget: false },
    { id: 'h3a', row: 3, col: 0, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'v4a', row: 4, col: 0, length: 2, direction: 'vertical',   isTarget: false },
    { id: 'h4b', row: 4, col: 2, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'h4c', row: 4, col: 4, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'h5a', row: 5, col: 1, length: 2, direction: 'horizontal', isTarget: false },
    { id: 'v0r', row: 0, col: 3, length: 2, direction: 'vertical',   isTarget: false },
    { id: 'v0s', row: 0, col: 5, length: 2, direction: 'vertical',   isTarget: false },
  ],
}

export const LEVELS: GameState[] = [LEVEL_1]
