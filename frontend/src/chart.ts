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

// Registra os componentes necessários
Chart.register(
    LineController, LineElement, PointElement, LinearScale, CategoryScale,
    TimeScale, Title, Tooltip, Legend
);

// Guarda referências aos gráficos ativos (interno ao módulo)
let activeCharts: Chart[] = [];

// Fator de escala conhecido para NDVI e EVI (valor inteiro -> multiplica por 0.0001)
const SCALE_FACTOR = 0.0001;

/**
 * Destrói os charts mantidos internamente e limpa o array.
 * Chamado pelo UI ao fechar modal.
 */
export function clearActiveCharts() {
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];
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
            // Algumas respostas vêm com .coverages[0].attributes, outras podem vir direto; tentamos ambos
            const attrs = data?.coverages?.[0]?.attributes ?? data?.attributes ?? [];
            if (Array.isArray(attrs) && attrs.length > 0) {
                // Transform attrs para uppercase para comparação
                const attrsUC = attrs.map((a: string) => a.toString().toUpperCase());
                // Filtra apenas os selecionados pelo usuário (case-insensitive)
                const relevant = attrsUC.filter((a: string) => selectedAttrsUC.includes(a));
                if (relevant.length > 0) {
                    // Guardamos em uppercase para manter consistência
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
                    // A API provavelmente aceita tanto 'NDVI' quanto 'ndvi' — mantenha attribute original se necessário.
                    // Aqui passamos attributeUC, se sua API for sensível a case ajuste conforme necessário.
                    const timeSeries = await fetchTimeSeriesData(collection, coords.lat, coords.lon, startDate, endDate, attributeUC);

                    // Aceita respostas com ou sem "result"
                    const resultData = timeSeries?.result ?? timeSeries;

                    // Verifica se timeline e attributes existem
                    if (!resultData?.timeline || !resultData?.attributes) {
                        console.warn(`Resposta inválida de ${collection} (${attributeUC}):`, timeSeries);
                        return;
                    }

                    // Encontrar o atributo na resposta (case-insensitive)
                    const attrObj = resultData.attributes.find((a: any) =>
                        (a.attribute ?? '').toString().toUpperCase() === attributeUC.toUpperCase()
                    );

                    if (!attrObj || !Array.isArray(attrObj.values)) {
                        console.warn(`Atributo ${attributeUC} não encontrado ou sem valores em ${collection}.`);
                        return;
                    }

                    const labels = resultData.timeline;
                    const rawValues = attrObj.values;

                    // Se for NDVI/EVI aplicamos SCALE_FACTOR, caso contrário mantemos o valor "bruto"
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
                        // só aplicar limites para NDVI/EVI (valores entre -0.2 e 1.0)
                        min: ['NDVI', 'EVI'].includes(attrName) ? -0.2 : undefined,
                        max: ['NDVI', 'EVI'].includes(attrName) ? 1.0 : undefined
                    }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

        activeCharts.push(chart);
    });
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
