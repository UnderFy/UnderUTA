document.addEventListener("DOMContentLoaded", () => {
    iniciarAreaDoOuvinte();
});

async function iniciarAreaDoOuvinte() {
    try {
        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const { data: perfil, error: perfilError } = await supabaseClient
            .from("perfis")
            .select("nome, username, tipo")
            .eq("id", user.id)
            .single();

        if (perfilError) throw perfilError;

        if (!perfil) {
    window.location.href = "ouvinte.html";
    return;
}

configurarSaudacao(perfil);
carregarMusicas();
carregarStories();
carregarArtistas();
configurarPlayer();

    } catch (error) {
        console.error("Erro ao iniciar área do ouvinte:", error);
    }
}


/* =========================================
   SAUDAÇÃO
========================================= */

function configurarSaudacao(perfil) {
    const titulo = document.querySelector(".listener-welcome h1");

    if (!titulo) return;

    const nome = perfil.nome?.trim();

    if (nome) {
        titulo.textContent = `Olá, ${nome}.`;
    } else {
        titulo.textContent = "Olá, ouvinte.";
    }
}


/* =========================================
   MÚSICAS
========================================= */

async function carregarMusicas() {
    alert("carregarMusicas foi executada");
    
    const container = document.querySelector("#listener-music");

    if (!container) return;

    const { data: musicas, error } = await supabaseClient
        .from("musicas_ouvintes")
        .select(`
            id,
            nome,
            artista_id,
            artista_nome,
            capa_url,
            audio_url,
            descricao,
            criado_em
        `)
        .order("criado_em", { ascending: false });

    if (error) {
    console.error("Erro ao carregar músicas:", error);

    container.innerHTML = `
        <article class="listener-music-card">
            <h3>Erro ao carregar músicas</h3>
            <p>${escaparHTML(error.message || "Erro desconhecido")}</p>
        </article>
    `;

    return;
    }

    container.innerHTML = "";

    if (!musicas || musicas.length === 0) {
        container.innerHTML = `
            <article class="listener-music-card">
                <div class="listener-music-cover"></div>

                <h3>Nenhuma música ainda</h3>

                <p>
                    As novidades aparecerão aqui.
                </p>
            </article>
        `;

        return;
    }

    musicas.forEach((musica) => {
        const card = document.createElement("article");

        card.className = "listener-music-card";

        card.innerHTML = `
            <div class="listener-music-cover">
                ${
                    musica.capa_url
                        ? `<img src="${musica.capa_url}" alt="Capa de ${escaparHTML(musica.nome)}">`
                        : ""
                }
            </div>

            <h3>${escaparHTML(musica.nome)}</h3>

            <p>${escaparHTML(musica.artista_nome || "Artista")}</p>
        `;

        card.addEventListener("click", () => {
            tocarMusica(musica);
        });

        container.appendChild(card);
    });
}


/* =========================================
   ARTISTAS
========================================= */

async function carregarArtistas() {
    const container = document.querySelector("#listener-artists");

    if (!container) return;

    const { data: artistas, error } = await supabaseClient
        .from("artistas")
        .select(`
            id,
            nome_artistico
        `)
        .order("nome_artistico", { ascending: true });

    if (error) {
        console.error("Erro ao carregar artistas:", error);
        return;
    }

    container.innerHTML = "";

    if (!artistas || artistas.length === 0) {
        container.innerHTML = `
            <div class="listener-artist-card">
                <h3>Nenhum artista ainda</h3>
                <p>Os artistas aparecerão aqui.</p>
            </div>
        `;

        return;
    }

    artistas.forEach((artista) => {
        const card = document.createElement("article");

        card.className = "listener-artist-card";

        const nome = artista.nome_artistico || "Artista";

        card.innerHTML = `
            <div class="listener-artist-avatar">
                <span>${escaparHTML(nome.charAt(0).toUpperCase())}</span>
            </div>

            <h3>${escaparHTML(nome)}</h3>
        `;

        container.appendChild(card);
    });
}

/* =========================================
   PLAYER
========================================= */

function configurarPlayer() {
    const audio = document.querySelector("#listener-audio");

    if (!audio) return;

    audio.addEventListener("ended", () => {
        audio.currentTime = 0;
    });
}


function tocarMusica(musica) {
    const audio = document.querySelector("#listener-audio");
    const titulo = document.querySelector("#player-title");
    const artista = document.querySelector("#player-artist");
    const capa = document.querySelector("#player-cover");

    if (!audio || !musica.audio_url) return;

    titulo.textContent = musica.nome || "Música";
    artista.textContent = musica.artista_nome || "Artista";

    if (musica.capa_url) {
        capa.src = musica.capa_url;
        capa.alt = `Capa de ${musica.nome || "música"}`;
    } else {
        capa.removeAttribute("src");
        capa.alt = "";
    }

    audio.src = musica.audio_url;

    audio.play().catch((error) => {
        console.error("Não foi possível iniciar a reprodução:", error);
    });
}


/* =========================================
   SEGURANÇA DO TEXTO
========================================= */

function escaparHTML(texto) {
    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

 /* =========================================
   STORIES
========================================= */

async function carregarStories() {
    const container = document.querySelector("#listener-stories");

    if (!container) return;

    const agora = new Date().toISOString();

    const { data: stories, error } = await supabaseClient
        .from("stories")
        .select(`
            id,
            artista_id,
            midia_url,
            tipo,
            criado_em,
            expira_em,
            artistas (
                id,
                nome_artistico
            )
        `)
        .gt("expira_em", agora)
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao carregar Stories:", error);
        return;
    }

    container.innerHTML = "";

    if (!stories || stories.length === 0) {
        container.innerHTML = `
            <div class="listener-story">
                <div class="listener-story-avatar">
                    <span>U</span>
                </div>

                <div class="listener-story-name">
                    Nenhum Story
                </div>
            </div>
        `;

        return;
    }

    const artistas = new Map();

    stories.forEach((story) => {
        if (!artistas.has(story.artista_id)) {
            artistas.set(story.artista_id, {
                artista: story.artistas,
                stories: []
            });
        }

        artistas.get(story.artista_id).stories.push(story);
    });

    artistas.forEach((grupo) => {
        const artista = grupo.artista;

        const nome = artista?.nome_artistico || "Artista";

        const storyElement = document.createElement("div");

        storyElement.className = "listener-story";

        storyElement.innerHTML = `
            <div class="listener-story-avatar">
                <span>${escaparHTML(nome.charAt(0).toUpperCase())}</span>
            </div>

            <div class="listener-story-name">
                ${escaparHTML(nome)}
            </div>
        `;

        storyElement.addEventListener("click", () => {
            abrirStory(grupo.stories);
        });

        container.appendChild(storyElement);
    });
}


/* =========================================
   VISUALIZAÇÃO DO STORY
========================================= */

let storiesAtuais = [];
let storyAtualIndex = 0;

function abrirStory(stories) {
    if (!stories || stories.length === 0) return;

    storiesAtuais = stories;
    storyAtualIndex = 0;

    const viewer = document.querySelector("#story-viewer");

    if (!viewer) return;

    viewer.hidden = false;

    mostrarStoryAtual();
}

function mostrarStoryAtual() {
    if (!storiesAtuais.length) return;

    const story = storiesAtuais[storyAtualIndex];

    const mediaContainer = document.querySelector(
        "#story-viewer-media-container"
    );

    const nomeElement = document.querySelector("#story-viewer-name");
    const timeElement = document.querySelector("#story-viewer-time");
    const avatarElement = document.querySelector("#story-viewer-avatar");
    const progressElement = document.querySelector("#story-viewer-progress");

    if (!mediaContainer) return;

    const artista = story.artistas;
    const nome = artista?.nome_artistico || "Artista";

    nomeElement.textContent = nome;

    avatarElement.textContent =
        nome.charAt(0).toUpperCase();

    if (story.criado_em) {
        const data = new Date(story.criado_em);

        timeElement.textContent =
            data.toLocaleDateString("pt-BR");
    } else {
        timeElement.textContent = "";
    }

    mediaContainer.innerHTML = "";

    if (story.tipo === "video") {
        const video = document.createElement("video");

        video.src = story.midia_url;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;

        mediaContainer.appendChild(video);
    } else {
        const imagem = document.createElement("img");

        imagem.src = story.midia_url;
        imagem.alt = `Story de ${nome}`;

        mediaContainer.appendChild(imagem);
    }

    atualizarProgresso();
    atualizarBotoes();
}

function atualizarProgresso() {
    const progressElement = document.querySelector(
        "#story-viewer-progress"
    );

    if (!progressElement) return;

    progressElement.innerHTML = "";

    storiesAtuais.forEach((_, index) => {
        const barra = document.createElement("span");

        if (index === storyAtualIndex) {
            barra.classList.add("active");
        }

        progressElement.appendChild(barra);
    });
}

function atualizarBotoes() {
    const anterior = document.querySelector("#story-viewer-prev");
    const proximo = document.querySelector("#story-viewer-next");

    if (anterior) {
        anterior.hidden = storyAtualIndex === 0;
    }

    if (proximo) {
        proximo.hidden =
            storyAtualIndex === storiesAtuais.length - 1;
    }
}

function fecharStory() {
    const viewer = document.querySelector("#story-viewer");

    if (!viewer) return;

    const mediaContainer = document.querySelector(
        "#story-viewer-media-container"
    );

    if (mediaContainer) {
        mediaContainer.innerHTML = "";
    }

    viewer.hidden = true;

    storiesAtuais = [];
    storyAtualIndex = 0;
}

function storyAnterior() {
    if (storyAtualIndex <= 0) return;

    storyAtualIndex--;

    mostrarStoryAtual();
}

function proximoStory() {
    if (storyAtualIndex >= storiesAtuais.length - 1) return;

    storyAtualIndex++;

    mostrarStoryAtual();
}

function configurarVisualizadorStory() {
    const fechar = document.querySelector("#story-viewer-close");
    const anterior = document.querySelector("#story-viewer-prev");
    const proximo = document.querySelector("#story-viewer-next");
    const backdrop = document.querySelector(".story-viewer-backdrop");

    if (fechar) {
        fechar.addEventListener("click", fecharStory);
    }

    if (anterior) {
        anterior.addEventListener("click", storyAnterior);
    }

    if (proximo) {
        proximo.addEventListener("click", proximoStory);
    }

    if (backdrop) {
        backdrop.addEventListener("click", fecharStory);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    configurarVisualizadorStory
);
