// arquivo: frontend/src/ui.ts

import { mapManager } from './map';
import { renderComparisonCharts } from './chart'; // Importa a função que criará os gráficos

// Guarda a lista completa de resultados para ser usada pelos filtros
let allFeatures: any[] = [];

/**
 * Configura os eventos do menu hambúrguer para mostrar/esconder a sidebar de filtros.
 */
function setupSidebarToggle(): void {
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

/**
 * Configura o evento de clique do botão "Aplicar Filtros".
 */
function setupFilters(): void {
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const dateFilter = document.getElementById('date-filter') as HTMLInputElement;

        const selectedCollection = collectionFilter.value;
        const selectedDate = dateFilter.value;

        let filteredFeatures = allFeatures;

        if (selectedCollection) {
            filteredFeatures = filteredFeatures.filter(feature => feature.collection === selectedCollection);
        }

        if (selectedDate) {
            filteredFeatures = filteredFeatures.filter(feature => {
                const featureDate = new Date(feature.properties.datetime).toISOString().split('T')[0];
                return featureDate === selectedDate;
            });
        }

        renderResultsList(filteredFeatures);
    });
}

// =======================================================
// INÍCIO DO CÓDIGO ADICIONADO
// =======================================================

/**
 * Busca as coordenadas geográficas de um local usando a API Nominatim.
 */
async function handleLocationSearch(): Promise<void> {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn') as HTMLButtonElement;
    const locationQuery = searchInput.value;

    if (!locationQuery) {
        alert('Por favor, digite um local para pesquisar.');
        return;
    }

    searchBtn.textContent = 'Buscando...';
    searchBtn.disabled = true;

    // API Gratuita do OpenStreetMap para transformar texto em coordenadas
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Falha na resposta da rede.');
        
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            mapManager.panToLocation(parseFloat(lat), parseFloat(lon));
        } else {
            alert('Local não encontrado. Tente ser mais específico.');
        }
    } catch (error) {
        console.error('Erro ao buscar localização:', error);
        alert('Ocorreu um erro ao buscar a localização.');
    } finally {
        searchBtn.textContent = 'Buscar Local';
        searchBtn.disabled = false;
    }
}

/**
 * Configura o evento de clique do botão de busca por local.
 */
function setupLocationSearch(): void {
    const searchBtn = document.getElementById('location-search-btn');
    if (!searchBtn) return;

    searchBtn.addEventListener('click', handleLocationSearch);
}

// =======================================================
// FIM DO CÓDIGO ADICIONADO
// =======================================================

/**
 * Configura os eventos para a funcionalidade de comparação (checkboxes e botão).
 */
export function setupCompareLogic(coords: { lat: number, lon: number }): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;

    if (!resultsList || !compareBtn) return;

    resultsList.onchange = (event) => {
        if ((event.target as HTMLElement).classList.contains('compare-checkbox')) {
            const checkedBoxes = resultsList.querySelectorAll('.compare-checkbox:checked');
            compareBtn.disabled = checkedBoxes.length < 2;
        }
    };

    compareBtn.onclick = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedItems: any[] = [];
        checkedBoxes.forEach(checkbox => {
            selectedItems.push({
                collection: checkbox.dataset.collection,
                datetime: checkbox.dataset.datetime,
            });
        });
        renderComparisonCharts(selectedItems, coords);
    };
}

/**
 * Configura o botão para fechar o modal dos gráficos.
 */
function setupModal(): void {
    const modal = document.getElementById('chart-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (!modal || !closeModalBtn) return;

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

/**
 * Mostra a mensagem de "carregando" na sidebar de resultados.
 */
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

/**
 * Renderiza a lista de itens de resultado na sidebar da direita.
 */
function renderResultsList(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    resultsList.innerHTML = '';

    if (features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado com esses filtros.</p>';
        return;
    }

    features.forEach(feature => {
        const collection = feature.collection;
        const date = new Date(feature.properties.datetime).toLocaleDateString('pt-BR');
        const cloudCover = feature.properties['eo:cloud_cover'];
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-item-header">
                <h4>${collection || 'Coleção não informada'}</h4>
                <input 
                    type="checkbox" 
                    class="compare-checkbox" 
                    data-collection="${collection}"
                    data-datetime="${feature.properties.datetime}"
                >
            </div>
            <p>Data: ${date}</p>
            ${cloudCover !== null ? `<p>Nuvens: ${cloudCover.toFixed(2)}%</p>` : ''}
        `;
        resultsList.appendChild(item);
    });
}

/**
 * Popula o dropdown de filtro de coleções com base nos resultados da busca.
 */
function populateCollectionFilter(features: any[]): void {
    const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
    if (!collectionFilter) return;

    const collections = [...new Set(features.map(feature => feature.collection))].filter(Boolean);

    while (collectionFilter.options.length > 1) {
        collectionFilter.remove(1);
    }

    collections.forEach(collectionName => {
        const option = document.createElement('option');
        option.value = collectionName;
        option.textContent = collectionName;
        collectionFilter.appendChild(option);
    });
}

/**
 * Função principal que recebe os dados da API, guarda, e chama as funções de renderização.
 */
export function displayResults(features: any[]): void {
    allFeatures = features;
    populateCollectionFilter(features);
    renderResultsList(features);
}

/**
 * Inicializa os componentes estáticos da UI.
 */
export function initializeUI(): void {
    setupSidebarToggle();
    setupFilters();
    setupModal();
    setupLocationSearch(); // <-- Adiciona a inicialização do novo filtro
}
