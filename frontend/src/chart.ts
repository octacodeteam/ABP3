// frontend/src/chart.ts

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { fetchCoverageAttributes, fetchTimeSeriesData } from './apiService';
import * as XLSX from 'xlsx';

// Registra os componentes necessários
Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  TimeScale, Title, Tooltip, Legend
);

// Guarda referências aos gráficos ativos (interno ao módulo)
let activeCharts: Chart[] = [];

// Fator de escala conhecido para NDVI e EVI (valor inteiro -> multiplica por 0.0001)
const SCALE_FACTOR = 0.0001;

/** ==========================
 *  AUXILIARES P/ EXCEL (estilos)
 *  ========================== */
const XL_COLORS = {
  titleFill: 'FF0D6EFD',      // azul
  titleFont: 'FFFFFFFF',      // branco
  headerFill: 'FFF2F2F2',     // cinza claro
  infoFill: 'FFEFF6FF'        // azul bem claro
};

// Estilos básicos
const STYLE_TITLE = {
  fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.titleFill } },
  font: { bold: true, color: { rgb: XL_COLORS.titleFont }, sz: 14 },
  alignment: { horizontal: 'center', vertical: 'center' as const }
};

const STYLE_INFO_LABEL = {
  font: { bold: true },
  alignment: { horizontal: 'left', vertical: 'center' as const }
};

const STYLE_INFO_VALUE = {
  fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.infoFill } },
  alignment: { horizontal: 'left', vertical: 'center' as const }
};

const STYLE_TABLE_HEADER = {
  fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.titleFill } },
  font: { bold: true, color: { rgb: XL_COLORS.titleFont } },
  alignment: { horizontal: 'center', vertical: 'center' as const },
  border: {
    top: { style: 'thin' as const, color: { rgb: 'FFBBBBBB' } },
    left: { style: 'thin' as const, color: { rgb: 'FFBBBBBB' } },
    right: { style: 'thin' as const, color: { rgb: 'FFBBBBBB' } },
    bottom: { style: 'thin' as const, color: { rgb: 'FFBBBBBB' } }
  }
};

// MODIFICADO: Função styleCell removida.

/**
 * Gera e baixa o Excel com estilos.
 * @param payload estrutura agrupada por atributo
 * @param coords  coordenadas do ponto
 * @param dateWin {startDate, endDate}
 */
function exportChartsToExcelStyled(
  payload: Map<string, Array<{ collection: string; labels: string[]; data: (number|null)[] }>>,
  coords: { lat: number; lon: number },
  dateWin: { startDate: string; endDate: string }
) {
  const wb = XLSX.utils.book_new();

  payload.forEach((seriesArr, attrName) => {
    // ... (definições de title, pointText, etc. - sem alteração)
    const title = `Série temporal - ${attrName}`;
    const pointText = `latitude ${coords.lat.toFixed(5)}, longitude ${coords.lon.toFixed(5)}`;
    const periodText = `${dateWin.startDate} a ${dateWin.endDate}`;
    const obsText = 'valores já escalados para o intervalo 0 a 1.';

    // Monta matriz de dados
    const baseLabels = seriesArr[0]?.labels ?? [];
    const header = ['Data (YYYY-MM-DD)', ...seriesArr.map(s => s.collection)];
    const rows: any[][] = [header];

    for (let i = 0; i < baseLabels.length; i++) {
      const row = [baseLabels[i]];
      seriesArr.forEach(s => {
        const v = s.data[i];
        row.push(typeof v === 'number' && !isNaN(v) ? v : null);
      });
      rows.push(row);
    }

    // Inserimos 5 linhas antes para título/legenda e colocamos o header na linha 6
    const ws = XLSX.utils.aoa_to_sheet([[], [], [], [], [], ...rows]);

    // ======= TÍTULO (A1:... mesclado) =======
    const totalCols = header.length;
    const lastCol = XLSX.utils.encode_col(totalCols - 1);

    // MODIFICADO: Estilo aplicado diretamente
    ws['A1'] = { t: 's', v: title, s: STYLE_TITLE };
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

    // ======= LEGENDA / INFORMAÇÕES (MODIFICADO: Estilos aplicados diretamente) =======
    ws['A2'] = { t: 's', v: 'Local consultado:', s: STYLE_INFO_LABEL };
    ws['B2'] = { t: 's', v: pointText, s: STYLE_INFO_VALUE };
    ws['!merges'].push({ s: { r: 1, c: 1 }, e: { r: 1, c: totalCols - 1 } });

    ws['A3'] = { t: 's', v: 'Período:', s: STYLE_INFO_LABEL };
    ws['B3'] = { t: 's', v: periodText, s: STYLE_INFO_VALUE };
    ws['!merges'].push({ s: { r: 2, c: 1 }, e: { r: 2, c: totalCols - 1 } });

    ws['A4'] = { t: 's', v: 'Observação:', s: STYLE_INFO_LABEL };
    ws['B4'] = { t: 's', v: obsText, s: STYLE_INFO_VALUE };
    ws['!merges'].push({ s: { r: 3, c: 1 }, e: { r: 3, c: totalCols - 1 } });

    // ======= CABEÇALHO DA TABELA (linha 6) (MODIFICADO: Estilos aplicados diretamente) =======
    for (let c = 0; c < header.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: 5, c }); // linha 6
      // A célula (ws[addr]) já existe por causa do aoa_to_sheet,
      // apenas adicionamos a propriedade de estilo 's' a ela.
      if (ws[addr]) {
        ws[addr].s = STYLE_TABLE_HEADER;
      }
    }

    // ======= FORMATOS NUMÉRICOS (Sem alteração) =======
    for (let r = 6; r < rows.length + 5; r++) {
      for (let c = 1; c < header.length; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (!ws[addr]) continue;
        ws[addr].z = '0.0000';
      }
    }

    // ======= LARGURA DE COLUNAS (Sem alteração) =======
    const cols: Array<{ wch: number }> = [];
    for (let i = 0; i < header.length; i++) {
      cols.push({ wch: 36 });
    }
    (ws as any)['!cols'] = cols;

    // ======= AUTOFILTER (Sem alteração) =======
    ws['!autofilter'] = { ref: `A6:${lastCol}${6 + baseLabels.length}` };

    // Ref final
    const lastRow = 6 + baseLabels.length;
    ws['!ref'] = `A1:${lastCol}${lastRow}`;

    XLSX.utils.book_append_sheet(wb, ws, attrName.substring(0, 31));
  });

  // ... (Nome do arquivo e XLSX.writeFile - sem alteração)
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const fileName = `geoinsight_graficos_${y}-${m}-${d}.xlsx`;

  XLSX.writeFile(wb, fileName, { cellStyles: true });
}

/** ==========================
 *  FUNÇÕES JÁ EXISTENTES
 *  ========================== */

// (Todo o restante do arquivo, como clearActiveCharts, destroyCharts,
// renderComparisonCharts e getRandomColor, permanece exatamente igual)

/** Destrói os charts mantidos internamente. */
export function clearActiveCharts() {
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];
}

/** Compatibilidade – destruir charts recebidos. */
export function destroyCharts(charts: Chart[]) {
  charts.forEach(chart => {
    try { chart.destroy(); } catch { /* ignore */ }
  });
}

/**
 * Renderiza gráficos de comparação. Aceita `selectedAttributes` (ex.: ['NDVI','NBR']).
 */
export async function renderComparisonCharts(
  selectedCompatibleFeatures: any[],
  coords: { lat: number; lon: number },
  startDate: string,
  endDate: string,
  selectedAttributes: string[] = ['NDVI', 'EVI']
): Promise<void> {

  const chartsContainer = document.getElementById('comparison-container');
  const modal = document.getElementById('comparison-modal');

  if (!chartsContainer || !modal) {
    console.error("Elemento '#comparison-container' ou '#comparison-modal' não encontrado.");
    alert("Erro interno: Área para gráficos não encontrada.");
    return;
  }

  const selectedAttrsUC = selectedAttributes.map(a => (a ?? '').toString().toUpperCase());

  chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">Carregando dados para os gráficos...</p>';
  clearActiveCharts();
  modal.style.display = 'flex';

  // --- PASSO 1: Buscar atributos de cada coleção ---
  const attributesMap = new Map<string, string[]>();
  const uniqueCollections = [...new Set(selectedCompatibleFeatures.map(f => f.collection))];

  await Promise.allSettled(uniqueCollections.map(async (collection) => {
    try {
      const data = await fetchCoverageAttributes(collection);
      const attrs = data?.coverages?.[0]?.attributes ?? (data as any)?.attributes ?? [];
      if (Array.isArray(attrs) && attrs.length > 0) {
        const attrsUC = attrs.map((a: string) => a.toString().toUpperCase());
        const relevant = attrsUC.filter((a: string) => selectedAttrsUC.includes(a));
        if (relevant.length > 0) attributesMap.set(collection, relevant);
      }
    } catch (err) {
      console.error(`Erro ao buscar atributos de ${collection}:`, err);
    }
  }));

  if (attributesMap.size === 0) {
    chartsContainer.innerHTML = `<p style="text-align:center;color:red;">Nenhum atributo (${selectedAttrsUC.join(', ')}) encontrado para as coleções selecionadas.</p>`;
    return;
  }

  // --- PASSO 2: Buscar séries temporais ---
  const chartDataConfigs: any[] = [];

  await Promise.allSettled(
    selectedCompatibleFeatures.flatMap(feature => {
      const collection = feature.collection;
      const availableAttrs = attributesMap.get(collection) || [];
      return availableAttrs.map(async (attributeUC: string) => {
        try {
          const timeSeries = await fetchTimeSeriesData(collection, coords.lat, coords.lon, startDate, endDate, attributeUC);
          const resultData = (timeSeries as any)?.result ?? timeSeries;

          if (!resultData?.timeline || !resultData?.attributes) return;

          const attrObj = resultData.attributes.find((a: any) =>
            (a.attribute ?? '').toString().toUpperCase() === attributeUC.toUpperCase()
          );

          if (!attrObj || !Array.isArray(attrObj.values)) return;

          const labels = resultData.timeline;
          const rawValues = attrObj.values;

          const shouldScale = ['NDVI', 'EVI'].includes(attributeUC.toUpperCase());
          const scaledData = rawValues.map((v: number | null) =>
            (v !== null && !isNaN(v)) ? (shouldScale ? v * SCALE_FACTOR : v) : null
          );

          if (labels.length !== scaledData.length) return;

          chartDataConfigs.push({ collection, attribute: attributeUC.toUpperCase(), labels, data: scaledData });
        } catch (error) {
          console.error(`Erro ao buscar série temporal para ${collection} (${attributeUC}):`, error);
        }
      });
    })
  );

  // --- PASSO 3: Renderizar os gráficos ---
  chartsContainer.innerHTML = '';

  if (chartDataConfigs.length === 0) {
    chartsContainer.innerHTML = `<p style="text-align:center;color:orange;">Nenhum dado encontrado para os atributos selecionados (${selectedAttrsUC.join(', ')}) no período.</p>`;
    return;
  }

  // Agrupa por atributo
  const chartsByAttr = new Map<string, any[]>();
  chartDataConfigs.forEach(cfg => {
    const key = (cfg.attribute ?? '').toString().toUpperCase();
    if (!chartsByAttr.has(key)) chartsByAttr.set(key, []);
    chartsByAttr.get(key)?.push(cfg);
  });

  // Payload para exportação
  const exportPayload = new Map<
    string,
    Array<{ collection: string; labels: string[]; data: (number|null)[] }>
  >();

  chartsByAttr.forEach((configs, attrName) => {
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '350px';
    canvas.style.marginBottom = '25px';
    chartsContainer.appendChild(canvas);

    const datasets = configs.map((cfg, i) => ({
      label: cfg.collection,
      data: cfg.data.map((v: number | null, idx: number) => ({ x: cfg.labels[idx], y: v })),
      borderColor: getRandomColor(i),
      backgroundColor: getRandomColor(i),
      tension: 0.1,
      fill: false,
      spanGaps: true,
      pointRadius: 3,
      pointHoverRadius: 5
    }));

    const chart = new Chart(canvas.getContext('2d')!, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `Série Temporal - ${attrName}` },
          tooltip: { mode: 'index', intersect: false }
  	    },
        scales: {
          x: {
            type: 'category',
            labels: configs[0]?.labels || [],
            title: { display: true, text: 'Data' }
    	    },
  	      y: {
            beginAtZero: false,
            title: { display: true, text: 'Valor' },
            min: ['NDVI', 'EVI'].includes(attrName) ? -0.2 : undefined,
  	        max: ['NDVI', 'EVI'].includes(attrName) ? 1.0 : undefined
          }
  	    },
        interaction: { mode: 'index', intersect: false }
      }
    });

    activeCharts.push(chart);

    exportPayload.set(
      attrName,
      configs.map((cfg: any) => ({
        collection: cfg.collection,
  	    labels: cfg.labels,
  	    data: cfg.data
  	  }))
    );
  });

  const exportBtn = document.getElementById('export-chart-btn') as HTMLButtonElement | null;
  if (exportBtn) {
    exportBtn.style.display = 'inline-flex';
    exportBtn.onclick = () => {
      exportChartsToExcelStyled(exportPayload, coords, { startDate, endDate });
    };
  }
}

/** Cor por índice (previsível) */
function getRandomColor(index: number): string {
  const colors = [
    'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)',
    'rgb(255, 205, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
    'rgb(201, 203, 207)'
  ];
  return colors[index % colors.length];
}