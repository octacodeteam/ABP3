// Copie e cole este código completo para substituir o seu arquivo ui.ts
import  {renderComparisonCharts}  from '../src/chart'
import { mapManager } from './map'; // Import necessário para o mapa se mover

let allFeatures: any[] = [];

// --- SETUP DAS FUNCIONALIDADES DA PÁGINA ---

function setupSidebarToggle(): void {
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-sidebar');
    if (!toggleButton || !container) return;

    toggleButton.addEventListener('click', () => {
        container.classList.toggle('sidebar-hidden');
    });
}

function setupFilters(): void {
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        // CORREÇÃO: Pegando as duas datas para o filtro de período
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

        const selectedCollection = collectionFilter.value;
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;

        let filteredFeatures = allFeatures;

        if (selectedCollection) {
            filteredFeatures = filteredFeatures.filter(f => f.collection === selectedCollection);
        }

        // Lógica de filtro por período
        if (startDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] >= startDate);
        }
        if (endDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] <= endDate);
        }
        renderResultsList(filteredFeatures);
    });
}

// =======================================================
// INÍCIO DO CÓDIGO CORRIGIDO/ADICIONADO
// =======================================================

/**
 * Busca as coordenadas geográficas de um local e move o mapa.
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

    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Falha na resposta da rede.');
        
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            // Chama o método no map.ts para mover o mapa
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

function setupModal(): void {
    const modal = document.getElementById('comparison-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (!modal || !closeModalBtn) return;

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

export function setupCompareLogic(coords: { lat: number, lon: number }): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const graf = document.getElementById('graf') as HTMLButtonElement;
    const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
    const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

    if (!resultsList || !compareBtn) return;

    resultsList.onchange = (event) => {
        if ((event.target as HTMLElement).classList.contains('compare-checkbox')) {
            const checkedBoxes = resultsList.querySelectorAll('.compare-checkbox:checked');
            compareBtn.disabled = checkedBoxes.length < 2;
        }
    };

    compareBtn.onclick = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedIds: string[] = [];
        checkedBoxes.forEach(checkbox => {
            if (checkbox.dataset.id) selectedIds.push(checkbox.dataset.id);
        });
        displayComparisonTable(selectedIds);
    };

    graf.onclick = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedIds: string[] = [];
        checkedBoxes.forEach(checkbox => {
            if (checkbox.dataset.id) selectedIds.push(checkbox.dataset.id);
        });
        renderComparisonCharts(selectedIds, coords, startDateFilter.value, endDateFilter.value);
    };
}

// Adicionando função para limpar filtros
function setupClearFilters(): void {
    const clearBtn = document.getElementById('clear-filters-btn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
        // 1. Limpa os valores dos campos de filtro
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

        collectionFilter.value = '';
        startDateFilter.value = '';
        endDateFilter.value = '';

        // 2. Renderiza a lista novamente com todos os resultados originais
        renderResultsList(allFeatures);
    });
}

// --- FUNÇÕES DE RENDERIZAÇÃO E DADOS ---

function displayComparisonTable(selectedIds: string[]): void {
    const container = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');
    if (!container || !modal) return;

    const itemsToCompare = allFeatures.filter(feature => selectedIds.includes(feature.id));
    if (itemsToCompare.length === 0) return;

    let tableHTML = '<table border="1" style="width:100%; border-collapse: collapse; text-align: center; font-size: 0.9rem;">';
    tableHTML += '<thead><tr style="background-color: #f2f2f2;"><th>Propriedade</th>';
    itemsToCompare.forEach((item) => {
        tableHTML += `<th style="padding: 8px;">${item.collection || 'Item'}</th>`;
    });
    tableHTML += '</tr></thead>';

    const propertiesToCompare = [
        { name: 'Coleção', path: 'collection' },
        { name: 'Data', path: 'properties.datetime', format: (d: string) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) },
        { name: 'Nuvens (%)', path: 'properties.eo:cloud_cover', format: (c: number) => c?.toFixed(2) ?? 'N/A' },
    ];

    tableHTML += '<tbody>';
    propertiesToCompare.forEach(prop => {
        tableHTML += `<tr><td style="padding: 8px; font-weight: bold; text-align: left;">${prop.name}</td>`;
        itemsToCompare.forEach(item => {
            const value = prop.path.split('.').reduce((o, i) => o?.[i], item) ?? 'N/A';
            const formattedValue = prop.format ? prop.format(value) : value;
            tableHTML += `<td style="padding: 8px;">${formattedValue}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    container.innerHTML = tableHTML;
    modal.style.display = 'flex';
}

function renderResultsList(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    resultsList.innerHTML = '';
    if (features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado.</p>';
        return;
    }

    features.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-item-header">
                <h4>${feature.collection || 'Coleção não informada'}</h4>
                <input type="checkbox" class="compare-checkbox" data-id="${feature.id}">
            </div>
            <p>Data: ${new Date(feature.properties.datetime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        `;
        resultsList.appendChild(item);
    });
}

function populateCollectionFilter(features: any[]): void {
    const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
    if (!collectionFilter) return;
    const collections = [...new Set(features.map(f => f.collection))].filter(Boolean);
    collectionFilter.innerHTML = '<option value="">Todas as Coleções</option>';
    collections.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        collectionFilter.appendChild(option);
    });
}

export function showLoading(isLoading: boolean): void {
    const resultsList = document.getElementById('results-list');
    const container = document.querySelector('.container');
    if (!resultsList || !container) return;
    if (isLoading) {
        container.classList.remove('results-hidden');
        resultsList.innerHTML = '<p class="loading-message">Buscando dados...</p>';
    }
}

export function displayResults(features: any[]): void {
    allFeatures = features;
    populateCollectionFilter(features);
    renderResultsList(features);
}

export function initializeUI(): void {
    setupSidebarToggle();
    setupFilters();
    setupModal();
    setupLocationSearch();
    setupClearFilters();
}