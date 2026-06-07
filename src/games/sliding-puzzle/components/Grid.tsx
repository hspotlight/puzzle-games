import { useRef, useCallback, useMemo, memo, useState } from 'react'
import type { GameState, MoveAction, Tile } from '../types'
import { getMovableRange, findEmpty, buildOccupancy } from '../engine'

interface Props {
  state: GameState
  onMove: (action: MoveAction) => void
  cellSize: number
}

const GAP = 6
const PADDING = 16

const CellGrid = memo(({ gridSize, cellSize }: { gridSize: number; cellSize: number }) => (
  <>
    {Array.from({ length: gridSize }, (_, r) =>
      Array.from({ length: gridSize }, (_, c) => (
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            top: PADDING + r * (cellSize + GAP),
            left: PADDING + c * (cellSize + GAP),
            width: cellSize,
            height: cellSize,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 6,
          }}
        />
      ))
    )}
  </>
))

interface TilePieceProps {
  tile: Tile
  cellSize: number
  canMove: boolean
  isDragging: boolean
  dragOffsetX: number
  dragOffsetY: number
  onPointerDown: (e: React.PointerEvent, tile: Tile) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onClick: (e: React.MouseEvent, tileId: string) => void
}

const TilePiece = memo(({
  tile, cellSize, canMove, isDragging, dragOffsetX, dragOffsetY,
  onPointerDown, onPointerMove, onPointerUp, onClick,
}: TilePieceProps) => {
  const top = tile.row * (cellSize + GAP) + (isDragging ? dragOffsetY : 0)
  const left = tile.col * (cellSize + GAP) + (isDragging ? dragOffsetX : 0)
  const bg = isDragging ? '#ff8f00' : canMove ? '#ff8f00' : '#e65100'
  const fontSize = Math.max(14, Math.floor(cellSize * 0.4))

  return (
    <div
      onPointerDown={e => onPointerDown(e, tile)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={e => onClick(e, tile.id)}
      style={{
        position: 'absolute',
        top,
        left,
        width: cellSize,
        height: cellSize,
        background: bg,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        color: '#fff',
        cursor: canMove ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        boxShadow: isDragging
          ? '0 0 0 3px #fff, 0 8px 24px rgba(0,0,0,0.5)'
          : canMove
          ? '0 0 0 2px rgba(255,255,255,0.5), 0 3px 8px rgba(0,0,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.3)',
        transition: isDragging ? 'none' : 'top 0.15s ease, left 0.15s ease, background 0.1s',
        zIndex: isDragging ? 10 : 1,
        touchAction: 'none',
      }}
    >
      {tile.value}
    </div>
  )
})

interface DragRef {
  tileId: string
  tileRow: number
  tileCol: number
  emptyRow: number
  emptyCol: number
  startX: number
  startY: number
  dragOffsetX: number
  dragOffsetY: number
  applied: boolean
}

export function Grid({ state, onMove, cellSize }: Props) {
  const gridPx = state.gridSize * cellSize + (state.gridSize - 1) * GAP
  const [dragVisual, setDragVisual] = useState<{ tileId: string; ox: number; oy: number } | null>(null)
  const dragRef = useRef<DragRef | null>(null)
  const rafRef = useRef<number | null>(null)

  const tileMap = useMemo(
    () => new Map(state.tiles.map(t => [t.id, t])),
    [state.tiles]
  )

  const occupancy = useMemo(() => buildOccupancy(state), [state])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, tile: Tile) => {
      const { max } = getMovableRange(tile, state, occupancy)
      if (max === 0) return
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const empty = findEmpty(state)
      dragRef.current = {
        tileId: tile.id,
        tileRow: tile.row,
        tileCol: tile.col,
        emptyRow: empty.row,
        emptyCol: empty.col,
        startX: e.clientX,
        startY: e.clientY,
        dragOffsetX: 0,
        dragOffsetY: 0,
        applied: false,
      }
      setDragVisual({ tileId: tile.id, ox: 0, oy: 0 })
    },
    [state, occupancy]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const ds = dragRef.current
    const tile = tileMap.get(ds.tileId)
    if (!tile) return

    const maxPx = cellSize + GAP
    const rowDir = ds.emptyRow - ds.tileRow  // -1, 0, or 1
    const colDir = ds.emptyCol - ds.tileCol  // -1, 0, or 1

    const rawX = e.clientX - ds.startX
    const rawY = e.clientY - ds.startY

    // Constrain to the axis toward the empty space
    const ox = colDir !== 0 ? Math.max(0, Math.min(maxPx, colDir * rawX)) * colDir : 0
    const oy = rowDir !== 0 ? Math.max(0, Math.min(maxPx, rowDir * rawY)) * rowDir : 0

    ds.dragOffsetX = ox
    ds.dragOffsetY = oy

    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (dragRef.current)
        setDragVisual({ tileId: dragRef.current.tileId, ox: dragRef.current.dragOffsetX, oy: dragRef.current.dragOffsetY })
    })
  }, [tileMap, cellSize])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const ds = dragRef.current
    dragRef.current = null
    setDragVisual(null)
    if (!ds) return
    const threshold = (cellSize + GAP) * 0.3
    const moved = Math.abs(ds.dragOffsetX) + Math.abs(ds.dragOffsetY)
    if (moved >= threshold) onMove({ tileId: ds.tileId })
  }, [onMove, cellSize])

  const handleTileClick = useCallback((e: React.MouseEvent, tileId: string) => {
    e.stopPropagation()
    if (dragRef.current) return
    const tile = tileMap.get(tileId)
    if (!tile) return
    const { max } = getMovableRange(tile, state, occupancy)
    if (max > 0) onMove({ tileId })
  }, [tileMap, state, occupancy, onMove])

  function handleArrowKey(e: React.KeyboardEvent) {
    const empty = findEmpty(state)
    let targetRow = empty.row
    let targetCol = empty.col

    // Arrow key = direction the empty space moves;
    // tile adjacent in that direction slides into empty
    if (e.key === 'ArrowRight') targetCol = empty.col + 1
    else if (e.key === 'ArrowLeft') targetCol = empty.col - 1
    else if (e.key === 'ArrowDown') targetRow = empty.row + 1
    else if (e.key === 'ArrowUp') targetRow = empty.row - 1
    else return

    e.preventDefault()
    if (targetRow < 0 || targetRow >= state.gridSize || targetCol < 0 || targetCol >= state.gridSize) return
    const occ = occupancy
    const id = occ[targetRow]?.[targetCol]
    if (id && id !== 'empty') onMove({ tileId: id })
  }

  return (
    <div
      role="grid"
      aria-label="puzzle grid"
      tabIndex={0}
      onKeyDown={handleArrowKey}
      style={{
        position: 'relative',
        width: gridPx + PADDING * 2,
        height: gridPx + PADDING * 2,
        background: '#5d4037',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        outline: 'none',
        touchAction: 'none',
        flexShrink: 0,
      }}
    >
      <CellGrid gridSize={state.gridSize} cellSize={cellSize} />

      <div style={{ position: 'absolute', top: PADDING, left: PADDING }}>
        {state.tiles
          .filter(tile => tile.value !== 0)
          .map(tile => {
            const isDragging = dragVisual?.tileId === tile.id
            const { max } = getMovableRange(tile, state, occupancy)
            return (
              <TilePiece
                key={tile.id}
                tile={tile}
                cellSize={cellSize}
                canMove={max > 0}
                isDragging={isDragging}
                dragOffsetX={isDragging ? dragVisual!.ox : 0}
                dragOffsetY={isDragging ? dragVisual!.oy : 0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleTileClick}
              />
            )
          })}
      </div>
    </div>
  )
}
