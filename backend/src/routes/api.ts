import { Router } from 'express';
// 1. Importe AMBAS as funções do controller
import { getStacItems, getTimeSeries } from '../controllers/bdcController';

const router = Router();

// Rota para buscar dados do STAC (já existe)
router.get('/stac/search', getStacItems);

// 2. NOVA ROTA para buscar a série temporal (WTSS)
router.get('/wtss/time-series', getTimeSeries);

export default router;