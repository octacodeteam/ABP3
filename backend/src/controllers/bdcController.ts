import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

// --- URLs CORRETAS ---
// URL base para o serviço STAC
const BDC_STAC_URL = 'https://data.inpe.br/bdc/stac/v1'; //
// URL base para o serviço WTSS
const BDC_WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/'; //
// --- FIM DAS URLs CORRETAS ---

// Lista de coleções que SABEMOS serem compatíveis com WTSS no BDC v4
const WTSS_COMPATIBLE_COLLECTIONS = [
    'S2-16D-2',
    'LC8-16D-1',
    'LC9-16D-1',
    'MOD13Q1-6',
    // Adicione outros se souber de mais cubos de dados compatíveis
];

/**
 * Busca itens STAC.
 * MODIFICADO: Filtro inicial por 'collections' compatíveis com WTSS REATIVADO.
 */
export const getStacItems = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query; //

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Parâmetros latitude e longitude são obrigatórios.' }); //
        }

        const lon = parseFloat(longitude as string); //
        const lat = parseFloat(latitude as string); //
        const offset = 0.001; // Mantém uma pequena área de busca
        const bboxString = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`; //

        const stacSearchUrl = `${BDC_STAC_URL}/search`; //

        // Junta a lista de coleções compatíveis em uma string separada por vírgula
        const compatibleCollectionsParam = WTSS_COMPATIBLE_COLLECTIONS.join(',');

        console.log(`Buscando STAC (COLEÇÕES COMPATÍVEIS) em ${stacSearchUrl} com bbox: ${bboxString} e collections: ${compatibleCollectionsParam}`);

        // *** ALTERAÇÃO AQUI: Reativado o parâmetro 'collections' ***
        const response = await axios.get(stacSearchUrl, {
            params: {
                bbox: bboxString,
                collections: compatibleCollectionsParam, // Filtra pelas coleções compatíveis
                limit: 150 // Mantém um limite razoável
            }
        }); //

        // Adiciona flag de compatibilidade WTSS (todos aqui serão true)
        const featuresWithFlag = response.data.features.map((feature: any) => ({
            ...feature,
            properties: {
                ...feature.properties,
                isWtssCompatible: true // Como filtramos, todos são compatíveis
            }
        }));

        // Ordena por data (mais recentes primeiro)
        featuresWithFlag.sort((a: any, b: any) => {
            // Trata casos onde datetime pode não existir ou ser inválido
            const dateA = a.properties?.datetime ? new Date(a.properties.datetime).getTime() : 0;
            const dateB = b.properties?.datetime ? new Date(b.properties.datetime).getTime() : 0;
            // Se as datas forem inválidas ou iguais, não muda a ordem
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA; // Ordena do mais recente para o mais antigo
        });


        res.status(200).json({
             ...response.data, // Mantém outros dados da resposta STAC
             features: featuresWithFlag // Envia a lista com a flag
            });

    } catch (error: any) {
        console.error("Erro detalhado ao buscar itens no STAC:", error.response?.data || error.message); //
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500; //
        res.status(status).json({
            message: 'Erro no servidor ao contatar a API STAC do BDC',
            detail: axiosError.response?.data || axiosError.message
        }); //
    }
};

/**
 * Busca uma série temporal (WTSS).
 */
export const getTimeSeries = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, coverage, attributes, start_date, end_date } = req.query; //

        if (!latitude || !longitude || !coverage || !attributes) {
            return res.status(400).json({ message: 'Parâmetros latitude, longitude, coverage e attributes são obrigatórios.' }); //
        }

        const wtssTimeSeriesUrl = `${BDC_WTSS_URL}/time_series`; //
        console.log(`Buscando WTSS Time Series em ${wtssTimeSeriesUrl} para coverage ${coverage}, attribute ${attributes}`);

        const response = await axios.get(wtssTimeSeriesUrl, {
            params: { latitude, longitude, coverage, attributes, start_date, end_date } //
        });

        res.status(200).json(response.data); //

    } catch (error: any) {
        console.error("Erro detalhado ao buscar série temporal WTSS:", error.response?.data || error.message); //
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500; //
        res.status(status).json({
            message: 'Erro no servidor ao contatar a API WTSS do BDC para buscar série temporal',
            detail: axiosError.response?.data || axiosError.message
        }); //
    }
};

/**
 * Busca os atributos disponíveis para UMA cobertura específica (WTSS).
 * Inclui workaround para erro 404 em coleções conhecidas.
 */
export const getCoverageAttributes = async (req: Request, res: Response) => {
    const coverage = req.query.coverage as string; //

    if (!coverage) {
        return res.status(400).json({ message: 'Parâmetro coverage (apenas um nome) é obrigatório.' }); //
    }

    // --- WORKAROUND: Atributos conhecidos ---
    const knownAttributes: { [key: string]: string[] } = {
        'S2-16D-2': ['NDVI', 'EVI', 'NBR', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B8A', 'B09', 'B11', 'B12', 'SCL', 'CLEAROB', 'TOTALOB', 'PROVENANCE'],
        'LC8-16D-1': ['NDVI', 'EVI', 'NBR', 'BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', 'PIXELQA'], // Exemplo mais completo
        'LC9-16D-1': ['NDVI', 'EVI', 'NBR', 'BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', 'PIXELQA'], // Exemplo mais completo
        'MOD13Q1-6': ['NDVI', 'EVI'] // Exemplo
        // Adicione outros da lista WTSS_COMPATIBLE_COLLECTIONS
    };
    // ------------------------------------

    const wtssDescribeUrl = `${BDC_WTSS_URL}/describe_coverage`; //
    console.log(`Buscando atributos WTSS em ${wtssDescribeUrl} para: ${coverage}`);

    try {
        const response = await axios.get(wtssDescribeUrl, {
            params: { coverage: coverage } //
        });

        const responseData = response.data;
        // Pega atributos da resposta da API
        const attributes = Object.keys(responseData.attributes || {}); //

        console.log(`Atributos encontrados via API para ${coverage}: ${attributes.join(', ')}`);
        res.status(200).json({
            coverages: [{ coverage: coverage, attributes: attributes }]
        }); //

    } catch (error: any) {
        const axiosError = error as AxiosError<{ code?: number; description?: string }>; //

        // *** LÓGICA DO WORKAROUND ***
        if (axiosError.response?.status === 404 && knownAttributes[coverage]) {
            console.warn(`WTSS /describe_coverage retornou 404 para ${coverage}. Usando atributos pré-definidos como fallback.`);
            res.status(200).json({ // Retorna 200 OK com os dados do fallback
                coverages: [{
                    coverage: coverage,
                    attributes: knownAttributes[coverage] // Usa a lista pré-definida
                }]
            });
        }
        // *** FIM DO WORKAROUND ***
        else if (axiosError.response?.status === 404) {
             // 404 para uma coleção não definida no fallback
             console.warn(`WTSS /describe_coverage retornou 404 para ${coverage} (não pré-definido).`);
             return res.status(404).json({
                 message: `A cobertura '${coverage}' não foi encontrada na API WTSS do BDC ou não possui atributos conhecidos.`,
                 detail: axiosError.response?.data?.description || 'API do INPE retornou Not Found'
             }); //
        } else {
            // Outros erros
            console.error("Erro detalhado ao buscar atributos de cobertura WTSS:", axiosError.response?.data || axiosError.message); //
            const status = axiosError.response?.status || 500; //
            res.status(status).json({
                message: 'Erro no servidor ao contatar a API WTSS do BDC para buscar atributos',
                detail: axiosError.response?.data || axiosError.message
            }); //
        }
    }
};