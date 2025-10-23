// Em frontend/src/chart.ts

import { Chart, registerables } from 'chart.js';
import { fetchTimeSeriesData } from './apiService';

Chart.register(...registerables);

let activeCharts: Chart[] = [];

export async function renderComparisonCharts(
    selectedItems: any[],
    coords: { lat: number, lon: number },
    startDate: string,
    endDate: string

) {
    console.log("entrou");
    console.log(selectedItems, coords, startDate, endDate);
    // ... (o início da função continua igual)
    const chartsContainer = document.getElementById('charts-container');
    const modal = document.getElementById('chart-modal');
    if (!chartsContainer || !modal) return;

    chartsContainer.innerHTML = '<p class="loading-message">Carregando dados reais dos gráficos...</p>';
    activeCharts.forEach(chart => chart.destroy());
    activeCharts = [];

    modal.style.display = 'flex';

    const chartPromises = selectedItems.map(async (item) => {
        // --- MUDANÇA AQUI: Passando as datas para a chamada da API ---
        const timeSeries = await fetchTimeSeriesData(item.collection, coords.lat, coords.lon, startDate, endDate);

        if (!timeSeries) return;

        // ... (o resto da função para criar o gráfico continua igual)
        const canvas = document.createElement('canvas');
        // ...
    });

    await Promise.all(chartPromises);

    const loadingMessage = chartsContainer.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}