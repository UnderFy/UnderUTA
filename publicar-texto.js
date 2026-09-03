// =========================================
// UNDERUTA — PUBLICAR TEXTO
// =========================================

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href = "login.html";

        return;
    }


    const {
        data: perfil,
        error
    } = await supabaseClient

        .from("perfis")

        .select("tipo")

        .eq("id", user.id)

        .single();


    if (error || !perfil || perfil.tipo !== "artista") {

        window.location.href = "index.html";

        return;
    }


    const botao =
        document.querySelector("#publish-texto");

    const titulo =
        document.querySelector("#texto-titulo");

    const conteudo =
        document.querySelector("#texto-conteudo");

    const status =
        document.querySelector("#texto-status");


    botao.addEventListener("click", async () => {

        const tituloTexto =
            titulo.value.trim();

        const conteudoTexto =
            conteudo.value.trim();


        if (!conteudoTexto) {

            status.textContent =
                "Escreva um texto antes de publicar.";

            return;
        }


        botao.disabled = true;

        status.textContent =
            "Publicando...";


        const {
            error: erroPublicacao
        } = await supabaseClient

            .from("textos")

            .insert({

                artista_id: user.id,

                titulo:
                    tituloTexto || null,

                conteudo:
                    conteudoTexto

            });


        if (erroPublicacao) {

            console.error(
                "Erro ao publicar texto:",
                erroPublicacao
            );

            status.textContent =
                "Não foi possível publicar o texto.";

            botao.disabled = false;

            return;
        }


        status.textContent =
            "Texto publicado com sucesso.";


        titulo.value = "";

        conteudo.value = "";


        botao.disabled = false;

    });

}
