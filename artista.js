document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href = "login.html";

        return;
    }


    const { data: perfil, error } =
        await supabaseClient
            .from("perfis")
            .select("nome, username, tipo")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(error);

        return;
    }


    if (perfil.tipo !== "artista") {

        window.location.href = "feed.html";

        return;
    }


    const nome =
        document.querySelector("#artist-name");


    nome.textContent =
        `Olá, ${perfil.nome || perfil.username}!`;


    const logout =
        document.querySelector("#logout-btn");


    logout.addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

    });

});
