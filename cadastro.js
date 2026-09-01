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

            console.log("Tipo de conta:", tipoDeConta);

        });

    });

}


function iniciarCadastro() {

    const formulario = document.querySelector("#register-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", (event) => {

        event.preventDefault();

        const nome =
            document.querySelector("#nome").value.trim();

        const username =
            document.querySelector("#username").value.trim();

        const email =
            document.querySelector("#email").value.trim();

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


        const usuario = {

            nome,
            username,
            email,
            tipo: tipoDeConta

        };


        console.log("Novo usuário:", usuario);

        alert(
            `Cadastro de ${tipoDeConta} preparado.`
        );

    });

}
