import { initializeUI } from './ui';
import { mapManager } from './map';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação iniciada!');

    initializeUI();

    // Adiciona o listener para o botão do menu principal
    const toggleButton = document.getElementById('toggle-sidebar');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            // Espera a animação do CSS e então atualiza o tamanho do mapa
            setTimeout(() => mapManager.invalidateSize(), 300);
        });
    }
});