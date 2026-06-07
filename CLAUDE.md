# puzzle-games — Claude Instructions

## Tech stack
React 19, TypeScript, Vite, Vitest 4, React Router 7 (HashRouter). No CSS framework — inline styles only.

## Project layout

```
src/
  App.tsx                          # Router, NavBar, lazy routes
  pages/HomePage.tsx               # Game card grid
  games/
    unblock-me/                    # Sliding-block puzzle (6×6)
    sliding-puzzle/                # 8-puzzle (3×3)
public/
  internals-unblock-me.html        # CS docs for Unblock Me
  internals-8-puzzle.html          # CS docs for 8-Puzzle
```

Each game lives entirely in `src/games/<slug>/` and follows this structure:

```
types.ts          # Piece, GameState, MoveAction interfaces
engine.ts         # Pure functions: buildOccupancy, getMovableRange, applyMove,
                  #   serializeState, getLegalMoves
solver.ts         # BFS/DFS solver — game-agnostic
levels.ts         # Handcrafted LEVELS: GameState[]
[GameName].tsx    # Main page: useReducer, useCellSize, solver animation
index.ts          # export { GameName }
components/
  Grid.tsx              # Absolute-positioned board, RAF drag, memo tiles
  [GameName]Panel.tsx   # Solver UI with dynamic import('../solver')
  HowToPlay.tsx         # Modal overlay
  index.ts
engine.test.ts    # ≥15 unit tests for every engine function
levels.test.ts    # No overlaps, in-bounds, BFS solvability per level
```

## Adding a new game

Use the `/add-puzzle-game` skill. It handles everything end-to-end.

## Architecture rules

**Pure engine functions** — `engine.ts` has no side effects, no globals, no
mutation of arguments. `buildOccupancy` may mutate its own locally-created
array — that's fine.

**`buildOccupancy` must skip blank tiles.** If a game has an empty/blank tile,
do not write its id into the occupancy grid — leave that cell as `null`.

**No derived data in `GameState`.** Occupancy, adjacency, legal moves — all
computed on demand.

**Piece positions in `Grid.tsx`** are relative to a container `<div>` that
already has `top: PADDING; left: PADDING`. Use `row * (cellSize + GAP)` —
**never** `PADDING + row * (cellSize + GAP)` — or tiles will overflow the board.

**`useReducer`** manages all game logic state. `useState` is only for transient
UI state (show/hide modal, drag visual delta).

**No animation inside the reducer.** Solver playback uses `setTimeout` chains
in the component dispatching `SET_STATE`.

## Routing

All routes are hash-based (`HashRouter`). Adding a game requires:
1. Lazy import in `App.tsx`
2. `<Link>` in the `NavBar` component
3. Internals `<a>` link in the `NavBar` pointing to `internals-<slug>.html`
4. `<Route>` inside `<Routes>`
5. Game card in `src/pages/HomePage.tsx`

## Internals documentation

Each game has its own standalone HTML file at `public/internals-<slug>.html`.
There is no shared `internals.html`. Each file includes a cross-link to the
other game's internals in its sidebar footer.

## Tests

Vitest 4 — timeout option is the **second** argument:
```typescript
it('name', { timeout: 10_000 }, () => { ... })   // ✓ Vitest 4
it('name', () => { ... }, { timeout: 10_000 })   // ✗ removed in Vitest 4
```

Run with `npm test`. All tests must pass before considering any task done.

## Color palette

| Role | Value |
|---|---|
| Page background | `#2c1810` |
| Board background | `#5d4037` |
| Accent / heading | `#ffcc80` |
| Muted text | `#bcaaa4` |
| Normal piece | `#e65100` |
| Selected / movable piece | `#ff8f00` |
| Target piece | `#d32f2f` |
| Win banner bg | `#1b5e20` |
| Win banner text | `#a5d6a7` |
