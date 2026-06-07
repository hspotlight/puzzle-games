interface HowToPlayProps {
  onClose: () => void
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#3e2723',
          borderRadius: 16,
          padding: '28px 32px',
          maxWidth: 380,
          width: '90%',
          border: '1px solid #795548',
          color: '#fff',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: '#ffcc80', margin: '0 0 16px', fontSize: 20 }}>How to Play</h2>

        <div style={{ color: '#bcaaa4', fontSize: 14, lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: '#fff' }}>Objective:</strong> Connect each pair of colored dots
            with a path. Fill <em>every</em> cell on the board — no empty squares allowed!
          </p>

          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: '#fff' }}>Draw a path:</strong> Click and drag from any dot of
            a color to extend its path. The path grows as you move across cells.
          </p>

          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: '#fff' }}>Complete a flow:</strong> A flow is complete when
            the path connects both dots of the same color. Completed flows glow.
          </p>

          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: '#fff' }}>Rules:</strong>
          </p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>
            <li>Paths cannot cross each other</li>
            <li>Paths can only move horizontally or vertically</li>
            <li>Starting a new path on a color clears the old one</li>
            <li>Win when all colors connected AND all cells filled</li>
          </ul>

          <p style={{ margin: 0 }}>
            <strong style={{ color: '#fff' }}>Tip:</strong> Use the solver panel to see the
            optimal solution animated step by step.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: '#e65100',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
