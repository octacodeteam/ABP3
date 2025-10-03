// Em frontend/src/chart.ts

import { Chart, registerables } from 'chart.js';
import { fetchTimeSeriesData } from './apiService';

Chart.register(...registerables);

let activeCharts: Chart[] = [];

export async function renderComparisonCharts(selectedItems: any[], coords: { lat: number, lon: number }) {
    const chartsContainer = document.getElementById('charts-container');
    const modal = document.getElementById('chart-modal');
    if (!chartsContainer || !modal) return;

    chartsContainer.innerHTML = '<p class="loading-message">Carregando dados dos gráficos...</p>';
    activeCharts.forEach(chart => chart.destroy());
    activeCharts = [];

    modal.style.display = 'flex';

    const chartPromises = selectedItems.map(async (item) => {
        const timeSeries = await fetchTimeSeriesData(item.collection, coords.lat, coords.lon);
        const canvas = document.createElement('canvas');
        chartsContainer.appendChild(canvas);

        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: timeSeries.timeline,
                datasets: [{
                    label: `NDVI`, // A legenda da linha em si
                    data: timeSeries.values,
                    borderColor: `rgba(${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, 1)`,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: `Coleção: ${item.collection}`, // Título principal do gráfico
                        font: { size: 16 }
                    }
                },
                // --- INÍCIO DA MUDANÇA: Adicionando títulos aos eixos ---
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Data' // Título do Eixo X
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Valor do NDVI' // Título do Eixo Y
                        }
                    }
                }
                // --- FIM DA MUDANÇA ---
            }
        });
        activeCharts.push(chart);
    });

    await Promise.all(chartPromises);

    const loadingMessage = chartsContainer.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}