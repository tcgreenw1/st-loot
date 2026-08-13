import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Box,
  Check,
  Heart,
  Leaf,
  Mail,
  Menu,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { lootBoxes, type LootBox } from './data/catalog'
import { supabase } from './lib/supabase'

const filters = ['All', 'Fresh', 'Warm', 'Rare'] as const

type FormStatus = 'idle' | 'saving' | 'saved' | 'preview' | 'error'

function BottleArt({ box }: { box: LootBox }) {
  return (
    <div className="bottle-stage" style={{ '--accent': box.accent } as React.CSSProperties}>
      <span className="bottle-halo" />
      <span className="bottle-cap" />
      <span className="bottle-neck" />
      <span className="bottle-body">
        <span className="bottle-label">ST</span>
      </span>
      <span className="bottle-shadow" />
    </div>
  )
}

function BoxCard({ box, onSelect }: { box: LootBox; onSelect: (box: LootBox) => void }) {
  return (
    <article className={`loot-card ${box.featured ? 'loot-card-featured' : ''}`}>
      <div className="loot-card-art">
        {box.featured && <span className="popular-pill">Popular</span>}
        <BottleArt box={box} />
        <span className="prize-count">{box.prizeCount} possible prizes</span>
      </div>
      <div className="loot-card-content">
        <div className="card-heading-row">
          <div>
            <p className="eyebrow">{box.eyebrow}</p>
            <h3>{box.name}</h3>
          </div>
          <span className="family-pill">{box.family}</span>
        </div>
        <p className="card-description">{box.description}</p>
        <div className="note-row">
          {box.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
        <div className="card-footer">
          <div>
            <span className="price-label">Open for</span>
            <strong>${box.price}</strong>
          </div>
          <button className="arrow-button" onClick={() => onSelect(box)} aria-label={`Preview ${box.name}`}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </article>
  )
}

function WaitlistForm({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setStatus('saving')

    if (!supabase) {
      setStatus('preview')
      return
    }

    const { error } = await supabase.from('waitlist_signups').insert({
      email: email.trim().toLowerCase(),
      source,
    })

    if (error && error.code !== '23505') {
      setStatus('error')
      return
    }

    setStatus('saved')
    setEmail('')
  }

  if (status === 'saved' || status === 'preview') {
    return (
      <div className="form-success" role="status">
        <Check size={18} />
        <span>{status === 'saved' ? "You're on the first-drop list." : 'Preview mode is ready; database capture comes with deployment.'}</span>
      </div>
    )
  }

  return (
    <form className="waitlist-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={`email-${source}`}>Email address</label>
      <div className="email-field">
        <Mail size={18} />
        <input
          id={`email-${source}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          required
        />
      </div>
      <button className="button button-light" type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Joining…' : 'Join the first drop'}
        <ArrowRight size={18} />
      </button>
      {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
    </form>
  )
}

function PreviewModal({ box, onClose }: { box: LootBox; onClose: () => void }) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', listener)
    document.body.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', listener)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title">
        <button className="modal-close" onClick={onClose} aria-label="Close preview">
          <X size={20} />
        </button>
        <div className="modal-art">
          <BottleArt box={box} />
        </div>
        <div className="modal-content">
          <p className="eyebrow">First drop preview</p>
          <h2 id="preview-title">{box.name}</h2>
          <p>{box.description}</p>
          <div className="modal-facts">
            <div><span>Opening price</span><strong>${box.price}</strong></div>
            <div><span>Prize range</span><strong>{box.value}</strong></div>
            <div><span>Outcome</span><strong>Always a prize</strong></div>
          </div>
          <div className="guarantee-note">
            <ShieldCheck size={21} />
            <p><strong>No empty opens.</strong> Every box is backed by available fragrance inventory before it goes live.</p>
          </div>
          <p className="modal-launch-copy">Paid openings are intentionally disabled during pre-launch. Join the list for the first partner drop.</p>
          <WaitlistForm source={`box:${box.id}`} />
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')
  const [selectedBox, setSelectedBox] = useState<LootBox | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleBoxes = useMemo(
    () => activeFilter === 'All' ? lootBoxes : lootBoxes.filter((box) => box.family === activeFilter),
    [activeFilter],
  )

  return (
    <div className="site-shell">
      <div className="announcement">
        <span><Heart size={15} fill="currentColor" /> Every open gives back</span>
        <span className="announcement-detail">100% of net proceeds designated for charity</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="St Loot home">
          <span className="brand-mark">ST</span>
          <span>Loot</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#boxes">Discover</a>
          <a href="#how">How it works</a>
          <a href="#impact">Impact</a>
        </nav>
        <div className="header-actions">
          <a className="text-link desktop-only" href="#first-drop">Sign in</a>
          <a className="button button-dark desktop-only" href="#first-drop">Join the first drop</a>
          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#boxes" onClick={() => setMenuOpen(false)}>Discover</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#impact" onClick={() => setMenuOpen(false)}>Impact</a>
            <a href="#first-drop" onClick={() => setMenuOpen(false)}>Join the first drop</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker"><Sparkles size={16} /> Fragrance with a purpose</p>
            <h1>Open something <em>good.</em></h1>
            <p className="hero-description">Discover remarkable fragrances in guaranteed-prize mystery boxes—and help fund a future every time you open.</p>
            <div className="hero-actions">
              <a className="button button-accent" href="#boxes">Explore boxes <ArrowRight size={18} /></a>
              <a className="play-link" href="#how"><span><PackageCheck size={20} /></span> See how it works</a>
            </div>
            <div className="trust-row">
              <span><Check size={15} /> Guaranteed prize</span>
              <span><Check size={15} /> Inventory backed</span>
              <span><Check size={15} /> Transparent impact</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Featured fragrance mystery box">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <span className="floating-tag floating-tag-one"><Leaf size={16} /> Good scent</span>
            <span className="floating-tag floating-tag-two"><Heart size={16} /> Greater good</span>
            <div className="hero-box">
              <span className="hero-box-top" />
              <span className="hero-box-face">
                <span className="hero-box-brand">ST</span>
                <span className="hero-box-name">Signature<br />Vault</span>
                <span className="hero-box-meta">01 / fragrance drop</span>
              </span>
            </div>
            <div className="hero-bottle">
              <span className="hero-bottle-cap" />
              <span className="hero-bottle-body"><span>ST<br /><small>EAU DE GOOD</small></span></span>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="St Loot commitments">
          <div><strong>100%</strong><span>net proceeds to charity</span></div>
          <div><strong>1:1</strong><span>every open, one real prize</span></div>
          <div><strong>0</strong><span>cash-outs or empty outcomes</span></div>
          <div><strong>Open</strong><span>impact reporting by drop</span></div>
        </section>

        <section className="catalog section" id="boxes">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The first collection</p>
              <h2>Find your next signature.</h2>
            </div>
            <p>Partner-led fragrance drops with published prize pools and a guaranteed product in every box.</p>
          </div>
          <div className="filter-row" role="group" aria-label="Filter boxes">
            {filters.map((filter) => (
              <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
          <div className="catalog-grid">
            {visibleBoxes.map((box) => <BoxCard key={box.id} box={box} onSelect={setSelectedBox} />)}
          </div>
        </section>

        <section className="how-section section" id="how">
          <div className="how-intro">
            <p className="eyebrow">Simple by design</p>
            <h2>The thrill stays.<br />The guesswork goes.</h2>
            <p>Every prize is loaded into the published pool before a box can be opened. No battles, no wagering, and no cash substitutes.</p>
          </div>
          <div className="step-list">
            <article>
              <span className="step-number">01</span>
              <div><Box size={24} /><h3>Choose a box</h3><p>Review its price, prize range, product pool, and published odds.</p></div>
            </article>
            <article>
              <span className="step-number">02</span>
              <div><Sparkles size={24} /><h3>Reveal your fragrance</h3><p>Every completed opening assigns one available physical prize to your inventory.</p></div>
            </article>
            <article>
              <span className="step-number">03</span>
              <div><Heart size={24} /><h3>Create real impact</h3><p>Net proceeds flow into an auditable charity ledger and are reported by drop.</p></div>
            </article>
          </div>
        </section>

        <section className="impact-section section" id="impact">
          <div className="impact-card">
            <div className="impact-copy">
              <p className="eyebrow">The St in St Loot</p>
              <h2>A better reason to chase the reveal.</h2>
              <p>Our launch model designates 100% of net proceeds to support St. Jude Children's Research Hospital while a formal beneficiary relationship is explored.</p>
              <ul>
                <li><ReceiptText size={20} /><span><strong>Drop-level reporting</strong>Revenue, product costs, operating costs, and net proceeds shown clearly.</span></li>
                <li><ShieldCheck size={20} /><span><strong>Auditable by design</strong>Every financial event is recorded in an append-only impact ledger.</span></li>
                <li><PackageCheck size={20} /><span><strong>Fulfillment first</strong>Prize inventory is reserved before proceeds are calculated.</span></li>
              </ul>
              <p className="partner-disclaimer">St. Jude is the intended placeholder beneficiary for this MVP. St Loot is not yet affiliated with or endorsed by St. Jude Children's Research Hospital.</p>
            </div>
            <div className="impact-visual">
              <div className="impact-ring">
                <span>100%</span>
                <small>net proceeds</small>
              </div>
              <div className="impact-receipt">
                <div><span>Opening</span><strong>$50.00</strong></div>
                <div><span>Product + fulfillment</span><strong>− $31.50</strong></div>
                <div><span>Processing + operations</span><strong>− $4.25</strong></div>
                <div className="receipt-total"><span>Designated for charity</span><strong>$14.25</strong></div>
                <small>Illustrative calculation only</small>
              </div>
            </div>
          </div>
        </section>

        <section className="signup-section section" id="first-drop">
          <div>
            <p className="eyebrow">The first drop is coming</p>
            <h2>Smell good.<br />Do good.</h2>
          </div>
          <div className="signup-content">
            <p>Join for partner announcements, early access, and a first look at the published prize pool.</p>
            <WaitlistForm />
            <small>No spam. Just launches, impact reports, and really good fragrance.</small>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">ST</span><span>Loot</span></a>
        <p>Guaranteed prizes. Transparent impact. No wagering or cash equivalents.</p>
        <div><a href="#how">How it works</a><a href="#impact">Impact</a><a href="mailto:hello@cofounderplus.com">Contact</a></div>
        <small>© {new Date().getFullYear()} St Loot. Pre-launch preview.</small>
      </footer>

      {selectedBox && <PreviewModal box={selectedBox} onClose={() => setSelectedBox(null)} />}
    </div>
  )
}
