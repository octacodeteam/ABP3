// frontend/src/ui.ts
import { mapManager } from './map';
import { renderComparisonCharts, clearActiveCharts } from './chart';

// Guarda a lista completa de features recebida da API STAC
let allFeatures: any[] = [];

// Lista de coleções que SABEMOS serem compatíveis com WTSS (deve ser a mesma do backend e chart.ts)
const WTSS_COMPATIBLE_COLLECTIONS = [
    'S2-16D-2', 'LC8-16D-1', 'LC9-16D-1', 'MOD13Q1-6',
];

// Variável para manter a última requisição de gráficos (para o botão "Aplicar" do modal)
let lastChartRequest: {
    features: any[] | null,
    coords: { lat: number, lon: number } | null,
    startDate: string | null,
    endDate: string | null
} = { features: null, coords: null, startDate: null, endDate: null };

// --- SETUP DAS FUNCIONALIDADES DA PÁGINA ---

function setupSidebarToggle(): void {
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-sidebar');
    if (!toggleButton || !container) return;
    toggleButton.addEventListener('click', () => {
        container.classList.toggle('sidebar-hidden');
        mapManager.invalidateSize();
    });
}

function setupFilters(): void {
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!applyBtn) return;
    applyBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;
        const selectedCollection = collectionFilter.value;
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;

        let filteredFeatures = allFeatures;
        if (selectedCollection) {
            filteredFeatures = filteredFeatures.filter(f => f.collection === selectedCollection);
        }
        if (startDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] >= startDate);
        }
        if (endDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] <= endDate);
        }
        renderResultsList(filteredFeatures);
    });
}

function setupClearFilters(): void {
    const clearBtn = document.getElementById('clear-filters-btn');
    if (!clearBtn) return;
    clearBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;
        const locationInput = document.getElementById('location-search-input') as HTMLInputElement;

        collectionFilter.value = '';
        startDateFilter.value = '';
        endDateFilter.value = '';
        locationInput.value = '';

        renderResultsList(allFeatures);
    });
}

async function handleLocationSearch(): Promise<void> {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn') as HTMLButtonElement;
    const locationQuery = searchInput.value.trim();

    if (!locationQuery) {
        alert('Por favor, digite um local para pesquisar.');
        return;
    }

    searchBtn.textContent = 'Buscando...';
    searchBtn.disabled = true;
    const apiUrl = `/api/geocode?query=${encodeURIComponent(locationQuery)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Erro ${response.status}`);

        console.log(`Local encontrado: ${data.display_name}`);
        mapManager.panToLocation(data.lat, data.lon);
    } catch (error: any) {
        console.error('Erro ao buscar localização via backend:', error);
        alert(`Erro ao buscar localização: ${error.message || 'Erro desconhecido'}`);
    } finally {
        searchBtn.textContent = 'Buscar Local';
        searchBtn.disabled = false;
    }
}

function setupLocationSearch(): void {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn');
    if (!searchBtn || !searchInput) return;
    searchBtn.addEventListener('click', handleLocationSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleLocationSearch();
    });
}

function setupModal(): void {
    const modal = document.getElementById('comparison-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const container = document.getElementById('comparison-container');
    const applyAttributesBtn = document.getElementById('apply-attributes');

    if (!modal || !closeModalBtn || !container) return;

    const closeModal = () => {
        modal.style.display = 'none';
        container.innerHTML = '';
        // Limpa gráficos do chart.ts
        clearActiveCharts();
        // limpa lastChartRequest? mantemos para permitir reabertura se necessário
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // Aplica os atributos selecionados (botão dentro do modal)
    if (applyAttributesBtn) {
        applyAttributesBtn.addEventListener('click', async () => {
            // Lê atributos selecionados no seletor
            const selectEl = document.getElementById('attribute-select') as HTMLSelectElement | null;
            const selectedAttrs = selectEl ? Array.from(selectEl.selectedOptions).map(o => o.value) : ['NDVI', 'EVI'];

            // Se tivermos uma requisição anterior, reexecuta com os novos atributos
            if (lastChartRequest.features && lastChartRequest.coords && lastChartRequest.startDate && lastChartRequest.endDate) {
                // Re-renderiza com os atributos escolhidos
                await renderComparisonCharts(lastChartRequest.features, lastChartRequest.coords, lastChartRequest.startDate, lastChartRequest.endDate, selectedAttrs);
            } else {
                // Caso não haja requisição anterior (raro), apenas fecha ou mostra alerta
                alert('Nenhuma seleção ativa para aplicar. Gere gráficos primeiro pelo botão "Grafico".');
            }
        });
    }
}

/**
 * Atualiza o estado (habilitado/desabilitado) dos botões Comparar e Gráfico.
 */
function updateButtonStates(): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement;

    if (!resultsList || !compareBtn || !grafBtn) return;

    const checkedEnabledCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked:not([disabled])');
    const allCheckedCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
    compareBtn.disabled = allCheckedCheckboxes.length < 2;
    grafBtn.disabled = checkedEnabledCheckboxes.length === 0;
}

/**
 * Configura botões e lógica de seleção, garantindo que o botão gráfico só considere itens compatíveis e valide datas.
 * coords é fornecido pelo mapManager (ponto clicado / pesquisa de localização)
 */
export function setupCompareLogic(coords: { lat: number, lon: number }): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement;
    const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
    const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

    if (!resultsList || !compareBtn || !grafBtn || !startDateFilter || !endDateFilter) {
        console.error("Elementos #results-list, #compare-btn, #graf, #date-filter-start ou #date-filter-end não encontrados.");
        return;
    }

    resultsList.addEventListener('input', (event) => {
        if ((event.target as HTMLElement).classList.contains('compare-checkbox')) {
            updateButtonStates();
        }
    });

    compareBtn.onclick = () => {
        const allCheckedCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedIds = Array.from(allCheckedCheckboxes)
                                 .map(cb => cb.dataset.id).filter(Boolean) as string[];
        if (selectedIds.length >= 2) {
            displayComparisonTable(selectedIds);
        } else {
             alert("Selecione pelo menos dois itens para comparar na tabela.");
        }
    };

    grafBtn.onclick = async () => {
        // Validação de datas
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;

        if (!startDate || !endDate) {
            alert("Por favor, selecione uma Data de Início e uma Data de Fim para gerar o gráfico.");
            return;
        }
        if (startDate > endDate) {
            alert("A Data de Início não pode ser posterior à Data de Fim.");
            return;
        }

        // Seleciona APENAS checkboxes MARCADOS e HABILITADOS
        const checkedEnabledCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked:not([disabled])');
        const selectedIds = Array.from(checkedEnabledCheckboxes)
                                 .map(cb => cb.dataset.id).filter(Boolean) as string[];

        // Filtra 'allFeatures' pelos IDs selecionados (já garantidos como compatíveis)
        const selectedCompatibleFeatures = allFeatures.filter(feature => selectedIds.includes(feature.id));

        if (selectedCompatibleFeatures.length > 0) {
            // Lê atributos selecionados no seletor do modal (caso o modal já exista no DOM)
            const selectEl = document.getElementById('attribute-select') as HTMLSelectElement | null;
            const selectedAttrs = selectEl ? Array.from(selectEl.selectedOptions).map(o => o.value) : ['NDVI', 'EVI'];

            // Salva a última requisição para o botão "Aplicar" do modal
            lastChartRequest = {
                features: selectedCompatibleFeatures,
                coords,
                startDate,
                endDate
            };

            console.log("Chamando renderComparisonCharts com features COMPATÍVEIS:", selectedCompatibleFeatures);
            await renderComparisonCharts(selectedCompatibleFeatures, coords, startDate, endDate, selectedAttrs);
        } else {
            alert("Nenhum item compatível com gráfico foi selecionado.");
        }
    };

    // Garante estado inicial desabilitado ao configurar
    compareBtn.disabled = true;
    grafBtn.disabled = true;
}

/**
 * Exibe uma tabela comparativa no modal.
 */
function displayComparisonTable(selectedIds: string[]): void {
    const container = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');
    if (!container || !modal) return;

    const itemsToCompare = allFeatures.filter(feature => selectedIds.includes(feature.id));
    if (itemsToCompare.length < 2) return;

    container.innerHTML = '';

    const propertiesToCompare = [
        { name: 'Coleção', path: 'collection' },
        { name: 'Data', path: 'properties.datetime', format: (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A' },
        { name: 'Nuvens (%)', path: 'properties.eo:cloud_cover', format: (c: number | null | undefined) => (c != null && !isNaN(c)) ? c.toFixed(2) : 'N/A' },
    ];

    let tableHTML = '<table class="comparison-table" border="1" style="width:100%; border-collapse: collapse; text-align: center; font-size: 0.9rem;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px;">Propriedade</th>';
    itemsToCompare.forEach(item => { tableHTML += `<th style="padding: 8px; word-break: break-all;">${item.collection || item.id}</th>`; });
    tableHTML += '</tr></thead><tbody>';
    propertiesToCompare.forEach(prop => {
        tableHTML += `<tr><td style="padding: 8px; font-weight: bold; text-align: left;">${prop.name}</td>`;
        itemsToCompare.forEach(item => {
            const value = prop.path.split('.').reduce((o, i) => (o && typeof o === 'object' && o !== null) ? (o as any)[i] : undefined, item);
            const formattedValue = prop.format ? prop.format(value) : (value ?? 'N/A');
            tableHTML += `<td style="padding: 8px;">${formattedValue}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    container.innerHTML = tableHTML;
    modal.style.display = 'flex';
}

/**
 * Renderiza a lista, desabilita checkbox e mostra aviso para itens não compatíveis com WTSS.
 */
function renderResultsList(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    resultsList.innerHTML = '';

    if (!Array.isArray(features) || features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado para este local ou filtros aplicados.</p>';
        updateButtonStates();
        return;
    }

    features.forEach(feature => {
        const item = document.createElement('div');
        const isWtssCompatible = feature.properties?.isWtssCompatible === true || WTSS_COMPATIBLE_COLLECTIONS.includes(feature.collection);

        item.className = `result-item ${!isWtssCompatible ? 'disabled' : ''}`;
        item.title = isWtssCompatible ? `Coleção ${feature.collection}` : `Coleção ${feature.collection} (não compatível com gráficos WTSS)`;

        item.innerHTML = `
            <div class="result-item-header">
                <h4>${feature.collection || 'Coleção Indefinida'}</h4>
                <input
                    type="checkbox"
                    class="compare-checkbox"
                    data-id="${feature.id}"
                    ${!isWtssCompatible ? 'disabled title="Não é possível gerar gráfico para esta coleção"' : ''}
                >
            </div>
            <p>Data: ${feature.properties.datetime ? new Date(feature.properties.datetime).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
            ${!isWtssCompatible ? '<p class="incompatible-warning">(Não gera gráfico)</p>' : ''} `;
        resultsList.appendChild(item);
    });

    updateButtonStates();
}

function populateCollectionFilter(features: any[]): void {
    const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
    if (!collectionFilter) return;
    const currentSelection = collectionFilter.value;
    const collections = [...new Set(features.map(f => f.collection).filter(Boolean))].sort();
    while (collectionFilter.options.length > 1) collectionFilter.remove(1);
    collections.forEach(name => {
        const option = document.createElement('option');
        option.value = name; option.textContent = name;
        collectionFilter.appendChild(option);
    });
    collectionFilter.value = collections.includes(currentSelection) ? currentSelection : "";
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
    setupClearFilters();
    setupModal();
    setupLocationSearch();
}
