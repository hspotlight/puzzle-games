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
          Slide the <Red>red block</Red> to the <strong>right exit arrow ▶</strong>.
          It can only move horizontally — clear its path!
        </Section>

        <Section title="Moving blocks">
          Every block slides in <em>one direction only</em>: horizontal blocks move
          left/right; vertical blocks move up/down. They can't change direction or
          jump over other blocks.
        </Section>

        <Section title="Controls">
          <ul style={{ margin: '8px 0', paddingLeft: 20, lineHeight: 1.9 }}>
            <li><strong>Drag</strong> any block along its axis.</li>
            <li><strong>Tap / click</strong> a block to select it (highlight), then tap
              elsewhere on the grid to slide it there.</li>
            <li><strong>Arrow keys</strong> move the selected block one cell at a time.</li>
          </ul>
        </Section>

        <Section title="Auto-Solver">
          Open the <strong>Solver panel</strong> and choose BFS (optimal, fewest moves) or
          DFS (any valid path). Hit <em>Solve &amp; Animate</em> to watch the solution
          play out step by step.
        </Section>

        <Section title="Tips">
          <ul style={{ margin: '8px 0', paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Plan ahead — moving one block often frees another.</li>
            <li>Vertical blockers in the red block's row are the immediate obstacles.</li>
            <li>Look for blocks that are already free to move out of the way.</li>
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

function Red({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#ef5350', fontWeight: 700 }}>{children}</span>
}
