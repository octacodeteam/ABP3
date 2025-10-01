/**
 * Este arquivo centraliza todas as chamadas para o nosso backend.
 * Assim, se a URL da API mudar, só precisamos alterar em um lugar.
 */

// Define o tipo de dado que esperamos receber para cada item da lista
// É opcional, mas ajuda o TypeScript a nos dar sugestões e evitar erros.
interface StacFeature {
    type: "Feature";
    id: string;
    collection: string;
    properties: {
        datetime: string;
        [key: string]: any; // Permite outras propriedades que não listamos
    };
    // Adicione outros campos se precisar
}


/**
 * Busca os dados de satélite para uma coordenada específica.
 * @param lat A latitude do ponto.
 * @param lon A longitude do ponto.
 * @returns Uma promessa que resolve para um array de 'features' (itens) do STAC.
 */
export const fetchStacData = async (lat: number, lon: number): Promise<StacFeature[]> => {
    try {
        // Monta a URL para o nosso próprio backend
        const apiUrl = `/api/stac/search?latitude=${lat}&longitude=${lon}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Se o backend retornar um erro (como 400 ou 500), ele entrará aqui
            throw new Error(`Erro na resposta da API: ${response.statusText}`);
        }

        const data = await response.json();

        // A API retorna um objeto que contém uma lista chamada "features"
        return data.features || []; // Retorna a lista ou um array vazio se não houver 'features'

    } catch (error) {
        console.error("Falha ao buscar dados do STAC no frontend:", error);
        // Em caso de erro (ex: backend fora do ar), retorna um array vazio para não quebrar a aplicação
        return [];
    }
};