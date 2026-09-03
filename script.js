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

// =========================================
// STORIES — OUVINTES
// =========================================

async function carregarStories() {

    const lista = document.querySelector("#stories-list");

    if (!lista) {
        return;
    }

    lista.innerHTML = `
        <p id="stories-loading">
            Carregando Stories...
        </p>
    `;

    const { data: stories, error } = await supabaseClient
        .from("stories")
        .select("id, artista_id, midia_url, tipo, criado_em, expira_em")
        .gt("expira_em", new Date().toISOString())
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao carregar Stories:", error);

        lista.innerHTML = `
            <p>
                Não foi possível carregar os Stories.
            </p>
        `;

        return;
    }

    if (!stories || stories.length === 0) {

        lista.innerHTML = `
            <p>
                Nenhum Story publicado no momento.
            </p>
        `;

        return;
    }

    const idsArtistas = [
        ...new Set(
            stories
                .map((story) => story.artista_id)
                .filter(Boolean)
        )
    ];

    let artistas = [];

    if (idsArtistas.length > 0) {

        const respostaArtistas = await supabaseClient
            .from("artistas")
            .select("id, nome_artistico")
            .in("id", idsArtistas);

        if (respostaArtistas.error) {
            console.error(
                "Erro ao carregar artistas:",
                respostaArtistas.error
            );
        } else {
            artistas = respostaArtistas.data || [];
        }
    }

    const mapaArtistas = {};

    artistas.forEach((artista) => {
        mapaArtistas[artista.id] = artista;
    });

    lista.innerHTML = "";

    stories.forEach((story) => {

        const artista = mapaArtistas[story.artista_id];

        const nomeArtista =
            artista?.nome_artistico ||
            "Artista";

        const inicial =
            nomeArtista
                .trim()
                .charAt(0)
                .toUpperCase() || "A";

        const card = document.createElement("article");

        card.className = "story";
        card.dataset.storyId = story.id;

        card.innerHTML = `
            <button
                type="button"
                class="story-button"
                aria-label="Abrir Story de ${nomeArtista}"
            >

                <div class="story-avatar">
                    ${inicial}
                </div>

                <span>
                    ${nomeArtista}
                </span>

            </button>
        `;

        const botao = card.querySelector(".story-button");

        botao.addEventListener("click", () => {
            abrirStory(story, nomeArtista);
        });

        lista.appendChild(card);
    });
}


// =========================================
// ABRIR STORY
// =========================================

function abrirStory(story, nomeArtista) {

    let viewer = document.querySelector("#story-viewer");

    if (!viewer) {

        viewer = document.createElement("div");

        viewer.id = "story-viewer";
        viewer.className = "story-viewer";

        viewer.innerHTML = `
            <div class="story-viewer-content">

                <button
                    type="button"
                    class="story-close"
                    aria-label="Fechar Story"
                >
                    ×
                </button>

                <div class="story-artist-name"></div>

                <div class="story-media"></div>

            </div>
        `;

        document.body.appendChild(viewer);

        viewer
            .querySelector(".story-close")
            .addEventListener("click", () => {
                viewer.classList.remove("story-viewer-visible");
            });
    }

    const nome = viewer.querySelector(".story-artist-name");
    const media = viewer.querySelector(".story-media");

    nome.textContent = nomeArtista;

    media.innerHTML = "";

    if (story.tipo === "video") {

        const video = document.createElement("video");

        video.src = story.midia_url;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;

        media.appendChild(video);

    } else {

        const imagem = document.createElement("img");

        imagem.src = story.midia_url;
        imagem.alt = `Story de ${nomeArtista}`;

        media.appendChild(imagem);
    }

    viewer.classList.add("story-viewer-visible");
}


// =========================================
// INICIAR STORIES
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    carregarStories();
});
