import { useRef, useState } from 'react';
import { Upload, X, Play, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';
import BacktestResults from './BacktestResults';

const DEFAULTS = {
  capital_inicial:         10000,
  tp_normal:               0.03,
  caida_reentrada:         0.15,
  multiplicador_reentrada: 2.5,
  riesgo_caida:            0.15,
  utilidad_ciclo_pct:      0.01,
  valor_por_punto:         20,
};

const FIELD_CONFIG = [
  { name: 'capital_inicial',         label: 'Capital inicial ($)',          min: 1000,  max: 1000000, step: 1000,  format: 'Monto en USD',                          raw: true },
  { name: 'tp_normal',               label: 'TP Normal (%)',                min: 0.5,   max: 20,      step: 0.5,   format: 'Porcentaje de ganancia objetivo',         pct: true },
  { name: 'caida_reentrada',         label: 'Caída para reentrada (%)',     min: 5,     max: 50,      step: 1,     format: 'Baja que activa segunda compra',          pct: true },
  { name: 'multiplicador_reentrada', label: 'Multiplicador reentrada',      min: 1,     max: 10,      step: 0.5,   format: 'Tamaño del lote 2 vs lote 1',            raw: true },
  { name: 'riesgo_caida',            label: 'Riesgo máximo (%)',            min: 1,     max: 50,      step: 1,     format: 'Del capital para calcular lotaje',        pct: true },
  { name: 'utilidad_ciclo_pct',      label: 'Utilidad objetivo ciclo (%)',  min: 0.1,   max: 10,      step: 0.1,   format: 'PnL mínimo para cerrar con reentrada',   pct: true },
  { name: 'valor_por_punto',         label: 'Valor por punto ($)',          min: 1,     max: 100,     step: 1,     format: 'USD por punto por lote',                 raw: true },
];

export default function BacktestCSVSection() {
  const [file,    setFile]    = useState(null);
  const [params,  setParams]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const fileInputRef = useRef(null);

  const onChange = (name, val) => setParams(p => ({ ...p, [name]: val }));

  const handleFile = (f) => {
    if (f && f.name.toLowerCase().endsWith('.csv')) {
      setFile(f);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.backtestCSV(file, params);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="backtest-csv" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            CSV Propio
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Backtest con CSV Propio
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Subí tu propio archivo de datos OHLCV en formato CSV y corré el backtest con tus propias velas.
            Columnas requeridas: datetime, open, high, low, close, tickvol.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload + params panel */}
          <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">
            {/* Drop zone */}
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">
                Archivo CSV
              </p>
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
                >
                  <Upload size={28} className="text-slate-500" />
                  <p className="text-slate-400 text-sm text-center">
                    Arrastrá tu CSV aquí o hacé click para seleccionar
                  </p>
                  <p className="text-slate-600 text-xs">Solo archivos .csv</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Upload size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm truncate">
                      Archivo cargado: {file.name}
                    </span>
                  </div>
                  <button
                    onClick={clearFile}
                    className="text-slate-500 hover:text-red-400 transition-colors ml-3 shrink-0"
                    aria-label="Eliminar archivo"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0] ?? null)}
              />
            </div>

            {/* Numeric params */}
            {FIELD_CONFIG.map(({ name, label, min, max, step, format, pct }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                  {label}
                </label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={pct ? params[name] * 100 : params[name]}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    onChange(name, pct ? v / 100 : v);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {format && <span className="text-slate-600 text-xs">{format}</span>}
              </div>
            ))}

            {/* Submit button */}
            <button
              onClick={handleRun}
              disabled={!file || loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                !file || loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-green'
              }`}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                : <><Play size={16} /> Ejecutar backtest</>
              }
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
          </div>

          {/* Results area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!result && !loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
                <TrendingUp size={40} className="text-slate-700" />
                <p className="text-slate-500">
                  Cargá un CSV y presioná <strong className="text-slate-400">Ejecutar backtest</strong>
                </p>
              </div>
            )}

            {loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-emerald-400 animate-spin" />
                <p className="text-slate-400 text-sm">Procesando CSV y ejecutando simulación...</p>
              </div>
            )}

            {result && (
              <BacktestResults data={result} capitalInicial={params.capital_inicial} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
