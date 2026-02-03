import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useRoutes } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import BirdDetail from './BirdDetail.tsx'
import { BirdTransitionProvider } from './BirdTransitionContext.tsx'

const routes = [
  { path: '/', element: <App /> },
  { path: '/bird/:id', element: <BirdDetail /> },
]

function AnimatedRoutes() {
  const location = useLocation()
  const element = useRoutes(routes, location)
  const fromBirdBack = (location.state as { fromBirdBack?: boolean } | null)?.fromBirdBack
  const isBackToGallery = location.pathname === '/' && fromBirdBack

  // Skip AnimatePresence when returning from detail – avoids detail’s full-screen exit (grow + fade)
  if (element && isBackToGallery) {
    return <div style={{ position: 'absolute', inset: 0 }}>{element}</div>
  }

  return (
    <AnimatePresence mode="wait">
      {element && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {element}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BirdTransitionProvider>
        <AnimatedRoutes />
      </BirdTransitionProvider>
    </BrowserRouter>
  </StrictMode>,
)
