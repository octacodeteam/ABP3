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

// Tipo de dado que vamos guardar para exportar depois
type ExportSheet = {
    attrName: string;
    point: { lat: number; lon: number };
    labels: string[];
    series: Array<{ collection: string; values: (number | null)[] }>;
};

// Agora guardamos uma lista de abas a serem exportadas
let latestExportData: ExportSheet[] = [];

// Fator de escala conhecido para NDVI e EVI (valor inteiro -> multiplica por 0.0001)
const SCALE_FACTOR = 0.0001;

/**
 * Destrói os charts mantidos internamente e limpa o array.
 * Chamado pelo UI ao fechar modal.
 */
export function clearActiveCharts() {
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];
    latestExportData = [];
}

/**
 * Função pública usada por outros módulos se quiser destruir um array de charts
 * (mantive por compatibilidade caso prefira usar).
 */
export function destroyCharts(charts: Chart[]) {
    charts.forEach(chart => {
        try { chart.destroy(); } catch { /* ignore */ }
    });
}

/**
 * Exporta o último conjunto de gráficos gerados para um arquivo .xlsx
 * Agora com linhas explicativas
 */
export function exportLatestChartsToExcel(): void {
    if (!latestExportData || latestExportData.length === 0) {
        alert('Nenhum gráfico disponível para exportar.');
        return;
    }

    const wb = XLSX.utils.book_new();

    latestExportData.forEach((sheetData) => {
        const aoa: any[][] = [];

        // Linha de título
        aoa.push([`Série temporal - ${sheetData.attrName}`]);

        // Linha com o ponto clicado
        aoa.push([`Ponto consultado: latitude ${sheetData.point.lat.toFixed(5)}, longitude ${sheetData.point.lon.toFixed(5)}`]);

        // Se for NDVI/EVI, avisar que já está escalado
        if (['NDVI', 'EVI'].includes(sheetData.attrName.toUpperCase())) {
            aoa.push([`Observação: valores já escalados para o intervalo 0 a 1.`]);
        } else {
            aoa.push([`Observação: valores no formato retornado pela API WTSS para o atributo ${sheetData.attrName}.`]);
        }

        // Linha vazia
        aoa.push([]);

        // Cabeçalho real da tabela
        const header: string[] = ['Data (YYYY-MM-DD)'];
        sheetData.series.forEach(s => {
            header.push(`${s.collection} (${sheetData.attrName})`);
        });
        aoa.push(header);

        // Linhas de dados
        for (let i = 0; i < sheetData.labels.length; i++) {
            const row: any[] = [sheetData.labels[i]];
            sheetData.series.forEach(s => {
                const v = s.values[i];
                row.push((v !== null && v !== undefined && v !== '') ? v : '');
            });
            aoa.push(row);
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const safeName = sheetData.attrName.substring(0, 31) || 'Dados';
        XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    const today = new Date().toISOString().slice(0, 10);
    const fileName = `geoinsight_graficos_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Renderiza gráficos de comparação buscando atributos dinamicamente para coleções WTSS compatíveis.
 * Agora aceita parâmetro `selectedAttributes` (array de strings, ex: ['NDVI','NBR'])
 */
export async function renderComparisonCharts(
    selectedCompatibleFeatures: any[],
    coords: { lat: number; lon: number },
    startDate: string,
    endDate: string,
    selectedAttributes: string[] = ['NDVI', 'EVI'] // padrão caso não seja informado
): Promise<void> {

    const chartsContainer = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');

    if (!chartsContainer || !modal) {
        console.error("Elemento '#comparison-container' ou '#comparison-modal' não encontrado.");
        alert("Erro interno: Área para gráficos não encontrada.");
        return;
    }

    // Normalize attributes (upper case) para comparações
    const selectedAttrsUC = selectedAttributes.map(a => (a ?? '').toString().toUpperCase());

    // Limpa e prepara o modal/container
    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">Carregando dados para os gráficos...</p>';
    clearActiveCharts();
    modal.style.display = 'flex';

    // --- PASSO 1: Buscar atributos de cada coleção ---
    const attributesMap = new Map<string, string[]>();
    const uniqueCollections = [...new Set(selectedCompatibleFeatures.map(f => f.collection))];

    await Promise.allSettled(uniqueCollections.map(async (collection) => {
        try {
            const data = await fetchCoverageAttributes(collection);
            const attrs = data?.coverages?.[0]?.attributes ?? data?.attributes ?? [];
            if (Array.isArray(attrs) && attrs.length > 0) {
                const attrsUC = attrs.map((a: string) => a.toString().toUpperCase());
                const relevant = attrsUC.filter((a: string) => selectedAttrsUC.includes(a));
                if (relevant.length > 0) {
                    attributesMap.set(collection, relevant);
                } else {
                    console.warn(`Coleção ${collection} não possui nenhum dos atributos selecionados (${selectedAttrsUC.join(', ')}). Atributos disponíveis: ${attrsUC.join(', ')}`);
                }
            } else {
                console.warn(`Resposta de atributos inesperada para ${collection}:`, data);
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
                    const resultData = timeSeries?.result ?? timeSeries;

                    if (!resultData?.timeline || !resultData?.attributes) {
                        console.warn(`Resposta inválida de ${collection} (${attributeUC}):`, timeSeries);
                        return;
                    }

                    const attrObj = resultData.attributes.find((a: any) =>
                        (a.attribute ?? '').toString().toUpperCase() === attributeUC.toUpperCase()
                    );

                    if (!attrObj || !Array.isArray(attrObj.values)) {
                        console.warn(`Atributo ${attributeUC} não encontrado ou sem valores em ${collection}.`);
                        return;
                    }

                    const labels = resultData.timeline;
                    const rawValues = attrObj.values;

                    const shouldScale = ['NDVI', 'EVI'].includes(attributeUC.toUpperCase());
                    const scaledData = rawValues.map((v: number | null) =>
                        (v !== null && !isNaN(v)) ? (shouldScale ? v * SCALE_FACTOR : v) : null
                    );

                    if (labels.length !== scaledData.length) {
                        console.warn(`Número de datas (${labels.length}) difere de valores (${scaledData.length}) em ${collection} - ${attributeUC}.`);
                        return;
                    }

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

    // 👉 vamos começar a montar o que será exportado
    latestExportData = [];

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

        // 👉 montar dados para exportar depois
        const baseLabels: string[] = configs[0]?.labels || [];
        const series = configs.map((cfg: any) => ({
            collection: cfg.collection,
            values: cfg.data as (number | null)[]
        }));

        latestExportData.push({
            attrName,
            point: { lat: coords.lat, lon: coords.lon },
            labels: baseLabels,
            series
        });
    });

    // 👉 mostrar botão do rodapé
    const exportBtn = document.getElementById('export-chart-btn') as HTMLButtonElement | null;
    if (exportBtn) {
        exportBtn.style.display = 'inline-block';
        exportBtn.onclick = () => {
            exportLatestChartsToExcel();
        };
    }
}

/**
 * Retorna uma cor fixa baseada no índice (não verdadeiramente aleatória para previsibilidade)
 */
function getRandomColor(index: number): string {
    const colors = [
        'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)',
        'rgb(255, 205, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
        'rgb(201, 203, 207)'
    ];
    return colors[index % colors.length];
}
