import { useState, useCallback } from 'react';
import { Cpu, AlertTriangle, CheckCircle2, HelpCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { api } from '../utils/api';

function Slider({ label, min, max, step, value, onChange, format }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-300 text-sm font-medium">
        {label}: <span className="text-white font-bold">{format ? format(value) : value}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

export default function SimuladorSection() {
  const [distEma20,  setDistEma20]  = useState(-0.005);
  const [rsi,        setRsi]        = useState(38);
  const [bbPos,      setBbPos]      = useState(0.20);
  const [caida5,     setCaida5]     = useState(-0.005);
  const [distEma50,  setDistEma50]  = useState(-0.003);
  const [distEma200, setDistEma200] = useState(-0.001);
  const [macd,       setMacd]       = useState(0);
  const [volRel,     setVolRel]     = useState(1.0);

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.predict({
        dist_ema20:   distEma20,
        dist_ema50:   distEma50,
        dist_ema200:  distEma200,
        rsi_14:       rsi,
        bb_posicion:  bbPos,
        caida_5:      caida5,
        caida_10:     caida5 * 1.8,
        macd:         macd,
        macd_signal:  0,
        vol_relativo: volRel,
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [distEma20, distEma50, distEma200, rsi, bbPos, caida5, macd, volRel]);

  // Fallback local si la API no está disponible
  const precioEnDescuento = distEma20 < -0.003 || rsi < 40 || bbPos < 0.25 || caida5 < -0.004;
  const senalLocal        = precioEnDescuento && distEma50 < -0.0015;

  const condiciones = result
    ? [
        { label: 'dist_ema20 < -0.3%',   ok: result.condiciones.dist_ema20_ok,   value: `${(distEma20*100).toFixed(2)}%` },
        { label: 'rsi_14 < 40',           ok: result.condiciones.rsi_ok,           value: rsi.toFixed(0) },
        { label: 'bb_posicion < 0.25',    ok: result.condiciones.bb_ok,            value: bbPos.toFixed(2) },
        { label: 'caida_5 < -0.4%',       ok: result.condiciones.caida5_ok,        value: `${(caida5*100).toFixed(2)}%` },
      ]
    : [
        { label: 'dist_ema20 < -0.3%',   ok: distEma20 < -0.003, value: `${(distEma20*100).toFixed(2)}%` },
        { label: 'rsi_14 < 40',           ok: rsi < 40,           value: rsi.toFixed(0) },
        { label: 'bb_posicion < 0.25',    ok: bbPos < 0.25,       value: bbPos.toFixed(2) },
        { label: 'caida_5 < -0.4%',       ok: caida5 < -0.004,   value: `${(caida5*100).toFixed(2)}%` },
      ];

  const senal   = result ? result.senal_final : senalLocal;
  const proba   = result?.probabilidad ?? null;
  const apiActive = result !== null;

  return (
    <section id="simulador" className="py-24 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Simulador de Señales</span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">Predicción con el modelo real</h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Ajustá los indicadores y consultá al modelo Random Forest entrenado via API.
          </p>

          {/* API status badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-medium border ${
            apiActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {apiActive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {apiActive ? 'API conectada — modelo real activo' : 'Presioná "Consultar modelo" para conectar la API'}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-white font-bold text-lg">Indicadores técnicos</h3>

            <Slider label="Distancia a EMA20"  min={-0.02} max={0.02} step={0.001} value={distEma20}  onChange={setDistEma20}  format={v => `${(v*100).toFixed(1)}%`} />
            <Slider label="RSI (14 períodos)"   min={10}    max={80}   step={1}     value={rsi}        onChange={setRsi}        format={v => v.toFixed(0)} />
            <Slider label="Posición Bollinger"  min={0}     max={1}    step={0.01}  value={bbPos}      onChange={setBbPos}      format={v => v.toFixed(2)} />
            <Slider label="Caída 5 velas"        min={-0.02} max={0.02} step={0.001} value={caida5}     onChange={setCaida5}     format={v => `${(v*100).toFixed(1)}%`} />

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-5">
              <p className="text-slate-500 text-xs flex items-center gap-1.5">
                <HelpCircle size={12} /> Filtros adicionales
              </p>
              <Slider label="Distancia a EMA50"  min={-0.02} max={0.01} step={0.001} value={distEma50}  onChange={setDistEma50}  format={v => `${(v*100).toFixed(1)}%`} />
              <Slider label="Distancia a EMA200" min={-0.02} max={0.01} step={0.001} value={distEma200} onChange={setDistEma200} format={v => `${(v*100).toFixed(1)}%`} />
              <Slider label="Volumen relativo"    min={0.1}   max={5}    step={0.1}   value={volRel}     onChange={setVolRel}     format={v => `${v.toFixed(1)}x`} />
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white glow-blue'
              }`}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Consultando modelo...</> : <><Cpu size={16} /> Consultar modelo</>}
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}. Verificá que el servidor FastAPI esté corriendo en localhost:8000</p>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="flex flex-col gap-4">
            {/* precio_en_descuento */}
            <div className={`card-dark rounded-2xl p-6 border transition-colors ${precioEnDescuento ? 'border-emerald-500/40' : 'border-slate-700'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${precioEnDescuento ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  <Cpu size={20} className={precioEnDescuento ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Flag calculado</div>
                  <div className="text-white font-bold">precio_en_descuento</div>
                </div>
                <span className={`ml-auto px-3 py-1.5 rounded-full text-sm font-bold ${precioEnDescuento ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {precioEnDescuento ? '1 — Activo' : '0 — Inactivo'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {condiciones.map(({ label, ok, value }) => (
                  <div key={label} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      {ok ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                           : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 shrink-0" />}
                      <code className="text-slate-400 text-xs">{label}</code>
                    </div>
                    <span className={`text-xs font-mono ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Probabilidad del modelo */}
            {result && (
              <div className="card-dark rounded-2xl p-5 border border-blue-500/20">
                <div className="text-slate-400 text-xs mb-1">Probabilidad del modelo (Random Forest real)</div>
                <div className="flex items-end gap-3 mb-3">
                  <div className="text-4xl font-extrabold text-blue-400">{(proba * 100).toFixed(1)}%</div>
                  <div className="text-slate-500 text-sm mb-1">threshold = 0.30</div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${proba >= 0.30 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(proba * 100 / 0.6, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>0%</span><span className="text-slate-400">threshold 30%</span><span>60%+</span>
                </div>
              </div>
            )}

            {/* Señal final */}
            <div className={`rounded-2xl p-6 text-center transition-all ${senal ? 'bg-emerald-500/10 border border-emerald-500/40 glow-green' : 'card-dark'}`}>
              <div className="text-4xl mb-3">{senal ? '🟢' : '⚪'}</div>
              <div className={`text-2xl font-extrabold ${senal ? 'text-emerald-400' : 'text-slate-500'}`}>
                {senal ? 'SEÑAL DE COMPRA' : 'Sin señal'}
              </div>
              <div className="text-slate-400 text-sm mt-2">
                {result
                  ? (senal
                      ? `Probabilidad ${(proba*100).toFixed(1)}% ≥ threshold 30% y filtro EMA50 confirmado.`
                      : !result.precio_en_descuento
                        ? 'Ninguna condición de descuento activa.'
                        : result.senal === 0
                          ? `Probabilidad ${(proba*100).toFixed(1)}% < threshold 30%.`
                          : 'Señal base activa pero filtro EMA50 no confirma.')
                  : senal
                    ? 'Condiciones cumplen criterios técnicos (cálculo local — consultá el modelo para probabilidad real).'
                    : 'Ajustá los indicadores y consultá el modelo.'}
              </div>
            </div>

            {!result && (
              <div className="flex items-start gap-2.5 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  El semáforo usa lógica local. Para la <strong className="text-slate-400">probabilidad real del modelo Random Forest</strong>, presioná "Consultar modelo" (requiere servidor FastAPI en localhost:8000).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
