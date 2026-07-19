import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
} from 'lucide-react'
import logoUrl from './assets/logo.png'
import cyberRonin from './assets/cyber-ronin.png'
import sakuraWars from './assets/sakura-wars.png'
import voidEater from './assets/void-eater.png'
import salarymanX from './assets/salaryman-x.png'
import './index.css'

/* ------------------------------------------------------------------ */
/* Waitlist (front-end only — no backend, no real submission)        */
/* ------------------------------------------------------------------ */
const useWaitlistStore = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return { email, setEmail, submitted, error, submit }
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
        count={1000}
        factor={3}
        saturation={0.4}
        fade
        speed={0.4}
      />
      <Sparkles count={40} scale={15} size={1.5} speed={0.2} opacity={0.3} color="#6C5CE7" />
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
/* Hero — larger logo, better headline, "Join Auditions" CTA          */
/* ------------------------------------------------------------------ */
function Hero() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const { email, setEmail, submitted, error, submit } = useWaitlistStore()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden px-4 pt-16">
      {/* animated 3D background */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
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
        className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-center"
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
          as="form"
          onSubmit={submit}
          className="w-full max-w-md mb-8"
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-cyan-500 font-semibold flex items-center justify-center gap-2 electric-effect ripple shadow-[0_0_20px_rgba(0,206,201,0.5)]"
            >
              Join Auditions <ArrowRight size={18} />
            </motion.button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </motion.form>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <SparklesIcon className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h3 className="text-2xl font-heading mb-1">You're on the list!</h3>
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
              <h3 className="text-2xl font-heading mb-2">{it.title}</h3>
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
              <h3 className="text-xl font-heading mb-2">{f.title}</h3>
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
                <h3 className="font-heading text-lg mb-1">{m.title}</h3>
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
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h2 className="text-4xl md:text-5xl font-heading mb-3">{title}</h2>
      <p className="text-gray-400 max-w-xl mx-auto">{subtitle}</p>
      <div className="tono-divider"><span /><span /><span /></div>
    </motion.div>
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
            <p className="font-heading text-lg">
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
  return (
    <div className="bg-gradient-hero min-h-screen">
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
      <Footer />
    </div>
  )
}

export default App