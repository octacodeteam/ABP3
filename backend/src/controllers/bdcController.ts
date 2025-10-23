import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

// --- URLs CORRIGIDAS ---
// URL base para o serviço STAC
const BDC_STAC_URL = 'https://data.inpe.br/bdc/stac/v1';
// URL base para o serviço WTSS
const BDC_WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';
// --- FIM DAS URLs CORRIGIDAS ---

/**
 * Busca itens STAC.
 */
export const getStacItems = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Parâmetros latitude e longitude são obrigatórios.' });
        }

        const lon = parseFloat(longitude as string);
        const lat = parseFloat(latitude as string);
        const offset = 0.001;
        const bboxString = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;

        const compatibleCollections = [
            'S2-16D-2',
            'LC8-16D-1',
            'LC9-16D-1',
            'MOD13Q1-6',
        ].join(',');

        // *** USA A URL STAC CORRIGIDA ***
        const stacSearchUrl = `${BDC_STAC_URL}/search`;

        console.log(`Buscando STAC em ${stacSearchUrl} com bbox: ${bboxString}`);

        const response = await axios.get(stacSearchUrl, {
            params: {
                bbox: bboxString,
                collections: compatibleCollections,
                limit: 100
            }
        });

        res.status(200).json(response.data);

    } catch (error: any) {
        console.error("Erro detalhado ao buscar itens no STAC:", error.response?.data || error.message);
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        res.status(status).json({
            message: 'Erro no servidor ao contatar a API STAC do BDC',
            detail: axiosError.response?.data || axiosError.message
        });
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

        // *** USA A URL WTSS CORRIGIDA ***
        const wtssTimeSeriesUrl = `${BDC_WTSS_URL}/time_series`;
        console.log(`Buscando WTSS Time Series em ${wtssTimeSeriesUrl} para coverage ${coverage}, attribute ${attributes}`);

        const response = await axios.get(wtssTimeSeriesUrl, {
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

    } catch (error: any) {
        console.error("Erro detalhado ao buscar série temporal WTSS:", error.response?.data || error.message);
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        res.status(status).json({
            message: 'Erro no servidor ao contatar a API WTSS do BDC para buscar série temporal',
            detail: axiosError.response?.data || axiosError.message
        });
    }
};

/**
 * Busca os atributos disponíveis para uma ou mais coberturas (WTSS).
 */
export const getCoverageAttributes = async (req: Request, res: Response) => {
    try {
        const coverages = req.query.coverage as string;

        if (!coverages) {
            return res.status(400).json({ message: 'Parâmetro coverage é obrigatório (pode ser um ou mais nomes separados por vírgula).' });
        }

        // *** USA A URL WTSS CORRIGIDA ***
        const wtssDescribeUrl = `${BDC_WTSS_URL}/describe_coverage`;
        console.log(`Buscando atributos WTSS em ${wtssDescribeUrl} para: ${coverages}`);

        const response = await axios.get(wtssDescribeUrl, {
            params: {
                coverage: coverages
            }
        });

        const responseData = response.data;
        const formattedCoverages = Object.keys(responseData).map(coverageName => ({
            coverage: coverageName,
            attributes: Object.keys(responseData[coverageName].attributes || {})
        }));

        res.status(200).json({ coverages: formattedCoverages });

    } catch (error: any) {
        console.error("Erro detalhado ao buscar atributos de cobertura WTSS:", error.response?.data || error.message);
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        res.status(status).json({
            message: 'Erro no servidor ao contatar a API WTSS do BDC para buscar atributos de cobertura',
            detail: axiosError.response?.data || axiosError.message
        });
    }
};