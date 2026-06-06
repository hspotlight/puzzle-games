import { describe, it, expect } from 'vitest'
import { LEVELS } from './levels'
import { solve } from './solver'
import { buildOccupancy } from './engine'

describe('all levels', () => {
  LEVELS.forEach((lv, i) => {
    it(`level ${i + 1}: no cell overlaps`, () => {
      const grid = buildOccupancy(lv)
      const counts: Record<string, number> = {}
      for (let r = 0; r < lv.gridSize; r++)
        for (let c = 0; c < lv.gridSize; c++)
          if (grid[r][c]) counts[grid[r][c]!] = (counts[grid[r][c]!] ?? 0) + 1
      for (const block of lv.blocks)
        expect(counts[block.id], `block ${block.id} in level ${i + 1}`).toBe(block.length)
    })

    it(`level ${i + 1}: is solvable`, () => {
      const result = solve(lv, 'bfs', 500_000)
      expect(result.solved).toBe(true)
    })
  })
})
