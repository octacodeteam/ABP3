import * as L from 'leaflet';
// --- IMPORTAÇÕES NOVAS ---
import { fetchStacData } from './apiService'; // Nosso "mensageiro"
import { displayResults, showLoading } from './ui';   // Funções da interface que vamos criar a seguir

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

    // --- A função se torna 'async' para poder usar 'await' ---
    private listenForClicks(): void {
        this.map.on('click', async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            if (this.currentMarker) {
                this.map.removeLayer(this.currentMarker);
            }
            this.currentMarker = L.marker([lat, lng]).addTo(this.map);

            console.log(`Buscando dados para - Latitude: ${lat}, Longitude: ${lng}`);

            // --- MOSTRA O FEEDBACK DE CARREGAMENTO NA UI ---
            showLoading(true);

            // --- CHAMA A API USANDO O NOSSO MENSAGEIRO ---
            const features = await fetchStacData(lat, lng);

            // --- ENVIA OS DADOS PARA SEREM EXIBIDOS NA UI ---
            displayResults(features);
            showLoading(false); // Esconde o feedback de carregamento
        });
    }

    public invalidateSize(): void {
        setTimeout(() => {
            this.map.invalidateSize();
        }, 300);
    }
}

export const mapManager = new MapManager('map');