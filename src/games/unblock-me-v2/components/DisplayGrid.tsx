import { memo } from 'react'
import type { GameState } from '../../unblock-me/types'

interface Props {
  state: GameState
  cellSize?: number
  highlightBlockId?: string | null
}

const GAP = 5
const PAD = 12

export const DisplayGrid = memo(function DisplayGrid({ state, cellSize = 56, highlightBlockId }: Props) {
  const gridPx = state.gridSize * cellSize + (state.gridSize - 1) * GAP

  return (
    <div style={{
      position: 'relative',
      width: gridPx + PAD * 2,
      height: gridPx + PAD * 2,
      background: '#5d4037',
      borderRadius: 12,
      padding: PAD,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      flexShrink: 0,
    }}>
      {/* Cell backgrounds */}
      {Array.from({ length: state.gridSize }).map((_, r) =>
        Array.from({ length: state.gridSize }).map((_, c) => (
          <div key={`${r}-${c}`} style={{
            position: 'absolute',
            top: PAD + r * (cellSize + GAP),
            left: PAD + c * (cellSize + GAP),
            width: cellSize,
            height: cellSize,
            background: 'rgba(0,0,0,0.18)',
            borderRadius: 3,
          }} />
        ))
      )}

      {/* Exit arrow */}
      <div style={{
        position: 'absolute',
        right: -22,
        top: PAD + state.exitRow * (cellSize + GAP) + cellSize / 2 - 9,
        width: 0, height: 0,
        borderTop: '9px solid transparent',
        borderBottom: '9px solid transparent',
        borderLeft: '18px solid #d32f2f',
      }} />

      {/* Blocks */}
      <div style={{ position: 'absolute', top: PAD, left: PAD }}>
        {state.blocks.map(block => {
          const w = block.direction === 'horizontal'
            ? block.length * cellSize + (block.length - 1) * GAP : cellSize
          const h = block.direction === 'vertical'
            ? block.length * cellSize + (block.length - 1) * GAP : cellSize
          const top = block.row * (cellSize + GAP)
          const left = block.col * (cellSize + GAP)
          const isHighlighted = block.id === highlightBlockId
          const bg = block.isTarget ? '#d32f2f' : isHighlighted ? '#ff8f00' : '#e65100'

          return (
            <div key={block.id} style={{
              position: 'absolute', top, left, width: w, height: h,
              background: bg,
              borderRadius: 6,
              boxShadow: isHighlighted
                ? '0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.4)'
                : block.isTarget ? '0 0 0 2px rgba(255,255,255,0.3), 0 3px 8px rgba(0,0,0,0.3)'
                : '0 3px 8px rgba(0,0,0,0.3)',
              transition: 'top 0.3s ease, left 0.3s ease, background 0.15s',
              backgroundImage: block.isTarget ? 'none'
                : 'repeating-linear-gradient(90deg,rgba(255,255,255,0.07) 0px,rgba(255,255,255,0.07) 4px,transparent 4px,transparent 12px)',
            }} />
          )
        })}
      </div>

      {/* Win overlay */}
      {state.won && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(27,94,32,0.7)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>
          ✓
        </div>
      )}
    </div>
  )
})
