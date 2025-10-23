// frontend/src/chart.ts

// Importa apenas os componentes necessários do Chart.js para otimização
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale, // Para o eixo X (datas)
    TimeScale,     // Alternativa para o eixo X se as datas forem objetos Date
    Title,
    Tooltip,
    Legend
} from 'chart.js';
// Importa as funções da API
import { fetchCoverageAttributes, fetchTimeSeriesData } from './apiService'; //

// Registra os componentes que serão usados nos gráficos de linha
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale, // Use CategoryScale se suas labels (datas) forem strings "YYYY-MM-DD"
    // TimeScale,     // Use TimeScale se suas labels forem objetos Date (requer adaptador de data)
    Title,
    Tooltip,
    Legend
); //

// Guarda referências aos gráficos ativos para poder destruí-los depois
let activeCharts: Chart[] = []; //

/**
 * MODIFICADO: Renderiza gráficos de comparação buscando atributos dinamicamente.
 * @param selectedFeatures Array de objetos STAC Feature selecionados pelo usuário.
 * @param coords Objeto com latitude e longitude { lat, lon }.
 * @param startDate String da data de início no formato 'YYYY-MM-DD'.
 * @param endDate String da data de fim no formato 'YYYY-MM-DD'.
 */
export async function renderComparisonCharts(
    selectedFeatures: any[],
    coords: { lat: number; lon: number },
    startDate: string,
    endDate: string
): Promise<void> {

    // Encontra o container onde os gráficos serão colocados e o modal
    const chartsContainer = document.getElementById('comparison-container'); // ATENÇÃO: Usando o mesmo container da tabela? Verifique seu HTML.
    const modal = document.getElementById('comparison-modal'); // Certifique-se que o ID do modal está correto

    if (!chartsContainer || !modal) {
        console.error("Elemento '#comparison-container' ou '#comparison-modal' não encontrado no DOM.");
        alert("Erro interno: Não foi possível encontrar a área para exibir os gráficos.");
        return;
    }

    // Limpa conteúdo anterior, destrói gráficos antigos e mostra mensagem de carregamento
    chartsContainer.innerHTML = '<p class="loading-message" style="text-align: center; padding: 20px;">Carregando dados para os gráficos...</p>'; //
    activeCharts.forEach(chart => chart.destroy()); //
    activeCharts = []; //
    modal.style.display = 'flex'; // Garante que o modal seja exibido

    // --- PASSO 1: Buscar os atributos disponíveis para as coleções selecionadas ---
    const collectionNames = [...new Set(selectedFeatures.map(f => f.collection))]; // Pega nomes únicos de coleção
    const attributesData = await fetchCoverageAttributes(collectionNames); //

    if (!attributesData || !attributesData.coverages || attributesData.coverages.length === 0) {
        chartsContainer.innerHTML = '<p class="info-message" style="text-align: center; padding: 20px; color: red;">Não foi possível obter os atributos disponíveis (ex: NDVI, EVI) para as coleções selecionadas. Verifique o console para mais detalhes.</p>';
        return;
    }

    // Cria um mapa para fácil acesso: Nome da Coleção -> Array de Atributos
    const attributesMap = new Map<string, string[]>();
    attributesData.coverages.forEach((cov: { coverage: string; attributes: string[] }) => {
        // Filtra atributos comuns se necessário (ex: mostrar apenas NDVI e EVI)
        const relevantAttributes = cov.attributes.filter(attr => ['ndvi', 'evi'].includes(attr.toLowerCase()));
        if (relevantAttributes.length > 0) {
            attributesMap.set(cov.coverage, relevantAttributes);
        } else {
             console.warn(`Nenhum atributo relevante (NDVI, EVI) encontrado para a coleção: ${cov.coverage}. Atributos disponíveis: ${cov.attributes.join(', ')}`);
        }
    });

    // --- PASSO 2: Buscar as séries temporais para cada coleção e cada atributo relevante ---
    const timeSeriesPromises: Promise<any>[] = []; // Armazena todas as promessas de busca
    const chartDataConfigs: any[] = []; // Armazena os dados formatados para os gráficos

    selectedFeatures.forEach(feature => {
        const collection = feature.collection;
        const availableAttributes = attributesMap.get(collection);

        if (availableAttributes && availableAttributes.length > 0) {
            // Para cada atributo relevante encontrado (ex: 'NDVI', 'EVI')
            availableAttributes.forEach(attribute => {
                const promise = fetchTimeSeriesData(collection, coords.lat, coords.lon, startDate, endDate, attribute) //
                    .then(timeSeriesResult => {
                        // Verifica se a API retornou dados válidos
                        if (timeSeriesResult && Array.isArray(timeSeriesResult.timeline) && timeSeriesResult.timeline.length > 0) {
                            // Formata os dados para o Chart.js
                            const labels = timeSeriesResult.timeline.map((point: { date: string }) => point.date); // Datas como strings 'YYYY-MM-DD'
                            const data = timeSeriesResult.timeline.map((point: { value: number | null }) => point.value); // Valores (podem ser null)

                            // Armazena a configuração desta linha/série
                            chartDataConfigs.push({
                                collection: collection,
                                attribute: attribute, // Guarda qual atributo estes dados representam
                                labels: labels,     // Array de datas
                                data: data          // Array de valores
                            });
                        } else {
                            console.warn(`Série temporal ${attribute} para ${collection} retornou vazia ou em formato inválido.`);
                        }
                    })
                    .catch(error => {
                        // Não interrompe as outras buscas, apenas loga o erro
                        console.error(`Erro ao buscar time series para ${collection} - ${attribute}:`, error);
                    });
                timeSeriesPromises.push(promise); // Adiciona a promessa à lista
            });
        } else {
            console.warn(`Nenhum atributo relevante (NDVI, EVI) mapeado para a coleção: ${collection}. Pulando busca de série temporal.`);
        }
    });

    // Espera que TODAS as buscas de séries temporais (bem-sucedidas ou falhas) terminem
    await Promise.allSettled(timeSeriesPromises);

    // --- PASSO 3: Renderizar os gráficos com os dados obtidos ---
    const loadingMessage = chartsContainer.querySelector('.loading-message');
    if (loadingMessage) loadingMessage.remove(); // Remove a mensagem de "Carregando..."

    if (chartDataConfigs.length === 0) {
        chartsContainer.innerHTML = '<p class="info-message" style="text-align: center; padding: 20px; color: orange;">Nenhum dado de série temporal encontrado para os itens e atributos selecionados (NDVI, EVI). Verifique o console para possíveis erros.</p>';
        return;
    }

    // Agrupa os dados por ATRIBUTO para criar um gráfico separado para cada um (ex: Gráfico NDVI, Gráfico EVI)
    const chartsByAttribute = new Map<string, any[]>();
    chartDataConfigs.forEach(config => {
        const key = config.attribute.toUpperCase(); // Agrupa por atributo (case-insensitive)
        if (!chartsByAttribute.has(key)) {
            chartsByAttribute.set(key, []);
        }
        chartsByAttribute.get(key)?.push(config);
    });

    // Cria um elemento <canvas> e um gráfico Chart.js para cada atributo encontrado
    chartsByAttribute.forEach((configsForAttribute, attributeName) => {
        const chartCanvas = document.createElement('canvas'); //
        chartCanvas.style.maxHeight = '300px'; // Limita a altura do canvas
        chartCanvas.style.marginBottom = '20px'; // Espaço entre gráficos
        chartsContainer.appendChild(chartCanvas); // Adiciona o canvas ao modal

        // Monta os 'datasets' (as linhas do gráfico) para este atributo específico
        const datasets = configsForAttribute.map((config, index) => ({
            label: `${config.collection}`, // A legenda da linha será o nome da coleção
            data: config.data,
            borderColor: getRandomColor(index), // Pega uma cor diferente para cada coleção
            tension: 0.1, // Suaviza a linha
            fill: false, // Não preenche a área abaixo da linha
            parsing: { // Necessário se houver valores 'null' nos dados
                 xAxisKey: 'x', // Ou o nome da sua propriedade de data se usar objetos
                 yAxisKey: 'y' // Ou o nome da sua propriedade de valor se usar objetos
            },
            spanGaps: true // Conecta a linha mesmo se houver pontos nulos
        }));

        // Assume que as datas (labels) são as mesmas para todas as séries do mesmo atributo
        // Pega as labels da primeira configuração encontrada para este atributo
        const labels = configsForAttribute[0]?.labels || [];

        // Cria o gráfico
        const chart = new Chart(chartCanvas.getContext('2d')!, { // O '!' assume que o contexto 2d sempre existirá
            type: 'line',
            data: {
                labels: labels, // Eixo X (Datas)
                datasets: datasets // As linhas (Coleções)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permite que a altura seja controlada pelo CSS/style
                plugins: {
                    legend: {
                        position: 'top', // Posição da legenda (nomes das coleções)
                    },
                    title: {
                        display: true,
                        text: `Série Temporal - ${attributeName}`, // Título do Gráfico (ex: Série Temporal - NDVI)
                        font: { size: 16 }
                    },
                    tooltip: {
                        mode: 'index', // Mostra tooltips para todos os pontos na mesma data
                        intersect: false,
                    }
                },
                scales: {
                    x: { // Configuração do Eixo X (Datas)
                         type: 'category', // Usar 'category' para labels de string 'YYYY-MM-DD'
                        // type: 'time', // Usar 'time' se 'labels' forem objetos Date (requer adaptador)
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: { // Configuração do Eixo Y (Valores)
                        beginAtZero: false, // NDVI/EVI podem ser negativos ou próximos de zero
                        title: {
                            display: true,
                            text: 'Valor'
                        },
                         // Define limites se necessário, ex: para NDVI (-1 a 1)
                         // min: -1,
                         // max: 1
                    }
                },
                interaction: { // Melhora a interação com o mouse
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        }); //
        activeCharts.push(chart); // Guarda a referência para limpar depois
    });
}

/**
 * Função auxiliar para obter cores distintas para as linhas do gráfico.
 * @param index Índice da linha/dataset.
 * @returns Uma string de cor RGB.
 */
function getRandomColor(index: number): string {
    const colors = [
        'rgb(54, 162, 235)',  // Azul
        'rgb(255, 99, 132)',   // Vermelho
        'rgb(75, 192, 192)',   // Verde Água
        'rgb(255, 205, 86)',  // Amarelo
        'rgb(153, 102, 255)', // Roxo
        'rgb(255, 159, 64)',  // Laranja
        'rgb(100, 100, 100)' // Cinza (para mais linhas)
    ];
    return colors[index % colors.length]; // Usa o módulo para ciclar pelas cores
}