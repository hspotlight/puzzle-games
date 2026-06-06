import type { Block } from '../types'

interface Props {
  block: Block
  cellSize: number
  gap: number
  isSelected: boolean
  onClick: () => void
}

export function BlockPiece({ block, cellSize, gap, isSelected, onClick }: Props) {
  const width =
    block.direction === 'horizontal'
      ? block.length * cellSize + (block.length - 1) * gap
      : cellSize

  const height =
    block.direction === 'vertical'
      ? block.length * cellSize + (block.length - 1) * gap
      : cellSize

  const top = block.row * (cellSize + gap)
  const left = block.col * (cellSize + gap)

  const bg = block.isTarget
    ? '#d32f2f'
    : isSelected
    ? '#ff8f00'
    : '#e65100'

  return (
    <div
      data-testid={`block-${block.id}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        background: bg,
        borderRadius: 6,
        boxShadow: isSelected
          ? '0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.4)'
          : '0 3px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'top 0.15s ease, left 0.15s ease, background 0.1s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        backgroundImage: block.isTarget
          ? 'none'
          : 'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 4px, transparent 4px, transparent 12px)',
      }}
    />
  )
}
