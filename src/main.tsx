import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import BirdDetail from './BirdDetail.tsx'
import { BirdTransitionProvider } from './BirdTransitionContext.tsx'

/** Gallery stays mounted and is only hidden on bird page, so videos don't reload on back. */
function Root() {
  const location = useLocation()
  const isGallery = location.pathname === '/'

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          visibility: isGallery ? 'visible' : 'hidden',
          pointerEvents: isGallery ? 'auto' : 'none',
          zIndex: isGallery ? 1 : 0,
        }}
      >
        <App />
      </div>
      <Routes>
        <Route path="/bird/:id" element={<BirdDetail />} />
      </Routes>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BirdTransitionProvider>
        <Root />
      </BirdTransitionProvider>
    </BrowserRouter>
  </StrictMode>,
)
