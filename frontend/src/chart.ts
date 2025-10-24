// frontend/src/chart.ts

import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    TimeScale, // Incluído caso precise usar
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { fetchCoverageAttributes, fetchTimeSeriesData } from './apiService'; //

// Registra os componentes necessários
Chart.register(
    LineController, LineElement, PointElement, LinearScale, CategoryScale,
    TimeScale, Title, Tooltip, Legend
); //

// Guarda referências aos gráficos ativos
let activeCharts: Chart[] = []; //

// Lista de atributos que queremos buscar/mostrar nos gráficos
const RELEVANT_ATTRIBUTES = ['ndvi', 'evi']; // Comparação case-insensitive será usada

/**
 * Renderiza gráficos de comparação buscando atributos dinamicamente para coleções WTSS compatíveis.
 * @param selectedCompatibleFeatures Array de objetos STAC Feature selecionados E COMPATÍVEIS com WTSS.
 * @param coords Objeto com latitude e longitude { lat, lon }.
 * @param startDate String da data de início no formato 'YYYY-MM-DD'.
 * @param endDate String da data de fim no formato 'YYYY-MM-DD'.
 */
export async function renderComparisonCharts(
    selectedCompatibleFeatures: any[], // Nome atualizado para clareza
    coords: { lat: number; lon: number },
    startDate: string,
    endDate: string
): Promise<void> {

    const chartsContainer = document.getElementById('comparison-container'); // Container no modal //
    const modal = document.getElementById('comparison-modal'); // O modal em si //

    if (!chartsContainer || !modal) {
        console.error("Elemento '#comparison-container' ou '#comparison-modal' não encontrado.");
        alert("Erro interno: Área para gráficos não encontrada.");
        return;
    }

    // Limpa e prepara o modal/container
    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">Carregando dados para os gráficos...</p>'; //
    activeCharts.forEach(chart => chart.destroy()); //
    activeCharts = []; //
    modal.style.display = 'flex'; //

    // --- PASSO 1: Buscar atributos PARA CADA coleção selecionada ---
    const attributePromises: Promise<void>[] = [];
    const attributesMap = new Map<string, string[]>(); // Mapa: Coleção -> Atributos Relevantes

    const uniqueCompatibleCollections = [...new Set(selectedCompatibleFeatures.map(f => f.collection))];

    uniqueCompatibleCollections.forEach(collectionName => {
        const promise = fetchCoverageAttributes(collectionName) // Chama a API para CADA coleção //
            .then(attributesData => {
                if (attributesData?.coverages?.[0]?.attributes) { // Verifica se a resposta é válida
                    const coverageInfo = attributesData.coverages[0];
                    const relevantAttributes = coverageInfo.attributes.filter(attr =>
                        RELEVANT_ATTRIBUTES.includes(attr.toLowerCase()) // Filtra por NDVI/EVI (case-insensitive)
                    );
                    if (relevantAttributes.length > 0) {
                        attributesMap.set(collectionName, relevantAttributes); // Guarda no mapa
                    } else {
                        console.warn(`Nenhum atributo (${RELEVANT_ATTRIBUTES.join('/')}) encontrado para ${collectionName}. Disponíveis: ${coverageInfo.attributes.join(', ') || 'Nenhum'}`);
                    }
                }
                // Se attributesData for null (404 ou erro), já foi logado em fetchCoverageAttributes
            })
            .catch(error => { // Captura erros inesperados no processamento do .then
                console.error(`Erro inesperado ao processar atributos para ${collectionName}:`, error);
                // Continua mesmo se uma falhar
            });
        attributePromises.push(promise);
    });

    await Promise.allSettled(attributePromises); // Espera todas as buscas de atributos

    if (attributesMap.size === 0) {
         chartsContainer.innerHTML = `<p class="info-message" style="text-align: center; padding: 20px; color: red;">Não foi possível obter atributos (${RELEVANT_ATTRIBUTES.join('/')}) para nenhuma das coleções selecionadas compatíveis com WTSS. Verifique o console.</p>`;
        return;
    }


    // --- PASSO 2: Buscar as séries temporais ---
    const timeSeriesPromises: Promise<void>[] = [];
    const chartDataConfigs: any[] = []; // Guarda dados formatados { collection, attribute, labels, data }

    selectedCompatibleFeatures.forEach(feature => {
        const collection = feature.collection;
        const availableAttributes = attributesMap.get(collection); // Pega atributos relevantes do mapa

        if (availableAttributes?.length > 0) {
            availableAttributes.forEach(attribute => {
                const promise = fetchTimeSeriesData(collection, coords.lat, coords.lon, startDate, endDate, attribute) //
                    .then(timeSeriesResult => {
                        if (timeSeriesResult?.timeline?.length > 0) { // Verifica se timeline existe e não está vazia
                            const labels = timeSeriesResult.timeline.map(p => p.date);
                            const data = timeSeriesResult.timeline.map(p => p.value);
                            chartDataConfigs.push({ collection, attribute, labels, data });
                        } else {
                            console.warn(`Série temporal ${attribute} para ${collection} retornou vazia ou inválida.`);
                        }
                    })
                    .catch(error => { // Erro já é logado/alertado em fetchTimeSeriesData
                        // Apenas evita que a falha de uma busca impeça as outras
                    });
                timeSeriesPromises.push(promise);
            });
        }
    });

    await Promise.allSettled(timeSeriesPromises); // Espera todas as buscas de séries temporais

    // --- PASSO 3: Renderizar os gráficos ---
    const loadingMessage = chartsContainer.querySelector('.loading-message');
    if (loadingMessage) loadingMessage.remove(); // Remove o "Carregando..." //

    if (chartDataConfigs.length === 0) {
        chartsContainer.innerHTML = `<p class="info-message" style="text-align: center; padding: 20px; color: orange;">Nenhum dado de série temporal (${RELEVANT_ATTRIBUTES.join('/')}) encontrado para os itens selecionados no período especificado. Verifique o console.</p>`;
        return;
    }

    // Agrupa dados por ATRIBUTO (NDVI, EVI)
    const chartsByAttribute = new Map<string, any[]>();
    chartDataConfigs.forEach(config => {
        const key = config.attribute.toUpperCase();
        if (!chartsByAttribute.has(key)) chartsByAttribute.set(key, []);
        chartsByAttribute.get(key)?.push(config);
    });

    // Cria um gráfico para cada atributo
    chartsByAttribute.forEach((configsForAttribute, attributeName) => {
        const chartCanvas = document.createElement('canvas'); //
        chartCanvas.style.maxHeight = '350px'; // Altura máxima
        chartCanvas.style.marginBottom = '25px'; // Espaço entre gráficos
        chartsContainer.appendChild(chartCanvas); // Adiciona ao modal //

        // Monta os datasets (linhas) para este gráfico
        const datasets = configsForAttribute.map((config, index) => ({
            label: config.collection, // Legenda = Nome da coleção
            data: config.data.map((value, idx) => ({ x: config.labels[idx], y: value })), // Formato {x: date, y: value}
            borderColor: getRandomColor(index),
            backgroundColor: getRandomColor(index), // Para pontos
            tension: 0.1,
            fill: false,
            spanGaps: true, // Conecta através de pontos nulos
            pointRadius: 3, // Tamanho dos pontos
            pointHoverRadius: 5 // Tamanho ao passar o mouse
        }));

        // Pega as labels (datas) da primeira série (assumindo que são as mesmas)
        const labels = configsForAttribute[0]?.labels || [];

        // Cria o gráfico
        const chart = new Chart(chartCanvas.getContext('2d')!, {
            type: 'line',
            data: {
                // labels: labels, // Usar labels aqui se scale X for 'category'
                datasets: datasets // Passa os dados no formato {x, y}
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Série Temporal - ${attributeName}`, font: { size: 16 } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        type: 'category', // Mais simples para strings 'YYYY-MM-DD'
                        labels: labels, // Fornece as labels aqui para 'category'
                        // type: 'time', // Requer adaptador de data e labels como Date objects
                        // time: { unit: 'month' }, // Exemplo se usar TimeScale
                        title: { display: true, text: 'Data' }
                    },
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Valor' },
                        // min: -1, max: 1 // Descomente e ajuste se necessário (ex: NDVI)
                    }
                },
                interaction: { mode: 'index', axis: 'x', intersect: false }
            }
        }); //
        activeCharts.push(chart); //
    });
}

/**
 * Função auxiliar para obter cores distintas para as linhas do gráfico.
 */
function getRandomColor(index: number): string {
    const colors = [
        'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)',
        'rgb(255, 205, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
        'rgb(201, 203, 207)' // Cinza
    ];
    return colors[index % colors.length];
}