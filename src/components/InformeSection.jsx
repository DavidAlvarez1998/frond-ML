import { useState } from 'react';
import { FileText, Download, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

const CONTENIDO = [
  'Portada con KPIs principales del proyecto',
  'Descripción del dataset y configuración del modelo',
  'Tabla comparativa de los 5 modelos y thresholds evaluados',
  'Resultados completos del backtesting con detalle de ciclos',
  'Parámetros de la estrategia de inversión',
  'Conclusiones y trabajos futuros',
  'Stack tecnológico utilizado',
];

export default function InformeSection() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setDone(false);
    setError(null);
    await new Promise((r) => setTimeout(r, 200));
    try {
      generatePDF();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error('[PDF Error]', err);
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="informe" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Informe PDF
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Descargá el informe completo
          </h2>
          <p className="text-slate-400 text-lg">
            Informe ejecutivo del proyecto con todos los resultados del backtesting,
            comparativa de modelos y conclusiones. Generado en tiempo real desde el navegador.
          </p>
        </div>

        <div className="max-w-2xl mx-auto card-dark rounded-2xl p-8">
          {/* Document preview */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <FileText size={32} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">informe_nas100_ml_backtesting.pdf</div>
              <div className="text-slate-400 text-sm">4 páginas · Generado dinámicamente · A4</div>
            </div>
          </div>

          {/* Contents */}
          <h3 className="text-white font-semibold mb-4">El informe incluye:</h3>
          <ul className="flex flex-col gap-2.5 mb-8">
            {CONTENIDO.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>

          {/* Button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all ${
              done
                ? 'bg-emerald-600 text-white'
                : loading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-[1.02] glow-green'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generando PDF...
              </>
            ) : done ? (
              <>
                <CheckCircle2 size={20} />
                ¡Descargado con éxito!
              </>
            ) : (
              <>
                <Download size={20} />
                Descargar Informe PDF
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs font-mono break-all">{error}</p>
            </div>
          )}

          <p className="text-slate-600 text-xs text-center mt-4">
            El PDF se genera localmente en tu navegador. Ningún dato sale de tu dispositivo.
          </p>
        </div>
      </div>
    </section>
  );
}
