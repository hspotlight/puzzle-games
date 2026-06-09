import { memo } from 'react'
import type { Chapter } from '../types'

interface Props {
  chapters: Chapter[]
  activeChapterId: string | null
  activeLevelId: string | null
  onSelectLevel: (chapterId: string, levelId: string) => void
}

export const ChapterMap = memo(function ChapterMap({
  chapters, activeChapterId, activeLevelId, onSelectLevel,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 740 }}>
      {chapters.map(ch => (
        <div key={ch.id} style={{
          background: '#3e2723', borderRadius: 12, overflow: 'hidden',
          border: activeChapterId === ch.id ? `2px solid ${ch.color}` : '2px solid transparent',
        }}>
          {/* Chapter header */}
          <div style={{
            background: ch.color + '33',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: ch.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {ch.number}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{ch.title}</div>
              <div style={{ fontSize: 11, color: '#a1887f' }}>{ch.concept}</div>
            </div>
          </div>

          {/* Chapter description */}
          <div style={{ padding: '8px 16px 10px', fontSize: 12, color: '#bcaaa4', lineHeight: 1.6 }}>
            {ch.description}
          </div>

          {/* Levels */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', flexWrap: 'wrap' }}>
            {ch.levels.map((lv, i) => {
              const isActive = activeLevelId === lv.id
              return (
                <button
                  key={lv.id}
                  onClick={() => onSelectLevel(ch.id, lv.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: isActive ? `2px solid ${ch.color}` : '2px solid transparent',
                    background: isActive ? ch.color + '33' : '#5d4037',
                    color: isActive ? '#fff' : '#bcaaa4',
                    cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 400,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: isActive ? ch.color : '#4e342e',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>
                    {i + 1}
                  </span>
                  {lv.title}
                  {lv.leetcode && (
                    <span style={{ fontSize: 9, color: '#7986cb', background: '#1a237e', borderRadius: 3, padding: '1px 4px' }}>
                      LC
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
})
