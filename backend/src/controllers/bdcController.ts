import { Request, Response } from 'express';
import axios from 'axios';

// URL base para o serviço STAC que funcionou na sua rede
const BDC_STAC_URL = 'https://data.inpe.br/bdc/stac/v1';

/**
 * Função para o PASSO ATUAL (RF02 - Listar dados disponíveis)
 * Busca itens no catálogo STAC usando o método GET.
 */
// Cole esta nova versão da função no lugar da antiga
export const getStacItems = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Parâmetros latitude e longitude são obrigatórios.' });
        }

        // --- INÍCIO DA MUDANÇA ---
        const lon = parseFloat(longitude as string);
        const lat = parseFloat(latitude as string);

        // Define um deslocamento mínimo para criar uma caixa válida
        const offset = 0.0001;

        const min_lon = lon - offset;
        const min_lat = lat - offset;
        const max_lon = lon + offset;
        const max_lat = lat + offset;

        // Monta a string da bbox com a pequena área
        const bboxString = `${min_lon},${min_lat},${max_lon},${max_lat}`;
        // --- FIM DA MUDANÇA ---

        const response = await axios.get(`${BDC_STAC_URL}/search`, {
            params: {
                bbox: bboxString, // Usa a nova string da bbox
                limit: 100
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro ao buscar itens no STAC (via GET):", error);
        res.status(500).json({ message: 'Erro no servidor ao contatar a API STAC do BDC' });
    }
};

/**
 * Função para o PASSO FUTURO (RF03 - Visualizar séries temporais)
 * Busca uma série temporal de dados para um ponto específico.
 */
// Substitua a função getTimeSeries existente por esta
// Use esta versão da função getTimeSeries
export const getTimeSeries = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, coverage, attributes } = req.query;

        if (!latitude || !longitude || !coverage) {
            return res.status(400).json({ message: 'Parâmetros latitude, longitude e coverage são obrigatórios.' });
        }

        // --- URL CORRETA E OFICIAL do WTSS ---
        const BDC_WTSS_URL = 'https://brazil-data-cube.dpi.inpe.br/wtss';

        const response = await axios.get(`${BDC_WTSS_URL}/time_series`, {
            params: {
                latitude,
                longitude,
                coverage,
                attributes
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        // Log detalhado do erro no terminal do backend
        console.error("Erro ao buscar série temporal:", error);
        // Resposta genérica para o frontend
        res.status(500).json({ message: 'Erro no servidor ao contatar a API WTSS do BDC' });
    }
};