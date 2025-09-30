document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-sidebar");
  const container = document.querySelector(".container");
  const sidebar = document.getElementById("sidebar");

  toggleButton.addEventListener("click", () => {
    // Em telas maiores, ele apenas esconde/mostra a sidebar
    if (window.innerWidth > 768) {
      container.classList.toggle("sidebar-hidden");
    } else {
      // Em telas menores, ele controla a visibilidade
      container.classList.toggle("sidebar-visible");
    }
  });

  // Opcional: Fechar a sidebar se clicar fora dela em telas pequenas
  document.getElementById("main-content").addEventListener("click", () => {
    if (
      window.innerWidth <= 768 &&
      container.classList.contains("sidebar-visible")
    ) {
      container.classList.remove("sidebar-visible");
    }
  });
});
