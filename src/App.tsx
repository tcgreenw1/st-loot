import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js'
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check.js'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3.js'
import Box from 'lucide-react/dist/esm/icons/box.js'
import Check from 'lucide-react/dist/esm/icons/check.js'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js'
import CircleUserRound from 'lucide-react/dist/esm/icons/circle-user-round.js'
import Compass from 'lucide-react/dist/esm/icons/compass.js'
import Gift from 'lucide-react/dist/esm/icons/gift.js'
import Heart from 'lucide-react/dist/esm/icons/heart.js'
import Home from 'lucide-react/dist/esm/icons/home.js'
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.js'
import Mail from 'lucide-react/dist/esm/icons/mail.js'
import Menu from 'lucide-react/dist/esm/icons/menu.js'
import PackageOpen from 'lucide-react/dist/esm/icons/package-open.js'
import Search from 'lucide-react/dist/esm/icons/search.js'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js'
import Star from 'lucide-react/dist/esm/icons/star.js'
import Trophy from 'lucide-react/dist/esm/icons/trophy.js'
import X from 'lucide-react/dist/esm/icons/x.js'
import Zap from 'lucide-react/dist/esm/icons/zap.js'
import { lootBoxes, type LootBox } from './data/catalog'
import { supabase } from './lib/supabase'

const filters = ['All drops', 'Discovery', 'Signature', 'Rare'] as const
type Filter = (typeof filters)[number]
type FormStatus = 'idle' | 'saving' | 'saved' | 'preview' | 'error'

const poolPreview = [
  { name: 'Full-size parfum', value: '$150 value', box: lootBoxes[1], rarity: 'RARE' },
  { name: 'Travel spray set', value: '$45 value', box: lootBoxes[0], rarity: 'IN POOL' },
  { name: 'Collector bottle', value: '$220 value', box: lootBoxes[2], rarity: 'ULTRA' },
  { name: 'Discovery edit', value: '$75 value', box: lootBoxes[2], rarity: 'IN POOL' },
  { name: 'Archive edition', value: '$500 value', box: lootBoxes[3], rarity: 'ULTRA' },
]

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="St Loot home">
      <span className="brand-symbol"><Sparkles size={17} /></span>
      <span className="brand-name">ST <strong>LOOT</strong></span>
    </a>
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
        <span>{status === 'saved' ? "You're in. Watch your inbox for the first reveal." : 'Preview captured. Live waitlist activates with the connected environment.'}</span>
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
          placeholder="Email for early access"
          autoComplete="email"
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Joining…' : 'Join the first drop'}
        <ArrowRight size={17} />
      </button>
      {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
    </form>
  )
}

function LootCard({ box, onSelect }: { box: LootBox; onSelect: (box: LootBox) => void }) {
  return (
    <article className="loot-card" style={{ '--card-accent': box.accent, '--card-glow': box.glow } as CSSProperties}>
      <button className="loot-card-image" onClick={() => onSelect(box)} aria-label={`Preview ${box.name}`}>
        <img src={box.image} alt="" />
        <span className="card-sheen" />
        <span className="drop-tag">{box.kicker}</span>
        {box.featured && <span className="featured-tag"><Star size={11} fill="currentColor" /> Featured</span>}
        <span className="verified-tag"><ShieldCheck size={12} /> Guaranteed prize</span>
      </button>
      <div className="loot-card-body">
        <div className="card-title-row">
          <div>
            <p>{box.family} drop</p>
            <h3>{box.name}</h3>
          </div>
          <span className="price-orb"><small>$</small>{box.price}</span>
        </div>
        <p className="card-copy">{box.description}</p>
        <div className="card-stats">
          <span><Gift size={14} /> {box.prizeCount} prizes</span>
          <span><Trophy size={14} /> Up to {box.value.split('–')[1]}</span>
        </div>
        <div className="impact-line">
          <span><Heart size={13} fill="currentColor" /> {box.impactEstimate} to impact</span>
          <button onClick={() => onSelect(box)}>View pool <ChevronRight size={15} /></button>
        </div>
      </div>
    </article>
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
    <div className="modal-backdrop" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="box-modal" role="dialog" aria-modal="true" aria-labelledby="box-modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close preview"><X size={20} /></button>
        <div className="modal-visual" style={{ '--modal-glow': box.glow } as CSSProperties}>
          <img src={box.image} alt="" />
          <div className="modal-visual-overlay">
            <span><Sparkles size={14} /> First drop preview</span>
            <strong>{box.name}</strong>
          </div>
        </div>
        <div className="modal-details">
          <p className="section-kicker">{box.family} collection</p>
          <h2 id="box-modal-title">{box.name}</h2>
          <p className="modal-description">{box.description}</p>

          <div className="modal-metrics">
            <div><span>Open price</span><strong>${box.price}</strong></div>
            <div><span>Prize value</span><strong>{box.value}</strong></div>
            <div><span>Impact</span><strong>{box.impactEstimate}</strong></div>
          </div>

          <div className="pool-heading">
            <div><PackageOpen size={17} /><strong>Prize pool preview</strong></div>
            <span>Odds publish before launch</span>
          </div>
          <div className="prize-list">
            {box.prizes.map((prize) => (
              <div className="prize-row" key={prize.name}>
                <span className={`rarity-dot ${prize.rarity.toLowerCase().replace(' ', '-')}`} />
                <span>{prize.name}</span>
                <small>{prize.rarity}</small>
                <strong>{prize.value}</strong>
              </div>
            ))}
          </div>

          <div className="modal-guarantee">
            <LockKeyhole size={18} />
            <p><strong>Inventory locked before launch.</strong> Every completed opening assigns one physical fragrance prize. No empty outcomes or cash substitutes.</p>
          </div>

          <WaitlistForm source={`box:${box.id}`} />
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All drops')
  const [selectedBox, setSelectedBox] = useState<LootBox | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleBoxes = useMemo(
    () => activeFilter === 'All drops' ? lootBoxes : lootBoxes.filter((box) => box.family === activeFilter),
    [activeFilter],
  )

  return (
    <div className="app-shell" id="top">
      <aside className={`side-rail ${menuOpen ? 'side-rail-open' : ''}`}>
        <div className="side-top">
          <Logo />
          <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          <p>Explore</p>
          <a className="active" href="#top" onClick={() => setMenuOpen(false)}><Compass size={18} /> Discover</a>
          <a href="#drops" onClick={() => setMenuOpen(false)}><Gift size={18} /> Mystery drops <span>4</span></a>
          <a href="#how" onClick={() => setMenuOpen(false)}><Zap size={18} /> How it works</a>
          <a href="#impact" onClick={() => setMenuOpen(false)}><Heart size={18} /> Impact</a>

          <p>Categories</p>
          <a href="#drops" onClick={() => { setActiveFilter('Discovery'); setMenuOpen(false) }}><span className="nav-gem cyan" /> Discovery</a>
          <a href="#drops" onClick={() => { setActiveFilter('Signature'); setMenuOpen(false) }}><span className="nav-gem violet" /> Signature</a>
          <a href="#drops" onClick={() => { setActiveFilter('Rare'); setMenuOpen(false) }}><span className="nav-gem gold" /> Collector</a>
        </nav>

        <div className="side-impact-card">
          <span><Heart size={15} fill="currentColor" /> THE GIVEBACK</span>
          <strong>100% of net proceeds</strong>
          <p>Designated for charity. Reported drop by drop.</p>
          <a href="#impact">See the ledger <ArrowRight size={14} /></a>
        </div>

        <div className="side-footer">
          <a href="#first-drop">Support</a>
          <a href="#impact">Fairness</a>
          <span>PRE-LAUNCH / 01</span>
        </div>
      </aside>

      {menuOpen && <button className="drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="mobile-brand"><Logo /></div>
          <button className="search-control"><Search size={17} /><span>Search drops and prizes</span><kbd>⌘ K</kbd></button>
          <div className="top-actions">
            <div className="preview-balance"><span>Preview balance</span><strong><span className="credit-gem" /> 0.00</strong></div>
            <a className="sign-in-link" href="#first-drop"><CircleUserRound size={18} /> Sign in</a>
            <a className="join-button" href="#first-drop">Join first drop</a>
          </div>
        </header>

        <main className="marketplace">
          <section className="hero-panel">
            <img className="hero-art" src="/assets/st-loot-hero.jpg" alt="" />
            <div className="hero-gradient" />
            <div className="hero-grid" />
            <div className="hero-content">
              <p className="hero-badge"><Sparkles size={14} /> First drop · fragrance edition</p>
              <h1>Reveal something<br /><em>extraordinary.</em></h1>
              <p>Guaranteed fragrance prizes. Transparent pools. Every open helps create something bigger.</p>
              <div className="hero-actions">
                <a className="hero-primary" href="#drops">Explore mystery boxes <ArrowRight size={18} /></a>
                <button className="hero-secondary" onClick={() => setSelectedBox(lootBoxes[1])}><PackageOpen size={18} /> Preview a reveal</button>
              </div>
              <div className="hero-trust">
                <span><BadgeCheck size={15} /> Guaranteed physical prize</span>
                <span><ShieldCheck size={15} /> Published prize pools</span>
                <span><Heart size={15} /> 100% net proceeds</span>
              </div>
            </div>
            <div className="hero-impact-chip">
              <span className="impact-chip-icon"><Heart size={18} fill="currentColor" /></span>
              <div><small>INTENDED BENEFICIARY</small><strong>St. Jude Children's Research Hospital</strong></div>
              <ChevronRight size={17} />
            </div>
          </section>

          <section className="pool-strip" aria-label="Prize pool preview">
            <div className="pool-label">
              <span className="pulse-dot" />
              <div><strong>PRIZE POOL</strong><small>FIRST DROP PREVIEW</small></div>
            </div>
            <div className="pool-scroll">
              {poolPreview.map((item) => (
                <button key={item.name} className="pool-item" onClick={() => setSelectedBox(item.box)}>
                  <img src={item.box.image} alt="" />
                  <div><span>{item.rarity}</span><strong>{item.name}</strong><small>{item.value}</small></div>
                </button>
              ))}
            </div>
          </section>

          <section className="drops-section" id="drops">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Curated mystery boxes</p>
                <h2>Choose your reveal.</h2>
              </div>
              <p>Every possible prize is published before launch and backed by partner inventory.</p>
            </div>
            <div className="filter-bar" role="group" aria-label="Filter mystery boxes">
              {filters.map((filter) => (
                <button key={filter} className={filter === activeFilter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>
              ))}
              <span className="filter-count">{visibleBoxes.length} drops</span>
            </div>
            <div className="loot-grid">
              {visibleBoxes.map((box) => <LootCard key={box.id} box={box} onSelect={setSelectedBox} />)}
            </div>
          </section>

          <section className="experience-grid" id="how">
            <article className="experience-main">
              <div className="section-heading compact">
                <div><p className="section-kicker">The reveal ritual</p><h2>Magic without the mystery math.</h2></div>
              </div>
              <div className="steps-grid">
                <div><span>01</span><Box size={23} /><strong>Pick a world</strong><p>Explore its complete prize range, value, and published odds.</p></div>
                <div><span>02</span><Sparkles size={23} /><strong>Watch the reveal</strong><p>One available physical prize is assigned to every completed open.</p></div>
                <div><span>03</span><Gift size={23} /><strong>Claim your scent</strong><p>Track the prize in your inventory through fulfillment and delivery.</p></div>
                <div><span>04</span><Heart size={23} /><strong>See the good</strong><p>Follow the drop's costs, net proceeds, and confirmed donation.</p></div>
              </div>
            </article>
            <article className="fairness-card">
              <span className="fairness-orbit"><ShieldCheck /></span>
              <p className="section-kicker">Trust is part of the experience</p>
              <h3>Fairness you can inspect.</h3>
              <p>Inventory locks, server commitments, and reveal receipts make each opening independently reviewable.</p>
              <ul>
                <li><Check size={15} /> Prize pool locked before sale</li>
                <li><Check size={15} /> Opening receipt in your inventory</li>
                <li><Check size={15} /> No empty or cash-equivalent outcomes</li>
              </ul>
              <a href="#first-drop">Read the fairness model <ArrowRight size={15} /></a>
            </article>
          </section>

          <section className="impact-panel" id="impact">
            <div className="impact-aurora" />
            <div className="impact-panel-copy">
              <p className="section-kicker">Every drop has a second reveal</p>
              <h2>See exactly what your open unlocks.</h2>
              <p>St Loot separates product and fulfillment costs from proceeds, then publishes the net amount designated for charity after every drop.</p>
              <div className="impact-actions">
                <a href="#first-drop">Explore the impact ledger <BarChart3 size={17} /></a>
                <span>Beneficiary partnership pending</span>
              </div>
            </div>
            <div className="impact-dashboard">
              <div className="dashboard-top"><span>DROP 01 / IMPACT PREVIEW</span><BadgeCheck size={17} /></div>
              <div className="impact-big"><strong>100%</strong><span>of net proceeds designated</span></div>
              <div className="impact-breakdown">
                <div><span>Opening</span><strong>$50.00</strong></div>
                <div><span>Prize + fulfillment</span><strong>−$31.50</strong></div>
                <div><span>Processing + operations</span><strong>−$4.25</strong></div>
                <div className="impact-total"><span>Impact</span><strong>$14.25</strong></div>
              </div>
              <small>Illustrative estimate. Final drop ledger reports actual costs and proceeds.</small>
            </div>
          </section>

          <section className="first-drop-section" id="first-drop">
            <div>
              <span className="launch-orb"><Sparkles /></span>
              <p className="section-kicker">Early access</p>
              <h2>Be there for<br />the first reveal.</h2>
            </div>
            <div className="first-drop-form">
              <p>Get the partner announcement, prize pool, published odds, and launch time before the first box opens.</p>
              <WaitlistForm />
              <small>Pre-launch only. No payments are currently accepted.</small>
            </div>
          </section>

          <footer>
            <Logo />
            <p>Guaranteed prizes. Published pools. Transparent impact.</p>
            <div><a href="#how">Fairness</a><a href="#impact">Impact</a><a href="mailto:hello@cofounderplus.com">Contact</a></div>
            <small>St. Jude is the intended placeholder beneficiary. St Loot is not affiliated with or endorsed by St. Jude Children's Research Hospital.</small>
          </footer>
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <a className="active" href="#top"><Home size={20} /><span>Discover</span></a>
        <a href="#drops"><Gift size={20} /><span>Drops</span></a>
        <a href="#impact"><Heart size={20} /><span>Impact</span></a>
        <a href="#first-drop"><CircleUserRound size={20} /><span>Profile</span></a>
      </nav>

      {selectedBox && <PreviewModal box={selectedBox} onClose={() => setSelectedBox(null)} />}
    </div>
  )
}
