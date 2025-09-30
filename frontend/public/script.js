document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-sidebar");
  const container = document.querySelector(".container");
  const mainContent = document.getElementById("main-content");

  // --- INICIALIZAÇÃO DO MAPA ---
  // Coordenadas de Jacareí, SP
  const map = L.map("map").setView([-23.305, -45.966], 13);

  // Adiciona o mapa de fundo (Tile Layer) do OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Adiciona um marcador de exemplo
  L.marker([-23.305, -45.966])
    .addTo(map)
    .bindPopup("Centro de Jacareí!")
    .openPopup();

  // --- LÓGICA DA SIDEBAR ---
  toggleButton.addEventListener("click", () => {
    // Em telas maiores, ele apenas esconde/mostra a sidebar no grid
    if (window.innerWidth > 768) {
      container.classList.toggle("sidebar-hidden");
    } else {
      // Em telas menores, ele controla a visibilidade em modo "overlay"
      container.classList.toggle("sidebar-visible");
    }

    // IMPORTANTE: Informa ao mapa que seu tamanho mudou.
    // O timeout garante que a animação CSS termine antes do mapa se ajustar.
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // 300ms, igual à transição do CSS
  });

  // Opcional: Fechar a sidebar se clicar no mapa em telas pequenas
  mainContent.addEventListener("click", () => {
    if (
      window.innerWidth <= 768 &&
      container.classList.contains("sidebar-visible")
    ) {
      container.classList.remove("sidebar-visible");
      // Ajusta o mapa ao fechar
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  });
});
