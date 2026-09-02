document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) {
        console.error(userError);
        return;
    }

    if (!user) {
        window.location.href = "login.html";
        return;
    }


    // Busca o perfil do artista
    const { data: perfil, error: perfilError } =
        await supabaseClient
            .from("perfis")
            .select("nome, username, tipo")
            .eq("id", user.id)
            .single();


    if (perfilError) {
        console.error(perfilError);
        return;
    }


    // Confirma que é artista
    if (perfil.tipo !== "artista") {
        window.location.href = "feed.html";
        return;
    }


    // Nome do artista
    const nome = document.querySelector("#artist-name");

    nome.textContent =
        `Olá, ${perfil.nome || perfil.username}!`;


    // Botão sair
    const logout = document.querySelector("#logout-btn");

    logout.addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

    });


    // Lista de lançamentos
    const releasesList =
        document.querySelector("#releases-list");


    const { data: musicas, error: musicasError } =
        await supabaseClient
            .from("musicas_ouvintes")
            .select("id, nome, artista_nome, capa_url, audio_url, descricao, criado_em")
            .eq("artista_id", user.id)
            .order("criado_em", { ascending: false });


    if (musicasError) {

        console.error(musicasError);

        releasesList.innerHTML =
            "<p>Não foi possível carregar seus lançamentos.</p>";

        return;
    }


    // Nenhuma música
    if (!musicas || musicas.length === 0) {

        releasesList.innerHTML =
            "<p>Nenhuma música lançada ainda.</p>";

        return;
    }


    // Limpa o carregando
    releasesList.innerHTML = "";


    // Mostra cada música
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

                <p>
                    ${musica.descricao || ""}
                </p>

                <audio
                    controls
                    src="${musica.audio_url}">
                </audio>

            </div>
        `;


        releasesList.appendChild(card);

    });

});
