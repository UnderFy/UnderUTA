// =========================================
// UNDERUTA
// JavaScript principal
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("UnderUTA iniciado.");

    iniciarNavegacao();
});


// =========================================
// NAVEGAÇÃO
// =========================================

function iniciarNavegacao() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const destino = link.getAttribute("href");

            if (!destino || destino === "#") {
                return;
            }

            const elemento = document.querySelector(destino);

            if (!elemento) {
                return;
            }

            event.preventDefault();

            elemento.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}
