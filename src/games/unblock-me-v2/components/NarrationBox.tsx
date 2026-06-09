import { memo } from 'react'
import type { SolverStep, Algorithm } from '../types'

interface Props {
  step: SolverStep | null
  algorithm: Algorithm
  totalSteps: number
  introText: string
}

function getNarration(step: SolverStep, algorithm: Algorithm): string {
  if (step.stepIndex === 0) {
    return `Starting from the initial state (depth 0). The ${algorithm === 'bfs' ? 'queue' : 'stack'} begins empty — we explore this state first.`
  }
  if (step.isSolution) {
    return `✓ Solution found! Reached the goal at depth ${step.depth} after exploring ${step.visitedCount} unique states.`
  }

  const dataStructure = algorithm === 'bfs' ? 'Dequeued' : 'Popped'
  const pending = step.queueLength
  return `${dataStructure} state #${step.stepIndex + 1} (depth ${step.depth}). Visited: ${step.visitedCount} states. ${pending} state${pending !== 1 ? 's' : ''} waiting.`
}

export const NarrationBox = memo(function NarrationBox({ step, algorithm, introText, totalSteps }: Props) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 8,
      padding: '10px 12px',
      fontSize: 13,
      lineHeight: 1.6,
      color: '#d7ccc8',
      minHeight: 72,
    }}>
      {!step ? (
        <span style={{ color: '#a1887f', fontStyle: 'italic' }}>{introText}</span>
      ) : (
        <>
          <span style={{ color: step.isSolution ? '#a5d6a7' : '#ffcc80' }}>
            Step {step.stepIndex + 1}/{totalSteps}
          </span>
          {' — '}
          {getNarration(step, algorithm)}
        </>
      )}
    </div>
  )
})
