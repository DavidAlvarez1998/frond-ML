import { useState } from 'react';
import { Play, Loader2, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api } from '../utils/api';

const DEFAULTS = {
  capital_inicial:         10000,
  tp_normal:               0.03,
  caida_reentrada:         0.15,
  multiplicador_reentrada: 2.5,
  riesgo_caida:            0.15,
  utilidad_ciclo_pct:      0.01,
  valor_por_punto:         20,
};

function NumInput({ label, name, value, onChange, min, max, step, format }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</label>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
      />
      {format && <span className="text-slate-600 text-xs">{format}</span>}
    </div>
  );
}

const RESULTADO_BADGE = {
  TP_NORMAL:                { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'TP Normal' },
  CIERRE_CICLO_CON_UTILIDAD: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',        label: 'Ciclo Util.' },
  ABIERTA_FIN_DATA:          { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',  label: 'Abierto' },
  CICLO_ABIERTO_FIN_DATA:    { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',  label: 'Abierto' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-emerald-400 font-bold text-lg">${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default function BacktestInteractivo() {
  const [params,  setParams]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const onChange = (name, val) => setParams(p => ({ ...p, [name]: val }));
  const reset    = () => { setParams(DEFAULTS); setResult(null); setError(null); };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.backtest(params);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const capitalEvolution = result
    ? [{ punto: 'Inicio', capital: params.capital_inicial }, ...result.ciclos.map((c, i) => ({ punto: `Ciclo ${i + 1}`, capital: c.capital_despues }))]
    : [];

  const r = result?.resumen;
  const positivo = r && r.rendimiento_pct > 0;

  return (
    <section id="backtest-interactivo" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Backtesting Interactivo</span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">Probá tu estrategia</h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Cambiá los parámetros de la estrategia y corrés el backtesting sobre los datos reales del test set — todo via API en tiempo real.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Params panel */}
          <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Parámetros</h3>
              <button onClick={reset} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors">
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            <NumInput label="Capital inicial ($)"        name="capital_inicial"         value={params.capital_inicial}         onChange={onChange} min={1000}  max={1000000} step={1000}  format="Monto en USD" />
            <NumInput label="TP Normal (%)"              name="tp_normal"               value={params.tp_normal * 100}         onChange={(n,v) => onChange(n, v/100)} min={0.5} max={20}   step={0.5}   format="Porcentaje de ganancia objetivo" />
            <NumInput label="Caída para reentrada (%)"   name="caida_reentrada"         value={params.caida_reentrada * 100}   onChange={(n,v) => onChange(n, v/100)} min={5}   max={50}   step={1}     format="Baja que activa segunda compra" />
            <NumInput label="Multiplicador reentrada"     name="multiplicador_reentrada" value={params.multiplicador_reentrada} onChange={onChange} min={1}     max={10}   step={0.5}   format="Tamaño del lote 2 vs lote 1" />
            <NumInput label="Riesgo máximo (%)"          name="riesgo_caida"            value={params.riesgo_caida * 100}      onChange={(n,v) => onChange(n, v/100)} min={1}   max={50}   step={1}     format="Del capital para calcular lotaje" />
            <NumInput label="Utilidad objetivo ciclo (%)"name="utilidad_ciclo_pct"      value={params.utilidad_ciclo_pct * 100}onChange={(n,v) => onChange(n, v/100)} min={0.1} max={10}   step={0.1}   format="PnL mínimo para cerrar con reentrada" />
            <NumInput label="Valor por punto ($)"         name="valor_por_punto"         value={params.valor_por_punto}         onChange={onChange} min={1}     max={100}  step={1}     format="USD por punto por lote" />

            <button
              onClick={handleRun}
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-green'
              }`}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Ejecutando...</> : <><Play size={16} /> Correr Backtest</>}
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}. Verificá que el servidor FastAPI esté corriendo.</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!result && !loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
                <TrendingUp size={40} className="text-slate-700" />
                <p className="text-slate-500">Configurá los parámetros y presioná <strong className="text-slate-400">Correr Backtest</strong></p>
              </div>
            )}

            {loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-emerald-400 animate-spin" />
                <p className="text-slate-400 text-sm">Ejecutando simulación sobre 30,798 velas...</p>
              </div>
            )}

            {result && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Capital Final',    value: `$${r.capital_final.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, color: positivo ? 'text-emerald-400' : 'text-rose-400' },
                    { label: 'Rendimiento',      value: `${r.rendimiento_pct > 0 ? '+' : ''}${r.rendimiento_pct}%`,              color: positivo ? 'text-emerald-400' : 'text-rose-400' },
                    { label: 'PnL Total',        value: `${r.pnl_total > 0 ? '+' : ''}$${r.pnl_total.toLocaleString('es-AR')}`, color: positivo ? 'text-emerald-400' : 'text-rose-400' },
                    { label: 'Ciclos totales',   value: r.total_ciclos,    color: 'text-white' },
                    { label: 'TP normales',      value: r.tp_normales,     color: 'text-emerald-400' },
                    { label: 'Win Rate',         value: `${r.win_rate_pct}%`, color: r.win_rate_pct >= 50 ? 'text-emerald-400' : 'text-rose-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card-dark rounded-xl p-4 text-center">
                      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                      <div className="text-slate-500 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Capital chart */}
                {capitalEvolution.length > 1 && (
                  <div className="card-dark rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-4">Evolución del capital</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={capitalEvolution} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="capGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="punto" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={params.capital_inicial} stroke="#475569" strokeDasharray="4 4" />
                          <Area type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} fill="url(#capGrad2)" dot={{ fill: '#10b981', r: 4 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Cycles table */}
                {result.ciclos.length > 0 && (
                  <div className="card-dark rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800">
                      <h3 className="text-white font-bold">Ciclos de inversión</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {['#', 'Entrada', 'P.Entrada', 'Lote', 'Resultado', 'PnL', 'Capital', 'Prob.'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.ciclos.map(c => {
                            const badge = RESULTADO_BADGE[c.resultado] ?? RESULTADO_BADGE.TP_NORMAL;
                            return (
                              <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                <td className="px-4 py-3 text-slate-500 font-mono">{c.id}</td>
                                <td className="px-4 py-3 text-slate-300">{c.fecha_entrada}</td>
                                <td className="px-4 py-3 text-slate-300 font-mono">{c.precio_entrada.toLocaleString('es-AR')}</td>
                                <td className="px-4 py-3 text-slate-400 font-mono">{c.lote_1.toFixed(4)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>{badge.label}</span>
                                </td>
                                <td className={`px-4 py-3 font-bold ${c.pnl_total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {c.pnl_total >= 0 ? '+' : ''}${c.pnl_total.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-white font-semibold">
                                  ${c.capital_despues.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-slate-400">{(c.probabilidad * 100).toFixed(0)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {result.ciclos.length === 0 && (
                  <div className="card-dark rounded-2xl p-8 text-center">
                    <p className="text-slate-500">No se generaron ciclos con estos parámetros. Probá bajando el TP o ajustando el riesgo.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
