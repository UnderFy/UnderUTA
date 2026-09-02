document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) {
        console.error("ERRO AUTH:", userError);

        document.querySelector("#artist-name").textContent =
            "Erro ao verificar login.";

        return;
    }

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfis")
        .select("nome, username, tipo")
        .eq("id", user.id)
        .single();

    if (perfilError) {
        console.error("ERRO AO CARREGAR PERFIL:", perfilError);

        document.querySelector("#artist-name").textContent =
            "Erro ao carregar perfil: " + perfilError.message;

        return;
    }

    if (!perfil) {
        console.error("PERFIL NÃO ENCONTRADO:", user.id);

        document.querySelector("#artist-name").textContent =
            "Perfil não encontrado.";

        return;
    }

    if (perfil.tipo !== "artista") {
        window.location.href = "feed.html";
        return;
    }

    document.querySelector("#artist-name").textContent =
        `Olá, ${perfil.nome || perfil.username}!`;

    // BOTÃO SAIR

    const logout = document.querySelector("#logout-btn");

    logout.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    });

    // LISTA DE LANÇAMENTOS

    const releasesList =
        document.querySelector("#releases-list");

    const {
        data: musicas,
        error: musicasError
    } = await supabaseClient
        .from("musicas_ouvintes")
        .select(
            "id, nome, artista_nome, capa_url, audio_url, descricao, criado_em"
        )
        .eq("artista_id", user.id)
        .order("criado_em", { ascending: false });

    if (musicasError) {
        console.error(
            "ERRO AO CARREGAR LANÇAMENTOS:",
            musicasError
        );

        releasesList.innerHTML =
            "<p>Não foi possível carregar seus lançamentos.</p>";

        return;
    }

    if (!musicas || musicas.length === 0) {
        releasesList.innerHTML =
            "<p>Nenhuma música lançada ainda.</p>";

        return;
    }

    releasesList.innerHTML = "";

    musicas.forEach(musica => {

        const card = document.createElement("div");

        card.className = "release-card";

        card.innerHTML = `
            <div class="release-cover">
                <img
                    src="${musica.capa_url}"
                    alt="Capa de ${musica.nome}"
                >
            </div>

            <div class="release-info">

                <h3>${musica.nome}</h3>

                <p>${musica.descricao || ""}</p>

                <div class="under-player">

                    <audio
                        class="under-audio"
                        src="${musica.audio_url}"
                        preload="metadata">
                    </audio>

                    <button
                        class="under-play"
                        type="button"
                        aria-label="Reproduzir">
                        ▶
                    </button>

                    <div class="under-player-main">

                        <div class="under-progress-area">

                            <span class="under-current">
                                0:00
                            </span>

                            <input
                                class="under-progress"
                                type="range"
                                min="0"
                                max="100"
                                value="0"
                                step="0.1"
                            >

                            <span class="under-duration">
                                0:00
                            </span>

                        </div>

                        <div class="under-volume-area">

                            <span class="under-volume-icon">
                                🔊
                            </span>

                            <input
                                class="under-volume"
                                type="range"
                                min="0"
                                max="1"
                                value="1"
                                step="0.01"
                            >

                        </div>

                    </div>

                </div>

            </div>
        `;

        releasesList.appendChild(card);

        const audio =
            card.querySelector(".under-audio");

        const playButton =
            card.querySelector(".under-play");

        const progress =
            card.querySelector(".under-progress");

        const currentTime =
            card.querySelector(".under-current");

        const duration =
            card.querySelector(".under-duration");

        const volume =
            card.querySelector(".under-volume");

        const volumeIcon =
            card.querySelector(".under-volume-icon");


        function formatTime(seconds) {

            if (!Number.isFinite(seconds)) {
                return "0:00";
            }

            const minutes =
                Math.floor(seconds / 60);

            const secs =
                Math.floor(seconds % 60);

            return `${minutes}:${secs
                .toString()
                .padStart(2, "0")}`;
        }


        audio.addEventListener(
            "loadedmetadata",
            () => {

                duration.textContent =
                    formatTime(audio.duration);

            }
        );


        audio.addEventListener(
            "timeupdate",
            () => {

                currentTime.textContent =
                    formatTime(audio.currentTime);

                if (audio.duration) {

                    progress.value =
                        (audio.currentTime /
                        audio.duration) * 100;

                }

            }
        );


        playButton.addEventListener(
            "click",
            () => {

                if (audio.paused) {

                    document
                        .querySelectorAll(".under-audio")
                        .forEach(outroAudio => {

                            if (outroAudio !== audio) {
                                outroAudio.pause();
                            }

                        });

                    audio.play();

                } else {

                    audio.pause();

                }

            }
        );


        audio.addEventListener(
            "play",
            () => {

                playButton.textContent = "⏸";

            }
        );


        audio.addEventListener(
            "pause",
            () => {

                playButton.textContent = "▶";

            }
        );


        audio.addEventListener(
            "ended",
            () => {

                playButton.textContent = "▶";
                progress.value = 0;

            }
        );


        progress.addEventListener(
            "input",
            () => {

                if (!audio.duration) {
                    return;
                }

                audio.currentTime =
                    (progress.value / 100) *
                    audio.duration;

            }
        );


        volume.addEventListener(
            "input",
            () => {

                audio.volume =
                    Number(volume.value);

                volumeIcon.textContent =
                    audio.volume === 0
                        ? "🔇"
                        : "🔊";

            }
        );

    });

});
