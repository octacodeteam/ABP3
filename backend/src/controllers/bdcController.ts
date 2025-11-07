import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

// --- URLs CORRETAS ---
const BDC_STAC_URL = 'https://data.inpe.br/bdc/stac/v1';
// CORREÇÃO 1: Removida a barra '/' do final
const BDC_WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4'; 
// --- FIM DA CORREÇÃO 1 ---

const WTSS_COMPATIBLE_COLLECTIONS = [
    'S2-16D-2', 'myd11a2-6.1', 'myd13q1-6.1', 'mod13q1-6.1', 'CBERS4-WFI-16D-2', 'CBERS-WFI-8D-1', 'LANDSAT-16D-1', 'mod11a2-6.1', 'CBERS4-MUX-2M-1',
];

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

        const stacSearchUrl = `${BDC_STAC_URL}/search`; 

        const compatibleCollectionsParam = WTSS_COMPATIBLE_COLLECTIONS.join(',');

        console.log(`Buscando STAC (COLEÇÕES COMPATÍVEIS) em ${stacSearchUrl} com bbox: ${bboxString} e collections: ${compatibleCollectionsParam}`);

        const response = await axios.get(stacSearchUrl, {
            params: {
                bbox: bboxString,
                collections: compatibleCollectionsParam, 
                limit: 150
            }
        }); 

        const featuresWithFlag = response.data.features.map((feature: any) => ({
            ...feature,
            properties: {
                ...feature.properties,
                isWtssCompatible: true 
            }
        }));

        featuresWithFlag.sort((a: any, b: any) => {
            const dateA = a.properties?.datetime ? new Date(a.properties.datetime).getTime() : 0;
            const dateB = b.properties?.datetime ? new Date(b.properties.datetime).getTime() : 0;
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA; 
        });

        res.status(200).json({
             ...response.data, 
             features: featuresWithFlag 
            });

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
        // Renomeia na desestruturação para _str (string)
        const { latitude: latStr, longitude: lonStr, coverage, attributes, start_date, end_date } = req.query;

        if (!latStr || !lonStr || !coverage || !attributes) {
            return res.status(400).json({ message: 'Parâmetros latitude, longitude, coverage e attributes são obrigatórios.' });
        }

        // --- CORREÇÃO 2: Converte para float antes de enviar ---
        const latitude = parseFloat(latStr as string);
        const longitude = parseFloat(lonStr as string);
        // --- FIM DA CORREÇÃO 2 ---

        // URL agora é montada corretamente (sem //)
        const wtssTimeSeriesUrl = `${BDC_WTSS_URL}/time_series`;
        console.log(`Buscando WTSS Time Series em ${wtssTimeSeriesUrl} para coverage ${coverage}, attribute ${attributes}`);

        const response = await axios.get(wtssTimeSeriesUrl, {
            // Passa os valores convertidos para NÚMERO
            params: { latitude, longitude, coverage, attributes, start_date, end_date } 
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
 * Busca os atributos disponíveis para UMA cobertura específica (WTSS).
 */
export const getCoverageAttributes = async (req: Request, res: Response) => {
    const coverage = req.query.coverage as string; 

    if (!coverage) {
        return res.status(400).json({ message: 'Parâmetro coverage (apenas um nome) é obrigatório.' }); 
    }
    
    // WORKAROUND PARA O NDVI DO S2-16D-2 QUE ESTÁ QUEBRADO NA API DO INPE
    const knownAttributes: { [key: string]: string[] } = {
        // 'NDVI' FOI REMOVIDO DAQUI PARA EVITAR A CHAMADA QUEBRADA
        'S2-16D-2': ['EVI', 'NBR', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B8A', 'B09', 'B11', 'B12', 'SCL', 'CLEAROB', 'TOTALOB', 'PROVENANCE'],
        'LANDSAT-16D-1': ['NDVI', 'coastal', 'qa_pixel', 'CLEAROB', 'TOTALOB', 'PROVENANCE', 'blue', 'green', 'red', 'nir08', 'swir16', 'swir22', 'DATASOURCE', 'EVI'], 
        'mod13q1-6.1': ['NDVI', 'EVI', 'VI_Quality', 'composite_day_of_the_year', 'pixel_reliability', 'blue_reflectance', 'red_reflectance', 'NIR_reflectance', 'MIR_reflectance', 'view_zenith_angle', 'sun_zenith_angle', 'relative_azimuth_angle'], 
        'CBERS4-MUX-2M-1': ['BAND5', 'BAND6', 'BAND7', 'BAND8', 'NDVI', 'CMASK', 'CLEAROB', 'TOTALOB', 'PROVENANCE', 'EVI'],
        'CBERS4-WFI-16D-2': ['BAND13', 'BAND14', 'CMASK', 'CLEAROB', 'TOTALOB', 'PROVENANCE', 'BAND15', 'BAND16', 'EVI', 'NDVI'],
        'CBERS-WFI-8D-1': ['BAND13', 'CMASK', 'CLEAROB', 'TOTALOB', 'DATASOURCE', 'PROVENANCE', 'EVI', 'NDVI', 'BAND14', 'BAND15', 'BAND16'],
        'mod11a2-6.1': ['LST_Day_1km', 'QC_Day', 'Day_view_time', 'Day_view_angl', 'Clear_sky_days', 'LST_Night_1km', 'QC_Night', 'Night_view_time', 'Night_view_angl', 'Emis_31', 'Clear_sky_nights', 'Emis_32'],
        'myd11a2-6.1': ['LST_Day_1km', 'QC_Day', 'Day_view_time', 'Day_view_angl', 'LST_Night_1km', 'QC_Night', 'Night_view_time', 'Night_view_angl', 'Emis_31', 'Emis_32', 'Clear_sky_days', 'Clear_sky_nights'], 
        'myd13q1-6.1': ['NDVI', 'EVI', 'blue_reflectance', 'red_reflectance', 'NIR_reflectance', 'VI_Quality', 'view_zenith_angle', 'composite_day_of_the_year', 'pixel_reliability', 'MIR_reflectance', 'sun_zenith_angle', 'relative_azimuth_angle'] 
    };
    
    // URL agora é montada corretamente (sem //)
    const wtssDescribeUrl = `${BDC_WTSS_URL}/describe_coverage`;
    console.log(`Buscando atributos WTSS em ${wtssDescribeUrl} para: ${coverage}`);

    try {
        const response = await axios.get(wtssDescribeUrl, {
            params: { coverage: coverage } 
        });

        const responseData = response.data;
        const attributes = Object.keys(responseData.attributes || {}); 

        console.log(`Atributos encontrados via API para ${coverage}: ${attributes.join(', ')}`);
        res.status(200).json({
            coverages: [{ coverage: coverage, attributes: attributes }]
        }); 

    } catch (error: any) {
        const axiosError = error as AxiosError<{ code?: number; description?: string }>; 

        if (axiosError.response?.status === 404 && knownAttributes[coverage]) {
            console.warn(`WTSS /describe_coverage retornou 404 para ${coverage}. Usando atributos pré-definidos como fallback.`);
            res.status(200).json({ 
                coverages: [{
                    coverage: coverage,
                    attributes: knownAttributes[coverage] 
                }]
            });
        }
        else if (axiosError.response?.status === 404) {
             console.warn(`WTSS /describe_coverage retornou 404 para ${coverage} (não pré-definido).`);
             return res.status(404).json({
                 message: `A cobertura '${coverage}' não foi encontrada na API WTSS do BDC ou não possui atributos conhecidos.`,
                 detail: axiosError.response?.data?.description || 'API do INPE retornou Not Found'
             }); 
        } else {
            console.error("Erro detalhado ao buscar atributos de cobertura WTSS:", axiosError.response?.data || error.message); 
            const status = axiosError.response?.status || 500; 
            res.status(status).json({
                message: 'Erro no servidor ao contatar a API WTSS do BDC para buscar atributos',
                detail: axiosError.response?.data || axiosError.message
            }); 
        }
    }
};