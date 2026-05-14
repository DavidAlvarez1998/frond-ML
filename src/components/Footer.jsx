import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-10">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 text-sm leading-relaxed">
            <strong className="text-amber-400">Aviso importante:</strong> Este proyecto es de carácter
            exclusivamente académico y exploratorio. No constituye recomendación financiera, asesoramiento
            de inversión ni garantía de rendimientos futuros. Los resultados del backtesting histórico
            no garantizan resultados en operaciones reales. No operes con capital real basándote
            únicamente en este modelo.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-white font-bold">NAS100 ML Dashboard</span>
          </div>
          <div className="text-slate-500 text-sm text-center">
            Proyecto académico de Machine Learning · Clasificación supervisada · NAS100.fs M15 2019–2025
          </div>
          <div className="text-slate-600 text-sm">
            Built with React + Vite + Tailwind
          </div>
        </div>
      </div>
    </footer>
  );
}
