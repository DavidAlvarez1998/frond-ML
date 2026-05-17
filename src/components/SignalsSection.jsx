import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { api } from '../utils/api';

// ── T-02b: ProbabilityHistogram sub-component ─────────────────────────────────
function ProbabilityHistogram({ signals }) {
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = parseFloat((i * 0.1).toFixed(1));
    const hi = parseFloat(((i + 1) * 0.1).toFixed(1));
    return {
      rango: `${lo.toFixed(1)}–${hi.toFixed(1)}`,
      cantidad: signals.filter(s => {
        if (i === 9) return s.probabilidad_compra >= lo && s.probabilidad_compra <= 1.0;
        return s.probabilidad_compra >= lo && s.probabilidad_compra < hi;
      }).length,
    };
  });

  return (
    <div className="card-dark rounded-2xl p-6 mb-6">
      <h3 className="text-white font-bold text-lg mb-4">
        Distribución de Probabilidades del Modelo
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="rango" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
              {buckets.map((_, idx) => (
                <Cell key={idx} fill={idx < 3 ? '#475569' : '#3b82f6'} />
              ))}
            </Bar>
            {/* CRITICAL: x value MUST be the categorical string "0.3–0.4", not the number 0.30 */}
            <ReferenceLine
              x="0.3–0.4"
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Umbral 0.30', fill: '#ef4444', fontSize: 10 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── T-03: CSV export function ─────────────────────────────────────────────────
function exportCSV(rows) {
  const headers = ['Fecha', 'Precio', 'Probabilidad', 'RSI', 'BB Posición', 'En Descuento'];
  const csvRows = rows.map(s => [
    s.datetime,
    s.close,
    s.probabilidad_compra,
    s.rsi_14,
    s.bb_posicion,
    s.precio_en_descuento ? 'Sí' : 'No',
  ].join(','));
  const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'señales_nas100.csv' });
  a.click();
  URL.revokeObjectURL(url);
}

// ── T-02: Probability cell color helper ──────────────────────────────────────
function probCellClass(prob) {
  if (prob >= 0.5) return 'bg-emerald-900/50 text-emerald-400';
  if (prob >= 0.3) return 'bg-yellow-900/50 text-yellow-400';
  return 'bg-slate-800 text-slate-400';
}

// ── T-01 / T-02 / T-03: Main SignalsSection component ────────────────────────
export default function SignalsSection() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [minProb, setMinProb] = useState(0);

  useEffect(() => {
    api.signals(100)
      .then(data => { setSignals(data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, []);

  // T-02: derived — filtered and sorted
  const filtered = signals
    .filter(s => s.probabilidad_compra >= minProb)
    .sort((a, b) => b.probabilidad_compra - a.probabilidad_compra);

  return (
    <section id="signals" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Historial
          </p>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Señales Detectadas
          </h2>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="card-dark rounded-2xl p-12 flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400">Cargando señales...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="card-dark rounded-2xl p-8 text-center">
            <p className="text-rose-400">Error al cargar señales: {error}</p>
          </div>
        )}

        {/* Data loaded — show histogram + table */}
        {!loading && !error && (
          <>
            {/* T-02b: Histogram — receives raw unfiltered signals */}
            <ProbabilityHistogram signals={signals} />

            {/* T-02 + T-03: Slider + export + table */}
            <div className="card-dark rounded-2xl p-6">
              {/* Controls row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">
                    Probabilidad mínima: <span className="text-white font-semibold">{minProb.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={minProb}
                    onChange={e => setMinProb(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* T-03: Export button */}
                <button
                  onClick={() => exportCSV(filtered)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
                >
                  <Download size={14} />
                  Exportar CSV
                </button>
              </div>

              {/* Row count */}
              <p className="text-slate-400 text-sm mb-4">
                Mostrando <span className="text-white font-semibold">{filtered.length}</span> de{' '}
                <span className="text-white font-semibold">{signals.length}</span> señales
              </p>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Fecha', 'Precio', 'Probabilidad', 'RSI', 'BB Posición', 'En Descuento'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{s.datetime}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{s.close.toFixed(2)}</td>
                        <td className={`px-4 py-3 font-semibold font-mono rounded-sm ${probCellClass(s.probabilidad_compra)}`}>
                          {s.probabilidad_compra.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{s.rsi_14.toFixed(1)}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{s.bb_posicion.toFixed(3)}</td>
                        <td className="px-4 py-3">
                          {s.precio_en_descuento
                            ? <span className="bg-emerald-900/60 text-emerald-400 rounded px-2 py-0.5 text-xs">Sí</span>
                            : <span className="bg-slate-700 text-slate-400 rounded px-2 py-0.5 text-xs">No</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-500">No hay señales con probabilidad ≥ {minProb.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
