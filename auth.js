document.addEventListener("DOMContentLoaded", () => {

    iniciarTipoDeConta();
    iniciarLogin();

});


function iniciarTipoDeConta() {

    const botoes = document.querySelectorAll(".account-type");

    botoes.forEach((botao) => {

        botao.addEventListener("click", () => {

            botoes.forEach((item) => {
                item.classList.remove("active");
            });

            botao.classList.add("active");

        });

    });

}


function iniciarLogin() {

    const formulario = document.querySelector("#login-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = document.querySelector("#email").value;
        const senha = document.querySelector("#senha").value;

        console.log("Tentativa de login:", {
            email,
            senha
        });

        alert("Login será conectado ao Supabase na próxima etapa.");

    });

}
