import { useId } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';

const RESULTADO_BADGE = {
  TP_NORMAL:                { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'TP Normal' },
  CIERRE_CICLO_CON_UTILIDAD: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',        label: 'Ciclo Util.' },
  ABIERTA_FIN_DATA:          { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',  label: 'Abierto' },
  CICLO_ABIERTO_FIN_DATA:    { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',  label: 'Abierto' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-emerald-400 font-bold text-lg">
        ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

/**
 * Shared backtest results display: KPI cards, capital evolution chart, cycles table.
 * @param {{ resumen: object, ciclos: array }} data — API response from /backtest or /backtest-upload
 * @param {number} capitalInicial — initial capital value for chart baseline
 */
export default function BacktestResults({ data, capitalInicial }) {
  const uid = useId();
  const gradId = `capGrad-${uid}`;

  const capitalEvolution = data
    ? [
        { punto: 'Inicio', capital: capitalInicial },
        ...data.ciclos.map((c, i) => ({ punto: `Ciclo ${i + 1}`, capital: c.capital_despues })),
      ]
    : [];

  const r = data?.resumen;
  const positivo = r && r.rendimiento_pct > 0;

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Capital Final',  value: `$${r.capital_final.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, color: positivo ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Rendimiento',    value: `${r.rendimiento_pct > 0 ? '+' : ''}${r.rendimiento_pct}%`,              color: positivo ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'PnL Total',      value: `${r.pnl_total > 0 ? '+' : ''}$${r.pnl_total.toLocaleString('es-AR')}`, color: positivo ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Ciclos totales', value: r.total_ciclos,    color: 'text-white' },
          { label: 'TP normales',    value: r.tp_normales,     color: 'text-emerald-400' },
          { label: 'Win Rate',       value: `${r.win_rate_pct}%`, color: r.win_rate_pct >= 50 ? 'text-emerald-400' : 'text-rose-400' },
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
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="punto" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={capitalInicial} stroke="#475569" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} fill={`url(#${gradId})`} dot={{ fill: '#10b981', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cycles table */}
      {data.ciclos.length > 0 && (
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
                {data.ciclos.map(c => {
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

      {data.ciclos.length === 0 && (
        <div className="card-dark rounded-2xl p-8 text-center">
          <p className="text-slate-500">
            No se generaron ciclos con estos parámetros. Probá bajando el TP o ajustando el riesgo.
          </p>
        </div>
      )}
    </>
  );
}
