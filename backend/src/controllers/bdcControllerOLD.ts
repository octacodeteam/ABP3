import { Request, Response } from 'express';
import axios from 'axios';

const BDC_BASE_URL = 'https://data.inpe.br/bdc';

export const getTimeSeries = async (req: Request, res: Response) => {
    try {
        // Pegamos os parâmetros que o NOSSO frontend enviou
        const { latitude, longitude, coverage, attributes } = req.query;

        // Fazemos a chamada para a API externa do BDC usando Axios
        const response = await axios.get(${ BDC_BASE_URL } / wtss / v4 / time_series, {
            params: {
                latitude,
                longitude,
                coverage, // Ex: 'LCF-MODIS-250m-16d'
                attributes // Ex: 'red,nir'
            }
        });

        // Enviamos a resposta do BDC de volta para o nosso frontend
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro ao buscar série temporal:", error);
        res.status(500).json({ message: 'Erro no servidor ao contatar a API do BDC' });
    }
};

// Você pode criar uma função similar para o STAC
export const getStacItems = async (req: Request, res: Response) => {
    // Lógica para chamar a API /bdc/stac/v1/
};