import { Request, Response } from 'express';
import axios from 'axios';

// URL base para o serviço STAC
const BDC_STAC_URL = 'https://data.inpe.br/bdc/stac/v1';

/**
 * Busca itens APENAS dos cubos de dados compatíveis com WTSS.
 */
export const getStacItems = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Parâmetros latitude e longitude são obrigatórios.' });
        }

        const lon = parseFloat(longitude as string);
        const lat = parseFloat(latitude as string);
        const offset = 0.0001;
        const bboxString = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;

        // Lista de cubos de dados que queremos garantir que apareçam
        const compatibleCollections = 'S2-16D-2,LANDSAT-16D-1,CB4-16D-2';

        // Prepara as duas chamadas de API
        const targetedSearch = axios.get(`${BDC_STAC_URL}/search`, {
            params: { bbox: bboxString, limit: 50, collections: compatibleCollections }
        });

        const broadSearch = axios.get(`${BDC_STAC_URL}/search`, {
            params: { bbox: bboxString, limit: 50 } // Busca aberta
        });

        // Executa as duas buscas em paralelo para ganhar tempo
        const [targetedResponse, broadResponse] = await Promise.all([targetedSearch, broadSearch]);

        // Junta os resultados das duas buscas
        const allFeatures = [
            ...targetedResponse.data.features,
            ...broadResponse.data.features
        ];

        // Remove duplicados (caso um item apareça em ambas as buscas)
        // Usamos um Map para garantir que cada 'id' de feature seja único
        const uniqueFeatures = [...new Map(allFeatures.map(item => [item.id, item])).values()];

        // Monta a resposta final no mesmo formato que o frontend espera
        const finalResponse = {
            ...broadResponse.data, // Pega o cabeçalho da busca ampla
            features: uniqueFeatures, // Usa nossa lista única de features
            context: {
                returned: uniqueFeatures.length,
                limit: 100 // A soma dos nossos limites
            }
        };

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Erro ao buscar itens no STAC (busca dupla):", error);
        res.status(500).json({ message: 'Erro no servidor ao contatar a API STAC do BDC' });
    }
};

/**
 * Busca uma série temporal (WTSS).
 */
export const getTimeSeries = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, coverage, attributes, start_date, end_date } = req.query;

        if (!latitude || !longitude || !coverage || !attributes) {
            return res.status(400).json({ message: 'Parâmetros latitude, longitude, coverage e attributes são obrigatórios.' });
        }

        // URL correta do WTSS (sem /v1)
        const BDC_WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';

        const response = await axios.get(`${BDC_WTSS_URL}/time_series`, {
            params: {
                latitude,
                longitude,
                coverage,
                attributes,
                start_date,
                end_date
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro ao buscar série temporal:", error);
        res.status(500).json({ message: 'Erro no servidor ao contatar a API WTSS do BDC' });
    }
};