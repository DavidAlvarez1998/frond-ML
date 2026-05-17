import { useRef, useState } from 'react';
import { Upload, X, Play, Loader2, AlertTriangle, TrendingUp, RotateCcw, Database, FileText } from 'lucide-react';
import { api } from '../utils/api';
import BacktestResults from './BacktestResults';

/* ── Shared defaults (usar_dataset_completo lives in state, not in DEFAULTS) ── */
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
  { name: 'capital_inicial',         label: 'Capital inicial ($)',          min: 1000,  max: 1000000, step: 1000,  format: 'Monto en USD',                          pct: false },
  { name: 'tp_normal',               label: 'TP Normal (%)',                min: 0.5,   max: 20,      step: 0.5,   format: 'Porcentaje de ganancia objetivo',         pct: true  },
  { name: 'caida_reentrada',         label: 'Caída para reentrada (%)',     min: 5,     max: 50,      step: 1,     format: 'Baja que activa segunda compra',          pct: true  },
  { name: 'multiplicador_reentrada', label: 'Multiplicador reentrada',      min: 1,     max: 10,      step: 0.5,   format: 'Tamaño del lote 2 vs lote 1',            pct: false },
  { name: 'riesgo_caida',            label: 'Riesgo máximo (%)',            min: 1,     max: 50,      step: 1,     format: 'Del capital para calcular lotaje',        pct: true  },
  { name: 'utilidad_ciclo_pct',      label: 'Utilidad objetivo ciclo (%)',  min: 0.1,   max: 10,      step: 0.1,   format: 'PnL mínimo para cerrar con reentrada',   pct: true  },
  { name: 'valor_por_punto',         label: 'Valor por punto ($)',          min: 1,     max: 100,     step: 1,     format: 'USD por punto por lote',                 pct: false },
];

export default function BacktestRunner() {
  const [mode,    setMode]    = useState('testset'); // 'testset' | 'csv'
  const [file,    setFile]    = useState(null);
  const [params,  setParams]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const fileInputRef = useRef(null);

  /* ── helpers ── */
  const onChange = (name, val) => setParams(p => ({ ...p, [name]: val }));
  const reset    = () => { setParams(DEFAULTS); setResult(null); setError(null); setFile(null); };

  const handleFile = (f) => {
    if (f && f.name.toLowerCase().endsWith('.csv')) {
      setFile(f);
      setResult(null);
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(null);
    setError(null);
  };

  const switchMode = (m) => {
    setMode(m);
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = mode === 'testset'
        ? await api.backtest(params)
        : await api.backtestCSV(file, params);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canRun = mode === 'testset' || (mode === 'csv' && file);

  return (
    <section id="backtest-interactivo" className="py-24 px-6">
      {/* Anchor compat: #backtest-csv still scrolls here */}
      <a id="backtest-csv" className="block -mt-24 invisible h-0 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Backtesting
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Probá tu estrategia
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Ejecutá el backtest sobre el test set del modelo o subí tu propio CSV con datos OHLCV.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Params panel ── */}
          <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">
            {/* Mode toggle */}
            <div className="flex bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => switchMode('testset')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === 'testset'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database size={14} />
                Test Set
              </button>
              <button
                onClick={() => switchMode('csv')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === 'csv'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                CSV Propio
              </button>
            </div>

            {/* CSV upload zone */}
            {mode === 'csv' && (
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">
                  Archivo CSV
                </p>
                {!file ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload size={22} className="text-slate-500" />
                    <p className="text-slate-400 text-xs text-center">Arrastrá tu CSV o hacé click</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Upload size={13} className="text-emerald-400 shrink-0" />
                      <span className="text-slate-300 text-xs truncate">{file.name}</span>
                    </div>
                    <button onClick={clearFile} className="text-slate-500 hover:text-red-400 ml-2 shrink-0">
                      <X size={14} />
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
            )}

            {/* Params header + reset */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Parámetros</h3>
              <button onClick={reset} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors">
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            {/* Numeric inputs (shared) */}
            {FIELD_CONFIG.map(({ name, label, min, max, step, format, pct }) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</label>
                <input
                  type="number"
                  min={min} max={max} step={step}
                  value={pct ? (params[name] ?? 0) * 100 : (params[name] ?? 0)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    onChange(name, pct ? v / 100 : v);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {format && <span className="text-slate-600 text-xs">{format}</span>}
              </div>
            ))}

            {/* Test-set extra: usar_dataset_completo */}
            {mode === 'testset' && (
              <>
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={!!params.usar_dataset_completo}
                    onChange={e => onChange('usar_dataset_completo', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-slate-300 text-sm">Usar dataset completo (154,064 velas)</span>
                </label>
                {params.usar_dataset_completo && (
                  <p className="text-yellow-400 text-xs -mt-2">Advertencia: puede tardar más</p>
                )}
              </>
            )}

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={!canRun || loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                !canRun || loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-green'
              }`}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Ejecutando...</>
                : <><Play size={16} /> Correr Backtest</>
              }
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">
                  {error}
                  {mode === 'testset' && '. Verificá que el servidor FastAPI esté corriendo.'}
                </p>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!result && !loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
                <TrendingUp size={40} className="text-slate-700" />
                <p className="text-slate-500">
                  Configurá los parámetros y presioná <strong className="text-slate-400">Correr Backtest</strong>
                </p>
              </div>
            )}

            {loading && (
              <div className="card-dark rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-emerald-400 animate-spin" />
                <p className="text-slate-400 text-sm">
                  {mode === 'testset'
                    ? `Ejecutando simulación sobre ${params.usar_dataset_completo ? '154,064' : '30,798'} velas...`
                    : 'Procesando CSV y ejecutando simulación...'}
                </p>
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
