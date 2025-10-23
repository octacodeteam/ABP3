// frontend/src/ui.ts
import { mapManager } from './map'; // Import necessário para o mapa se mover
import { renderComparisonCharts } from './chart'; // Importa a função de gráfico

let allFeatures: any[] = []; // Guarda a lista completa de features recebida da API STAC

// --- SETUP DAS FUNCIONALIDADES DA PÁGINA ---

/**
 * Configura o botão que mostra/esconde a sidebar esquerda (filtros).
 */
function setupSidebarToggle(): void {
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-sidebar');
    if (!toggleButton || !container) return;

    toggleButton.addEventListener('click', () => {
        container.classList.toggle('sidebar-hidden');
        // Redimensiona o mapa após a animação da sidebar
        mapManager.invalidateSize(); //
    });
} //

/**
 * Configura o botão "Aplicar Filtros".
 */
function setupFilters(): void {
    const applyBtn = document.getElementById('apply-filters-btn');
    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

        const selectedCollection = collectionFilter.value;
        const startDate = startDateFilter.value; // Formato YYYY-MM-DD
        const endDate = endDateFilter.value;   // Formato YYYY-MM-DD

        let filteredFeatures = allFeatures; // Começa com a lista completa

        // Aplica filtro de coleção
        if (selectedCollection) {
            filteredFeatures = filteredFeatures.filter(f => f.collection === selectedCollection); //
        }

        // Aplica filtro de data de início
        if (startDate) {
            // Compara apenas a parte da data (ignorando a hora)
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] >= startDate); //
        }
        // Aplica filtro de data de fim
        if (endDate) {
            // Compara apenas a parte da data (ignorando a hora)
            filteredFeatures = filteredFeatures.filter(f => f.properties.datetime.split('T')[0] <= endDate); //
        }
        // Re-renderiza a lista de resultados com os itens filtrados
        renderResultsList(filteredFeatures); //
    });
} //

/**
 * Configura o botão "Limpar Filtros".
 */
function setupClearFilters(): void {
    const clearBtn = document.getElementById('clear-filters-btn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
        // 1. Limpa os valores dos campos de filtro
        const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
        const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
        const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;
        const locationInput = document.getElementById('location-search-input') as HTMLInputElement;

        collectionFilter.value = '';
        startDateFilter.value = '';
        endDateFilter.value = '';
        locationInput.value = ''; // Limpa também o campo de busca de local

        // 2. Renderiza a lista novamente com todos os resultados originais
        renderResultsList(allFeatures);
    });
}

/**
 * Busca as coordenadas geográficas de um local usando a API Nominatim (via backend) e move o mapa.
 */
async function handleLocationSearch(): Promise<void> {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn') as HTMLButtonElement;
    const locationQuery = searchInput.value.trim(); // Pega o valor e remove espaços extras

    if (!locationQuery) {
        alert('Por favor, digite um local para pesquisar.');
        return;
    }

    // Feedback visual de carregamento
    searchBtn.textContent = 'Buscando...';
    searchBtn.disabled = true;

    // Chama o endpoint de geocode no NOSSO backend
    const apiUrl = `/api/geocode?query=${encodeURIComponent(locationQuery)}`;

    try {
        const response = await fetch(apiUrl); // Usa fetch para chamar nosso backend
        const data = await response.json(); // Pega a resposta JSON

        if (!response.ok) {
            // Se o backend retornou erro (400, 404, 500), joga um erro
            throw new Error(data.error || `Erro ${response.status}`);
        }

        // Se encontrou (backend retorna 200 OK com os dados)
        const { lat, lon, display_name } = data;
        console.log(`Local encontrado: ${display_name}`);

        // Chama o método no map.ts para mover o mapa E buscar os dados
        mapManager.panToLocation(lat, lon); //

    } catch (error: any) {
        console.error('Erro ao buscar localização via backend:', error);
        // Exibe a mensagem de erro vinda do backend ou uma mensagem genérica
        alert(`Ocorreu um erro ao buscar a localização: ${error.message || 'Erro desconhecido'}`);
    } finally {
        // Restaura o botão
        searchBtn.textContent = 'Buscar Local';
        searchBtn.disabled = false;
    }
} //

/**
 * Configura o evento de clique do botão de busca por local e a tecla Enter no input.
 */
function setupLocationSearch(): void {
    const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('location-search-btn');
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', handleLocationSearch); //

    // Adiciona listener para a tecla Enter no campo de input
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleLocationSearch(); // Chama a mesma função de busca
        }
    });
} //

/**
 * Configura o botão de fechar do modal.
 */
function setupModal(): void {
    const modal = document.getElementById('comparison-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (!modal || !closeModalBtn) return;

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Esconde o modal ao clicar no 'X'
        // Opcional: Limpar o conteúdo do modal ao fechar
        const container = document.getElementById('comparison-container');
         if (container) container.innerHTML = '';
    });

     // Opcional: Fechar o modal clicando fora dele
     modal.addEventListener('click', (event) => {
         if (event.target === modal) { // Se o clique foi no overlay cinza
             modal.style.display = 'none';
              const container = document.getElementById('comparison-container');
              if (container) container.innerHTML = '';
         }
     });

} //

/**
 * Configura a lógica dos botões "Comparar Selecionados" e "Gráfico".
 * Atualiza o estado (habilitado/desabilitado) dos botões conforme checkboxes são marcados/desmarcados.
 * Define as ações de clique para chamar `displayComparisonTable` ou `renderComparisonCharts`.
 * @param coords Coordenadas {lat, lon} do ponto atualmente selecionado no mapa.
 */
export function setupCompareLogic(coords: { lat: number, lon: number }): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement; // Certifique-se que o ID no HTML é 'graf'
    const startDateFilter = document.getElementById('date-filter-start') as HTMLInputElement;
    const endDateFilter = document.getElementById('date-filter-end') as HTMLInputElement;

    if (!resultsList || !compareBtn || !grafBtn) {
        console.error("Elementos #results-list, #compare-btn ou #graf não encontrados no DOM.");
        return;
    }

    // Define a função que será chamada sempre que um checkbox mudar
    const updateButtonStates = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        compareBtn.disabled = checkedBoxes.length < 2; // Habilita "Comparar" se 2 ou mais estiverem marcados
        grafBtn.disabled = checkedBoxes.length === 0; // Habilita "Gráfico" se 1 ou mais estiverem marcados
    };

    // Adiciona o listener de evento à lista de resultados
    // Usamos 'input' pois 'change' pode não disparar corretamente em alguns casos
    resultsList.addEventListener('input', (event) => {
        if ((event.target as HTMLElement).classList.contains('compare-checkbox')) {
            updateButtonStates(); // Chama a função para atualizar os botões
        }
    });

    // Ação do botão "Comparar Selecionados" (gera tabela)
    compareBtn.onclick = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        // Pega os IDs dos checkboxes marcados
        const selectedIds = Array.from(checkedBoxes)
                                 .map(checkbox => checkbox.dataset.id)
                                 .filter(id => id !== undefined) as string[]; // Garante que IDs não sejam undefined

        if (selectedIds.length >= 2) {
            displayComparisonTable(selectedIds); // Chama a função que cria a tabela
        } else {
             alert("Selecione pelo menos dois itens para comparar."); // Mensagem caso tente comparar menos de 2
        }
    }; //

    // --- MODIFICAÇÃO PARA BOTÃO GRÁFICO ---
    // Ação do botão "Gráfico"
    grafBtn.onclick = () => {
        const checkedBoxes = resultsList.querySelectorAll<HTMLInputElement>('.compare-checkbox:checked');
        const selectedIds = Array.from(checkedBoxes)
                                 .map(checkbox => checkbox.dataset.id)
                                 .filter(id => id !== undefined) as string[]; // Pega os IDs

        // Filtra o array global 'allFeatures' para obter os OBJETOS COMPLETOS dos itens selecionados
        const selectedFeatures = allFeatures.filter(feature => selectedIds.includes(feature.id));

        if (selectedFeatures.length > 0) {
            console.log("Chamando renderComparisonCharts com features:", selectedFeatures);
            // Chama a função renderComparisonCharts passando os OBJETOS FEATURE, as coordenadas e as datas
            renderComparisonCharts(selectedFeatures, coords, startDateFilter.value, endDateFilter.value); //
        } else {
            alert("Selecione pelo menos um item para gerar o gráfico.");
        }
    }; //

     // Garante que os botões comecem desabilitados
    compareBtn.disabled = true; //
    grafBtn.disabled = true;
} //


// --- FUNÇÕES DE RENDERIZAÇÃO E DADOS ---

/**
 * Exibe uma tabela comparativa no modal com os itens selecionados.
 * @param selectedIds Array com os IDs das features selecionadas.
 */
function displayComparisonTable(selectedIds: string[]): void {
    const container = document.getElementById('comparison-container');
    const modal = document.getElementById('comparison-modal');
    if (!container || !modal) return;

    // Filtra 'allFeatures' para pegar os objetos completos correspondentes aos IDs
    const itemsToCompare = allFeatures.filter(feature => selectedIds.includes(feature.id));
    if (itemsToCompare.length < 2) return; // Precisa de pelo menos 2 para comparar

    // Limpa o container antes de adicionar a tabela
    container.innerHTML = '';

    // Define as propriedades que queremos comparar e como formatá-las
    const propertiesToCompare = [
        { name: 'Coleção', path: 'collection' },
        { name: 'Data', path: 'properties.datetime', format: (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A' }, // Adiciona formatação de data
        { name: 'Nuvens (%)', path: 'properties.eo:cloud_cover', format: (c: number | null | undefined) => (c != null && !isNaN(c)) ? c.toFixed(2) : 'N/A' }, // Formata número ou mostra N/A
         // Adicione mais propriedades se desejar, seguindo o padrão { name: 'Nome Exibido', path: 'caminho.no.objeto.feature', format: (opcional) => ... }
         // Exemplo: { name: 'ID', path: 'id' },
    ];

    // Cria a tabela HTML
    let tableHTML = '<table class="comparison-table" border="1" style="width:100%; border-collapse: collapse; text-align: center; font-size: 0.9rem;">';
    // Cabeçalho da tabela
    tableHTML += '<thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px;">Propriedade</th>';
    itemsToCompare.forEach((item) => {
        // Tenta usar o ID ou a coleção como título da coluna
        tableHTML += `<th style="padding: 8px; word-break: break-all;">${item.collection || item.id}</th>`;
    });
    tableHTML += '</tr></thead>';

    // Corpo da tabela
    tableHTML += '<tbody>';
    propertiesToCompare.forEach(prop => {
        tableHTML += `<tr><td style="padding: 8px; font-weight: bold; text-align: left;">${prop.name}</td>`;
        itemsToCompare.forEach(item => {
            // Navega pelo objeto usando o 'path' (ex: 'properties.datetime')
            const value = prop.path.split('.').reduce((o, i) => (o && typeof o === 'object') ? o[i] : undefined, item);
            // Formata o valor se uma função 'format' foi definida, senão usa o valor ou 'N/A'
            const formattedValue = prop.format ? prop.format(value) : (value ?? 'N/A');
            tableHTML += `<td style="padding: 8px;">${formattedValue}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    // Insere a tabela no container e mostra o modal
    container.innerHTML = tableHTML;
    modal.style.display = 'flex';
} //


/**
 * Renderiza a lista de resultados (features STAC) na sidebar direita.
 * @param features Array de features STAC a serem exibidas.
 */
function renderResultsList(features: any[]): void {
    const resultsList = document.getElementById('results-list');
    const compareBtn = document.getElementById('compare-btn') as HTMLButtonElement;
    const grafBtn = document.getElementById('graf') as HTMLButtonElement;

    if (!resultsList || !compareBtn || !grafBtn) return; // Verifica se todos os elementos existem
    resultsList.innerHTML = ''; // Limpa a lista anterior

    // Desabilita os botões de comparação e gráfico inicialmente
    compareBtn.disabled = true; //
    grafBtn.disabled = true;

    if (!Array.isArray(features) || features.length === 0) {
        resultsList.innerHTML = '<p class="info-message">Nenhum dado encontrado para este local ou filtros aplicados.</p>'; // Mensagem se não houver dados
        return;
    }

    // Cria um item na lista para cada feature
    features.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'result-item';
        // Inclui o checkbox com o data-id contendo o ID da feature
        item.innerHTML = `
            <div class="result-item-header">
                <h4>${feature.collection || 'Coleção não informada'}</h4>
                <input type="checkbox" class="compare-checkbox" data-id="${feature.id}">
            </div>
            <p>Data: ${feature.properties.datetime ? new Date(feature.properties.datetime).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Data indisponível'}</p>
            `; //
        resultsList.appendChild(item);
    });

     // Após renderizar a lista, chama a função para atualizar o estado inicial dos botões
     // (Isso garante que se a lista for renderizada com checkboxes já marcados, os botões reflitam isso)
     // Embora neste fluxo, a lista é sempre renderizada sem checkboxes marcados.
     // Mas é uma boa prática chamar a atualização após a renderização.
     // const updateButtonStates = () => { ... } // (A função definida em setupCompareLogic)
     // updateButtonStates(); // Você precisaria expor ou redefinir updateButtonStates aqui se quisesse chamar.
     // Por enquanto, apenas desabilitar é suficiente.

} //


/**
 * Popula o dropdown de filtro de coleções com base nas features encontradas.
 * @param features Array de features STAC.
 */
function populateCollectionFilter(features: any[]): void {
    const collectionFilter = document.getElementById('collection-filter') as HTMLSelectElement;
    if (!collectionFilter) return;

    // Guarda a seleção atual para tentar restaurá-la depois
    const currentSelection = collectionFilter.value;

    // Extrai nomes únicos de coleção das features
    const collections = [...new Set(features.map(f => f.collection).filter(Boolean))].sort(); // Filtra nulos/undefined e ordena

    // Limpa opções antigas, exceto a primeira ("Todas as Coleções")
    while (collectionFilter.options.length > 1) {
        collectionFilter.remove(1);
    }

    // Adiciona as novas coleções como opções
    collections.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        collectionFilter.appendChild(option);
    });

     // Tenta restaurar a seleção anterior, se ainda existir
     if (collections.includes(currentSelection)) {
        collectionFilter.value = currentSelection;
     } else {
        collectionFilter.value = ""; // Volta para "Todas as Coleções"
     }
} //


/**
 * Mostra ou esconde a mensagem de "Buscando dados..." na lista de resultados
 * e garante que a sidebar de resultados esteja visível.
 * @param isLoading Boolean indicando se deve mostrar (true) ou esconder (false) a mensagem.
 */
export function showLoading(isLoading: boolean): void {
    const resultsList = document.getElementById('results-list');
    const container = document.querySelector('.container'); // Elemento que controla a visibilidade da sidebar
    if (!resultsList || !container) return;

    if (isLoading) {
        container.classList.remove('results-hidden'); // Garante que a sidebar direita esteja visível
        resultsList.innerHTML = '<p class="loading-message">Buscando dados...</p>'; // Mostra a mensagem
    } else {
        // A mensagem de loading será substituída pelo conteúdo real em renderResultsList
        // Se renderResultsList não for chamada (ex: erro na API), a mensagem de loading ficará
        // Podemos limpar aqui caso renderResultsList não seja chamada após showLoading(false)
        // if (resultsList.querySelector('.loading-message')) {
        //     resultsList.innerHTML = ''; // Limpa se ainda estiver mostrando loading
        // }
    }
} //


/**
 * Função principal chamada quando novos dados STAC são recebidos.
 * Atualiza a variável global `allFeatures`, popula o filtro de coleções e renderiza a lista inicial.
 * @param features Array de features STAC recebido da API.
 */
export function displayResults(features: any[]): void {
    allFeatures = features; // Atualiza a variável global com os novos dados
    populateCollectionFilter(features); // Atualiza o dropdown de coleções
    renderResultsList(features); // Renderiza a lista de resultados na tela
} //

/**
 * Inicializa todos os componentes da UI (event listeners, etc.).
 * Chamada quando o DOM está pronto.
 */
export function initializeUI(): void {
    setupSidebarToggle();    // Botão de menu da sidebar esquerda
    setupFilters();          // Botão "Aplicar Filtros"
    setupClearFilters();     // Botão "Limpar Filtros"
    setupModal();            // Lógica do modal (fechar)
    setupLocationSearch();   // Funcionalidade de busca por local
    // setupCompareLogic é chamado pelo map.ts sempre que um novo ponto é selecionado
} //