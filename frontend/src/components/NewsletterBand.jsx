import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

// Saffron band — the v2 equivalent of the reference's "PAYDAY SALE"
// strip. Form submit is intentionally stubbed (no backend); the band
// exists to anchor the bottom of the page and capture interest while
// you wire up a real ESP later.
export default function NewsletterBand() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // TODO: replace with a real signup endpoint (Mailchimp, ConvertKit, etc.)
    setDone(true)
    setEmail('')
  }

  return (
    <section className="bg-saffron-500">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
          {/* Copy */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-ink-900">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink-900" />
              The Festive List
            </span>
            <h3 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 md:text-4xl">
              First dibs on new sarees.
              <br />
              Onam, Vishu &amp; wedding-season drops.
            </h3>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="flex items-stretch overflow-hidden rounded-xl bg-white p-1.5 shadow-soft"
          >
            <input
              type="email"
              required
              placeholder="your.email@kerala.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={done}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-ink-900
                         placeholder:text-ink-500/60 focus:outline-none disabled:opacity-50"
              aria-label="Your email"
            />
            <button
              type="submit"
              disabled={done}
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-3
                         text-[12px] font-bold uppercase tracking-[0.18em] text-white
                         transition-all hover:bg-ink-700 disabled:cursor-not-allowed
                         disabled:opacity-80"
            >
              {done ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Joined
                </>
              ) : (
                <>
                  Join <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
