import React, { useRef, useCallback, memo } from 'react'
import type { GameState, ColorId, FlowPath } from '../types'
import { isPathComplete } from '../engine'

const GAP = 4
const PADDING = 12

const COLOR_MAP: Record<string, string> = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
  orange: '#fb8c00',
  maroon: '#880e4f',
  purple: '#8e24aa',
  cyan: '#00acc1',
  pink: '#f06292',
  brown: '#6d4c41',
}

function getColor(colorId: ColorId): string {
  return COLOR_MAP[colorId] ?? '#aaa'
}

interface CellGridProps {
  gridSize: number
  cellSize: number
}

const CellGrid = memo(function CellGrid({ gridSize, cellSize }: CellGridProps) {
  const cells: React.ReactNode[] = []
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            top: r * (cellSize + GAP),
            left: c * (cellSize + GAP),
            width: cellSize,
            height: cellSize,
            borderRadius: 6,
            background: '#3e2e28',
            border: '1px solid #5d4037',
          }}
        />
      )
    }
  }
  return <>{cells}</>
})

interface PathSegmentProps {
  path: FlowPath
  cellSize: number
  complete: boolean
}

const PathSegment = memo(function PathSegment({ path, cellSize, complete }: PathSegmentProps) {
  const color = getColor(path.colorId)
  const segments: React.ReactNode[] = []
  const cells = path.cells

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const prev = cells[i - 1]
    const next = cells[i + 1]

    const cx = cell.col * (cellSize + GAP) + cellSize / 2
    const cy = cell.row * (cellSize + GAP) + cellSize / 2
    const hw = cellSize * 0.3  // half-width of pipe

    // Draw segment lines to adjacent cells
    if (prev) {
      const px = prev.col * (cellSize + GAP) + cellSize / 2
      const py = prev.row * (cellSize + GAP) + cellSize / 2
      const midX = (cx + px) / 2
      const midY = (cy + py) / 2
      const isH = cell.row === prev.row

      segments.push(
        <div
          key={`seg-prev-${i}`}
          style={{
            position: 'absolute',
            background: color,
            ...(isH
              ? {
                  top: cy - hw,
                  left: Math.min(cx, midX),
                  width: Math.abs(cx - midX),
                  height: hw * 2,
                }
              : {
                  top: Math.min(cy, midY),
                  left: cx - hw,
                  width: hw * 2,
                  height: Math.abs(cy - midY),
                }),
          }}
        />
      )
    }
    if (next) {
      const nx = next.col * (cellSize + GAP) + cellSize / 2
      const ny = next.row * (cellSize + GAP) + cellSize / 2
      const midX = (cx + nx) / 2
      const midY = (cy + ny) / 2
      const isH = cell.row === next.row

      segments.push(
        <div
          key={`seg-next-${i}`}
          style={{
            position: 'absolute',
            background: color,
            ...(isH
              ? {
                  top: cy - hw,
                  left: Math.min(cx, midX),
                  width: Math.abs(cx - midX),
                  height: hw * 2,
                }
              : {
                  top: Math.min(cy, midY),
                  left: cx - hw,
                  width: hw * 2,
                  height: Math.abs(cy - midY),
                }),
          }}
        />
      )
    }

    // Draw filled circle at each cell
    const isEndpoint = i === 0 || i === cells.length - 1
    segments.push(
      <div
        key={`dot-${i}`}
        style={{
          position: 'absolute',
          top: cell.row * (cellSize + GAP) + cellSize * 0.15,
          left: cell.col * (cellSize + GAP) + cellSize * 0.15,
          width: cellSize * 0.7,
          height: cellSize * 0.7,
          borderRadius: '50%',
          background: color,
          boxShadow: complete && isEndpoint ? `0 0 8px 2px ${color}` : undefined,
          border: isEndpoint ? `3px solid rgba(255,255,255,0.5)` : 'none',
          zIndex: isEndpoint ? 3 : 1,
        }}
      />
    )
  }

  return <>{segments}</>
})

interface EndpointDotProps {
  row: number
  col: number
  colorId: ColorId
  cellSize: number
}

const EndpointDot = memo(function EndpointDot({ row, col, colorId, cellSize }: EndpointDotProps) {
  const color = getColor(colorId)
  return (
    <div
      style={{
        position: 'absolute',
        top: row * (cellSize + GAP) + cellSize * 0.1,
        left: col * (cellSize + GAP) + cellSize * 0.1,
        width: cellSize * 0.8,
        height: cellSize * 0.8,
        borderRadius: '50%',
        background: color,
        border: '3px solid rgba(255,255,255,0.6)',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  )
})

interface GridProps {
  state: GameState
  cellSize: number
  activeColor: ColorId | null
  onCellPointerDown: (row: number, col: number) => void
  onCellPointerEnter: (row: number, col: number) => void
  onPointerUp: () => void
}

export const Grid = memo(function Grid({
  state,
  cellSize,
  onCellPointerDown,
  onCellPointerEnter,
  onPointerUp,
}: GridProps) {
  const { gridSize, endpoints, paths } = state
  const gridPx = gridSize * cellSize + (gridSize - 1) * GAP

  const isDragging = useRef(false)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      isDragging.current = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left - PADDING
      const y = e.clientY - rect.top - PADDING
      const col = Math.floor(x / (cellSize + GAP))
      const row = Math.floor(y / (cellSize + GAP))
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        onCellPointerDown(row, col)
      }
    },
    [cellSize, gridSize, onCellPointerDown]
  )

  const rafRef = useRef<number | null>(null)
  const pendingCell = useRef<{ row: number; col: number } | null>(null)

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left - PADDING
      const y = e.clientY - rect.top - PADDING
      const col = Math.floor(x / (cellSize + GAP))
      const row = Math.floor(y / (cellSize + GAP))
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        pendingCell.current = { row, col }
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            if (pendingCell.current) {
              onCellPointerEnter(pendingCell.current.row, pendingCell.current.col)
              pendingCell.current = null
            }
          })
        }
      }
    },
    [cellSize, gridSize, onCellPointerEnter]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    onPointerUp()
  }, [onPointerUp])

  // Compute which paths are complete
  const completeSet = new Set(
    paths.filter(p => isPathComplete(p, state)).map(p => p.colorId)
  )

  return (
    <div
      tabIndex={0}
      style={{
        position: 'relative',
        width: gridPx + PADDING * 2,
        height: gridPx + PADDING * 2,
        background: '#5d4037',
        borderRadius: 12,
        border: '2px solid #795548',
        cursor: 'crosshair',
        userSelect: 'none',
        touchAction: 'none',
        outline: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Cell background grid */}
      <div style={{ position: 'absolute', top: PADDING, left: PADDING }}>
        <CellGrid gridSize={gridSize} cellSize={cellSize} />

        {/* Paths */}
        {paths.map(path => (
          <PathSegment
            key={path.colorId}
            path={path}
            cellSize={cellSize}
            complete={completeSet.has(path.colorId)}
          />
        ))}

        {/* Endpoint dots (rendered on top) */}
        {endpoints.map(ep => (
          <EndpointDot
            key={`${ep.colorId}-${ep.row}-${ep.col}`}
            row={ep.row}
            col={ep.col}
            colorId={ep.colorId}
            cellSize={cellSize}
          />
        ))}
      </div>
    </div>
  )
})
