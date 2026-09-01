document.addEventListener("DOMContentLoaded", () => {
    iniciarTipoDeConta();
    iniciarCadastro();
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


async function iniciarCadastro() {

    const formulario = document.querySelector("#register-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", async (event) => {

        event.preventDefault();


        const nome =
            document.querySelector("#nome").value.trim();

        const username =
            document.querySelector("#username").value
                .trim()
                .toLowerCase()
                .replace(/^@/, "");

        const email =
            document.querySelector("#email").value
                .trim()
                .toLowerCase();

        const senha =
            document.querySelector("#senha").value;

        const confirmarSenha =
            document.querySelector("#confirmar-senha").value;


        if (senha !== confirmarSenha) {

            alert("As senhas não são iguais.");

            return;
        }


        if (senha.length < 8) {

            alert("A senha precisa ter pelo menos 8 caracteres.");

            return;
        }


        const botao =
            formulario.querySelector(".auth-submit");


        botao.disabled = true;
        botao.textContent = "Criando conta...";


        try {

            const { data, error } =
                await supabase.auth.signUp({

                    email: email,

                    password: senha,

                    options: {

                        data: {
                            nome: nome,
                            username: username,
                            tipo: tipoDeConta
                        },

                        emailRedirectTo:
                            "https://underfy.github.io/UnderUTA/login.html"

                    }

                });


            if (error) {
                throw error;
            }


            console.log("Usuário criado:", data);


            alert(
                "Conta criada! Verifique seu e-mail para confirmar o cadastro."
            );


            window.location.href = "login.html";


        } catch (error) {

            console.error(error);

            alert(
                "Não foi possível criar a conta: " +
                error.message
            );


        } finally {

            botao.disabled = false;
            botao.textContent = "Criar minha conta";

        }

    });

}
