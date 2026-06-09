import { memo } from 'react'
import type { GameState } from '../../unblock-me/types'
import { buildOccupancy } from '../../unblock-me/engine'

interface Props {
  state: GameState
  size?: number   // total pixel width/height
  highlight?: boolean
}

export const MiniGrid = memo(function MiniGrid({ state, size = 48, highlight = false }: Props) {
  const cell = size / state.gridSize
  const occ = buildOccupancy(state)

  // build a flat color map
  const blockColor: Record<string, string> = {}
  for (const b of state.blocks) {
    blockColor[b.id] = b.isTarget ? '#ef5350' : '#fb8c00'
  }

  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      background: '#4e342e',
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: highlight ? '0 0 0 2px #ffcc80' : '0 1px 4px rgba(0,0,0,0.4)',
      display: 'grid',
      gridTemplateColumns: `repeat(${state.gridSize}, ${cell}px)`,
      gridTemplateRows: `repeat(${state.gridSize}, ${cell}px)`,
    }}>
      {occ.flatMap((row, r) =>
        row.map((id, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              background: id ? blockColor[id] : 'rgba(0,0,0,0.25)',
              borderRadius: 1,
              margin: 0.5,
            }}
          />
        ))
      )}
    </div>
  )
})
