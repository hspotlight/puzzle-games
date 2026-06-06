import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const UnblockMe = lazy(() => import('./games/unblock-me/UnblockMe').then(m => ({ default: m.UnblockMe })))

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: '#bcaaa4' }}>
      Loading…
    </div>
  )
}

function NavBar() {
  return (
    <nav
      style={{
        background: '#1a0f0a',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        borderBottom: '1px solid #3e2723',
      }}
    >
      <Link to="/" style={{ color: '#ffcc80', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
        🧩 Puzzle Games
      </Link>
      <Link to="/unblock-me" style={{ color: '#bcaaa4', textDecoration: 'none', fontSize: 14 }}>
        Unblock Me
      </Link>
    </nav>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div style={{ minHeight: '100vh', background: '#2c1810', fontFamily: 'system-ui, sans-serif' }}>
        <NavBar />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unblock-me" element={<UnblockMe />} />
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  )
}
