import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Scroll detection for scrollbar effects */
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const onScroll = () => {
  document.body.classList.add('scrolling')
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.body.classList.remove('scrolling')
    scrollTimeout = null
  }, 300)
}

document.addEventListener('scroll', onScroll, { passive: true })