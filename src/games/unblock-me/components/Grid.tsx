import type { GameState, MoveAction } from '../types'
import { getMovableRange } from '../engine'

interface Props {
  state: GameState
  onMove: (action: MoveAction) => void
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
}

const CELL_SIZE = 64
const GAP = 6
const PADDING = 16

export function Grid({ state, onMove, selectedBlockId, onSelectBlock }: Props) {
  const gridPx = state.gridSize * CELL_SIZE + (state.gridSize - 1) * GAP

  function handleBlockClick(blockId: string) {
    if (selectedBlockId === blockId) {
      onSelectBlock(null)
      return
    }
    onSelectBlock(blockId)
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
    if (delta !== 0) {
      e.preventDefault()
      onMove({ blockId: selectedBlockId, delta })
    }
  }

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedBlockId) return
    const block = state.blocks.find(b => b.id === selectedBlockId)
    if (!block) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - PADDING
    const y = e.clientY - rect.top - PADDING

    const clickCol = Math.floor(x / (CELL_SIZE + GAP))
    const clickRow = Math.floor(y / (CELL_SIZE + GAP))

    let delta = 0
    if (block.direction === 'horizontal') {
      delta = clickCol - block.col
    } else {
      delta = clickRow - block.row
    }

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
      }}
    >
      {Array.from({ length: state.gridSize }).map((_, r) =>
        Array.from({ length: state.gridSize }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              top: PADDING + r * (CELL_SIZE + GAP),
              left: PADDING + c * (CELL_SIZE + GAP),
              width: CELL_SIZE,
              height: CELL_SIZE,
              background: 'rgba(0,0,0,0.15)',
              borderRadius: 4,
            }}
          />
        ))
      )}

      {/* Exit arrow */}
      <div
        style={{
          position: 'absolute',
          right: -24,
          top: PADDING + state.exitRow * (CELL_SIZE + GAP) + CELL_SIZE / 2 - 10,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: '20px solid #d32f2f',
        }}
      />

      <div style={{ position: 'absolute', top: PADDING, left: PADDING }}>
        {state.blocks.map(block => {
          const w = block.direction === 'horizontal'
            ? block.length * CELL_SIZE + (block.length - 1) * GAP
            : CELL_SIZE
          const h = block.direction === 'vertical'
            ? block.length * CELL_SIZE + (block.length - 1) * GAP
            : CELL_SIZE
          const top = block.row * (CELL_SIZE + GAP)
          const left = block.col * (CELL_SIZE + GAP)
          const isSelected = selectedBlockId === block.id
          const bg = block.isTarget ? '#d32f2f' : isSelected ? '#ff8f00' : '#e65100'

          return (
            <div
              key={block.id}
              data-testid={`block-${block.id}`}
              onClick={e => { e.stopPropagation(); handleBlockClick(block.id) }}
              style={{
                position: 'absolute',
                top,
                left,
                width: w,
                height: h,
                background: bg,
                borderRadius: 6,
                boxShadow: isSelected
                  ? '0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.4)'
                  : '0 3px 8px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'top 0.15s ease, left 0.15s ease, background 0.1s',
                userSelect: 'none',
                backgroundImage: block.isTarget
                  ? 'none'
                  : 'repeating-linear-gradient(90deg,rgba(255,255,255,0.07) 0px,rgba(255,255,255,0.07) 4px,transparent 4px,transparent 12px)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
