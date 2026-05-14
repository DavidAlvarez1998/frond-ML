import { TrendingUp, BarChart2, Activity, Zap, Waves, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import { FEATURES_LIST } from '../data/projectData';

const ICON_MAP = {
  TrendingUp, BarChart2, Activity, Zap, Waves, ArrowDownCircle,
};

const COLOR_CLASSES = {
  blue: {
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    dot: 'bg-blue-400',
    border: 'hover:border-blue-500/30',
  },
  purple: {
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    dot: 'bg-purple-400',
    border: 'hover:border-purple-500/30',
  },
  cyan: {
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    dot: 'bg-cyan-400',
    border: 'hover:border-cyan-500/30',
  },
  green: {
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    dot: 'bg-emerald-400',
    border: 'hover:border-emerald-500/30',
  },
  orange: {
    badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    dot: 'bg-orange-400',
    border: 'hover:border-orange-500/30',
  },
  red: {
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    dot: 'bg-rose-400',
    border: 'hover:border-rose-500/30',
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">
            Feature Engineering
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            30 indicadores técnicos
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Variables derivadas que describen momentum, estructura de velas, volatilidad y
            posición relativa del precio frente a medias móviles e indicadores clásicos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {FEATURES_LIST.map(({ categoria, color, icon, items, desc }) => {
            const Icon = ICON_MAP[icon] || Activity;
            const cls = COLOR_CLASSES[color];
            return (
              <div
                key={categoria}
                className={`card-dark rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 ${cls.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${cls.badge}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-white font-bold">{categoria}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* precio_en_descuento card */}
        <div className="card-dark rounded-2xl p-6 border-emerald-500/20 border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shrink-0 mt-1">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">
                Flag: <code className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-base">precio_en_descuento</code>
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Variable binaria construida como condición técnica de descuento. Se activa cuando el precio muestra
                al menos una de estas características:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { cond: 'dist_ema20 < -0.3%', desc: 'Precio bajo la EMA de 20 períodos' },
                  { cond: 'rsi_14 < 40', desc: 'RSI en zona de sobreventa moderada' },
                  { cond: 'bb_posicion < 0.25', desc: 'Precio en cuartil inferior Bollinger' },
                  { cond: 'caida_5 < -0.4%', desc: 'Caída acumulada últimas 5 velas' },
                ].map(({ cond, desc }) => (
                  <div key={cond} className="flex items-start gap-2 p-3 bg-slate-900 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <code className="text-emerald-300 text-xs">{cond}</code>
                      <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
