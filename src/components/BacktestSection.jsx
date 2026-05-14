import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { BACKTEST_CYCLES, CAPITAL_EVOLUTION, BACKTEST_PARAMS } from '../data/projectData';

const RESULTADO_COLORS = {
  TP_NORMAL: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'TP Normal' },
  CIERRE_CICLO_CON_UTILIDAD: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Ciclo Cerrado' },
  ABIERTA_FIN_DATA: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: 'Abierta' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-emerald-400 font-bold text-lg">
        ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-slate-500 text-xs">Capital acumulado</p>
    </div>
  );
};

const KPIS = [
  { label: 'Capital Inicial', value: '$10,000', sub: 'Base de simulación', color: 'slate' },
  { label: 'Capital Final', value: '$11,940.52', sub: 'Al cerrar el último ciclo', color: 'emerald' },
  { label: 'Rendimiento', value: '+19.41%', sub: 'Sobre capital inicial', color: 'emerald' },
  { label: 'PnL Total', value: '+$1,940.52', sub: '6 ciclos cerrados', color: 'emerald' },
  { label: 'PnL Promedio', value: '+$323.42', sub: 'Por ciclo', color: 'blue' },
  { label: 'Win Rate', value: '100%', sub: '6/6 TP alcanzado', color: 'emerald' },
];

const colorKpi = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  slate: 'text-slate-300',
};

export default function BacktestSection() {
  return (
    <section id="backtesting" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Backtesting Histórico
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Simulación sobre datos reales
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Evaluación sobre el 20% final del dataset (bloque temporal 2024–2025) con gestión de
            capital real, lotaje dinámico por riesgo y lógica de reentradas.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {KPIS.map(({ label, value, sub, color }) => (
            <div key={label} className="card-dark rounded-2xl p-4 text-center">
              <div className={`text-xl font-extrabold ${colorKpi[color]}`}>{value}</div>
              <div className="text-white text-xs font-semibold mt-1">{label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Capital chart */}
        <div className="card-dark rounded-2xl p-6 mb-8">
          <h3 className="text-white font-bold text-lg mb-1">Evolución del capital</h3>
          <p className="text-slate-500 text-sm mb-6">Capital acumulado ciclo a ciclo</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CAPITAL_EVOLUTION} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="punto" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[9800, 12200]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={10000} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Capital inicial', fill: '#64748b', fontSize: 10 }} />
                <Area type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2.5} fill="url(#capitalGrad)" dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cycles table */}
        <div className="card-dark rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-white font-bold text-lg">Detalle de ciclos</h3>
            <p className="text-slate-500 text-sm mt-1">Todos los ciclos cerrados con su PnL y capital resultante</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['#', 'Fecha Entrada', 'Precio Entrada', 'Lote', 'Fecha Salida', 'Resultado', 'PnL', 'Capital', 'Prob.'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BACKTEST_CYCLES.map((c) => {
                  const res = RESULTADO_COLORS[c.resultado] ?? RESULTADO_COLORS.TP_NORMAL;
                  return (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3.5 text-slate-400 text-sm font-mono">{c.id}</td>
                      <td className="px-4 py-3.5 text-slate-300 text-sm">{c.fecha_entrada}</td>
                      <td className="px-4 py-3.5 text-slate-300 text-sm font-mono">{c.precio_entrada.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm font-mono">{c.lote.toFixed(4)}</td>
                      <td className="px-4 py-3.5 text-slate-300 text-sm">{c.fecha_salida}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${res.bg} ${res.text} ${res.border}`}>
                          {res.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-emerald-400 font-bold text-sm">
                        +${c.pnl.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-white font-semibold text-sm">
                        ${c.capital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm">
                        {(c.probabilidad * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Params */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'TP Normal', value: '+3%', desc: 'Objetivo de ganancia por ciclo' },
            { label: 'Caída para reentrada', value: '-15%', desc: 'Nivel que activa segunda compra' },
            { label: 'Multiplicador reentrada', value: '2.5x', desc: 'Lote de la segunda posición' },
            { label: 'Riesgo máximo', value: '15%', desc: 'Del capital para calcular lotaje' },
            { label: 'Utilidad objetivo ciclo', value: '+1%', desc: 'Capital para cerrar con reentrada' },
            { label: 'Valor por punto', value: '$20 / lote', desc: 'Equivalente monetario del NAS100' },
          ].map(({ label, value, desc }) => (
            <div key={label} className="card-dark rounded-xl p-4 flex items-center gap-3">
              <div className="w-1 h-10 bg-emerald-500/40 rounded-full shrink-0" />
              <div>
                <div className="text-emerald-400 font-bold text-lg leading-none">{value}</div>
                <div className="text-slate-200 text-sm font-medium">{label}</div>
                <div className="text-slate-500 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
