// Importa os tipos do Leaflet para que o TypeScript entenda o que é L, Map, Marker, etc.
import * as L from 'leaflet';

// Classe para gerenciar todas as operações do mapa
class MapManager {
    // Propriedades privadas para guardar a instância do mapa e o marcador atual
    private map: L.Map;
    private currentMarker: L.Marker | null = null;

    constructor(elementId: string) {
        // Inicializa o mapa no elemento HTML especificado (ex: 'map')
        this.map = L.map(elementId).setView([-23.305, -45.966], 13);
        this.addTileLayer();
        this.listenForClicks();
    }

    // Adiciona a camada de mapa base (OpenStreetMap)
    private addTileLayer(): void {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
    }

    // Fica "ouvindo" por cliques no mapa
    private listenForClicks(): void {
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            // Remove o marcador anterior se ele existir
            if (this.currentMarker) {
                this.map.removeLayer(this.currentMarker);
            }

            // Adiciona um novo marcador e o guarda na propriedade da classe
            this.currentMarker = L.marker([lat, lng]).addTo(this.map);

            console.log(`Ponto selecionado - Latitude: ${lat}, Longitude: ${lng}`);

            // TODO: Chamar a função para buscar dados da API com estas coordenadas
        });
    }

    // Método público para que outros módulos possam forçar o redimensionamento do mapa
    public invalidateSize(): void {
        // O timeout garante que a animação da sidebar termine antes de ajustar o mapa
        setTimeout(() => {
            this.map.invalidateSize();
        }, 300); // 300ms, mesmo tempo da transição do CSS
    }
}

// Cria e exporta uma ÚNICA instância do MapManager (padrão Singleton)
// Assim, toda a aplicação usará o mesmo objeto de mapa.
export const mapManager = new MapManager('map');