import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { cleanupOldEntries } from '@/services/storageService'
import Home from '@/pages/Home'
import Tool from '@/pages/Tool'
import About from '@/pages/About'

export default function App() {
  useEffect(() => {
    cleanupOldEntries().catch(() => {
      // IndexedDB unavailable (private mode, etc.) — non-fatal.
    })
  }, [])

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:name" element={<Tool />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
