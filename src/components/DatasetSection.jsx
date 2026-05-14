import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DATASET_INFO } from '../data/projectData';

const CLASS_DATA = [
  { name: 'No Compra', value: DATASET_INFO.claseNoCompra, color: '#475569' },
  { name: 'Compra', value: DATASET_INFO.claseCompra, color: '#10b981' },
];

const YEAR_DATA = [
  { year: '2019', velas: 23145 },
  { year: '2020', velas: 25312 },
  { year: '2021', velas: 26087 },
  { year: '2022', velas: 26134 },
  { year: '2023', velas: 25841 },
  { year: '2024', velas: 26002 },
  { year: '2025', velas: 1543 },
];

const INFO_ITEMS = [
  { label: 'Instrumento', value: 'NAS100.fs — Nasdaq 100' },
  { label: 'Temporalidad', value: 'M15 (15 minutos)' },
  { label: 'Período', value: '2019-01-02 → 2025-12-31' },
  { label: 'Total de filas', value: '154,064 velas' },
  { label: 'Split Train', value: '80% — 123,251 filas' },
  { label: 'Split Test', value: '20% — 30,813 filas' },
  { label: 'Clase Compra', value: '9,263 velas (6.0%)' },
  { label: 'Clase No Compra', value: '144,801 velas (94.0%)' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-slate-400">{payload[0].value.toLocaleString('es-AR')} velas</p>
    </div>
  );
};

export default function DatasetSection() {
  return (
    <section id="dataset" className="py-24 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
            Dataset
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            NAS100.fs — 6 años de historia
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Datos históricos OHLC del índice Nasdaq 100 en temporalidad M15, derivados de
            datos M1 entre 2019 y 2025.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info table */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-5">Características del dataset</h3>
            <div className="flex flex-col gap-3">
              {INFO_ITEMS.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-slate-100 text-sm font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart */}
          <div className="card-dark rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-4">Distribución de clases</h3>
            <p className="text-slate-500 text-sm mb-4">
              Alto desbalance: 94% No Compra vs 6% Compra → requiere RandomOverSampler.
            </p>
            <div className="flex-1 min-h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CLASS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CLASS_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 justify-center mt-2">
              {CLASS_DATA.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="card-dark rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-4">Velas por año</h3>
            <div className="flex-1 min-h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={YEAR_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="velas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Velas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="mt-8 card-dark rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Columnas del dataset original</h3>
          <div className="flex flex-wrap gap-3">
            {DATASET_INFO.columnas.map((col) => (
              <div key={col} className="flex flex-col gap-1 px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-slate-100 font-mono text-sm font-medium">{col}</span>
                <span className="text-slate-500 text-xs">
                  {col === 'datetime' ? 'Fecha y hora de la vela'
                    : col === 'open' ? 'Precio de apertura'
                    : col === 'high' ? 'Precio máximo'
                    : col === 'low' ? 'Precio mínimo'
                    : col === 'close' ? 'Precio de cierre'
                    : col === 'tickvol' ? 'Volumen por ticks'
                    : col === 'vol' ? 'Volumen real'
                    : 'Spread del broker'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
