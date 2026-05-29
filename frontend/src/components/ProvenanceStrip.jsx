// Saffron provenance strip — replaces what the reference uses for brand
// logos (H&M, Levi's, etc.) with our own equivalent: the weave traditions
// and regions our catalog sources from. Free-floating dots act as separators.
const ITEMS = [
  'Kasavu',
  'Kanchipuram',
  'Maheshwar',
  'Block Print',
  'Batik',
  'Linen',
  'Zari',
]

export default function ProvenanceStrip() {
  return (
    <div className="overflow-hidden bg-saffron-500">
      <div className="container-x flex h-[72px] items-center justify-center gap-x-8 gap-y-2 md:h-20">
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 md:gap-x-12">
          {ITEMS.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-x-7 md:gap-x-12"
            >
              <span className="text-[12px] font-bold uppercase tracking-[0.28em] text-ink-900 md:text-sm">
                {label}
              </span>
              {i < ITEMS.length - 1 && (
                <span aria-hidden className="hidden h-1.5 w-1.5 rounded-full bg-ink-900 md:inline-block" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
