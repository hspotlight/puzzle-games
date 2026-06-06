import { useState, useRef, useCallback } from 'react'
import type { GameState, MoveAction, Block } from '../types'
import { getMovableRange } from '../engine'

interface Props {
  state: GameState
  onMove: (action: MoveAction) => void
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  cellSize: number
}

const GAP = 6
const PADDING = 16

interface DragState {
  blockId: string
  startX: number
  startY: number
  currentDelta: number
  min: number
  max: number
}

export function Grid({ state, onMove, selectedBlockId, onSelectBlock, cellSize }: Props) {
  const gridPx = state.gridSize * cellSize + (state.gridSize - 1) * GAP
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, block: Block) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const { min, max } = getMovableRange(block, state)
      const ds: DragState = { blockId: block.id, startX: e.clientX, startY: e.clientY, currentDelta: 0, min, max }
      dragRef.current = ds
      setDrag(ds)
      onSelectBlock(block.id)
    },
    [state, onSelectBlock]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      const ds = dragRef.current
      const block = state.blocks.find(b => b.id === ds.blockId)
      if (!block) return
      const rawPx = block.direction === 'horizontal' ? e.clientX - ds.startX : e.clientY - ds.startY
      const rawDelta = Math.round(rawPx / (cellSize + GAP))
      const clampedDelta = Math.max(ds.min, Math.min(ds.max, rawDelta))
      if (clampedDelta !== ds.currentDelta) {
        const updated = { ...ds, currentDelta: clampedDelta }
        dragRef.current = updated
        setDrag(updated)
      }
    },
    [state, cellSize]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      const ds = dragRef.current
      if (!ds) return
      if (Math.abs(ds.currentDelta) > 0) {
        onMove({ blockId: ds.blockId, delta: ds.currentDelta })
        onSelectBlock(null)
      }
      dragRef.current = null
      setDrag(null)
    },
    [onMove, onSelectBlock]
  )

  function handleBlockClick(e: React.MouseEvent, blockId: string) {
    e.stopPropagation()
    if (dragRef.current) return
    onSelectBlock(selectedBlockId === blockId ? null : blockId)
  }

  function handleArrowKey(e: React.KeyboardEvent) {
    if (!selectedBlockId) return
    const block = state.blocks.find(b => b.id === selectedBlockId)
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
    const block = state.blocks.find(b => b.id === selectedBlockId)
    if (!block) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - PADDING
    const y = e.clientY - rect.top - PADDING
    const clickCol = Math.floor(x / (cellSize + GAP))
    const clickRow = Math.floor(y / (cellSize + GAP))
    let delta = block.direction === 'horizontal' ? clickCol - block.col : clickRow - block.row
    if (delta !== 0) {
      const { min, max } = getMovableRange(block, state)
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
      {/* Cell backgrounds */}
      {Array.from({ length: state.gridSize }).map((_, r) =>
        Array.from({ length: state.gridSize }).map((_, c) => (
          <div key={`${r}-${c}`} style={{
            position: 'absolute',
            top: PADDING + r * (cellSize + GAP),
            left: PADDING + c * (cellSize + GAP),
            width: cellSize,
            height: cellSize,
            background: 'rgba(0,0,0,0.15)',
            borderRadius: 4,
          }} />
        ))
      )}

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

      {/* Blocks */}
      <div style={{ position: 'absolute', top: PADDING, left: PADDING }}>
        {state.blocks.map(block => {
          const w = block.direction === 'horizontal'
            ? block.length * cellSize + (block.length - 1) * GAP : cellSize
          const h = block.direction === 'vertical'
            ? block.length * cellSize + (block.length - 1) * GAP : cellSize
          const baseTop = block.row * (cellSize + GAP)
          const baseLeft = block.col * (cellSize + GAP)
          const isDragging = drag?.blockId === block.id
          const dragDelta = isDragging ? drag.currentDelta : 0
          const top = block.direction === 'vertical' ? baseTop + dragDelta * (cellSize + GAP) : baseTop
          const left = block.direction === 'horizontal' ? baseLeft + dragDelta * (cellSize + GAP) : baseLeft
          const isSelected = selectedBlockId === block.id
          const bg = block.isTarget ? '#d32f2f' : isSelected ? '#ff8f00' : '#e65100'

          return (
            <div
              key={block.id}
              data-testid={`block-${block.id}`}
              onPointerDown={e => handlePointerDown(e, block)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={e => handleBlockClick(e, block.id)}
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
        })}
      </div>
    </div>
  )
}
