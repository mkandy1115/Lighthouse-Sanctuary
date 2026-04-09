import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Heart, Moon, Sun } from 'lucide-react'
import { ThemeContext } from '@/App'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Programs', to: '/programs' },
  { label: 'Impact', to: '/impact' },
]

export default function PublicNav() {
  const { theme, setTheme } = useContext(ThemeContext)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'border-b border-brand-border shadow-card' : 'border-b border-transparent'
      }`}
      role="banner"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze rounded"
          aria-label="Imari: Safe Haven — go to homepage"
        >
          <img
            src="/imari-icon.svg"
            alt="Imari Safe Haven icon"
            className="h-9 w-9"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-brand-charcoal text-lg tracking-tight leading-tight">
              Imari
            </span>
            <span className="text-[10px] text-brand-muted tracking-widest uppercase font-sans leading-tight">
              Safe Haven
            </span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-brand-charcoal rounded-md hover:bg-brand-stone hover:text-brand-bronze transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-brand-border p-2 text-brand-charcoal hover:bg-brand-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-brand-charcoal border border-brand-border rounded-lg hover:bg-brand-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
          >
            Portal Login
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-brand-bronze text-white rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze focus-visible:ring-offset-2"
          >
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            Donate
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md text-brand-charcoal hover:bg-brand-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            className="p-2 rounded-md text-brand-charcoal hover:bg-brand-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden bg-white border-t border-brand-border animate-fade-in"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <ul className="px-4 py-3 space-y-1" role="list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-brand-charcoal rounded-md hover:bg-brand-stone hover:text-brand-bronze transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-brand-border">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-medium border border-brand-border text-brand-charcoal rounded-lg hover:bg-brand-stone transition-colors"
            >
              Portal Login
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold border border-brand-border text-brand-charcoal rounded-lg hover:bg-brand-stone transition-colors"
            >
              Partner With Us
            </Link>
            <Link
              to="/donate"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-brand-bronze text-white rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
            >
              <Heart className="w-3.5 h-3.5" aria-hidden="true" />
              Donate
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
