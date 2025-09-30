import { initializeUI } from './ui';
// O mapManager é inicializado automaticamente quando é importado, então não precisamos chamar nada dele aqui.
import { mapManager } from './map';

// Garante que o código só rode depois que o HTML foi completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação iniciada!');
    initializeUI();
});