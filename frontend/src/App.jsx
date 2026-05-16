import { useEffect, useState } from 'react'

import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import AISearchSection from './components/AISearchSection.jsx'
import FeaturedCollections from './components/FeaturedCollections.jsx'
import BrandStory from './components/BrandStory.jsx'
import Footer from './components/Footer.jsx'

import { pingHealth } from './lib/api.js'

export default function App() {
  // Pre-warm the Render free-tier dyno so the first search isn't a 30s
  // wait. The AISearchSection shows a banner while warming is true.
  const [warming, setWarming] = useState(true)

  useEffect(() => {
    let cancelled = false
    pingHealth().finally(() => {
      if (!cancelled) setWarming(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <AISearchSection warming={warming} />
        <FeaturedCollections />
        <BrandStory />
      </main>
      <Footer />
    </div>
  )
}
