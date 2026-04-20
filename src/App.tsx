import { useState, useRef, Suspense } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Sparkles } from '@react-three/drei'
import { 
  Twitter, Github, MessageCircle, Mail, ArrowRight, 
  Sparkles as SparklesIcon, BookOpen, Wand2, 
  Cpu, Wallet, Users, ChevronDown
} from 'lucide-react'
import './index.css'

// Waitlist store
const useWaitlistStore = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setLoading(true)
    setError('')
    
    // Simulate API call - replace with actual endpoint
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitted(true)
    setLoading(false)
  }

  return { email, setEmail, submitted, loading, error, submit }
}

// 3D Logo Component
function Logo3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -clock.getElapsedTime() * 0.5
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* Main crystal */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial 
            color="#6C5CE7" 
            emissive="#6C5CE7"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Inner glow */}
        <mesh scale={0.8}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial 
            color="#00CEC9"
            emissive="#00CEC9"
            emissiveIntensity={1}
            transparent
            opacity={0.5}
          />
        </mesh>
        
        {/* Outer ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshStandardMaterial 
            color="#6C5CE7"
            emissive="#6C5CE7"
            emissiveIntensity={2}
          />
        </mesh>
      </group>
    </Float>
  )
}

// Floating particles
function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ] as [number, number, number],
    scale: Math.random() * 0.1 + 0.02
  }))

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position} scale={p.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? '#6C5CE7' : '#00CEC9'}
            emissive={i % 2 === 0 ? '#6C5CE7' : '#00CEC9'}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Scene component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6C5CE7" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00CEC9" />
      <spotLight position={[0, 10, 0]} angle={0.3} intensity={1} color="#6C5CE7" />
      
      <Logo3D />
      <FloatingParticles />
      
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.5} color="#6C5CE7" />
    </>
  )
}

// Hero Section
function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Canvas */}
      <motion.div 
        className="absolute inset-0"
        style={{ y, opacity }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/20 border border-primary/30 text-primary mb-6">
            Coming Soon
          </span>
        </motion.div>

        <motion.h1 
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 glow-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Manga<span className="text-primary">Verse</span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Where Manga Meets Tomorrow
        </motion.p>

        <motion.p 
          className="text-lg text-gray-400 max-w-xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          Revolutionary Web3-powered manga creation platform with AI-powered tools 
          for artists and immersive reading experiences.
        </motion.p>

        <WaitlistForm />
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400"
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Waitlist Form
function WaitlistForm() {
  const { email, setEmail, submitted, loading, error, submit } = useWaitlistStore()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
      className="max-w-md mx-auto"
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <SparklesIcon className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-2xl font-heading mb-2">You're on the list!</h3>
            <p className="text-gray-400">We'll notify you when we launch.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-xl font-heading mb-2">Join the Waitlist</h3>
            <p className="text-gray-400 mb-6">Get early access and exclusive perks.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-surface border border-white/10 
                         focus:border-primary/50 focus:outline-none transition-colors
                         placeholder:text-gray-500"
                disabled={loading}
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/80 
                         font-medium flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         electric-effect ripple"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Join
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
            
            {error && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}
            
            <p className="text-gray-500 text-xs mt-4">
              Join 10,000+ early adopters. No spam, ever.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Feature Card
interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function Feature({ icon, title, description, delay }: FeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-6 hover-glow"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-heading mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

// Features Section
function Features() {
  const features = [
    {
      icon: <Wand2 size={24} />,
      title: 'AI Character Generation',
      description: 'Generate manga characters from text prompts with style customization and consistent identity using LoRA fine-tuning.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Manga Studio',
      description: 'Full-featured studio with drag-drop scene builder, templates, AI backgrounds, and real-time collaboration tools.'
    },
    {
      icon: <SparklesIcon size={24} />,
      title: 'One-Click Animation',
      description: 'Transform static manga into animated content with LTX Video Model. Add sound effects and music overlay instantly.'
    },
    {
      icon: <Wallet size={24} />,
      title: 'Web3 Ownership',
      description: 'NFT-based manga ownership with immutable authorship records and smart contract-powered perpetual royalties.'
    },
    {
      icon: <Cpu size={24} />,
      title: 'Custom .MVX Format',
      description: 'Proprietary format preserving layers, AI metadata, animations, and blockchain-verified authorship with DRM.'
    },
    {
      icon: <Users size={24} />,
      title: 'DAO Governance',
      description: 'Community-driven platform decisions with $MANGA token governance and stakeholder voting rights.'
    }
  ]

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading mb-4">
            The Future of <span className="text-primary">Manga</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A revolutionary platform bridging traditional artistry with cutting-edge AI and Web3 technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Feature key={i} {...feature} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Manga Gallery Section
function MangaGallery() {
  const sampleManga = [
    {
      title: "Cyber Ronin",
      style: "Shonen",
      description: "A wandering warrior in a neon-drenched cyberpunk future. Last of the Ronin code.",
      color: "#FF6B6B",
      tags: ["Action", "Sci-Fi"]
    },
    {
      title: "Sakura Wars",
      style: "Shoujo",
      description: "High school girls discover magical powers to save their town from supernatural threats.",
      color: "#FF69B4",
      tags: ["Magical Girl", "Romance"]
    },
    {
      title: "Void Eater",
      style: "Seinen",
      description: "Dark fantasy epic where humanity fights ancient cosmic horrors. Not for the faint-hearted.",
      color: "#9B59B6",
      tags: ["Horror", "Fantasy"]
    },
    {
      title: "Salaryman X",
      style: "Comedy",
      description: "An ordinary salaryman gets transported to a fantasy world. Hilarity ensues.",
      color: "#3498DB",
      tags: ["Isekai", "Comedy"]
    }
  ]

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading mb-4">
            Sample <span className="text-primary">Manga</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-generated manga concepts showcasing the creative possibilities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleManga.map((manga, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl overflow-hidden hover-glow"
            >
              <div 
                className="h-48 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${manga.color}22 0%, ${manga.color}11 100%)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-20 h-20 rounded-full opacity-30"
                    style={{ 
                      background: `radial-gradient(circle at 30% 30%, ${manga.color}66, transparent)`,
                      boxShadow: `0 0 40px ${manga.color}44`
                    }}
                  />
                </div>
                <span className="font-heading text-2xl opacity-20 text-white">{manga.title[0]}</span>
                <span 
                  className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${manga.color}33`, color: manga.color }}
                >
                  {manga.style}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-heading text-lg mb-1">{manga.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{manga.description}</p>
                <div className="flex flex-wrap gap-2">
                  {manga.tags.map((tag, j) => (
                    <span 
                      key={j}
                      className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400"
                    >
                      {tag}
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

// Tech Stack Section
function TechStack() {
  const techStack = [
    { name: 'React', category: 'Frontend' },
    { name: 'Three.js', category: '3D' },
    { name: 'TailwindCSS', category: 'Styling' },
    { name: 'Framer Motion', category: 'Animation' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Polygon zkEVM', category: 'Blockchain' },
    { name: 'ComfyUI + SDXL', category: 'AI/ML' },
    { name: 'LTX Video', category: 'AI/ML' },
    { name: 'IPFS', category: 'Storage' }
  ]

  return (
    <section className="relative py-24 px-4 bg-surface/30">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-heading mb-4">Built With</h2>
          <p className="text-gray-400 mb-12">Cutting-edge technology stack</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 
                         text-sm hover:border-primary/50 hover:bg-primary/10 
                         transition-colors cursor-default"
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Stats Section
function Stats() {
  const stats = [
    { value: '$31.2B', label: 'Global Manga Market' },
    { value: '50M+', label: 'Potential Readers' },
    { value: '500K+', label: 'Manga Artists' },
    { value: 'Web3 Ready', label: 'Blockchain Native' }
  ]

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-heading text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const socials = [
    { icon: <Twitter size={20} />, label: 'Twitter', href: '#' },
    { icon: <MessageCircle size={20} />, label: 'Discord', href: '#' },
    { icon: <Github size={20} />, label: 'GitHub', href: '#' },
    { icon: <Mail size={20} />, label: 'Contact', href: 'mailto:hello@mangaverse.ai' }
  ]

  return (
    <footer className="relative py-12 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-heading text-xl">
              Manga<span className="text-primary">Verse</span>
            </span>
            <p className="text-gray-500 text-sm">Where Manga Meets Tomorrow</p>
          </div>

          <div className="flex items-center gap-4">
            {socials.map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center 
                         justify-center text-gray-400 hover:text-primary 
                         hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          <p className="text-gray-500 text-sm">
            © 2026 MangaVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main App
function App() {
  return (
    <div className="bg-gradient-hero min-h-screen">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
      </div>

      <Hero />
      <Stats />
      <Features />
      <MangaGallery />
      <TechStack />
      <Footer />
    </div>
  )
}

export default App