import { useState, useEffect } from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#proyecto', label: 'Proyecto' },
  { href: '#dataset', label: 'Dataset' },
  { href: '#features', label: 'Features' },
  { href: '#modelos', label: 'Modelos' },
  { href: '#backtesting', label: 'Backtesting' },
  { href: '#simulador', label: 'Simulador' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
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
        <a href="#" className="flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={22} />
          <span className="font-bold text-white text-lg tracking-tight">NAS100 ML</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#informe"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          Descargar Informe
        </a>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white py-2 text-sm"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#informe"
            onClick={() => setOpen(false)}
            className="mt-2 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-sm rounded-lg text-center"
          >
            Descargar Informe
          </a>
        </div>
      )}
    </nav>
  );
}
