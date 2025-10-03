// arquivo: frontend/src/map.ts

import * as L from 'leaflet';
import { fetchStacData } from './apiService';
import { displayResults, showLoading, setupCompareLogic } from './ui';

class MapManager {
    private map: L.Map;
    private currentMarker: L.Marker | null = null;

    constructor(elementId: string) {
        // Inicializa o mapa no elemento HTML com o ID 'map'
        this.map = L.map(elementId).setView([-23.305, -45.966], 13);

        // Adiciona as camadas e os eventos
        this.addTileLayer();
        this.listenForClicks();
    }

    /**
     * Adiciona a camada de mapa base (OpenStreetMap)
     */
    private addTileLayer(): void {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
    }

    /**
     * Fica "ouvindo" por cliques no mapa e dispara todo o fluxo de busca de dados.
     */
    private listenForClicks(): void {
        this.map.on('click', async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            // Remove o marcador anterior, se houver, e adiciona um novo
            if (this.currentMarker) {
                this.map.removeLayer(this.currentMarker);
            }
            this.currentMarker = L.marker([lat, lng]).addTo(this.map);

            // A cada clique, reconfiguramos a lógica de comparação com as novas coordenadas
            setupCompareLogic({ lat, lon: lng });

            console.log(`Buscando dados para - Latitude: ${lat}, Longitude: ${lng}`);

            // 1. Mostra o estado de "carregando" na UI
            showLoading(true);

            // 2. Chama o serviço de API para buscar os dados (STAC)
            const features = await fetchStacData(lat, lng);

            // 3. Envia os resultados para a UI para serem exibidos
            displayResults(features);

            // 4. Esconde o estado de "carregando"
            showLoading(false);
        });
    }

    /**
     * Método público para forçar o mapa a se redimensionar.
     * Útil quando as sidebars abrem/fecham.
     */
    public invalidateSize(): void {
        setTimeout(() => {
            this.map.invalidateSize();
        }, 300); // O delay corresponde à animação do CSS
    }
}

// Cria e exporta uma única instância do MapManager para ser usada em toda a aplicação
export const mapManager = new MapManager('map');