import { mapManager } from './map';

function setupSidebarToggle(): void {
    // Acessamos o container aqui, garantindo que o DOM já carregou
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-sidebar');
    const mainContent = document.getElementById('main-content');

    if (!toggleButton || !container || !mainContent) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        container.classList.toggle('sidebar-hidden');
        mapManager.invalidateSize();
    });

    mainContent.addEventListener('click', () => {
        if (window.innerWidth <= 768 && container.classList.contains('sidebar-visible')) {
            container.classList.remove('sidebar-visible');
            mapManager.invalidateSize();
        }
    });
}

export function showLoading(isLoading: boolean): void {
    const resultsList = document.getElementById('results-list');
    const container = document.querySelector('.container');
    if (!resultsList || !container) return;

    if (isLoading) {
        container.classList.remove('results-hidden');
        resultsList.innerHTML = '<p class="loading-message">Buscando dados...</p>';
        mapManager.invalidateSize();
    }
}

export function displayResults(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    const container = document.querySelector('.container');
    if (!resultsList || !container) return;

    resultsList.innerHTML = '';

    if (features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado.</p>';
        return;
    }

    features.forEach(feature => {
        const collection = feature.collection;
        const date = new Date(feature.properties.datetime).toLocaleDateString('pt-BR');
        const cloudCover = feature.properties['eo:cloud_cover'];

        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <h4>${collection || 'Coleção não informada'}</h4>
            <p>Data: ${date}</p>
            ${cloudCover !== null ? `<p>Nuvens: ${cloudCover.toFixed(2)}%</p>` : ''}
        `;
        resultsList.appendChild(item);
    });
}

export function initializeUI(): void {
    setupSidebarToggle();
}