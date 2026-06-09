export type { Block, GameState, MoveAction, Direction } from '../unblock-me/types'

export type Algorithm = 'bfs' | 'dfs'

export interface Chapter {
  id: string
  number: number
  title: string
  concept: string
  color: string
  description: string
  levels: LessonLevel[]
}

export interface LessonLevel {
  id: string
  title: string
  algorithm: Algorithm
  puzzle: import('../unblock-me/types').GameState
  introText: string
  showQueue: boolean
  showVisited: boolean
  leetcode?: { title: string; url: string; note: string }
}

export interface SolverStep {
  stepIndex: number
  stateKey: string
  state: import('../unblock-me/types').GameState
  action: import('../unblock-me/types').MoveAction | null
  depth: number
  queueSnapshot: QueueItem[]
  queueLength: number
  visitedCount: number
  isSolution: boolean
}

export interface QueueItem {
  stateKey: string
  state: import('../unblock-me/types').GameState
  depth: number
}
