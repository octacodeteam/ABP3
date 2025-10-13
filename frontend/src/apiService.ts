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
 * Busca os dados de satélite (lista de features) para uma coordenada específica.
 */
export const fetchStacData = async (lat: number, lon: number): Promise<any[]> => {
    try {
        const apiUrl = `/api/stac/search?latitude=${lat}&longitude=${lon}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na resposta da API STAC: ${response.statusText}`);
        }
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error("Falha ao buscar dados do STAC no frontend:", error);
        return [];
    }
};

/**
 * Busca dados de série temporal do NOSSO backend (AGORA DE VERDADE).
 * @returns Uma promessa que resolve para os dados da série temporal.
 */
// Em frontend/src/apiService.ts

export const fetchTimeSeriesData = async (
    collection: string,
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
): Promise<any> => {
    try {
        // Monta a URL para o nosso backend, agora incluindo as datas
        let apiUrl = `/api/wtss/time-series?coverage=${collection}&attributes=ndvi&latitude=${lat}&longitude=${lon}`;

        // Adiciona as datas na URL apenas se elas foram preenchidas
        if (startDate) {
            apiUrl += `&start_date=${startDate}`;
        }
        if (endDate) {
            apiUrl += `&end_date=${endDate}`;
        }

        console.log(`Buscando dados REAIS de: ${apiUrl}`);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na API do backend (WTSS): ${response.statusText}`);
        }
        const data = await response.json();

        return data.result;

    } catch (error) {
        console.error("Falha ao buscar dados da série temporal:", error);
        return null;
    }
};