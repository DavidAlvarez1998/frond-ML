import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  BACKTEST_PARAMS,
  BACKTEST_CYCLES,
  MODEL_RESULTS,
  DATASET_INFO,
} from '../data/projectData';

// RGB arrays — siempre se usan con spread: doc.setFillColor(...C.dark)
const C = {
  dark:      [10,  15,  30],
  bg:        [15,  23,  42],
  primary:   [16,  185, 129],
  secondary: [59,  130, 246],
  muted:     [100, 116, 139],
  white:     [255, 255, 255],
  text:      [180, 195, 215],   // <-- array correcto, se usa con spread también
};

function rgb(arr) { return arr; }   // alias para claridad

function header(doc, page, total) {
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...C.primary);
  doc.text('NAS100 ML — Informe de Resultados', 14, 11);
  doc.setTextColor(...C.muted);
  doc.text(`Pagina ${page} de ${total}`, 196, 11, { align: 'right' });
}

function footer(doc) {
  doc.setDrawColor(...C.muted);
  doc.setLineWidth(0.3);
  doc.line(14, 285, 196, 285);
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(
    'Proyecto academico. No constituye recomendacion financiera. Los resultados historicos no garantizan rendimientos futuros.',
    14, 290
  );
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function generatePDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const TOTAL = 4;

  // ── PORTADA ──────────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, 6, 297, 'F');

  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text('PROYECTO DE MACHINE LEARNING PARA TRADING', 20, 58);

  doc.setFontSize(24);
  doc.setTextColor(...C.white);
  doc.text('Deteccion de Oportunidades', 20, 76);
  doc.text('de Compra en NAS100', 20, 89);

  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  doc.text('Modelo de clasificacion supervisada con backtesting historico', 20, 106);
  doc.text('Temporalidad M15 · 2019-2025 · 154,064 velas', 20, 115);

  // Stats cards en portada
  const stats = [
    { label: 'Capital inicial',  value: '$10,000' },
    { label: 'Capital final',    value: '$11,940.52' },
    { label: 'Rendimiento',      value: '+19.41%' },
    { label: 'Ciclos cerrados',  value: '6 / 6 TP' },
  ];
  stats.forEach((s, i) => {
    const bx = 20 + i * 46;
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, 140, 42, 22, 2, 2, 'FD');
    doc.setFontSize(13);
    doc.setTextColor(...C.primary);
    doc.text(s.value, bx + 21, 151, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(s.label, bx + 21, 158, { align: 'center' });
  });

  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    20, 255
  );
  doc.text('Uso academico · No recomendacion financiera', 20, 262);

  // ── PAG 2: DATASET + MODELOS ──────────────────────────────────────────────
  doc.addPage();
  header(doc, 2, TOTAL);

  let y = 28;

  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('1. Dataset y Configuracion del Modelo', 14, y);
  y += 7;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Datos historicos OHLC del indice NAS100.fs en temporalidad M15, periodo 2019-2025.', 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Parametro', 'Valor']],
    body: [
      ['Instrumento', DATASET_INFO.instrumento],
      ['Temporalidad', DATASET_INFO.temporalidad],
      ['Periodo', `${DATASET_INFO.periodoInicio} a ${DATASET_INFO.periodoFin}`],
      ['Total de velas', DATASET_INFO.totalFilas.toLocaleString('es-AR')],
      ['Columnas originales', DATASET_INFO.columnas.join(', ')],
      ['Split Train/Test', `${DATASET_INFO.trainPct}% / ${DATASET_INFO.testPct}%`],
      ['Clase Compra (1)', `${DATASET_INFO.claseCompra.toLocaleString('es-AR')} velas (6.0%)`],
      ['Clase No Compra (0)', `${DATASET_INFO.claseNoCompra.toLocaleString('es-AR')} velas (94.0%)`],
      ['Balanceo de clases', 'RandomOverSampler (solo en train)'],
      ['Variable objetivo', 'precio_en_descuento == 1 AND rendimiento_futuro_max >= 3% en 240 velas'],
    ],
    theme: 'grid',
    headStyles: { fillColor: rgb(C.primary), textColor: rgb(C.white), fontStyle: 'bold' },
    bodyStyles: { textColor: [200, 210, 220], fontSize: 8 },
    alternateRowStyles: { fillColor: [18, 28, 52] },
    styles: { fillColor: [12, 20, 40] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('2. Comparacion de Modelos', 14, y);
  y += 7;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Evaluacion con predict_proba() y busqueda de threshold optimo (0.01-0.60). Metrica: F1-score clase Compra.', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Modelo', 'Threshold', 'Precision', 'Recall', 'F1', 'Senales']],
    body: MODEL_RESULTS.map((m) => [
      m.mejor ? `* ${m.modelo}` : m.modelo,
      m.threshold.toFixed(2),
      `${(m.precision * 100).toFixed(1)}%`,
      `${(m.recall * 100).toFixed(1)}%`,
      `${(m.f1 * 100).toFixed(2)}%`,
      m.senales.toLocaleString('es-AR'),
    ]),
    theme: 'grid',
    headStyles: { fillColor: rgb(C.secondary), textColor: rgb(C.white), fontStyle: 'bold' },
    bodyStyles: { textColor: [200, 210, 220], fontSize: 8 },
    alternateRowStyles: { fillColor: [18, 28, 52] },
    styles: { fillColor: [12, 20, 40] },
    willDrawCell: (data) => {
      if (data.section === 'body' && data.row.index === 0) {
        data.cell.styles.textColor = C.primary;
      }
    },
    margin: { left: 14, right: 14 },
  });

  footer(doc);

  // ── PAG 3: BACKTESTING ────────────────────────────────────────────────────
  doc.addPage();
  header(doc, 3, TOTAL);

  y = 28;
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('3. Resultados del Backtesting', 14, y);
  y += 7;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Simulacion sobre el 20% final del dataset. Estrategia con gestion de capital y reentradas.', 14, y);
  y += 10;

  // KPI boxes
  const kpis = [
    { label: 'Capital Inicial',   value: '$10,000' },
    { label: 'Capital Final',     value: '$11,940.52' },
    { label: 'Rendimiento Total', value: '+19.41%' },
    { label: 'PnL Total',         value: '+$1,940.52' },
    { label: 'PnL Prom / Ciclo',  value: '+$323.42' },
    { label: 'Win Rate',          value: '100% (6/6)' },
  ];
  const BW = 56, BH = 18, GX = 6, GY = 4;
  kpis.forEach((k, i) => {
    const bx = 14 + (i % 3) * (BW + GX);
    const by = y + Math.floor(i / 3) * (BH + GY);
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, by, BW, BH, 2, 2, 'FD');
    doc.setFontSize(12);
    doc.setTextColor(...C.primary);
    doc.text(k.value, bx + BW / 2, by + 9, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(k.label, bx + BW / 2, by + 14, { align: 'center' });
  });

  y += Math.ceil(kpis.length / 3) * (BH + GY) + 8;

  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text('Detalle de ciclos de inversion', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Entrada', 'P.Entrada', 'Lote', 'Salida', 'P.Salida', 'Resultado', 'PnL', 'Capital']],
    body: BACKTEST_CYCLES.map((c) => [
      c.id,
      c.fecha_entrada,
      c.precio_entrada.toLocaleString('es-AR'),
      c.lote.toFixed(4),
      c.fecha_salida,
      c.precio_salida.toLocaleString('es-AR'),
      c.resultado,
      `+$${c.pnl.toFixed(2)}`,
      `$${c.capital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: rgb(C.primary), textColor: rgb(C.white), fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { textColor: [200, 210, 220], fontSize: 7.5 },
    alternateRowStyles: { fillColor: [18, 28, 52] },
    styles: { fillColor: [12, 20, 40] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  const paramLine = [
    `TP: ${BACKTEST_PARAMS.tpPct}%`,
    `Reentrada: -${BACKTEST_PARAMS.caidaReentrada}%`,
    `Mult: ${BACKTEST_PARAMS.multiplicadorReentrada}x`,
    `Riesgo max: ${BACKTEST_PARAMS.riesgoMaximo}%`,
    `Util objetivo: ${BACKTEST_PARAMS.utilidadCiclo}%`,
    `Val/punto: $${BACKTEST_PARAMS.valorPorPunto}`,
  ].join('   ');
  doc.text('Parametros: ' + paramLine, 14, y, { maxWidth: 182 });

  footer(doc);

  // ── PAG 4: CONCLUSIONES ───────────────────────────────────────────────────
  doc.addPage();
  header(doc, 4, TOTAL);

  y = 28;
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('4. Conclusiones y Trabajos Futuros', 14, y);
  y += 10;

  const conclusiones = [
    {
      titulo: 'Modelo ganador',
      texto: 'El Random Forest Balanced con threshold 0.30 obtuvo el mejor balance entre precision (50.1%) y recall (45.1%), con F1-score de 0.4749 sobre la clase minoritaria de compra.',
    },
    {
      titulo: 'Desbalance de clases manejado',
      texto: 'El RandomOverSampler se aplico exclusivamente sobre el conjunto de entrenamiento, manteniendo el test con distribucion real del mercado para una evaluacion objetiva.',
    },
    {
      titulo: 'Backtesting historico positivo',
      texto: 'La simulacion sobre el bloque de prueba genero 6 operaciones, todas cerradas con TP del 3%. Rendimiento total: +19.41% sobre capital inicial de $10,000.',
    },
    {
      titulo: 'Limitaciones importantes',
      texto: 'El backtesting no considera comisiones, slippage ni impacto de mercado. La muestra de 6 ciclos es reducida para conclusiones estadisticas robustas.',
    },
    {
      titulo: 'Trabajos futuros',
      texto: 'Walk-forward validation, optimizacion de hiperparametros con validacion cruzada temporal, incorporacion de datos macroeconomicos y despliegue de senales en tiempo real via API.',
    },
  ];

  conclusiones.forEach((c) => {
    doc.setFontSize(10);
    doc.setTextColor(...C.primary);
    doc.text(`• ${c.titulo}`, 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...C.text);   // <-- FIX: era setTextColor([array]) sin spread
    const lines = doc.splitTextToSize(c.texto, 178);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 6;
  });

  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('Tecnologias utilizadas:', 14, y);
  y += 6;
  ['Python 3.13', 'pandas', 'numpy', 'scikit-learn', 'imbalanced-learn', 'joblib', 'matplotlib'].forEach((t, i) => {
    const tx = 14 + (i % 4) * 46;
    const ty = y + Math.floor(i / 4) * 9;
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.secondary);
    doc.setLineWidth(0.3);
    doc.roundedRect(tx, ty - 4, 40, 7, 1, 1, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.secondary);
    doc.text(t, tx + 20, ty, { align: 'center' });
  });

  footer(doc);

  // Descarga via blob — más confiable que doc.save() en todos los browsers
  const blob = doc.output('blob');
  triggerDownload(blob, 'informe_nas100_ml_backtesting.pdf');
}
