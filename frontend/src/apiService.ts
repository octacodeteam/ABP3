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
        isWtssCompatible?: boolean; // Flag adicionada pelo backend
        [key: string]: any;
    };
    assets?: {
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
        // Garante que o retorno seja sempre um array, mesmo se data.features não existir
        return Array.isArray(data?.features) ? data.features : []; //
    } catch (error) {
        console.error("Falha ao buscar dados do STAC no frontend:", error);
        alert(`Erro ao buscar dados de satélite: ${error}`); // Informa o usuário
        return []; // Retorna array vazio em caso de erro //
    }
};

/**
 * Interface para a resposta da busca de atributos PARA UMA COLEÇÃO.
 */
interface SingleCoverageAttributesResponse {
    coverages: { // Mesmo que a API retorne um array com um item, mantemos a estrutura
        coverage: string;
        attributes: string[];
    }[];
}

/**
 * MODIFICADO: Busca os atributos disponíveis para UMA ÚNICA coleção (coverage).
 * @param collectionName O nome da coleção. Ex: 'S2-16D-2'
 * @returns Uma promessa que resolve para a estrutura de dados com os atributos ou null em caso de erro.
 */
export const fetchCoverageAttributes = async (collectionName: string): Promise<SingleCoverageAttributesResponse | null> => {
    if (!collectionName) {
        console.warn("fetchCoverageAttributes chamado sem nome de coleção.");
        return null;
    }
    try {
        const apiUrl = `/api/wtss/attributes?coverage=${encodeURIComponent(collectionName)}`;
        console.log(`Frontend: Buscando atributos WTSS de ${apiUrl}`);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Se o backend retornou 404 (cobertura não encontrada), trata como aviso, não erro fatal
            if (response.status === 404) {
                console.warn(`Atributos não encontrados para ${collectionName} (API retornou 404).`);
                return null; // Retorna null para indicar que não há atributos
            }
            // Outros erros
            const errorData = await response.json();
            throw new Error(`Erro na API do backend (atributos WTSS): ${response.statusText} - ${errorData.detail || errorData.message}`);
        }
        const data: SingleCoverageAttributesResponse = await response.json();
        console.log(`Frontend: Atributos WTSS recebidos para ${collectionName}:`, data);
        // Retorna a resposta (que deve conter um array 'coverages' com um único item)
        return data;

    } catch (error) {
        console.error(`Falha ao buscar atributos da cobertura WTSS ${collectionName}:`, error);
        // Não mostra alert aqui para não interromper o loop no chart.ts
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
    // Pode haver outros campos
    [key: string]: any;
}

/**
 * Busca dados de série temporal do NOSSO backend.
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
    attribute: string
): Promise<TimeSeriesResult | null> => {
    try {
        let apiUrl = `/api/wtss/time-series?coverage=${encodeURIComponent(collection)}&attributes=${encodeURIComponent(attribute)}&latitude=${lat}&longitude=${lon}`;
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

        // Retorna o 'result' se existir (padrão WTSS), senão o objeto todo
        return data.result || data; //

    } catch (error) {
        console.error(`Falha ao buscar dados da série temporal WTSS para o atributo ${attribute}:`, error);
        alert(`Erro ao buscar dados do gráfico (${attribute}) para ${collection}: ${error}`);
        return null;
    }
};