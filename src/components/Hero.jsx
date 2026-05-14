import { ArrowDown, TrendingUp, Database, Brain, DollarSign } from 'lucide-react';

const STATS = [
  { icon: Database, label: 'Velas M15', value: '154,064', sub: '2019–2025' },
  { icon: Brain, label: 'Mejor Modelo', value: 'Random Forest', sub: 'F1 = 0.4749' },
  { icon: TrendingUp, label: 'Rendimiento', value: '+19.41%', sub: 'Backtesting histórico' },
  { icon: DollarSign, label: 'PnL Total', value: '+$1,940', sub: '6 ciclos · 6 TP' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Machine Learning · Trading · NAS100.fs · M15
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Detección de{' '}
          <span className="gradient-text">Oportunidades</span>
          <br />
          de Compra en NAS100
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Modelo de clasificación supervisada que analiza{' '}
          <strong className="text-slate-200">154,064 velas M15</strong> del índice Nasdaq 100
          (2019–2025) para detectar señales de compra con gestión de capital y backtesting histórico.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <a
            href="#backtesting"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all hover:scale-105 glow-green"
          >
            <TrendingUp size={18} />
            Ver Backtesting
          </a>
          <a
            href="#modelos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Brain size={18} />
            Explorar Modelos
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="card-dark rounded-2xl p-5 flex flex-col gap-2 hover:border-emerald-500/30 transition-colors"
            >
              <Icon size={20} className="text-emerald-400" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div>
                <div className="text-sm font-medium text-slate-300">{label}</div>
                <div className="text-xs text-slate-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#proyecto"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 hover:text-slate-400 transition-colors animate-bounce"
      >
        <ArrowDown size={24} />
      </a>
    </section>
  );
}
