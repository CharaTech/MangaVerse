import { useState } from 'react'
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
  Image as ImageIcon,
  Layers,
} from 'lucide-react'
import logoUrl from './assets/logo.png'
import cyberRonin from './assets/cyber-ronin.png'
import sakuraWars from './assets/sakura-wars.png'
import voidEater from './assets/void-eater.png'
import salarymanX from './assets/salaryman-x.png'
import audition from './assets/audition.png'
import './index.css'

/* ------------------------------------------------------------------ */
/* Waitlist (front-end only — no backend, no real submission)         */
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
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#6C5CE7" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00CEC9" />
      <Stars radius={120} depth={50} count={1500} factor={4} fade speed={0.6} />
      <Sparkles count={60} scale={12} size={2} speed={0.3} opacity={0.4} color="#6C5CE7" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Hero — manga-first: a static panel with subtle camera-pan + the    */
/* "Animate This" concept pill (teaser, not functional)               */
/* ------------------------------------------------------------------ */
function Hero() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* ambient canvas */}
      <div className="absolute inset-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <AmbientScene />
        </Canvas>
      </div>

      {/* brand mark */}
      <motion.img
        src={logoUrl}
        alt="MangaVerse logo"
        className="logo-glow w-20 h-20 md:w-24 md:h-24 mb-6 rounded-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

      <motion.span
        className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/20 border border-primary/30 text-primary mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Coming Soon
      </motion.span>

      <motion.h1
        className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Manga<span className="text-brand-gradient">Verse</span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Where Manga Meets Tomorrow — create manga with AI, then bring every page to life.
      </motion.p>

      {/* Manga panel hero with camera-pan + Animate This teaser */}
      <motion.div
        className="relative w-full max-w-md mb-12"
        style={{ opacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="manga-panel aspect-[3/4] camera-pan">
          <div className="halftone" />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <div className="speech-bubble text-sm">New chapter drops soon!</div>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/30 text-primary">
                Shonen
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary opacity-70 blur-[1px]" />
              <span className="animate-pill">
                <Play size={14} /> Animate This
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <WaitlistForm />

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown size={30} />
      </motion.div>
    </section>
  )
}

function WaitlistForm() {
  const { email, setEmail, submitted, error, submit } = useWaitlistStore()

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <SparklesIcon className="w-10 h-10 text-secondary mx-auto mb-3" />
        <h3 className="text-2xl font-heading mb-1">You're on the list!</h3>
        <p className="text-gray-400">We'll notify you the moment we launch.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto"
    >
      <h3 className="text-xl font-heading mb-1">Join the Waitlist</h3>
      <p className="text-gray-400 mb-5 text-sm">Early access + exclusive creator perks.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 px-4 py-3 rounded-xl bg-surface border border-white/10
                   focus:border-primary/50 focus:outline-none placeholder:text-gray-500"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary
                   font-medium flex items-center justify-center gap-2 electric-effect ripple"
        >
          Join <ArrowRight size={18} />
        </motion.button>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      <p className="text-gray-500 text-xs mt-4">
        Be the first to create, animate, and own manga on MangaVerse.
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Two journeys — Artists & Readers (mapped to the product vision)    */
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
      body: 'Read manga your way, then tap “Animate This” to watch a page come alive — with sound, camera-pan, and immersive storytelling.',
      points: ['One-click animation', 'Camera-pan playback', 'Immersive reading'],
      tint: 'from-secondary/30',
    },
  ]

  return (
    <section className="relative py-20 px-4">
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
/* Features — mapped to the low-level docs (Studio / Reader / Web3)   */
/* ------------------------------------------------------------------ */
function Features() {
  const features = [
    {
      icon: <Wand2 size={24} />,
      title: 'AI Character Generation',
      description: 'Text-to-character with style presets and consistent identity via LoRA fine-tuning.',
    },
    {
      icon: <Layers size={24} />,
      title: 'Manga Studio',
      description: 'Drag-and-drop scene builder, templates, AI backgrounds, and real-time collaboration.',
    },
    {
      icon: <Play size={24} />,
      title: 'One-Click Animation',
      description: 'Turn static pages into motion with the LTX Video Model, plus sound and camera-pan.',
    },
    {
      icon: <Wallet size={24} />,
      title: 'Web3 Ownership',
      description: 'NFT-based authorship records and smart-contract perpetual royalties for creators.',
    },
    {
      icon: <ImageIcon size={24} />,
      title: 'Camera-Pan Reading',
      description: 'Pan and frame each page like a scene — your perspective, your viewing angle.',
    },
    {
      icon: <Users size={24} />,
      title: 'DAO Governance',
      description: 'Community-driven decisions powered by the $MANGA token and stakeholder voting.',
    },
  ]

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="The Future of Manga" subtitle="AI creation, living animation, and true ownership" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-2xl p-6 hover-glow"
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
              <p className="text-gray-400 text-sm">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Sample Manga — real AI-generated concept art (presentational only) */
/* ------------------------------------------------------------------ */
function SampleManga() {
  const samples = [
    {
      image: cyberRonin,
      title: 'Cyber Ronin',
      style: 'Shonen',
      description: 'A wandering warrior in a neon-drenched cyberpunk future. Last of the Ronin code.',
      tags: ['Action', 'Sci-Fi'],
      color: '#6C5CE7',
    },
    {
      image: sakuraWars,
      title: 'Sakura Wars',
      style: 'Shoujo',
      description: 'High school girls discover magical powers to save their town from supernatural threats.',
      tags: ['Magical Girl', 'Romance'],
      color: '#00CEC9',
    },
    {
      image: voidEater,
      title: 'Void Eater',
      style: 'Seinen',
      description: 'Dark fantasy epic where humanity fights ancient cosmic horrors. Not for the faint-hearted.',
      tags: ['Horror', 'Fantasy'],
      color: '#9B59B6',
    },
    {
      image: salarymanX,
      title: 'Salaryman X',
      style: 'Comedy',
      description: 'An ordinary salaryman gets transported to a fantasy world. Hilarity ensues.',
      tags: ['Isekai', 'Comedy'],
      color: '#3498DB',
    },
    {
      image: audition,
      title: 'Audition',
      style: 'Josei',
      description: 'Aspiring idols navigate rivalry, friendship, and the spotlight of stage life.',
      tags: ['Drama', 'Music'],
      color: '#FF69B4',
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
                <img
                  src={m.image}
                  alt={m.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
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
        <div className="text-center md:text-left">
          <img src={logoUrl} alt="MangaVerse" className="logo-glow w-10 h-10 rounded-lg mb-2" />
          <p className="font-heading text-lg">
            Manga<span className="text-brand-gradient">Verse</span>
          </p>
          <p className="text-gray-500 text-sm">Where Manga Meets Tomorrow</p>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((s, i) => (
            <motion.a
              key={i}
              href={s.href}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400
                       hover:text-primary hover:bg-primary/20 transition-colors"
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
