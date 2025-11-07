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

// --- 1. FUNÇÃO DE DELAY (SLEEP) ---
/**
 * Cria uma pausa (delay) em milissegundos.
 * @param ms Tempo para esperar (ex: 2000 para 2 segundos)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// --- FIM DA FUNÇÃO ---

// Guarda referências aos gráficos ativos (interno ao módulo)
let activeCharts: Chart[] = [];

type ExportSheet = {
    attrName: string;
    point: { lat: number; lon: number };
    labels: string[];
    series: Array<{ collection: string; values: (number | null)[] }>;
};

let latestExportData: ExportSheet[] = [];
const SCALE_FACTOR = 0.0001;

export function clearActiveCharts() {
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];
    latestExportData = [];
}

export function destroyCharts(charts: Chart[]) {
    charts.forEach(chart => {
        try { chart.destroy(); } catch { /* ignore */ }
    });
}

export function exportLatestChartsToExcel(): void {
    if (!latestExportData || latestExportData.length === 0) {
        alert('Nenhum gráfico disponível para exportar.');
        return;
    }

    const wb = XLSX.utils.book_new();

    latestExportData.forEach((sheetData) => {
        const aoa: any[][] = [];
        aoa.push([`Série temporal - ${sheetData.attrName}`]);
        aoa.push([`Ponto consultado: latitude ${sheetData.point.lat.toFixed(5)}, longitude ${sheetData.point.lon.toFixed(5)}`]);

        if (['NDVI', 'EVI'].includes(sheetData.attrName.toUpperCase())) {
            aoa.push([`Observação: valores já escalados para o intervalo 0 a 1.`]);
        } else {
            aoa.push([`Observação: valores no formato retornado pela API WTSS para o atributo ${sheetData.attrName}.`]);
        }
        aoa.push([]);

        const header: string[] = ['Data (YYYY-MM-DD)'];
        sheetData.series.forEach(s => {
            header.push(`${s.collection} (${sheetData.attrName})`);
        });
        aoa.push(header);

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
 * Renderiza gráficos de comparação.
 * IMPLEMENTA O "EFEITO CASCATA" COM DELAY.
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

    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">1/3: Buscando atributos disponíveis...</p>';
    clearActiveCharts();
    modal.style.display = 'flex';

    // --- PASSO 1: Buscar atributos de cada coleção (continua em paralelo, é rápido) ---
    const attributesMap = new Map<string, string[]>();
    const uniqueCollections = [...new Set(selectedCompatibleFeatures.map(f => f.collection))];

    await Promise.all(uniqueCollections.map(async (collection) => {
        try {
            const data = await fetchCoverageAttributes(collection);
            const attrs = data?.coverages?.[0]?.attributes ?? (data as any)?.attributes ?? [];
            if (Array.isArray(attrs) && attrs.length > 0) {
                const attrsUC = attrs.map((a: string) => a.toString().toUpperCase());
                const relevant = attrsUC.filter((a: string) => selectedAttrsUC.includes(a));
                if (relevant.length > 0) {
                    attributesMap.set(collection, relevant);
                }
            }
        } catch (err) {
            console.error(`Erro ao buscar atributos de ${collection}:`, err);
        }
    }));

    if (attributesMap.size === 0) {
        chartsContainer.innerHTML = `<p style="text-align:center;color:red;">Nenhum atributo (${selectedAttrsUC.join(', ')}) encontrado para as coleções selecionadas.</p>`;
        return;
    }

    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">2/3: Buscando dados das séries temporais...</p>';

    // --- PASSO 2: Criar lista de TAREFAS (não promessas) ---
    const tasksToRun: { collection: string, attributeUC: string }[] = [];
    selectedCompatibleFeatures.forEach(feature => {
        const collection = feature.collection;
        const availableAttrs = attributesMap.get(collection) || [];
        
        availableAttrs.forEach(attributeUC => {
            tasksToRun.push({ collection, attributeUC });
        });
    });

    // --- PASSO 3: Executar tarefas UMA DE CADA VEZ (Sequencial) ---
    const chartDataConfigs: any[] = [];
    const errorMessages: string[] = [];
    
    let currentTask = 1;
    const totalTasks = tasksToRun.length;
    const loadingMessageEl = chartsContainer.querySelector('.loading-message');

    // ESTE É O "EFEITO CASCATA"
    for (const task of tasksToRun) {
        const { collection, attributeUC } = task;
        
        // Atualiza a mensagem de loading
        if (loadingMessageEl) {
            loadingMessageEl.textContent = 
                `Buscando dados (${currentTask}/${totalTasks}): ${collection} (${attributeUC})...`;
        }
        
        try {
            // --- 2. ADIÇÃO DO DELAY DE 2 SEGUNDOS ---
            // Adiciona a pausa de 2 segundos ANTES de fazer a chamada
            // (Não adiciona na *primeira* chamada para ser mais rápido)
            if (currentTask > 1) {
                await sleep(2000); 
            }
            // --- FIM DA ADIÇÃO ---

            // Await FORÇA a espera da chamada terminar antes de ir para a próxima
            const timeSeries = await fetchTimeSeriesData(collection, coords.lat, coords.lon, startDate, endDate, attributeUC);

            // Se a chamada funcionou, processa e ordena os dados
            const resultData = timeSeries?.result ?? timeSeries;
            if (!resultData?.timeline || !resultData?.attributes) {
                throw new Error(`[${collection} - ${attributeUC}]: Resposta inválida da API`);
            }

            const attrObj = resultData.attributes.find((a: any) =>
                (a.attribute ?? '').toString().toUpperCase() === attributeUC.toUpperCase()
            );
            if (!attrObj || !Array.isArray(attrObj.values)) {
                throw new Error(`[${collection} - ${attributeUC}]: Atributo não encontrado na resposta`);
            }

            // CORREÇÃO DO GRÁFICO "RISCADO" (Ordenação)
            const originalLabels = resultData.timeline as string[];
            const rawValues = attrObj.values as (number | null)[];
            const shouldScale = ['NDVI', 'EVI'].includes(attributeUC.toUpperCase());

            let combinedData = originalLabels.map((date, index) => {
                const rawValue = rawValues[index];
                const scaledValue = (rawValue !== null && !isNaN(rawValue))
                    ? (shouldScale ? rawValue * SCALE_FACTOR : rawValue)
                    : null;
                return { date: date, value: scaledValue };
            });

            combinedData.sort((a, b) => a.date.localeCompare(b.date)); // Ordena por data
            const sortedLabels = combinedData.map(d => d.date);
            const sortedData = combinedData.map(d => d.value);

            // Adiciona aos dados que funcionaram
            chartDataConfigs.push({
                collection,
                attribute: attributeUC.toUpperCase(),
                labels: sortedLabels,
                data: sortedData
            });

        } catch (error: any) {
            // Se a chamada falhou, captura o erro e adiciona à lista de erros
            console.error(`Falha na busca de ${collection} (${attributeUC}):`, error);
            // Tenta extrair a mensagem de erro específica, se não, usa a mensagem genérica
            const detail = (error as Error).message || `Falha ao buscar ${collection} (${attributeUC})`;
            errorMessages.push(detail.includes('[') ? detail : `[${collection} - ${attributeUC}]: ${detail}`);
        }
        
        currentTask++; // Próxima tarefa
    }
    
    // --- PASSO 4: Renderizar os gráficos e os erros ---
    chartsContainer.innerHTML = ''; // Limpa a mensagem "Buscando..."

    // Mostra os erros no topo do modal
    if (errorMessages.length > 0) {
        const errorHtml = `
            <div style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                <h4 style="color: #d46b08; margin: 0 0 5px 0;">Alguns gráficos falharam:</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    ${errorMessages.map(msg => `<li style="font-size: 0.9em; color: #333;">${msg}</li>`).join('')}
                </ul>
            </div>
        `;
        chartsContainer.innerHTML += errorHtml;
    }

    if (chartDataConfigs.length === 0 && errorMessages.length > 0) {
        // Se *tudo* falhou, não precisa dizer "nenhum dado"
    } else if (chartDataConfigs.length === 0) {
        chartsContainer.innerHTML = `<p style="text-align:center;color:orange;">Nenhum dado encontrado para os atributos selecionados (${selectedAttrsUC.join(', ')}) no período.</p>`;
        return;
    }

    // Agrupa os dados que funcionaram por atributo
    const chartsByAttr = new Map<string, any[]>();
    chartDataConfigs.forEach(cfg => {
        const key = (cfg.attribute ?? '').toString().toUpperCase();
        if (!chartsByAttr.has(key)) chartsByAttr.set(key, []);
        chartsByAttr.get(key)?.push(cfg);
    });

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
                        labels: configs[0]?.labels || [], // Usa os labels ordenados
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

    // Mostra o botão de exportar se algum gráfico foi renderizado
    const exportBtn = document.getElementById('export-chart-btn') as HTMLButtonElement | null;
    if (exportBtn && latestExportData.length > 0) {
        exportBtn.style.display = 'inline-block';
        exportBtn.onclick = () => {
            exportLatestChartsToExcel();
        };
    } else if (exportBtn) {
        exportBtn.style.display = 'none';
    }
}

function getRandomColor(index: number): string {
    const colors = [
        'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)',
        'rgb(255, 205, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
        'rgb(201, 203, 207)'
    ];
    return colors[index % colors.length];
}