import { useState, useEffect } from 'react';
import { TrendingUp, Menu, X, FileDown } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

const NAV_LINKS = [
  { href: '#proyecto',              label: 'Proyecto' },
  { href: '#dataset',               label: 'Dataset' },
  { href: '#features',              label: 'Features' },
  { href: '#modelos',               label: 'Modelos' },
  { href: '#simulador',             label: 'Simulador' },
  { href: '#backtesting',           label: 'Backtesting' },
  { href: '#backtest-interactivo',  label: 'Backtest Inter.' },
  { href: '#comparador',            label: 'Comparador' },
  { href: '#señales',               label: 'Señales' },
  { href: '#backtest-csv',          label: 'CSV Propio' },
  { href: '#informe',               label: 'Informe' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  // Scroll background
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // IntersectionObserver scroll-spy — observes all 11 section anchors
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observers = [];
    const activeCounts = {};

    ids.forEach((id) => {
      activeCounts[id] = 0;
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // The section entering from top becomes active
            setActiveId((prev) => {
              // Only change if the previous active section is no longer intersecting
              const prevEl = prev ? document.getElementById(prev) : null;
              if (prevEl) {
                const prevRect = prevEl.getBoundingClientRect();
                // Keep previous active if it still occupies significant viewport space
                if (prevRect.top < window.innerHeight * 0.5 && prevRect.bottom > 0) {
                  return prev;
                }
              }
              return id;
            });
          }
        },
        { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <TrendingUp className="text-emerald-400" size={22} />
          <span className="font-bold text-white text-lg tracking-tight">NAS100 ML</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-0.5 flex-nowrap">
          {NAV_LINKS.map((l) => {
            const id = l.href.slice(1);
            const isActive = activeId === id;
            return (
              <li key={l.href} className="shrink-0">
                <a
                  href={l.href}
                  className={`px-2 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Descargar Informe — triggers real PDF generation */}
        <button
          onClick={(e) => {
            e.preventDefault();
            generatePDF();
          }}
          className="hidden md:inline-flex shrink-0 items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          <FileDown size={15} />
          Descargar Informe
        </button>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((l) => {
            const id = l.href.slice(1);
            const isActive = activeId === id;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-2 text-sm transition-colors ${
                  isActive ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            );
          })}
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              generatePDF();
            }}
            className="mt-2 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-sm rounded-lg text-center flex items-center justify-center gap-2"
          >
            <FileDown size={15} />
            Descargar Informe
          </button>
        </div>
      )}
    </nav>
  );
}
