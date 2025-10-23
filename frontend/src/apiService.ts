/**
 * Este arquivo centraliza todas as chamadas para o nosso backend.
 */

// Define o tipo de dado que esperamos receber para cada item da lista STAC
interface StacFeature {
    type: "Feature";
    id: string;
    collection: string; // O nome da coleção (coverage) é crucial
    properties: {
        datetime: string;
        [key: string]: any;
    };
    assets?: { // Adiciona a seção de assets se precisar acessar links de visualização, etc.
        thumbnail?: { href: string };
        [key: string]: any;
    }
}

/**
 * Busca os dados de satélite (lista de features STAC) para uma coordenada específica.
 */
export const fetchStacData = async (lat: number, lon: number): Promise<StacFeature[]> => {
    try {
        const apiUrl = `/api/stac/search?latitude=${lat}&longitude=${lon}`;
        console.log(`Frontend: Buscando dados STAC de ${apiUrl}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API do backend (STAC): ${response.statusText} - ${errorData.detail || errorData.message}`);
        }
        const data = await response.json();
        console.log("Frontend: Dados STAC recebidos:", data);
        return data.features || []; // Retorna a lista de features
    } catch (error) {
        console.error("Falha ao buscar dados do STAC no frontend:", error);
        alert(`Erro ao buscar dados de satélite: ${error}`); // Informa o usuário
        return []; // Retorna array vazio em caso de erro
    }
};

/**
 * Interface para a resposta esperada da busca de atributos.
 */
interface CoverageAttributesResponse {
    coverages: {
        coverage: string;
        attributes: string[];
    }[];
}

/**
 * NOVO: Busca os atributos disponíveis para uma lista de coleções (coverages).
 * @param collections Array com os nomes das coleções. Ex: ['S2-16D-2', 'LANDSAT-16D-1']
 * @returns Uma promessa que resolve para a estrutura de dados com os atributos ou null em caso de erro.
 */
export const fetchCoverageAttributes = async (collections: string[]): Promise<CoverageAttributesResponse | null> => {
    if (!collections || collections.length === 0) {
        console.warn("fetchCoverageAttributes chamado sem coleções.");
        return null;
    }
    try {
        const collectionsParam = collections.join(',');
        const apiUrl = `/api/wtss/attributes?coverage=${encodeURIComponent(collectionsParam)}`;
        console.log(`Frontend: Buscando atributos WTSS de ${apiUrl}`);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API do backend (atributos WTSS): ${response.statusText} - ${errorData.detail || errorData.message}`);
        }
        const data: CoverageAttributesResponse = await response.json();
        console.log("Frontend: Atributos WTSS recebidos:", data);
        return data; // Deve retornar algo como { "coverages": [{ "coverage": "...", "attributes": ["NDVI", "EVI"] }, ...] }

    } catch (error) {
        console.error("Falha ao buscar atributos das coberturas WTSS:", error);
        alert(`Erro ao buscar atributos disponíveis para os gráficos: ${error}`); // Informa o usuário
        return null; // Retorna null em caso de erro
    }
};

/**
 * Interface para um ponto na linha do tempo da série temporal WTSS.
 */
interface TimeSeriesTimelinePoint {
    date: string; // Formato "YYYY-MM-DD"
    value: number | null; // Valor do atributo (pode ser null)
}

/**
 * Interface para o resultado da busca de série temporal WTSS.
 */
interface TimeSeriesResult {
    timeline: TimeSeriesTimelinePoint[];
    // Pode haver outros campos como 'processing_unit', 'attribute', etc.
    [key: string]: any;
}

/**
 * Busca dados de série temporal do NOSSO backend.
 * MODIFICADO: Recebe o atributo específico a ser buscado.
 * @param collection Nome da coleção (coverage).
 * @param lat Latitude.
 * @param lon Longitude.
 * @param startDate Data de início (YYYY-MM-DD).
 * @param endDate Data de fim (YYYY-MM-DD).
 * @param attribute O atributo desejado (ex: "NDVI", "EVI").
 * @returns Uma promessa que resolve para os dados da série temporal ou null em caso de erro.
 */
export const fetchTimeSeriesData = async (
    collection: string,
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    attribute: string // <-- PARÂMETRO ADICIONADO E AGORA USADO
): Promise<TimeSeriesResult | null> => {
    try {
        // Monta a URL para o nosso backend, incluindo o atributo específico
        let apiUrl = `/api/wtss/time-series?coverage=${encodeURIComponent(collection)}&attributes=${encodeURIComponent(attribute)}&latitude=${lat}&longitude=${lon}`; // <-- ATRIBUTO USADO AQUI

        // Adiciona as datas na URL apenas se elas foram fornecidas
        if (startDate) apiUrl += `&start_date=${startDate}`; //
        if (endDate) apiUrl += `&end_date=${endDate}`; //

        console.log(`Frontend: Buscando dados WTSS Time Series (${attribute}) de: ${apiUrl}`);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API do backend (WTSS Time Series): ${response.statusText} - ${errorData.detail || errorData.message}`);
        }
        const data = await response.json();
        console.log(`Frontend: Dados WTSS (${attribute}) recebidos para ${collection}:`, data);

        // A estrutura de retorno da API WTSS time_series geralmente tem um objeto 'result'
        // Verifique a estrutura real retornada pela sua API /getTimeSeries
        return data.result || data; // Retorna o 'result' se existir, senão o objeto todo

    } catch (error) {
        console.error(`Falha ao buscar dados da série temporal WTSS para o atributo ${attribute}:`, error);
        alert(`Erro ao buscar dados do gráfico (${attribute}) para ${collection}: ${error}`); // Informa o usuário
        return null; // Retorna null em caso de erro
    }
};