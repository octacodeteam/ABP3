import express from 'express';
// 1. Importe o roteador que acabamos de editar
import apiRouter from './routes/api';

const app = express();
const port = 3000; // Ou a porta que você preferir

// 2. Diga ao Express para usar nossas rotas de API
// Todas as rotas definidas em api.ts serão prefixadas com /api
app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});