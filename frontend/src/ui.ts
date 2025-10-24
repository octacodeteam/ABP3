// frontend/src/ui.ts
import { mapManager } from './map'; //
import { renderComparisonCharts } from './chart';

// Guarda a lista completa de features recebida da API STAC
let allFeatures: any[] = []; //

// Lista de coleções que SABEMOS serem compatíveis com WTSS (deve ser a mesma do backend e chart.ts)
const WTSS_COMPATIBLE_COLLECTIONS = [
    'S2-16D-2', 'LC8-16D-1', 'LC9-16D-1', 'MOD13Q1-6',
    // Adicione outros cubos de dados se necessário
];

// --- SETUP DAS FUNCIONALIDADES DA PÁGINA ---

function setupSidebarToggle(): void {
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-sidebar');
    if (!toggleButton || !container) return;
    toggleButton.addEventListener('click', () => {
        container.classList.toggle('sidebar-hidden');
        mapManager.invalidateSize(); //
    });
} //

function setupFilters(): void {
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!applyBtn) return;
    applyBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;
        const selectedCollection = collectionFilter.value; //
        const startDate = startDateFilter.value; //
        const endDate = endDateFilter.value; //

        let filteredFeatures = allFeatures; //
        if (selectedCollection) {
            filteredFeatures = filteredFeatures.filter(f => f.collection === selectedCollection); //
        }
        if (startDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] >= startDate); //
        }
        if (endDate) {
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] <= endDate); //
        }
        renderResultsList(filteredFeatures); //
    });
} //

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

        renderResultsList(allFeatures); // Renderiza a lista original completa
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
        mapManager.panToLocation(data.lat, data.lon); // Move o mapa E busca dados STAC //
    } catch (error: any) {
        console.error('Erro ao buscar localização via backend:', error);
        alert(`Erro ao buscar localização: ${error.message || 'Erro desconhecido'}`);
    } finally {
        searchBtn.textContent = 'Buscar Local';
        searchBtn.disabled = false;
    }
} //

function setupLocationSearch(): void {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn');
    if (!searchBtn || !searchInput) return;
    searchBtn.addEventListener('click', handleLocationSearch); //
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleLocationSearch();
    });
} //

function setupModal(): void {
    const modal = document.getElementById('comparison-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const container = document.getElementById('comparison-container'); // Pega o container também

    if (!modal || !closeModalBtn || !container) return;

    const closeModal = () => {
        modal.style.display = 'none'; //
        container.innerHTML = ''; // Limpa o conteúdo (tabela ou gráficos)
        activeCharts.forEach(chart => chart.destroy()); // Garante que gráficos sejam destruídos
        activeCharts = [];
    };

    closeModalBtn.addEventListener('click', closeModal); //
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(); // Fecha clicando fora //
    });

} //

/**
 * Atualiza o estado (habilitado/desabilitado) dos botões Comparar e Gráfico.
 * Deve ser chamada sempre que um checkbox muda ou a lista é renderizada.
 */
function updateButtonStates(): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement; // Certifique-se que o ID é 'graf'

    if (!resultsList || !compareBtn || !grafBtn) return; // Sai se os elementos não existirem

    // Seleciona APENAS checkboxes que NÃO ESTÃO desabilitados
    // const enabledCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:not([disabled])'); // Não usado diretamente, mas útil para debug
    const checkedEnabledCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked:not([disabled])');

    // Botão Comparar (Tabela): Precisa de pelo menos 2 marcados (podem ser compatíveis ou não)
    const allCheckedCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
    compareBtn.disabled = allCheckedCheckboxes.length < 2;

    // Botão Gráfico: Precisa de pelo menos 1 MARCADO e HABILITADO (compatível com WTSS)
    grafBtn.disabled = checkedEnabledCheckboxes.length === 0;
}


/**
 * MODIFICADO: Configura botões e lógica de seleção, garantindo que o botão gráfico só considere itens compatíveis e valide datas.
 */
export function setupCompareLogic(coords: { lat: number, lon: number }): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement; // ID 'graf'
    const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
    const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

    if (!resultsList || !compareBtn || !grafBtn || !startDateFilter || !endDateFilter) { // Verifica também os inputs de data
        console.error("Elementos #results-list, #compare-btn, #graf, #date-filter-start ou #date-filter-end não encontrados.");
        return;
    }

    // Listener para mudanças nos checkboxes (delegação de evento)
    resultsList.addEventListener('input', (event) => {
        if ((event.target as HTMLElement).classList.contains('compare-checkbox')) {
            updateButtonStates(); // Atualiza os botões sempre que um checkbox muda
        }
    });

    // Ação do Botão Comparar (Tabela)
    compareBtn.onclick = () => {
        const allCheckedCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedIds = Array.from(allCheckedCheckboxes)
                                 .map(cb => cb.dataset.id).filter(Boolean) as string[];
        if (selectedIds.length >= 2) {
            displayComparisonTable(selectedIds); //
        } else {
             alert("Selecione pelo menos dois itens para comparar na tabela.");
        }
    }; //

    // Ação do Botão Gráfico
    grafBtn.onclick = () => {
        // --- VALIDAÇÃO DE DATAS ---
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
        // --- FIM DA VALIDAÇÃO ---

        // Seleciona APENAS checkboxes MARCADOS e HABILITADOS
        const checkedEnabledCheckboxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked:not([disabled])');
        const selectedIds = Array.from(checkedEnabledCheckboxes)
                                 .map(cb => cb.dataset.id).filter(Boolean) as string[];

        // Filtra 'allFeatures' pelos IDs selecionados (já garantidos como compatíveis)
        const selectedCompatibleFeatures = allFeatures.filter(feature => selectedIds.includes(feature.id));

        if (selectedCompatibleFeatures.length > 0) {
            console.log("Chamando renderComparisonCharts com features COMPATÍVEIS:", selectedCompatibleFeatures);
            renderComparisonCharts(selectedCompatibleFeatures, coords, startDate, endDate); //
        } else {
            // Este alerta só deve aparecer se a lógica de updateButtonStates falhar
            alert("Nenhum item compatível com gráfico foi selecionado."); //
        }
    }; //

    // Garante estado inicial desabilitado ao configurar
    compareBtn.disabled = true; //
    grafBtn.disabled = true;
} //

/**
 * Exibe uma tabela comparativa no modal.
 */
function displayComparisonTable(selectedIds: string[]): void {
    const container = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');
    if (!container || !modal) return;

    const itemsToCompare = allFeatures.filter(feature => selectedIds.includes(feature.id));
    if (itemsToCompare.length < 2) return;

    container.innerHTML = ''; // Limpa antes de adicionar

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
    modal.style.display = 'flex'; // Mostra o modal com a tabela //
} //

/**
 * MODIFICADO: Renderiza a lista, desabilita checkbox e mostra aviso para itens não compatíveis com WTSS.
 */
function renderResultsList(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return; // Sai se a lista não existir
    resultsList.innerHTML = ''; // Limpa a lista anterior //

    if (!Array.isArray(features) || features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado para este local ou filtros aplicados.</p>';
         updateButtonStates(); // Atualiza botões mesmo se lista estiver vazia (para desabilitá-los)
        return;
    }

    features.forEach(feature => {
        const item = document.createElement('div');
        // Verifica compatibilidade usando a flag do backend OU a lista local
        const isWtssCompatible = feature.properties?.isWtssCompatible === true || WTSS_COMPATIBLE_COLLECTIONS.includes(feature.collection);

        item.className = `result-item ${!isWtssCompatible ? 'disabled' : ''}`; // Adiciona classe CSS se não compatível
        item.title = isWtssCompatible ? `Coleção ${feature.collection}` : `Coleção ${feature.collection} (não compatível com gráficos WTSS)`;

        item.innerHTML = `
            <div class="result-item-header">
                <h4>${feature.collection || 'Coleção Indefinida'}</h4>
                <input
                    type="checkbox"
                    class="compare-checkbox"
                    data-id="${feature.id}"
                    ${!isWtssCompatible ? 'disabled title="Não é possível gerar gráfico para esta coleção"' : ''}  /* Desabilita e adiciona dica */
                >
            </div>
            <p>Data: ${feature.properties.datetime ? new Date(feature.properties.datetime).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
            ${!isWtssCompatible ? '<p class="incompatible-warning">(Não gera gráfico)</p>' : ''} `; //
        resultsList.appendChild(item);
    });

    updateButtonStates(); // Atualiza o estado dos botões após renderizar a lista
} //


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
    collectionFilter.value = collections.includes(currentSelection) ? currentSelection : ""; //
} //

export function showLoading(isLoading: boolean): void {
    const resultsList = document.getElementById('results-list');
    const container = document.querySelector('.container');
    if (!resultsList || !container) return;
    if (isLoading) {
        container.classList.remove('results-hidden'); //
        resultsList.innerHTML = '<p class="loading-message">Buscando dados...</p>'; //
    }
    // A limpeza agora é feita por renderResultsList ou pelo tratamento de erro
} //

export function displayResults(features: any[]): void {
    allFeatures = features; // Atualiza a lista global //
    populateCollectionFilter(features); //
    renderResultsList(features); // Renderiza a lista (que também chama updateButtonStates) //
} //

export function initializeUI(): void {
    setupSidebarToggle();    // Botão de menu da sidebar esquerda
    setupFilters();          // Botão "Aplicar Filtros"
    setupClearFilters();     // Botão "Limpar Filtros"
    setupModal();            // Lógica do modal (fechar)
    setupLocationSearch();   // Funcionalidade de busca por local
    // setupCompareLogic é chamado pelo map.ts após cada busca de dados STAC
} //