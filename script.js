// =========================================
// UNDERUTA — JAVASCRIPT
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    iniciarNavegacao();
    iniciarPlayer();
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


// =========================================
// PLAYER
// =========================================

function iniciarPlayer() {

    const botoes = document.querySelectorAll(".play-button");

    botoes.forEach((botao) => {

        botao.addEventListener("click", () => {

            const card = botao.closest(".music-card");

            if (!card) {
                return;
            }

            const titulo = card.querySelector("h3")?.textContent.trim();
            const artista = card.querySelector("p")?.textContent.trim();

            abrirPlayer(titulo, artista, botao);

        });

    });

}


// =========================================
// ABRIR PLAYER
// =========================================

function abrirPlayer(titulo, artista, botaoAtual) {

    let player = document.querySelector(".underuta-player");

    if (!player) {
        player = criarPlayer();
        document.body.appendChild(player);
    }

    player.querySelector(".player-title").textContent =
        titulo || "Música";

    player.querySelector(".player-artist").textContent =
        artista || "Artista";

    player.classList.add("player-visible");

    document.querySelectorAll(".play-button").forEach((botao) => {
        botao.textContent = "▶";
    });

    botaoAtual.textContent = "❚❚";
}


// =========================================
// CRIAR PLAYER
// =========================================

function criarPlayer() {

    const player = document.createElement("div");

    player.className = "underuta-player";

    player.innerHTML = `
        <div class="player-info">

            <div class="player-cover">
                ♪
            </div>

            <div>
                <strong class="player-title">
                    Música
                </strong>

                <span class="player-artist">
                    Artista
                </span>
            </div>

        </div>

        <div class="player-controls">

            <button
                class="player-play"
                aria-label="Reproduzir"
            >
                ▶
            </button>

        </div>

        <button
            class="player-close"
            aria-label="Fechar player"
        >
            ×
        </button>
    `;

    const botaoPlay = player.querySelector(".player-play");
    const botaoFechar = player.querySelector(".player-close");

    botaoPlay.addEventListener("click", () => {

        if (botaoPlay.textContent === "▶") {
            botaoPlay.textContent = "❚❚";
        } else {
            botaoPlay.textContent = "▶";
        }

    });

    botaoFechar.addEventListener("click", () => {

        player.classList.remove("player-visible");

        document.querySelectorAll(".play-button").forEach((botao) => {
            botao.textContent = "▶";
        });

    });

    return player;
}
