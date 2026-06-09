import type { GameState } from '../unblock-me/types'
import type { Chapter } from './types'

function gs(exitRow: number, blocks: GameState['blocks']): GameState {
  return { gridSize: 6, blocks, exitRow, moves: 0, won: false }
}

// ─── Puzzles ────────────────────────────────────────────────────────────────

// CH1: "What is a State?" — trivial 2-3 block puzzles
const CH1_P1 = gs(2, [
  { id: 'T', row: 2, col: 1, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 3, length: 2, direction: 'vertical', isTarget: false },
])

const CH1_P2 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 1, col: 3, length: 2, direction: 'vertical', isTarget: false },
  { id: 'B', row: 4, col: 1, length: 3, direction: 'horizontal', isTarget: false },
])

// CH2: "Neighbors & Moves" — slightly more complex
const CH2_P1 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 2, length: 3, direction: 'vertical', isTarget: false },
  { id: 'B', row: 2, col: 4, length: 2, direction: 'vertical', isTarget: false },
  { id: 'C', row: 4, col: 0, length: 2, direction: 'horizontal', isTarget: false },
])

const CH2_P2 = gs(3, [
  { id: 'T', row: 3, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 1, col: 2, length: 2, direction: 'vertical', isTarget: false },
  { id: 'B', row: 3, col: 3, length: 2, direction: 'vertical', isTarget: false },
  { id: 'C', row: 0, col: 4, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'D', row: 5, col: 2, length: 3, direction: 'horizontal', isTarget: false },
])

// CH3: BFS — 4-move puzzle
const CH3_P1 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 2, length: 3, direction: 'vertical', isTarget: false },
  { id: 'B', row: 2, col: 3, length: 2, direction: 'vertical', isTarget: false },
  { id: 'C', row: 0, col: 4, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'D', row: 4, col: 1, length: 2, direction: 'horizontal', isTarget: false },
])

// CH3 L2: BFS — 5-move, wider search tree
const CH3_P2 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 2, length: 2, direction: 'vertical', isTarget: false },
  { id: 'B', row: 2, col: 3, length: 2, direction: 'vertical', isTarget: false },
  { id: 'C', row: 2, col: 5, length: 2, direction: 'vertical', isTarget: false },
  { id: 'D', row: 4, col: 3, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'E', row: 0, col: 4, length: 2, direction: 'horizontal', isTarget: false },
])

// CH4: DFS — same puzzle as CH3_P1 so students can compare
const CH4_P1 = CH3_P1
const CH4_P2 = CH3_P2

// CH5: Visited Set — puzzle where blocks can oscillate back and forth
const CH5_P1 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 3, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'B', row: 2, col: 3, length: 2, direction: 'vertical', isTarget: false },
  { id: 'C', row: 4, col: 3, length: 2, direction: 'horizontal', isTarget: false },
])

// CH6: Complexity — hard 6+ move puzzle
const CH6_P1 = gs(2, [
  { id: 'T', row: 2, col: 0, length: 2, direction: 'horizontal', isTarget: true },
  { id: 'A', row: 0, col: 2, length: 2, direction: 'vertical', isTarget: false },
  { id: 'B', row: 2, col: 3, length: 3, direction: 'vertical', isTarget: false },
  { id: 'C', row: 0, col: 4, length: 3, direction: 'horizontal', isTarget: false },
  { id: 'D', row: 1, col: 5, length: 2, direction: 'vertical', isTarget: false },
  { id: 'E', row: 3, col: 1, length: 2, direction: 'horizontal', isTarget: false },
  { id: 'F', row: 5, col: 0, length: 3, direction: 'horizontal', isTarget: false },
])

// ─── Curriculum ─────────────────────────────────────────────────────────────

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'What is a State?',
    concept: 'State Space',
    color: '#1565c0',
    description: 'Every board arrangement is a "state". When you move a block, you transition to a new state. Puzzles are solved by finding a path through the state space.',
    levels: [
      {
        id: 'ch1-l1',
        title: 'Your First State',
        algorithm: 'bfs',
        puzzle: CH1_P1,
        introText: 'Each unique arrangement of blocks on the board is called a **state**. Right now you are looking at the **initial state**. Watch the solver explore nearby states one by one.',
        showQueue: false,
        showVisited: false,
      },
      {
        id: 'ch1-l2',
        title: 'State Transitions',
        algorithm: 'bfs',
        puzzle: CH1_P2,
        introText: 'Every legal move creates a **new state**. States connect to each other through moves — this forms a **graph** that the algorithm must search. Each node in the graph is a state.',
        showQueue: false,
        showVisited: false,
      },
    ],
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Exploring Neighbors',
    concept: 'Graph Search',
    color: '#6a1b9a',
    description: 'From any state, you can reach "neighbor" states by making one move. To find the solution, we systematically explore these neighbors — this is graph search.',
    levels: [
      {
        id: 'ch2-l1',
        title: 'Finding Neighbors',
        algorithm: 'bfs',
        puzzle: CH2_P1,
        introText: 'From any state, every legal move leads to a **neighbor state**. The solver generates all neighbors, checks which ones are new, and adds them to the frontier to explore next.',
        showQueue: true,
        showVisited: false,
      },
      {
        id: 'ch2-l2',
        title: 'The Search Frontier',
        algorithm: 'bfs',
        puzzle: CH2_P2,
        introText: 'The **frontier** is the collection of states waiting to be explored. At each step, we pick one state from the frontier, expand it, and add its new neighbors. The order we pick matters!',
        showQueue: true,
        showVisited: false,
      },
    ],
  },
  {
    id: 'ch3',
    number: 3,
    title: 'BFS — Shortest Path',
    concept: 'Breadth-First Search',
    color: '#e65100',
    description: 'BFS uses a queue (FIFO). It explores all states at depth 1 before depth 2, guaranteeing the shortest solution. Trade-off: uses the most memory.',
    levels: [
      {
        id: 'ch3-l1',
        title: 'BFS in Action',
        algorithm: 'bfs',
        puzzle: CH3_P1,
        introText: '**BFS** uses a **queue** (First In, First Out). States are explored level by level — all depth-1 states before depth-2. This guarantees the fewest moves to solve.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Word Ladder',
          url: 'https://leetcode.com/problems/word-ladder/',
          note: 'Classic BFS on a graph of word states — exactly the same pattern as this puzzle.',
        },
      },
      {
        id: 'ch3-l2',
        title: 'Level-by-Level Expansion',
        algorithm: 'bfs',
        puzzle: CH3_P2,
        introText: 'Watch how BFS expands the frontier **level by level**. All 1-move states are explored before any 2-move states. The first time we reach the goal, we know it\'s the shortest path.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Minimum Genetic Mutation',
          url: 'https://leetcode.com/problems/minimum-genetic-mutation/',
          note: 'BFS on a state graph — find the shortest transformation sequence.',
        },
      },
    ],
  },
  {
    id: 'ch4',
    number: 4,
    title: 'DFS — Going Deep',
    concept: 'Depth-First Search',
    color: '#2e7d32',
    description: 'DFS uses a stack (LIFO). It dives deep into one path before backtracking. Uses less memory than BFS but may not find the shortest solution.',
    levels: [
      {
        id: 'ch4-l1',
        title: 'DFS in Action',
        algorithm: 'dfs',
        puzzle: CH4_P1,
        introText: '**DFS** uses a **stack** (Last In, First Out). It follows one path as deep as possible before backtracking. Compare how it explores states differently from BFS on the same puzzle.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Number of Islands',
          url: 'https://leetcode.com/problems/number-of-islands/',
          note: 'DFS to explore all connected cells in a grid.',
        },
      },
      {
        id: 'ch4-l2',
        title: 'BFS vs DFS Comparison',
        algorithm: 'dfs',
        puzzle: CH4_P2,
        introText: 'DFS may find a **longer path** to the solution. Notice how many states it explores and the depth it reaches — compare this with the BFS solution for the same puzzle in Chapter 3.',
        showQueue: true,
        showVisited: true,
      },
    ],
  },
  {
    id: 'ch5',
    number: 5,
    title: 'The Visited Set',
    concept: 'Cycle Detection',
    color: '#c62828',
    description: 'Without tracking visited states, the search would loop forever — move a block right, then left, back to the same state. The visited set prevents this.',
    levels: [
      {
        id: 'ch5-l1',
        title: 'Why Cycles Happen',
        algorithm: 'bfs',
        puzzle: CH5_P1,
        introText: 'Blocks can be moved forward and back — creating **cycles** in the state graph. Without a visited set, we\'d loop infinitely. Watch the visited counter grow as the solver skips already-seen states.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Sliding Puzzle',
          url: 'https://leetcode.com/problems/sliding-puzzle/',
          note: 'BFS with visited set to solve an 8-puzzle — the same technique used here.',
        },
      },
      {
        id: 'ch5-l2',
        title: 'Visited Set in Practice',
        algorithm: 'dfs',
        puzzle: CH5_P1,
        introText: 'With DFS, the visited set is even more critical — without it, DFS would follow a cycle indefinitely. The visited set converts an infinite graph into a finite one we can solve.',
        showQueue: true,
        showVisited: true,
      },
    ],
  },
  {
    id: 'ch6',
    number: 6,
    title: 'State Space Complexity',
    concept: 'Complexity & Optimization',
    color: '#4a148c',
    description: 'As puzzles grow harder, the number of states explodes. This is the core challenge of AI/search problems — and why smarter algorithms like A* and heuristics matter.',
    levels: [
      {
        id: 'ch6-l1',
        title: 'State Explosion',
        algorithm: 'bfs',
        puzzle: CH6_P1,
        introText: 'Watch the **states explored** counter as BFS works through a hard puzzle. Each additional block multiplies the state space. This is why Rubik\'s Cube (4.3×10²⁰ states) cannot be solved with plain BFS.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Word Ladder II',
          url: 'https://leetcode.com/problems/word-ladder-ii/',
          note: 'Find ALL shortest paths — the state space explosion makes this one of LeetCode\'s hardest BFS problems.',
        },
      },
      {
        id: 'ch6-l2',
        title: 'What Comes Next?',
        algorithm: 'dfs',
        puzzle: CH6_P1,
        introText: 'DFS explores the same hard puzzle differently. Neither BFS nor DFS is optimal for very large state spaces. The next step is **heuristic search (A*)** — using domain knowledge to guide the search toward the goal faster.',
        showQueue: true,
        showVisited: true,
        leetcode: {
          title: 'Minimum Cost to Reach Destination',
          url: 'https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/',
          note: 'When BFS/DFS isn\'t enough — Dijkstra\'s algorithm and weighted graphs.',
        },
      },
    ],
  },
]
