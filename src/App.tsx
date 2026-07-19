import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import {
  Twitter,
  Github,
  MessageCircle,
  Mail,
  ArrowRight,
  Wand2,
  BookOpen,
  Sparkles as SparklesIcon,
  Wallet,
  Cpu,
  Users,
  Play,
  ChevronDown,
  UserPlus,
  Layers,
  Sun,
  Moon,
} from 'lucide-react'
import logoUrl from './assets/logo.png'
import cyberRonin from './assets/cyber-ronin.png'
import sakuraWars from './assets/sakura-wars.png'
import voidEater from './assets/void-eater.png'
import salarymanX from './assets/salaryman-x.png'
import './index.css'

/* ------------------------------------------------------------------ */
/* Waitlist — integrates with Supabase backend                        */
/* ------------------------------------------------------------------ */
const WAITLIST_URL = import.meta.env.VITE_WAITLIST_URL

const useWaitlistStore = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    if (!WAITLIST_URL) {
      setError('Waitlist not configured')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(WAITLIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'subscribe' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, submitted, error, submit, loading }
}

/* ------------------------------------------------------------------ */
/* Theme — light / dark with persistence + system preference          */
/* ------------------------------------------------------------------ */
const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem('mv-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function ThemeToggle({ theme, setTheme }: { theme: 'dark' | 'light'; setTheme: (t: 'dark' | 'light') => void }) {
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('light', next === 'light')
    localStorage.setItem('mv-theme', next)
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed top-5 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(13,13,26,0.10)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(13,13,26,0.15)',
        color: theme === 'dark' ? '#ffffff' : '#0d0d1a',
      }}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Ambient 3D background (decorative only)                            */
/* ------------------------------------------------------------------ */
function AmbientScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#6C5CE7" />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#00CEC9" />
      <Stars
        radius={120}
        depth={50}
        count={350}
        factor={3}
        saturation={0.4}
        fade
        speed={0.2}
      />
      <Sparkles count={18} scale={15} size={1.5} speed={0.15} opacity={0.25} color="#6C5CE7" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Floating manga panel mesh for parallax effect                      */
/* ------------------------------------------------------------------ */
function FloatingPanel() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.03
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3
    }
  })
  return (
    <mesh ref={ref} position={[-6, -2, -5]} rotation={[0.3, 0.5, 0]}>
      <boxGeometry args={[1.2, 1.8, 0.05]} />
      <meshStandardMaterial
        color="rgba(108, 92, 231, 0.15)"
        emissive="rgba(108, 92, 231, 0.3)"
        transparent
        opacity={0.4}
        wireframe
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Floating manga panel mesh for parallax effect (2)                 */
/* ------------------------------------------------------------------ */
function FloatingPanel2() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.03
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3
    }
  })
  return (
    <mesh ref={ref} position={[5, 1, -6]} rotation={[-0.2, -0.4, 0]}>
      <boxGeometry args={[1, 1.4, 0.05]} />
      <meshStandardMaterial
        color="rgba(0, 206, 201, 0.15)"
        emissive="rgba(0, 206, 201, 0.3)"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Cursor trail — purple smoke puffs + lightning following the pointer */
/* ------------------------------------------------------------------ */
function CursorTrail() {
  const layerRef = useRef<HTMLDivElement>(null)
  const last = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 })

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    let frame = 0
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      const prev = last.current
      // throttle: spawn at most every ~28ms and only when moved enough
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y)
      if (now - prev.t < 28 || dist < 6) return
      last.current = { x: e.clientX, y: e.clientY, t: now }
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => spawn(e.clientX, e.clientY))
    }

    const spawn = (x: number, y: number) => {
      // smoke puff
      const puff = document.createElement('span')
      puff.className = 'cursor-puff'
      puff.style.left = `${x}px`
      puff.style.top = `${y}px`
      const s = 14 + Math.random() * 22
      puff.style.width = `${s}px`
      puff.style.height = `${s}px`
      layer.appendChild(puff)
      puff.addEventListener('animationend', () => puff.remove())

      // occasional lightning bolt
      if (Math.random() < 0.45) {
        const bolt = document.createElement('span')
        bolt.className = 'cursor-bolt'
        bolt.style.left = `${x}px`
        bolt.style.top = `${y}px`
        const h = 18 + Math.random() * 26
        bolt.style.height = `${h}px`
        bolt.style.setProperty('--r', `${ -25 + Math.random() * 50 }deg`)
        layer.appendChild(bolt)
        bolt.addEventListener('animationend', () => bolt.remove())
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={layerRef} className="cursor-trail-layer" aria-hidden />
}

/* ------------------------------------------------------------------ */
/* "Arise" intro overlay — pitch-black with purple smoke-cloud         */
/* outlines + lightning, Solo Leveling style                           */
/* ------------------------------------------------------------------ */
function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const clouds = [
    { top: '8%', left: '12%', size: 320, delay: 0.0 },
    { top: '52%', left: '68%', size: 280, delay: 0.12 },
    { top: '30%', left: '42%', size: 400, delay: 0.05 },
    { top: '66%', left: '18%', size: 260, delay: 0.18 },
    { top: '18%', left: '76%', size: 300, delay: 0.08 },
    { top: '44%', left: '6%', size: 240, delay: 0.22 },
  ]

  const bolts = [
    { top: '20%', left: '30%', height: 280, rotate: -12, delay: 0.1 },
    { top: '38%', left: '62%', height: 320, rotate: 14, delay: 0.25 },
    { top: '12%', left: '52%', height: 240, rotate: 4, delay: 0.35 },
    { top: '55%', left: '42%', height: 300, rotate: -8, delay: 0.45 },
  ]

  return (
    <motion.div
      className="arise-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.7, filter: 'blur(50px)' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
      onAnimationComplete={onComplete}
    >
      {/* outlined purple smoke clouds */}
      {clouds.map((c, i) => (
        <motion.div
          key={`c${i}`}
          className="arise-cloud"
          style={{ top: c.top, left: c.left, width: c.size, height: c.size }}
          initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
          animate={{ scale: [0.3, 1, 1.25], opacity: [0, 0.95, 0], rotate: [-10, 6, 12] }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: c.delay + 1.2 }}
        />
      ))}

      {/* jagged purple lightning bolts */}
      {bolts.map((b, i) => (
        <motion.div
          key={`b${i}`}
          className="arise-bolt"
          style={{ top: b.top, left: b.left, height: b.height, transform: `rotate(${b.rotate}deg)` }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 0.8, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: b.delay + 1.0, times: [0, 0.2, 0.7, 1] }}
        />
      ))}

      <motion.div
        className="arise-word"
        initial={{ opacity: 0, scale: 0.7, letterSpacing: '0.1em' }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1, 1.1], letterSpacing: ['0.1em', '0.35em', '0.35em', '0.6em'] }}
        transition={{ duration: 1.8, ease: 'easeOut', times: [0, 0.3, 0.7, 1] }}
      >
        Arise
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero — larger logo, better headline, "Join Auditions" CTA          */
/* ------------------------------------------------------------------ */
function Hero() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const { email, setEmail, submitted, error, submit, loading } = useWaitlistStore()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden px-4 pt-16">
      {/* animated 3D background */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.5]}>
          <AmbientScene />
          <FloatingPanel />
          <FloatingPanel2 />
        </Canvas>
      </div>

      {/* logo - larger */}
      <motion.img
        src={logoUrl}
        alt="MangaVerse logo"
        className="w-28 h-28 md:w-36 md:h-36 mb-6 rounded-2xl logo-glow"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

      <motion.span
        className="text-xs uppercase tracking-wider text-gray-400 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Where Manga Comes Alive
      </motion.span>

      <motion.h1
        className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-center heading-crimson pb-2 leading-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        The Future of Interactive Manga
      </motion.h1>

      <motion.p
        className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Discover worlds powered by AI, blockchain, and imagination.
      </motion.p>

      {/* Join Auditions button - glowing cyan */}
      {!submitted && (
        <motion.form
          onSubmit={submit}
          className="relative z-10 w-full max-w-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-surface border border-white/10 focus:border-secondary/50 focus:outline-none placeholder:text-gray-500 text-white"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-cyan-500 font-semibold text-white flex items-center justify-center gap-2 electric-effect ripple shadow-[0_0_20px_rgba(0,206,201,0.5)]"
            >
              {loading ? 'Submitting...' : <>Join Auditions <ArrowRight size={18} /></>}
            </motion.button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </motion.form>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-card rounded-2xl p-8 text-center"
        >
          <SparklesIcon className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h3 className="text-2xl font-heading mb-1 heading-crimson">You're on the list!</h3>
          <p className="text-gray-400">We'll notify you when we launch.</p>
        </motion.div>
      )}

      {/* Bounce down arrow aligned with input field */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Two journeys — Artists & Readers                                   */
/* ------------------------------------------------------------------ */
function Journeys() {
  const items = [
    {
      icon: <Wand2 size={22} />,
      title: 'For Artists',
      body: 'Generate characters from prompts, build scenes in a drag-and-drop Studio, and export a proprietary .MVX format — all with AI assistance.',
      points: ['AI character generation', 'Scene & panel builder', '.MVX creator format'],
      tint: 'from-primary/30',
    },
    {
      icon: <BookOpen size={22} />,
      title: 'For Readers',
      body: 'Read manga your way, then tap "Animate This" to watch a page come alive — with sound, camera-pan, and immersive storytelling.',
      points: ['One-click animation', 'Camera-pan playback', 'Immersive reading'],
      tint: 'from-secondary/30',
    },
  ]

  return (
    <section className="relative py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="Two sides of the Verse" subtitle="One platform for creators and fans" />
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {items.map((it, i) => (
            <motion.div
              key={i}
              className={`journey-card p-7 bg-gradient-to-br ${it.tint} to-transparent`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary mb-4">
                {it.icon}
              </div>
              <h3 className="text-2xl font-heading mb-2 heading-crimson">{it.title}</h3>
              <p className="text-gray-400 mb-4">{it.body}</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {it.points.map((p, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Features — mapped to low-level docs                               */
/* ------------------------------------------------------------------ */
function Features() {
  const features = [
    { icon: <Wand2 size={24} />, title: 'AI Character Generation', desc: 'Text-to-character with style presets and consistent identity via LoRA fine-tuning.' },
    { icon: <Layers size={24} />, title: 'Manga Studio', desc: 'Drag-and-drop scene builder, templates, AI backgrounds, and real-time collaboration.' },
    { icon: <Play size={24} />, title: 'One-Click Animation', desc: 'Turn static pages into motion with the LTX Video Model, plus sound and camera-pan.' },
    { icon: <Wallet size={24} />, title: 'Web3 Ownership', desc: 'NFT-based authorship records and smart-contract perpetual royalties.' },
    { icon: <Cpu size={24} />, title: 'Camera-Pan Reading', desc: 'Pan and frame each page like a scene — your perspective, your viewing angle.' },
    { icon: <Users size={24} />, title: 'DAO Governance', desc: 'Community-driven decisions powered by the $MANGA token.' },
  ]

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="The Future of Manga" subtitle="AI creation, living animation, and true ownership" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-2xl p-6 hover-glow electric-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="text-xl font-heading mb-2 heading-crimson">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Sample Manga — real AI-generated concept art                      */
/* ------------------------------------------------------------------ */
function SampleManga() {
  const samples = [
    {
      image: cyberRonin,
      title: 'Cyber Ronin',
      style: 'Shonen',
      description: 'A wandering warrior in a neon-drenched cyberpunk future.',
      tags: ['Action', 'Sci-Fi'],
      color: '#6C5CE7',
    },
    {
      image: sakuraWars,
      title: 'Sakura Wars',
      style: 'Shoujo',
      description: 'High school girls discover magical powers to save their town.',
      tags: ['Magical Girl', 'Romance'],
      color: '#00CEC9',
    },
    {
      image: voidEater,
      title: 'Void Eater',
      style: 'Seinen',
      description: 'Dark fantasy epic where humanity fights cosmic horrors.',
      tags: ['Horror', 'Fantasy'],
      color: '#9B59B6',
    },
    {
      image: salarymanX,
      title: 'Salaryman X',
      style: 'Comedy',
      description: 'An ordinary salaryman gets transported to a fantasy world.',
      tags: ['Isekai', 'Comedy'],
      color: '#3498DB',
    },
  ]

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Sample Manga"
          subtitle="AI-generated concepts showcasing what creators can build on MangaVerse"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {samples.map((m, i) => (
            <motion.div
              key={i}
              className="journey-card overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="manga-panel rounded-t-2xl !border-0 !rounded-b-none aspect-[3/4]">
                <div className="halftone" />
                <img src={m.image} alt={m.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <span
                  className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: `${m.color}33`, color: m.color }}
                >
                  {m.style}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg mb-1 heading-crimson">{m.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{m.description}</p>
                <div className="flex flex-wrap gap-2">
                  {m.tags.map((t, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section header                                                     */
/* ------------------------------------------------------------------ */
function SectionTitle({ title, subtitle, showDivider = true }: { title: string; subtitle: string; showDivider?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h2 className="text-4xl md:text-5xl font-heading mb-3 heading-crimson">{title}</h2>
      <p className="text-gray-400 max-w-xl mx-auto">{subtitle}</p>
      {showDivider && <div className="section-divider" />}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Built with — horizontally scrollable tech stack                    */
/* ------------------------------------------------------------------ */
function BuiltWith() {
  const stack = [
    { name: 'React', desc: 'Component-based UI powering the interactive landing page.' },
    { name: 'TypeScript', desc: 'Type-safe codebase from UI down to data models.' },
    { name: 'Vite', desc: 'Lightning-fast dev server and production bundler.' },
    { name: 'Tailwind CSS', desc: 'Utility-first styling with a custom MangaVerse theme.' },
    { name: 'Framer Motion', desc: 'Fluid animations, parallax, and scroll reveals.' },
    { name: 'Three.js', desc: 'WebGL 3D ambient background via react-three-fiber.' },
    { name: 'Zustand', desc: 'Minimal state store for the waitlist flow.' },
    { name: 'Lucide', desc: 'Clean, consistent icon set across the page.' },
    { name: 'Surge', desc: 'Zero-config static hosting for the coming-soon launch.' },
  ]

  return (
    <section className="relative py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Built with" subtitle="The stack bringing MangaVerse to life" showDivider={false} />
        <div className="flex justify-center mt-4 mb-6">
          <div className="flex gap-2">
            <motion.div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <motion.div className="w-2 h-2 rounded-full bg-secondary/60 animate-pulse [animation-delay:0.3s]" />
            <motion.div className="w-2 h-2 rounded-full bg-cyan-500/60 animate-pulse [animation-delay:0.6s]" />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-6 px-1 snap-x snap-mandatory hide-scrollbar">
          {stack.map((t, i) => (
            <motion.div
              key={i}
              className="journey-card electric-effect snap-start shrink-0 w-64 p-5"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-heading mb-2 heading-crimson">{t.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  const socials = [
    { icon: <Twitter size={20} />, label: 'Twitter', href: '#' },
    { icon: <MessageCircle size={20} />, label: 'Discord', href: '#' },
    { icon: <Github size={20} />, label: 'GitHub', href: '#' },
    { icon: <Mail size={20} />, label: 'Contact', href: 'mailto:hello@mangaverse.ai' },
  ]

  return (
    <footer className="relative py-12 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="MangaVerse logo" className="w-12 h-12 rounded-xl logo-glow" />
          <div>
            <p className="font-heading text-lg heading-crimson">
              Manga<span className="text-brand-gradient">Verse</span>
            </p>
            <p className="text-gray-500 text-sm">Where Manga Comes Alive</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((s, i) => (
            <motion.a
              key={i}
              href={s.href}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400
                       hover:text-secondary hover:bg-secondary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {s.icon}
            </motion.a>
          ))}
        </div>

        <p className="text-gray-500 text-sm">© 2026 MangaVerse. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')

    // Swap favicon to match theme. Browsers cache favicons by href, so we
    // recreate the <link> element (with a cache-busting query) to force a reload.
    const href = (theme === 'light' ? '/favicon-light-32.png' : '/favicon-32.png') + '?t=' + Date.now()
    const oldLink = document.getElementById('favicon')
    const link = document.createElement('link')
    link.id = 'favicon'
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = href
    if (oldLink && oldLink.parentNode) {
      oldLink.parentNode.replaceChild(link, oldLink)
    } else {
      document.head.appendChild(link)
    }
  }, [theme])

  return (
    <div className={`bg-gradient-hero min-h-screen ${theme === 'light' ? 'light' : ''}`}>
      <ThemeToggle theme={theme} setTheme={setTheme} />

      <AnimatePresence>
        {!introDone && <IntroOverlay onComplete={() => setIntroDone(true)} />}
      </AnimatePresence>

      <CursorTrail />
      {/* Subtle crimson red and electric blue glow effects */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] animate-crimson-glow pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-electric-blue-glow pointer-events-none" />
      
      {/* Parallax manga panels */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="parallax-panel" />
        <div className="parallax-panel" />
        <div className="parallax-panel" />
        <div className="parallax-panel" />
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
      </div>

      <Hero />
      <Journeys />
      <Features />
      <SampleManga />
      <BuiltWith />
      <Footer />
    </div>
  )
}

export default App