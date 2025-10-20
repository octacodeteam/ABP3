// Copie e cole este código completo para substituir o seu arquivo map.ts

import * as L from 'leaflet';
import { fetchStacData } from './apiService';
import { displayResults, showLoading, setupCompareLogic } from './ui';

class MapManager {
    private map: L.Map;
    private currentMarker: L.Marker | null = null;

    constructor(elementId: string) {
        this.map = L.map(elementId).setView([-23.305, -45.966], 13);
        this.addTileLayer();
        this.listenForClicks();
    }

    private addTileLayer(): void {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
    }

    /**
     * Fica "ouvindo" por cliques no mapa.
     */
    private listenForClicks(): void {
        this.map.on('click', async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            // Ao clicar no mapa, chama a nossa nova função centralizada
            this.searchAndDisplayData(lat, lng);
        });
    }

    /**
     * MÉTODO CENTRALIZADO: Busca e exibe dados para um ponto geográfico.
     * Esta é a principal mudança.
     * @param lat Latitude do ponto.
     * @param lon Longitude do ponto.
     */
    public async searchAndDisplayData(lat: number, lon: number): Promise<void> {
        // Remove o marcador anterior, se houver, e adiciona um novo
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }
        this.currentMarker = L.marker([lat, lon]).addTo(this.map);

        // Reconfigura a lógica de comparação com as novas coordenadas
        setupCompareLogic({ lat, lon });

        console.log(`Buscando dados para - Latitude: ${lat}, Longitude: ${lon}`);

        // 1. Mostra o estado de "carregando" na UI
        showLoading(true);

        // 2. Chama a API para buscar os dados STAC
        const features = await fetchStacData(lat, lon);

        // 3. Envia os resultados para a UI para serem exibidos
        displayResults(features);

        // 4. Esconde o estado de "carregando"
        showLoading(false);
    }

    /**
     * Move o mapa para uma nova localização e, EM SEGUIDA, dispara a busca de dados.
     * @param lat A latitude do novo centro.
     * @param lon A longitude do novo centro.
     */
    public panToLocation(lat: number, lon: number): void {
        const zoomLevel = 13;
        this.map.flyTo([lat, lon], zoomLevel);

        // Gatilho: Após mover o mapa, chama a busca de dados para o novo ponto.
        // Isso garante que a busca por "Jacareí" já popule a lista de resultados.
        this.searchAndDisplayData(lat, lon);
    }
    
    public invalidateSize(): void {
        setTimeout(() => {
            this.map.invalidateSize();
        }, 300);
    }
}

// Cria e exporta uma única instância do MapManager
export const mapManager = new MapManager('map');