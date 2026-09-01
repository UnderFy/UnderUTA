document.addEventListener("DOMContentLoaded", () => {
    iniciarTipoDeConta();
    iniciarLogin();
});

let tipoDeConta = "ouvinte";

function iniciarTipoDeConta() {
    const botoes = document.querySelectorAll(".account-type");

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {

            botoes.forEach((item) => {
                item.classList.remove("active");
            });

            botao.classList.add("active");

            tipoDeConta = botao.dataset.type;
        });
    });
}

async function iniciarLogin() {

    const formulario = document.querySelector("#login-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.querySelector("#email").value.trim();

        const senha =
            document.querySelector("#senha").value;

        const botao =
            formulario.querySelector(".auth-submit");

        botao.disabled = true;
        botao.textContent = "Entrando...";

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: senha
                });

            if (error) {
                throw error;
            }

            const usuario = data.user;

            if (!usuario) {
                throw new Error("Usuário não encontrado.");
            }

            const { data: perfil, error: erroPerfil } =
                await supabaseClient
                    .from("perfis")
                    .select("tipo")
                    .eq("id", usuario.id)
                    .single();

            if (erroPerfil) {
                throw erroPerfil;
            }

            if (perfil.tipo === "artista") {

                window.location.href = "artista.html";

            } else {

                window.location.href = "feed.html";

            }

        } catch (error) {

            console.error(error);

            alert(
                "Não foi possível entrar: " +
                error.message
            );

        } finally {

            botao.disabled = false;
            botao.textContent = "Entrar";

        }

    });
}
