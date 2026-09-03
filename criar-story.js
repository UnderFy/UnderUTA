document.addEventListener("DOMContentLoaded", async () => {

    const fileInput = document.querySelector("#story-file");
    const previewContainer = document.querySelector("#preview-container");
    const publishButton = document.querySelector("#publish-story");
    const status = document.querySelector("#story-status");

    let selectedFile = null;

    // Verificar usuário
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "login.html";
        return;
    }

    // Verificar se é artista
    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfis")
        .select("tipo")
        .eq("id", user.id)
        .single();

    if (perfilError || !perfil || perfil.tipo !== "artista") {
        window.location.href = "feed.html";
        return;
    }

    // Selecionar arquivo
    fileInput.addEventListener("change", () => {

        selectedFile = fileInput.files[0];

        if (!selectedFile) {
            previewContainer.innerHTML =
                "<p>A prévia aparecerá aqui.</p>";
            return;
        }

        previewContainer.innerHTML = "";

        const url = URL.createObjectURL(selectedFile);

        if (selectedFile.type.startsWith("image/")) {

            const img = document.createElement("img");

            img.src = url;
            img.alt = "Prévia do Story";

            previewContainer.appendChild(img);

        } else if (selectedFile.type.startsWith("video/")) {

            const video = document.createElement("video");

            video.src = url;
            video.controls = true;
            video.playsInline = true;

            previewContainer.appendChild(video);

        }

    });


    // Publicar Story
    publishButton.addEventListener("click", async () => {

        if (!selectedFile) {
            status.textContent =
                "Escolha uma imagem ou vídeo primeiro.";
            return;
        }

        publishButton.disabled = true;
        status.textContent = "Publicando...";


        try {

            const extensao =
                selectedFile.name.split(".").pop();

            const nomeArquivo =
                `${user.id}/${crypto.randomUUID()}.${extensao}`;


            // Upload para Storage
            const {
                error: uploadError
            } = await supabaseClient.storage
                .from("stories")
                .upload(nomeArquivo, selectedFile, {
                    contentType: selectedFile.type,
                    upsert: false
                });


            if (uploadError) {
                throw uploadError;
            }


            // URL pública
            const {
                data: publicUrlData
            } = supabaseClient.storage
                .from("stories")
                .getPublicUrl(nomeArquivo);


            const midiaUrl =
                publicUrlData.publicUrl;


            // Tipo da mídia
            const tipo =
                selectedFile.type.startsWith("video/")
                    ? "video"
                    : "imagem";


            // Expira em 24 horas
            const expiraEm =
                new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString();


            // Salvar Story no banco
            const {
                error: insertError
            } = await supabaseClient
                .from("stories")
                .insert({
                    artista_id: user.id,
                    midia_url: midiaUrl,
                    tipo: tipo,
                    expira_em: expiraEm
                });


            if (insertError) {
                throw insertError;
            }


            status.textContent =
                "Story publicado com sucesso!";


            fileInput.value = "";
            selectedFile = null;

            previewContainer.innerHTML =
                "<p>Story publicado.</p>";


        } catch (error) {

            console.error(
                "ERRO AO PUBLICAR STORY:",
                error
            );

            status.textContent =
                "Erro ao publicar: " +
                error.message;

        } finally {

            publishButton.disabled = false;

        }

    });

});
