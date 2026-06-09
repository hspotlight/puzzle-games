import { memo } from 'react'
import type { QueueItem } from '../types'
import type { Algorithm } from '../types'
import { MiniGrid } from './MiniGrid'

interface Props {
  items: QueueItem[]
  totalLength: number
  algorithm: Algorithm
}

export const QueueViz = memo(function QueueViz({ items, totalLength, algorithm }: Props) {
  const isBfs = algorithm === 'bfs'
  const label = isBfs ? 'Queue (FIFO)' : 'Stack (LIFO)'
  const frontLabel = isBfs ? 'dequeue ←' : 'pop ↑'
  const backLabel = isBfs ? '→ enqueue' : '↑ push'

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#ffcc80', letterSpacing: 0.5 }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: '#a1887f' }}>
          {totalLength} state{totalLength !== 1 ? 's' : ''}
        </span>
      </div>

      {totalLength === 0 ? (
        <div style={{ fontSize: 11, color: '#6d4c41', fontStyle: 'italic', padding: '6px 0' }}>
          empty
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#6d4c41', width: 40, textAlign: 'right', flexShrink: 0 }}>
            {frontLabel}
          </span>

          <div style={{ display: 'flex', gap: 4, overflowX: 'hidden', flex: 1 }}>
            {items.map((item, i) => (
              <div key={item.stateKey + i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <MiniGrid state={item.state} size={42} highlight={i === 0} />
                <span style={{ fontSize: 9, color: i === 0 ? '#ffcc80' : '#6d4c41' }}>
                  d={item.depth}
                </span>
              </div>
            ))}
            {totalLength > items.length && (
              <div style={{
                width: 42, height: 42, flexShrink: 0, borderRadius: 4,
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#6d4c41',
              }}>
                +{totalLength - items.length}
              </div>
            )}
          </div>

          <span style={{ fontSize: 9, color: '#6d4c41', width: 40, flexShrink: 0 }}>
            {backLabel}
          </span>
        </div>
      )}
    </div>
  )
})
