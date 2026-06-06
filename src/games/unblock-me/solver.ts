import type { GameState, MoveAction } from './types'
import { applyMove, getLegalMoves, serializeState } from './engine'

export type SolverAlgorithm = 'bfs' | 'dfs'

export interface SolverResult {
  solved: boolean
  moves: MoveAction[]
  statesExplored: number
}

interface SearchNode {
  state: GameState
  moves: MoveAction[]
}

export function solve(
  initial: GameState,
  algorithm: SolverAlgorithm = 'bfs',
  maxStates = 100_000
): SolverResult {
  if (initial.won) return { solved: true, moves: [], statesExplored: 0 }

  const visited = new Set<string>()
  const queue: SearchNode[] = [{ state: initial, moves: [] }]
  visited.add(serializeState(initial))
  let statesExplored = 0

  while (queue.length > 0) {
    const node = algorithm === 'bfs' ? queue.shift()! : queue.pop()!
    statesExplored++

    if (statesExplored > maxStates) break

    for (const action of getLegalMoves(node.state)) {
      const next = applyMove(node.state, action)
      const key = serializeState(next)
      if (visited.has(key)) continue
      visited.add(key)

      const path = [...node.moves, action]
      if (next.won) return { solved: true, moves: path, statesExplored }

      queue.push({ state: next, moves: path })
    }
  }

  return { solved: false, moves: [], statesExplored }
}
