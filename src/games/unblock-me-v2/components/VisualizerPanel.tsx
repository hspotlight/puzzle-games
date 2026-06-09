import { useState, useEffect, useRef, useCallback } from 'react'
import type { SolverStep, LessonLevel } from '../types'
import { buildSteps } from '../stepSolver'
import { QueueViz } from './QueueViz'
import { NarrationBox } from './NarrationBox'
import { StepControls } from './StepControls'

interface Props {
  level: LessonLevel
  onCurrentStepChange: (step: SolverStep | null) => void
}

export function VisualizerPanel({ level, onCurrentStepChange }: Props) {
  const [steps, setSteps] = useState<SolverStep[]>([])
  const [stepIndex, setStepIndex] = useState(-1)   // -1 = not started
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build steps when level changes
  useEffect(() => {
    const s = buildSteps(level.puzzle, level.algorithm)
    setSteps(s)
    setStepIndex(-1)
    setPlaying(false)
    onCurrentStepChange(null)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [level])

  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null

  useEffect(() => {
    onCurrentStepChange(currentStep)
  }, [currentStep])

  const advance = useCallback(() => {
    setStepIndex(prev => {
      const next = prev + 1
      if (next >= steps.length) {
        setPlaying(false)
        return prev
      }
      return next
    })
  }, [steps.length])

  // Auto-play timer
  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return }
    timerRef.current = setTimeout(() => {
      advance()
    }, speed)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, stepIndex, speed, advance])

  function handlePlay() {
    if (stepIndex >= steps.length - 1) { setStepIndex(0); }
    setPlaying(true)
  }
  function handlePause() { setPlaying(false) }
  function handlePrev() { setStepIndex(i => Math.max(0, i - 1)) }
  function handleNext() { setStepIndex(i => Math.min(steps.length - 1, i + 1)) }
  function handleReset() { setStepIndex(-1); setPlaying(false); onCurrentStepChange(null) }

  const step = currentStep

  return (
    <div style={{
      background: '#3e2723', borderRadius: 12, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 280, maxWidth: 360, width: '100%',
    }}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: 13, color: '#ffcc80' }}>
          Algorithm Visualizer
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px',
            background: level.algorithm === 'bfs' ? '#e65100' : '#2e7d32',
            borderRadius: 4, color: '#fff',
          }}>
            {level.algorithm.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, color: '#a1887f' }}>
            {level.algorithm === 'bfs' ? 'Queue — guarantees shortest path' : 'Stack — memory efficient, any path'}
          </span>
        </div>
      </div>

      {/* Stats */}
      {step && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['Depth', step.depth],
            ['Explored', step.visitedCount],
            ['Waiting', step.queueLength],
          ].map(([label, val]) => (
            <div key={label as string} style={{
              flex: 1, minWidth: 60,
              background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ffcc80' }}>{val}</div>
              <div style={{ fontSize: 10, color: '#6d4c41' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Queue visualization */}
      {level.showQueue && (
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '8px 10px' }}>
          <QueueViz
            items={step?.queueSnapshot ?? []}
            totalLength={step?.queueLength ?? 0}
            algorithm={level.algorithm}
          />
          {level.showVisited && step && (
            <div style={{ fontSize: 11, color: '#6d4c41', marginTop: 4 }}>
              Visited set: {step.visitedCount} state{step.visitedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Narration */}
      <NarrationBox
        step={step}
        algorithm={level.algorithm}
        introText={level.introText}
        totalSteps={steps.length}
      />

      {/* Controls */}
      <StepControls
        stepIndex={Math.max(0, stepIndex)}
        totalSteps={steps.length}
        playing={playing}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />

      {/* LeetCode link */}
      {level.leetcode && step?.isSolution && (
        <div style={{ background: '#1a237e', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#9fa8da', marginBottom: 4 }}>
            🔗 Related LeetCode problem
          </div>
          <a
            href={level.leetcode.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#c5cae9', fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 4 }}
          >
            {level.leetcode.title} ↗
          </a>
          <div style={{ fontSize: 11, color: '#7986cb', lineHeight: 1.5 }}>
            {level.leetcode.note}
          </div>
        </div>
      )}
    </div>
  )
}
