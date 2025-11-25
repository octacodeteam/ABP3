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
        return Array.isArray(data?.features) ? data.features : []; 
    } catch (error) {
        console.error("Falha ao buscar dados do STAC no frontend:", error);
        alert(`Erro ao buscar dados de satélite: ${error}`); 
        return []; 
    }
};

/**
 * Interface para a resposta da busca de atributos PARA UMA COLEÇÃO.
 */
interface SingleCoverageAttributesResponse {
    coverages: { 
        coverage: string;
        attributes: string[];
    }[];
}

/**
 * Busca os atributos disponíveis para UMA ÚNICA coleção (coverage).
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
            if (response.status === 404) {
                console.warn(`Atributos não encontrados para ${collectionName} (API retornou 404).`);
                return null; 
            }
            const errorData = await response.json();
            throw new Error(`Erro na API do backend (atributos WTSS): ${response.statusText} - ${errorData.detail || errorData.message}`);
        }
        const data: SingleCoverageAttributesResponse = await response.json();
        console.log(`Frontend: Atributos WTSS recebidos para ${collectionName}:`, data);
        return data;

    } catch (error) {
        console.error(`Falha ao buscar atributos da cobertura WTSS ${collectionName}:`, error);
        return null; 
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
    [key: string]: any;
}

/**
 * Busca dados de série temporal do NOSSO backend.
 */
export const fetchTimeSeriesData = async (
    collection: string,
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    attribute: string
): Promise<TimeSeriesResult | null> => {
    
    // *** MUDANÇA IMPORTANTE: O try/catch foi movido para o chart.ts ***
    // Nós *queremos* que esta função falhe (lance um erro) se a API falhar,
    // para que o Promise.allSettled possa capturá-la.
    
    let apiUrl = `/api/wtss/time_series?coverage=${encodeURIComponent(collection)}&attributes=${encodeURIComponent(attribute)}&latitude=${lat}&longitude=${lon}`;
    if (startDate) apiUrl += `&start_date=${startDate}`; 
    if (endDate) apiUrl += `&end_date=${endDate}`; 

    console.log(`Frontend: Buscando dados WTSS Time Series (${attribute}) de: ${apiUrl}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        const errorData = await response.json();
        // Lança um erro detalhado que será pego pelo 'Promise.allSettled' no chart.ts
        throw new Error(`[${collection} - ${attribute}]: ${errorData.detail?.description || errorData.message || 'Erro desconhecido'}`);
    }
    
    const data = await response.json();
    console.log(`Frontend: Dados WTSS (${attribute}) recebidos para ${collection}:`, data);

    return data.result || data; 

};