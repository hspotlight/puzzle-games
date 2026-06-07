interface Props {
  onClose: () => void
}

export function HowToPlay({ onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#3e2723', borderRadius: 16, padding: '24px 28px',
          maxWidth: 420, width: '100%', color: '#fff',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        <h2 style={{ color: '#ffcc80', margin: '0 0 16px', fontSize: 22 }}>How to Play</h2>

        <Section title="Goal">
          Arrange the tiles in order — <strong>1 through 8</strong> left-to-right,
          top-to-bottom — with the blank space in the bottom-right corner.
        </Section>

        <Section title="Moving tiles">
          Only tiles <em>directly adjacent</em> to the blank space can move.
          A tile slides into the empty slot — it cannot jump over other tiles.
          Highlighted (brighter) tiles are the ones you can move right now.
        </Section>

        <Section title="Controls">
          <ul style={{ margin: '8px 0', paddingLeft: 20, lineHeight: 1.9 }}>
            <li><strong>Click</strong> any highlighted tile to slide it into the blank.</li>
            <li><strong>Drag</strong> a highlighted tile toward the blank space and release.</li>
            <li><strong>Arrow keys</strong> move the blank space in that direction
              (the adjacent tile slides into the blank).</li>
          </ul>
        </Section>

        <Section title="Auto-Solver">
          Open the <strong>Solver panel</strong> and choose BFS (finds the fewest moves)
          or DFS (finds any path quickly). Hit <em>Solve &amp; Animate</em> to watch
          the solution play out.
        </Section>

        <Section title="Tips">
          <ul style={{ margin: '8px 0', paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Solve the top row first, then the left column, then the rest.</li>
            <li>Arrow keys are the fastest way to navigate once you have a plan.</li>
            <li>Not every scramble looks hard — count the moves BFS finds!</li>
          </ul>
        </Section>

        <button
          onClick={onClose}
          style={{
            marginTop: 20, width: '100%', padding: '10px 0',
            background: '#e65100', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: '#ffcc80', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{title}</div>
      <div style={{ color: '#d7ccc8', fontSize: 14, lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}
