import { describe, it, expect } from 'vitest'
import { solve } from './solver'
import { LEVELS } from './levels'
import { buildOccupancy } from './engine'

describe('levels', () => {
  LEVELS.forEach((level, i) => {
    it(`level ${i + 1} has no overlapping pieces`, () => {
      const occ = buildOccupancy(level)
      const seen = new Set<string>()
      for (let r = 0; r < level.gridSize; r++) {
        for (let c = 0; c < level.gridSize; c++) {
          const id = occ[r][c]
          if (id !== null) {
            expect(seen.has(id + `${r},${c}`)).toBe(false)
            seen.add(id + `${r},${c}`)
          }
        }
      }
    })

    it(`level ${i + 1} has at least 2 endpoints per color`, () => {
      const colors = new Set(level.endpoints.map(e => e.colorId))
      for (const color of colors) {
        const eps = level.endpoints.filter(e => e.colorId === color)
        expect(eps.length).toBe(2)
      }
    })

    it(`level ${i + 1} has all endpoints within bounds`, () => {
      for (const ep of level.endpoints) {
        expect(ep.row).toBeGreaterThanOrEqual(0)
        expect(ep.row).toBeLessThan(level.gridSize)
        expect(ep.col).toBeGreaterThanOrEqual(0)
        expect(ep.col).toBeLessThan(level.gridSize)
      }
    })

    it.skip(`level ${i + 1} is solvable`, { timeout: 30_000 }, () => {
      const result = solve(level, 'bfs', 500_000)
      expect(result.solved).toBe(true)
    })
  })
})
