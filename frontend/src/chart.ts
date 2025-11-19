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

let activeCharts: Chart[] = [];
const SCALE_FACTOR = 0.0001;

/** ==========================
 * FUNÇÃO DE EXPORTAÇÃO (Mantida igual)
 * ========================== */
// ... (Mantenha a função exportChartsToExcelStyled exatamente como estava antes, 
// ou use o código completo abaixo se preferir garantir)
function exportChartsToExcelStyled(
    payload: Map<string, Array<{ collection: string; labels: string[]; data: (number | null)[] }>>,
    coords: { lat: number; lon: number },
    dateWin: { startDate: string; endDate: string }
) {
    const wb = XLSX.utils.book_new();
    // Cores para o Excel
    const XL_COLORS = { titleFill: 'FF0D6EFD', titleFont: 'FFFFFFFF', infoFill: 'FFEFF6FF' };
    const STYLE_TITLE = { fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.titleFill } }, font: { bold: true, color: { rgb: XL_COLORS.titleFont }, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' } };
    const STYLE_INFO_LABEL = { font: { bold: true }, alignment: { horizontal: 'left' } };
    const STYLE_INFO_VALUE = { fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.infoFill } } };
    const STYLE_TABLE_HEADER = { fill: { patternType: 'solid', fgColor: { rgb: XL_COLORS.titleFill } }, font: { bold: true, color: { rgb: XL_COLORS.titleFont } }, alignment: { horizontal: 'center' } };

    payload.forEach((seriesArr, attrName) => {
        const title = `Série temporal - ${attrName}`;
        const pointText = `latitude ${coords.lat.toFixed(5)}, longitude ${coords.lon.toFixed(5)}`;
        const periodText = `${dateWin.startDate} a ${dateWin.endDate}`;

        // Cria um set de todas as datas para o Excel também
        const allDates = new Set<string>();
        seriesArr.forEach(s => s.labels.forEach(l => allDates.add(l)));
        const masterLabels = Array.from(allDates).sort();

        const header = ['Data (YYYY-MM-DD)', ...seriesArr.map(s => s.collection)];
        const rows: any[][] = [header];

        // Preenche as linhas alinhadas pela data
        for (const date of masterLabels) {
            const row = [date];
            seriesArr.forEach(s => {
                const idx = s.labels.indexOf(date);
                const val = idx !== -1 ? s.data[idx] : null;
                row.push(typeof val === 'number' ? val : null);
            });
            rows.push(row);
        }

        const ws = XLSX.utils.aoa_to_sheet([[], [], [], [], [], ...rows]);

        // Aplica estilos básicos (Título, info, header)
        const totalCols = header.length;
        ws['A1'] = { t: 's', v: title, s: STYLE_TITLE };
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

        ws['A2'] = { t: 's', v: 'Local:', s: STYLE_INFO_LABEL }; ws['B2'] = { t: 's', v: pointText, s: STYLE_INFO_VALUE };
        ws['!merges'].push({ s: { r: 1, c: 1 }, e: { r: 1, c: totalCols - 1 } });

        ws['A3'] = { t: 's', v: 'Período:', s: STYLE_INFO_LABEL }; ws['B3'] = { t: 's', v: periodText, s: STYLE_INFO_VALUE };
        ws['!merges'].push({ s: { r: 2, c: 1 }, e: { r: 2, c: totalCols - 1 } });

        // Estilo do Header
        for (let c = 0; c < header.length; c++) {
            const addr = XLSX.utils.encode_cell({ r: 5, c });
            if (ws[addr]) ws[addr].s = STYLE_TABLE_HEADER;
        }

        // Largura das colunas
        const cols = [{ wch: 15 }];
        for (let i = 1; i < header.length; i++) cols.push({ wch: 25 });
        ws['!cols'] = cols;

        XLSX.utils.book_append_sheet(wb, ws, attrName.substring(0, 31));
    });

    const fileName = `geoinsight_dados_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName, { cellStyles: true });
}

export function clearActiveCharts() {
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];
}

export async function renderComparisonCharts(
    selectedCompatibleFeatures: any[],
    coords: { lat: number; lon: number },
    startDate: string,
    endDate: string,
    selectedAttributes: string[] = ['NDVI', 'EVI']
): Promise<void> {

    const chartsContainer = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');

    if (!chartsContainer || !modal) return;

    const selectedAttrsUC = selectedAttributes.map(a => (a ?? '').toString().toUpperCase());

    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">Carregando dados...</p>';
    clearActiveCharts();
    modal.style.display = 'flex';

    // 1. Buscar atributos disponíveis
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
        } catch (err) { console.error(err); }
    }));

    if (attributesMap.size === 0) {
        chartsContainer.innerHTML = `<p style="text-align:center;color:red;">Nenhum atributo encontrado.</p>`;
        return;
    }

    // 2. Buscar séries temporais
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

                    const attrObj = resultData.attributes.find((a: any) => (a.attribute ?? '').toString().toUpperCase() === attributeUC.toUpperCase());
                    if (!attrObj || !Array.isArray(attrObj.values)) return;

                    const labels = resultData.timeline;
                    const rawValues = attrObj.values;
                    const shouldScale = ['NDVI', 'EVI'].includes(attributeUC.toUpperCase());
                    const scaledData = rawValues.map((v: number | null) => (v !== null && !isNaN(v)) ? (shouldScale ? v * SCALE_FACTOR : v) : null);

                    if (labels.length === scaledData.length) {
                        chartDataConfigs.push({ collection, attribute: attributeUC.toUpperCase(), labels, data: scaledData });
                    }
                } catch (error) { console.error(error); }
            });
        })
    );

    chartsContainer.innerHTML = '';
    if (chartDataConfigs.length === 0) {
        chartsContainer.innerHTML = `<p style="text-align:center;color:orange;">Sem dados para o período.</p>`;
        return;
    }

    // 3. Agrupar por atributo
    const chartsByAttr = new Map<string, any[]>();
    chartDataConfigs.forEach(cfg => {
        const key = cfg.attribute;
        if (!chartsByAttr.has(key)) chartsByAttr.set(key, []);
        chartsByAttr.get(key)?.push(cfg);
    });

    // 4. RENDERIZAR (Com a correção da Master Timeline)
    const exportPayload = new Map();

    // Adiciona a mensagem de instrução para o usuário
    const hint = document.createElement('p');
    hint.innerHTML = '<i class="fas fa-info-circle"></i> Dica: Clique nas legendas coloridas para ocultar ou exibir as linhas.';
    hint.style.textAlign = 'center';
    hint.style.fontSize = '0.9rem';
    hint.style.color = '#666';
    hint.style.marginBottom = '15px';
    hint.style.fontStyle = 'italic';
    hint.style.backgroundColor = '#f8f9fa';
    hint.style.padding = '8px';
    hint.style.borderRadius = '4px';
    hint.style.border = '1px solid #eee';

    chartsContainer.appendChild(hint);

    chartsByAttr.forEach((configs, attrName) => {
        const canvas = document.createElement('canvas');
        canvas.style.maxHeight = '350px';
        canvas.style.marginBottom = '25px';
        chartsContainer.appendChild(canvas);

        // --- CORREÇÃO PRINCIPAL AQUI ---

        // A. Criar a Linha do Tempo Mestre (todas as datas únicas, ordenadas)
        const allDatesSet = new Set<string>();
        configs.forEach((cfg: any) => {
            cfg.labels.forEach((date: string) => allDatesSet.add(date));
        });
        // Ordena as datas cronologicamente
        const masterLabels = Array.from(allDatesSet).sort();

        // B. Alinhar os dados de cada dataset à Linha do Tempo Mestre
        const datasets = configs.map((cfg: any, i: number) => {
            // Cria um mapa data -> valor para busca rápida
            const dataMap = new Map();
            cfg.labels.forEach((label: string, idx: number) => {
                dataMap.set(label, cfg.data[idx]);
            });

            // Cria o novo array de dados alinhado com masterLabels
            // Se não houver dado para aquela data, coloca null (o gráfico pula o ponto)
            const alignedData = masterLabels.map(date => {
                return dataMap.has(date) ? dataMap.get(date) : null;
            });

            return {
                label: cfg.collection,
                data: alignedData, // Dados alinhados!
                borderColor: getRandomColor(i),
                backgroundColor: getRandomColor(i),
                tension: 0.1,
                fill: false,
                spanGaps: true, // Importante: conecta linhas mesmo se houver buracos (datas faltantes)
                pointRadius: 3,
                pointHoverRadius: 5
            };
        });

        // --- FIM DA CORREÇÃO ---

        const chart = new Chart(canvas.getContext('2d')!, {
            type: 'line',
            data: {
                labels: masterLabels, // Usa a linha do tempo mestre
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Série Temporal - ${attrName}` },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Data' } },
                    y: {
                        title: { display: true, text: `Valor do ${attrName}` },
                        min: ['NDVI', 'EVI'].includes(attrName) ? -0.2 : undefined,
                        max: ['NDVI', 'EVI'].includes(attrName) ? 1.0 : undefined
                    }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

        activeCharts.push(chart);
        exportPayload.set(attrName, configs);
    });

    const exportBtn = document.getElementById('export-chart-btn') as HTMLButtonElement | null;
    if (exportBtn) {
        exportBtn.style.display = 'inline-flex';
        exportBtn.onclick = () => exportChartsToExcelStyled(exportPayload, coords, { startDate, endDate });
    }
}

function getRandomColor(index: number): string {
    const colors = ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)'];
    return colors[index % colors.length];
}