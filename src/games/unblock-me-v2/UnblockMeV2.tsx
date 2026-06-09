import { useState, useMemo } from 'react'
import type { SolverStep, Chapter, LessonLevel } from './types'
import { CHAPTERS } from './curriculum'
import { DisplayGrid } from './components/DisplayGrid'
import { VisualizerPanel } from './components/VisualizerPanel'
import { ChapterMap } from './components/ChapterMap'

function findLevel(chapters: Chapter[], chapterId: string, levelId: string): LessonLevel | null {
  return chapters.find(c => c.id === chapterId)?.levels.find(l => l.id === levelId) ?? null
}

export function UnblockMeV2() {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<SolverStep | null>(null)

  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId) ?? null
  const activeLevel = useMemo(
    () => activeChapterId && activeLevelId ? findLevel(CHAPTERS, activeChapterId, activeLevelId) : null,
    [activeChapterId, activeLevelId]
  )

  function handleSelectLevel(chapterId: string, levelId: string) {
    setActiveChapterId(chapterId)
    setActiveLevelId(levelId)
    setCurrentStep(null)
  }

  function handleBack() {
    setActiveLevelId(null)
    setCurrentStep(null)
  }

  const displayState = currentStep?.state ?? activeLevel?.puzzle ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <h1 style={{ color: '#ffcc80', margin: 0, fontSize: 24 }}>Unblock Me</h1>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '2px 8px',
            background: '#e65100', borderRadius: 12, color: '#fff',
          }}>
            Learn v2
          </span>
        </div>
        <p style={{ color: '#bcaaa4', fontSize: 13, margin: '6px 0 0', maxWidth: 480 }}>
          Learn BFS &amp; DFS by watching algorithms solve the puzzle step by step.
          6 chapters from state fundamentals to complexity theory.
        </p>
      </div>

      {/* Level view */}
      {activeLevel ? (
        <div style={{ width: '100%', maxWidth: 900 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button
              onClick={handleBack}
              style={{
                background: 'none', border: '1px solid #5d4037', color: '#bcaaa4',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
              }}
            >
              ← Chapters
            </button>
            <span style={{ color: '#6d4c41', fontSize: 12 }}>›</span>
            <span style={{ color: '#a1887f', fontSize: 12 }}>
              Ch {activeChapter?.number}: {activeChapter?.title}
            </span>
            <span style={{ color: '#6d4c41', fontSize: 12 }}>›</span>
            <span style={{ color: '#ffcc80', fontSize: 12 }}>{activeLevel.title}</span>
          </div>

          {/* Concept badge + intro */}
          <div style={{
            background: (activeChapter?.color ?? '#e65100') + '22',
            borderLeft: `3px solid ${activeChapter?.color ?? '#e65100'}`,
            borderRadius: '0 8px 8px 0',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: '#d7ccc8',
            lineHeight: 1.7,
          }}>
            <strong style={{ color: '#ffcc80' }}>{activeChapter?.concept}:</strong>{' '}
            {activeLevel.introText}
          </div>

          {/* Main layout: grid + visualizer */}
          <div style={{
            display: 'flex', gap: 24, alignItems: 'flex-start',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {/* Grid showing current solver state */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {displayState && (
                <DisplayGrid
                  state={displayState}
                  cellSize={52}
                  highlightBlockId={currentStep?.action?.blockId ?? null}
                />
              )}
              {currentStep && (
                <div style={{ fontSize: 12, color: '#a1887f', textAlign: 'center' }}>
                  {currentStep.action
                    ? `Block "${currentStep.action.blockId}" moved ${currentStep.action.delta > 0 ? '+' : ''}${currentStep.action.delta}`
                    : 'Initial state'}
                </div>
              )}

              {/* Level nav */}
              {activeChapter && (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {activeChapter.levels.map((lv, i) => (
                    <button
                      key={lv.id}
                      onClick={() => handleSelectLevel(activeChapterId!, lv.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: 'none',
                        background: lv.id === activeLevelId ? activeChapter.color : '#3e2723',
                        color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visualizer panel */}
            <VisualizerPanel
              key={activeLevel.id}
              level={activeLevel}
              onCurrentStepChange={setCurrentStep}
            />
          </div>

          {/* Chapter nav */}
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CHAPTERS.map(ch => (
              <button
                key={ch.id}
                onClick={() => handleSelectLevel(ch.id, ch.levels[0].id)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12,
                  background: ch.id === activeChapterId ? ch.color : '#3e2723',
                  color: ch.id === activeChapterId ? '#fff' : '#bcaaa4',
                  cursor: 'pointer',
                }}
              >
                Ch {ch.number}: {ch.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chapter map */
        <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, color: '#a1887f', marginBottom: 4 }}>
            Choose a chapter to start learning →
          </div>
          <ChapterMap
            chapters={CHAPTERS}
            activeChapterId={activeChapterId}
            activeLevelId={activeLevelId}
            onSelectLevel={handleSelectLevel}
          />
        </div>
      )}
    </div>
  )
}
