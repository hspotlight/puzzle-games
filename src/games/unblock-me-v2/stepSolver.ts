import type { GameState, MoveAction } from '../unblock-me/types'
import { applyMove, getLegalMoves, serializeState } from '../unblock-me/engine'
import type { SolverStep, QueueItem, Algorithm } from './types'

interface SearchNode {
  state: GameState
  moves: MoveAction[]
  key: string
  depth: number
}

/**
 * Runs BFS or DFS and captures every intermediate step so the visualizer
 * can replay the search one state at a time.
 */
export function buildSteps(
  initial: GameState,
  algorithm: Algorithm,
  maxStates = 8_000
): SolverStep[] {
  const steps: SolverStep[] = []
  const visited = new Set<string>()
  const startKey = serializeState(initial)
  visited.add(startKey)

  const queue: SearchNode[] = [{ state: initial, moves: [], key: startKey, depth: 0 }]

  while (queue.length > 0 && steps.length < maxStates) {
    const node = algorithm === 'bfs' ? queue.shift()! : queue.pop()!

    const queueSnapshot: QueueItem[] = queue.slice(0, 8).map(n => ({
      stateKey: n.key,
      state: n.state,
      depth: n.depth,
    }))

    const isSolution = node.state.won
    steps.push({
      stepIndex: steps.length,
      stateKey: node.key,
      state: node.state,
      action: node.moves.length > 0 ? node.moves[node.moves.length - 1] : null,
      depth: node.depth,
      queueSnapshot,
      queueLength: queue.length,
      visitedCount: visited.size,
      isSolution,
    })

    if (isSolution) break

    for (const action of getLegalMoves(node.state)) {
      const next = applyMove(node.state, action)
      const key = serializeState(next)
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({ state: next, moves: [...node.moves, action], key, depth: node.depth + 1 })
    }
  }

  return steps
}
