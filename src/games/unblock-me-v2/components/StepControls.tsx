import { memo } from 'react'

interface Props {
  stepIndex: number
  totalSteps: number
  playing: boolean
  speed: number
  onPlay: () => void
  onPause: () => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onSpeedChange: (v: number) => void
}

const SPEEDS = [2000, 1000, 500, 200]
const SPEED_LABELS = ['0.5×', '1×', '2×', '5×']

export const StepControls = memo(function StepControls({
  stepIndex, totalSteps, playing, speed,
  onPlay, onPause, onPrev, onNext, onReset, onSpeedChange,
}: Props) {
  const btn = (label: string, onClick: () => void, disabled = false, active = false): React.ReactNode => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '5px 10px', borderRadius: 6, border: 'none',
      background: active ? '#ff8f00' : disabled ? '#3e2723' : '#5d4037',
      color: disabled ? '#4e342e' : '#fff',
      cursor: disabled ? 'default' : 'pointer',
      fontSize: 13, fontWeight: active ? 700 : 400,
    }}>
      {label}
    </button>
  )

  const pct = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0

  return (
    <div>
      {/* Progress bar */}
      <div style={{ background: '#3e2723', borderRadius: 4, height: 4, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#ff8f00', transition: 'width 0.15s' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {btn('↺', onReset, stepIndex === 0 && !playing)}
        {btn('‹', onPrev, stepIndex === 0 || playing)}
        {playing
          ? btn('⏸', onPause)
          : btn('▶', onPlay, totalSteps === 0 || stepIndex >= totalSteps - 1)}
        {btn('›', onNext, stepIndex >= totalSteps - 1 || playing)}

        <div style={{ display: 'flex', gap: 3, marginLeft: 6 }}>
          {SPEEDS.map((s, i) => btn(SPEED_LABELS[i], () => onSpeedChange(s), false, speed === s))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#6d4c41', marginTop: 6 }}>
        {totalSteps === 0 ? 'Press ▶ to start' : `State ${stepIndex + 1} of ${totalSteps}`}
      </div>
    </div>
  )
})
