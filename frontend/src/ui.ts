// Importa a instância do nosso mapa para poder interagir com ela
import { mapManager } from './map';

function setupSidebarToggle(): void {
    const toggleButton = document.getElementById('toggle-sidebar');
    const container = document.querySelector('.container');
    const mainContent = document.getElementById('main-content');

    if (!toggleButton || !container || !mainContent) {
        console.error('Elementos da sidebar não encontrados!');
        return;
    }

    // Lógica para abrir/fechar a sidebar
    toggleButton.addEventListener('click', () => {
        if (window.innerWidth > 768) {
            container.classList.toggle('sidebar-hidden');
        } else {
            container.classList.toggle('sidebar-visible');
        }

        // AVISA O MAPA QUE ELE PRECISA SE AJUSTAR
        mapManager.invalidateSize();
    });

    // Lógica para fechar a sidebar ao clicar no mapa em telas pequenas
    mainContent.addEventListener('click', () => {
        if (window.innerWidth <= 768 && container.classList.contains('sidebar-visible')) {
            container.classList.remove('sidebar-visible');
            // AVISA O MAPA QUE ELE PRECISA SE AJUSTAR
            mapManager.invalidateSize();
        }
    });
}

// Função principal que inicializa todos os componentes da UI
export function initializeUI(): void {
    setupSidebarToggle();
    // Outras inicializações de UI podem vir aqui no futuro
}