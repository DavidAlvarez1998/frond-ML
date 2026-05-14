import { Target, GitBranch, FlaskConical, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    icon: Target,
    num: '01',
    title: 'Variable Objetivo',
    desc: 'Una vela es "Compra = 1" si el precio está técnicamente en descuento Y alcanza +3% de ganancia en las próximas 240 velas (60 horas).',
    color: 'emerald',
  },
  {
    icon: FlaskConical,
    num: '02',
    title: 'Feature Engineering',
    desc: '30 indicadores técnicos calculados: retornos, estructura de vela, EMAs, RSI, ATR, Bollinger Bands, MACD, volumen relativo y caídas recientes.',
    color: 'blue',
  },
  {
    icon: GitBranch,
    num: '03',
    title: 'Modelado y Selección',
    desc: '5 modelos entrenados con RandomOverSampler. Evaluación de 11 thresholds distintos (0.01–0.60) usando F1-score como criterio principal.',
    color: 'purple',
  },
  {
    icon: BarChart3,
    num: '04',
    title: 'Backtesting',
    desc: 'Simulación con gestión de capital real: lotaje dinámico por riesgo, reentradas con 2.5x lotaje y objetivo de +1% por ciclo.',
    color: 'orange',
  },
];

const TECHS = [
  'Python 3.13', 'pandas', 'numpy', 'scikit-learn',
  'imbalanced-learn', 'joblib', 'matplotlib', 'Google Colab',
];

const colorMap = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
};

export default function ProyectoSection() {
  return (
    <section id="proyecto" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Sobre el Proyecto
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Pipeline completo de ML para Trading
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Un flujo de Machine Learning end-to-end aplicado al índice Nasdaq 100, desde la
            ingeniería de features hasta la simulación de estrategia con capital real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STEPS.map(({ icon: Icon, num, title, desc, color }) => (
            <div key={num} className="card-dark rounded-2xl p-6 flex flex-col gap-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
                  <Icon size={20} />
                </div>
                <span className="text-slate-700 font-mono font-bold text-xl">{num}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Stack tecnológico</h3>
          <div className="flex flex-wrap gap-2">
            {TECHS.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
