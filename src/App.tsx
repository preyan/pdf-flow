import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Layout } from '@/components/shared/Layout'
import { PageTransition } from '@/components/shared/PageTransition'
import { cleanupOldEntries } from '@/services/storageService'
import Home from '@/pages/Home'
import Tool from '@/pages/Tool'
import About from '@/pages/About'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <PageTransition routeKey={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:name" element={<Tool />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    cleanupOldEntries().catch(() => {
      // IndexedDB unavailable (private mode, etc.) — non-fatal.
    })
  }, [])

  return (
    <HashRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </HashRouter>
  )
}
