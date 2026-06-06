import { useState, useRef, useCallback, useMemo, memo } from 'react'
import type { GameState, MoveAction, Block } from '../types'
import { getMovableRange, buildOccupancy } from '../engine'

interface Props {
  state: GameState
  onMove: (action: MoveAction) => void
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  cellSize: number
}

const GAP = 6
const PADDING = 16

// Memoised background grid — only re-renders when gridSize or cellSize changes
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
            background: 'rgba(0,0,0,0.15)',
            borderRadius: 4,
          }}
        />
      ))
    )}
  </>
))

interface BlockPieceProps {
  block: Block
  cellSize: number
  isSelected: boolean
  isDragging: boolean
  dragDelta: number
  onPointerDown: (e: React.PointerEvent, block: Block) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onClick: (e: React.MouseEvent, blockId: string) => void
}

// Memoised individual block — only re-renders when its own props change
const BlockPiece = memo(({
  block, cellSize, isSelected, isDragging, dragDelta,
  onPointerDown, onPointerMove, onPointerUp, onClick,
}: BlockPieceProps) => {
  const w = block.direction === 'horizontal'
    ? block.length * cellSize + (block.length - 1) * GAP : cellSize
  const h = block.direction === 'vertical'
    ? block.length * cellSize + (block.length - 1) * GAP : cellSize
  const baseTop = block.row * (cellSize + GAP)
  const baseLeft = block.col * (cellSize + GAP)
  const top = block.direction === 'vertical' ? baseTop + dragDelta * (cellSize + GAP) : baseTop
  const left = block.direction === 'horizontal' ? baseLeft + dragDelta * (cellSize + GAP) : baseLeft
  const bg = block.isTarget ? '#d32f2f' : isSelected ? '#ff8f00' : '#e65100'

  return (
    <div
      data-testid={`block-${block.id}`}
      onPointerDown={e => onPointerDown(e, block)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={e => onClick(e, block.id)}
      style={{
        position: 'absolute', top, left, width: w, height: h,
        background: bg,
        borderRadius: 6,
        boxShadow: isDragging
          ? '0 0 0 3px #fff, 0 8px 24px rgba(0,0,0,0.5)'
          : isSelected ? '0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.4)'
          : '0 3px 8px rgba(0,0,0,0.3)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'top 0.15s ease, left 0.15s ease, background 0.1s',
        userSelect: 'none',
        zIndex: isDragging ? 10 : 1,
        backgroundImage: block.isTarget ? 'none'
          : 'repeating-linear-gradient(90deg,rgba(255,255,255,0.07) 0px,rgba(255,255,255,0.07) 4px,transparent 4px,transparent 12px)',
      }}
    />
  )
})

interface DragRef {
  blockId: string
  startX: number
  startY: number
  min: number
  max: number
  currentDelta: number
}

export function Grid({ state, onMove, selectedBlockId, onSelectBlock, cellSize }: Props) {
  const gridPx = state.gridSize * cellSize + (state.gridSize - 1) * GAP
  // Visual drag state: only {blockId, delta} — minimal re-render trigger
  const [dragVisual, setDragVisual] = useState<{ blockId: string; delta: number } | null>(null)
  const dragRef = useRef<DragRef | null>(null)
  const rafRef = useRef<number | null>(null)

  // Build block lookup map once per state change
  const blockMap = useMemo(
    () => new Map(state.blocks.map(b => [b.id, b])),
    [state.blocks]
  )

  // Build occupancy map once per state change (used by getMovableRange)
  const occupancy = useMemo(() => buildOccupancy(state), [state])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, block: Block) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const { min, max } = getMovableRange(block, state, occupancy)
      dragRef.current = { blockId: block.id, startX: e.clientX, startY: e.clientY, min, max, currentDelta: 0 }
      setDragVisual({ blockId: block.id, delta: 0 })
      onSelectBlock(block.id)
    },
    [state, occupancy, onSelectBlock]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const ds = dragRef.current
    const block = blockMap.get(ds.blockId)
    if (!block) return
    const rawPx = block.direction === 'horizontal' ? e.clientX - ds.startX : e.clientY - ds.startY
    const rawDelta = Math.round(rawPx / (cellSize + GAP))
    const clamped = Math.max(ds.min, Math.min(ds.max, rawDelta))
    if (clamped === ds.currentDelta) return
    ds.currentDelta = clamped
    // Throttle visual updates to animation frames
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (dragRef.current) setDragVisual({ blockId: dragRef.current.blockId, delta: dragRef.current.currentDelta })
    })
  }, [blockMap, cellSize])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const ds = dragRef.current
    dragRef.current = null
    setDragVisual(null)
    if (ds && Math.abs(ds.currentDelta) > 0) {
      onMove({ blockId: ds.blockId, delta: ds.currentDelta })
      onSelectBlock(null)
    }
  }, [onMove, onSelectBlock])

  const handleBlockClick = useCallback((e: React.MouseEvent, blockId: string) => {
    e.stopPropagation()
    if (dragRef.current) return
    onSelectBlock(selectedBlockId === blockId ? null : blockId)
  }, [selectedBlockId, onSelectBlock])

  function handleArrowKey(e: React.KeyboardEvent) {
    if (!selectedBlockId) return
    const block = blockMap.get(selectedBlockId)
    if (!block) return
    let delta = 0
    if (block.direction === 'horizontal') {
      if (e.key === 'ArrowLeft') delta = -1
      if (e.key === 'ArrowRight') delta = 1
    } else {
      if (e.key === 'ArrowUp') delta = -1
      if (e.key === 'ArrowDown') delta = 1
    }
    if (delta !== 0) { e.preventDefault(); onMove({ blockId: selectedBlockId, delta }) }
  }

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedBlockId) return
    const block = blockMap.get(selectedBlockId)
    if (!block) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - PADDING
    const y = e.clientY - rect.top - PADDING
    const clickCol = Math.floor(x / (cellSize + GAP))
    const clickRow = Math.floor(y / (cellSize + GAP))
    let delta = block.direction === 'horizontal' ? clickCol - block.col : clickRow - block.row
    if (delta !== 0) {
      const { min, max } = getMovableRange(block, state, occupancy)
      const clamped = Math.max(min, Math.min(max, delta))
      if (clamped !== 0) onMove({ blockId: selectedBlockId, delta: clamped })
    }
  }

  return (
    <div
      role="grid"
      aria-label="puzzle grid"
      tabIndex={0}
      onKeyDown={handleArrowKey}
      onClick={handleGridClick}
      style={{
        position: 'relative',
        width: gridPx + PADDING * 2,
        height: gridPx + PADDING * 2,
        background: '#5d4037',
        borderRadius: 12,
        padding: PADDING,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        outline: 'none',
        touchAction: 'none',
        flexShrink: 0,
      }}
    >
      <CellGrid gridSize={state.gridSize} cellSize={cellSize} />

      {/* Exit arrow */}
      <div style={{
        position: 'absolute',
        right: -24,
        top: PADDING + state.exitRow * (cellSize + GAP) + cellSize / 2 - 10,
        width: 0, height: 0,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: '20px solid #d32f2f',
      }} />

      <div style={{ position: 'absolute', top: PADDING, left: PADDING }}>
        {state.blocks.map(block => {
          const isDragging = dragVisual?.blockId === block.id
          const dragDelta = isDragging ? dragVisual.delta : 0
          return (
            <BlockPiece
              key={block.id}
              block={block}
              cellSize={cellSize}
              isSelected={selectedBlockId === block.id}
              isDragging={isDragging}
              dragDelta={dragDelta}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={handleBlockClick}
            />
          )
        })}
      </div>
    </div>
  )
}
