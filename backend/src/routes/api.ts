import { Router } from 'express';
// 1. Importe a função que criamos no controller
import { getStacItems } from '../controllers/bdcController';

const router = Router();

// 2. Crie a rota GET que o frontend irá chamar
// A URL será /api/stac/search?latitude=...&longitude=...
router.get('/stac/search', getStacItems);

export default router;