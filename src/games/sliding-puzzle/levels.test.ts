import { describe, it, expect } from 'vitest'
import { solve } from './solver'
import { LEVELS } from './levels'
import { buildOccupancy } from './engine'

describe('levels', () => {
  LEVELS.forEach((level, i) => {
    it(`level ${i + 1} has no overlapping tiles`, () => {
      const occ = buildOccupancy(level)
      const seen = new Set<string>()
      for (let r = 0; r < level.gridSize; r++) {
        for (let c = 0; c < level.gridSize; c++) {
          const id = occ[r][c]
          if (id !== null) {
            expect(seen.has(id), `tile ${id} occupies multiple cells`).toBe(false)
            seen.add(id)
          }
        }
      }
    })

    it(`level ${i + 1} has all tiles within bounds`, () => {
      for (const tile of level.tiles) {
        expect(tile.row).toBeGreaterThanOrEqual(0)
        expect(tile.row).toBeLessThan(level.gridSize)
        expect(tile.col).toBeGreaterThanOrEqual(0)
        expect(tile.col).toBeLessThan(level.gridSize)
      }
    })

    it(`level ${i + 1} has exactly one empty tile`, () => {
      const empties = level.tiles.filter(t => t.value === 0)
      expect(empties.length).toBe(1)
    })

    it(`level ${i + 1} has unique tile ids`, () => {
      const ids = level.tiles.map(t => t.id)
      expect(ids.length).toBe(new Set(ids).size)
    })

    it(`level ${i + 1} is solvable`, { timeout: 10_000 }, () => {
      const result = solve(level)
      expect(result.solved).toBe(true)
    })
  })
})
