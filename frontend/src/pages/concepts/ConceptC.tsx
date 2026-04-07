// Concept C — Sanctuary: warm, editorial, full-bleed imagery aesthetic
export default function ConceptC() {
  return (
    <div className="min-h-screen bg-brand-stone">
      {/* Editorial hero */}
      <section className="relative bg-brand-charcoal text-white min-h-[60vh] flex items-end pb-16 px-8">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, #92642A 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, #2D8A8A 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl">
          <p className="text-brand-bronze font-semibold tracking-widest text-xs uppercase mb-4">
            Concept C — Sanctuary
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-none mb-6">
            Warm.<br />Editorial.<br />Human.
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">
            A full-bleed, magazine-style aesthetic with the warmth of cream backgrounds
            and the gravitas of Playfair Display. Designed for emotional resonance.
          </p>
        </div>
      </section>

      {/* Content strip */}
      <section className="max-w-5xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-serif text-3xl text-brand-charcoal mb-4">
            The Design Philosophy
          </h2>
          <p className="text-brand-muted leading-relaxed">
            Concept C leans into the editorial heritage of human-interest journalism.
            Large serif headlines, generous whitespace, and a warm cream-to-stone
            gradient system create an atmosphere of safety and trust — essential for
            an organization working with trauma survivors.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { swatch: 'bg-brand-bronze', label: 'Bronze #92642A' },
            { swatch: 'bg-brand-teal', label: 'Teal #2D8A8A' },
            { swatch: 'bg-brand-cream border border-brand-border', label: 'Cream #FAFAF8' },
            { swatch: 'bg-brand-charcoal', label: 'Charcoal #1C1917' },
          ].map(({ swatch, label }) => (
            <div key={label} className="text-center">
              <div className={`w-full h-16 rounded-xl mb-2 ${swatch}`} />
              <p className="text-brand-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
