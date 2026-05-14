import { Star, Info } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MODEL_RESULTS } from '../data/projectData';

const RADAR_DATA = [
  { metric: 'F1', full: 'F1 Score' },
  { metric: 'Precision', full: 'Precisión' },
  { metric: 'Recall', full: 'Recall' },
  { metric: 'Accuracy', full: 'Accuracy' },
].map((m) => {
  const row = { metric: m.metric };
  MODEL_RESULTS.forEach((mod) => {
    const key = m.metric === 'F1' ? 'f1' : m.metric === 'Precision' ? 'precision' : m.metric === 'Recall' ? 'recall' : 'accuracy';
    row[mod.modelo.split(' ')[0] + (mod.modelo.split(' ')[1] ? ' ' + mod.modelo.split(' ')[1][0] : '')] = +(mod[key] * 100).toFixed(1);
  });
  return row;
});

function MetricBar({ value, max = 1, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-400',
    red: 'bg-rose-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[color]}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

const ROW_COLORS = ['emerald', 'blue', 'purple', 'orange', 'red'];

export default function ModelosSection() {
  const best = MODEL_RESULTS.find((m) => m.mejor);

  return (
    <section id="modelos" className="py-24 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">
            Modelos de ML
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            5 modelos · 11 thresholds evaluados
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Cada modelo se entrenó con RandomOverSampler y se evaluó con{' '}
            <code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded text-sm">predict_proba()</code>{' '}
            en thresholds de 0.01 a 0.60. Métrica principal: F1-score de la clase Compra.
          </p>
        </div>

        {/* Best model highlight */}
        <div className="card-dark rounded-2xl p-6 border-emerald-500/30 border mb-8 glow-green">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shrink-0">
              <Star size={20} className="text-emerald-400 fill-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-white font-bold text-xl">Random Forest Balanced</h3>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
                  MEJOR MODELO
                </span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full">
                  threshold = 0.30
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'F1 Score', value: best.f1 },
                  { label: 'Precision', value: best.precision },
                  { label: 'Recall', value: best.recall },
                  { label: 'Accuracy', value: best.accuracy },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-emerald-400">
                      {(value * 100).toFixed(1)}%
                    </div>
                    <div className="text-slate-400 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All models table */}
        <div className="card-dark rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-white font-bold text-lg">Comparación de todos los modelos</h3>
            <p className="text-slate-500 text-sm mt-1">Mejor threshold por F1-score de la clase Compra</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Modelo', 'Threshold', 'Precision', 'Recall', 'F1', 'Señales', 'Accuracy'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODEL_RESULTS.map((m, i) => (
                  <tr
                    key={m.modelo}
                    className={`border-b border-slate-800/50 transition-colors ${
                      m.mejor ? 'bg-emerald-500/5' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {m.mejor && <Star size={14} className="text-emerald-400 fill-emerald-400 shrink-0" />}
                        <span className={`font-medium text-sm ${m.mejor ? 'text-emerald-300' : 'text-slate-200'}`}>
                          {m.modelo}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-slate-300 text-sm bg-slate-800 px-2 py-0.5 rounded">
                        {m.threshold.toFixed(2)}
                      </code>
                    </td>
                    <td className="px-5 py-4 min-w-28">
                      <MetricBar value={m.precision} color={ROW_COLORS[i]} />
                    </td>
                    <td className="px-5 py-4 min-w-28">
                      <MetricBar value={m.recall} color={ROW_COLORS[i]} />
                    </td>
                    <td className="px-5 py-4 min-w-28">
                      <MetricBar value={m.f1} color={ROW_COLORS[i]} />
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-sm">{m.senales.toLocaleString('es-AR')}</td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{(m.accuracy * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info about thresholds */}
        <div className="card-dark rounded-2xl p-5 flex items-start gap-3">
          <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 text-sm leading-relaxed">
            <strong className="text-slate-200">¿Por qué thresholds bajos?</strong>{' '}
            La clase "Compra" es minoritaria (&lt;6% del dataset). Con el threshold por defecto (0.50),
            el modelo predice casi todo como "No Compra". Bajar el threshold sube el recall pero baja
            la precisión — el F1 busca el punto de equilibrio óptimo.
          </p>
        </div>
      </div>
    </section>
  );
}
