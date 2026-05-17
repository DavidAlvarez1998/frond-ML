import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { api } from '../utils/api';

// ── T-04: DEFAULTS constant ───────────────────────────────────────────────────
const DEFAULTS = {
  capital_inicial:         10000,
  tp_normal:               0.03,
  caida_reentrada:         0.15,
  multiplicador_reentrada: 2.5,
  riesgo_caida:            0.02,
  utilidad_ciclo_pct:      0.01,
  valor_por_punto:         20,
  usar_dataset_completo:   false,
};

const FIELD_LABELS = {
  capital_inicial:         'Capital inicial ($)',
  tp_normal:               'TP Normal',
  caida_reentrada:         'Caída para reentrada',
  multiplicador_reentrada: 'Multiplicador reentrada',
  riesgo_caida:            'Riesgo máximo',
  utilidad_ciclo_pct:      'Utilidad objetivo ciclo',
  valor_por_punto:         'Valor por punto ($)',
};

// ── T-04: Strategy form panel ─────────────────────────────────────────────────
function StrategyPanel({ label, params, setParams }) {
  const handleChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleToggle = (e) => {
    setParams(prev => ({ ...prev, usar_dataset_completo: e.target.checked }));
  };

  return (
    <div className="card-dark rounded-2xl p-6 flex flex-col gap-4">
      <h3 className="text-white font-bold text-lg">{label}</h3>
      {Object.entries(FIELD_LABELS).map(([key, fieldLabel]) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
            {fieldLabel}
          </label>
          <input
            type="number"
            value={params[key]}
            step={key === 'capital_inicial' || key === 'valor_por_punto' ? 1 : 0.01}
            onChange={e => handleChange(key, e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 w-full transition-colors"
          />
        </div>
      ))}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={params.usar_dataset_completo}
          onChange={handleToggle}
          className="w-4 h-4 accent-emerald-500"
        />
        <span className="text-slate-300 text-sm">Usar dataset completo (154,064 velas)</span>
      </label>
      {params.usar_dataset_completo && (
        <p className="text-yellow-400 text-xs">Advertencia: El backtest puede tardar más</p>
      )}
    </div>
  );
}

// ── T-05: Summary card ────────────────────────────────────────────────────────
function SummaryCard({ label, result, isWinner }) {
  const r = result?.resumen ?? {};
  const borderClass = isWinner
    ? 'card-dark rounded-2xl p-6 border-2 border-emerald-500 ring-1 ring-emerald-500/30'
    : 'card-dark rounded-2xl p-6';

  return (
    <div className={borderClass}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-bold">{label}</h4>
        {isWinner && (
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">
            Ganador
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Rendimiento</p>
          <p className={`font-bold text-lg ${(r.rendimiento_pct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {r.rendimiento_pct != null ? `${r.rendimiento_pct > 0 ? '+' : ''}${r.rendimiento_pct}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Win Rate</p>
          <p className={`font-bold text-lg ${(r.win_rate_pct ?? 0) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {r.win_rate_pct != null ? `${r.win_rate_pct}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Total ciclos</p>
          <p className="text-white font-semibold">{r.total_ciclos ?? '—'}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Capital final</p>
          <p className="text-white font-semibold">
            {r.capital_final != null ? `$${r.capital_final.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Capital mínimo</p>
          <p className="text-rose-400 font-semibold">
            {r.capital_minimo != null ? `$${r.capital_minimo.toLocaleString()}` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── T-04 + T-05: Main ComparadorSection component ────────────────────────────
export default function ComparadorSection() {
  const [paramsA, setParamsA] = useState(DEFAULTS);
  const [paramsB, setParamsB] = useState({ ...DEFAULTS, tp_normal: 0.05 });
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataA, dataB] = await Promise.all([
        api.backtest(paramsA),
        api.backtest(paramsB),
      ]);
      setResultA(dataA);
      setResultB(dataB);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── T-05: Merged points with padding ──────────────────────────────────────
  const cyclesA = resultA?.ciclos ?? [];
  const cyclesB = resultB?.ciclos ?? [];
  const len = Math.max(cyclesA.length, cyclesB.length);
  // API cycle objects use `capital_despues` (see schemas.py: Ciclo model)
  // `capital_final` is on resumen only — not on individual cycles
  const lastA = cyclesA.length > 0 ? cyclesA[cyclesA.length - 1].capital_despues : paramsA.capital_inicial;
  const lastB = cyclesB.length > 0 ? cyclesB[cyclesB.length - 1].capital_despues : paramsB.capital_inicial;
  const mergedPoints = resultA && resultB
    ? Array.from({ length: len }, (_, i) => ({
        punto: i + 1,
        capitalA: cyclesA[i]?.capital_despues ?? lastA,
        capitalB: cyclesB[i]?.capital_despues ?? lastB,
      }))
    : [];

  const bothLoaded = resultA !== null && resultB !== null;
  const aRendimiento = resultA?.resumen?.rendimiento_pct ?? -Infinity;
  const bRendimiento = resultB?.resumen?.rendimiento_pct ?? -Infinity;
  const aIsWinner = aRendimiento >= bRendimiento;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Análisis comparativo
          </p>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Comparador de Estrategias
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Configurá dos estrategias con parámetros distintos y compará sus resultados en el test set.
          </p>
        </div>

        {/* T-04: Dual strategy panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <StrategyPanel label="Estrategia A" params={paramsA} setParams={setParamsA} />
          <StrategyPanel label="Estrategia B" params={paramsB} setParams={setParamsB} />
        </div>

        {/* T-04: Compare button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCompare}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              loading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-green'
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Comparando...' : 'Comparar estrategias'}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="card-dark rounded-2xl p-6 text-center mb-6">
            <p className="text-rose-400">Error: {error}</p>
          </div>
        )}

        {/* T-05: AreaChart + summary cards */}
        {bothLoaded && !error && (
          <>
            {len === 0 ? (
              <div className="card-dark rounded-2xl p-12 text-center mb-6">
                <p className="text-slate-500">
                  Ninguna estrategia generó ciclos con estos parámetros.
                </p>
              </div>
            ) : (
              <div className="card-dark rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold mb-4">Evolución del capital</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mergedPoints} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        {/* Strategy A = blue (#3b82f6) */}
                        <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        {/* Strategy B = orange (#f97316) */}
                        <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="punto"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `#${v}`}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `$${v.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={v => `$${v.toLocaleString()}`}
                      />
                      <Legend
                        formatter={(value) => {
                          const capital = value === 'Estrategia A'
                            ? resultA?.resumen?.capital_final
                            : resultB?.resumen?.capital_final;
                          return `${value} ($${(capital ?? 0).toLocaleString()})`;
                        }}
                      />
                      <ReferenceLine
                        y={paramsA.capital_inicial}
                        stroke="#475569"
                        strokeDasharray="4 4"
                        label={{ value: 'Capital inicial', fill: '#64748b', fontSize: 10 }}
                      />
                      {/* Strategy A — blue */}
                      <Area
                        type="monotone"
                        dataKey="capitalA"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#gradA)"
                        name="Estrategia A"
                      />
                      {/* Strategy B — orange */}
                      <Area
                        type="monotone"
                        dataKey="capitalB"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#gradB)"
                        name="Estrategia B"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* T-05: Summary cards — only when there are cycles */}
            {len > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <SummaryCard label="Estrategia A" result={resultA} isWinner={aIsWinner} />
                <SummaryCard label="Estrategia B" result={resultB} isWinner={!aIsWinner} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
