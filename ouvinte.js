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

        if (perfil.tipo !== "ouvinte") {
            window.location.href = "artista.html";
            return;
        }

        configurarSaudacao(perfil);
        carregarMusicas();
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
