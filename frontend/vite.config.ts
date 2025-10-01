import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            // Redireciona qualquer requisição que comece com /api para o seu backend
            '/api': {
                target: 'http://localhost:3000', // O endereço do seu servidor backend
                changeOrigin: true, // Necessário para o redirecionamento funcionar corretamente
            },
        },
    },
});