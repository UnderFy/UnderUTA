document.addEventListener("DOMContentLoaded", async () => {

    const fileInput =
        document.querySelector("#story-file");

    const previewContainer =
        document.querySelector("#preview-container");

    const publishButton =
        document.querySelector("#publish-story");

    const status =
        document.querySelector("#story-status");

    const cameraPreview =
        document.querySelector("#camera-preview");

    const cameraPlaceholder =
        document.querySelector("#camera-placeholder");

    const openCameraButton =
        document.querySelector("#open-camera");

    const switchCameraButton =
        document.querySelector("#switch-camera");

    const takePhotoButton =
        document.querySelector("#take-photo");

    const startVideoButton =
        document.querySelector("#start-video");

    const stopVideoButton =
        document.querySelector("#stop-video");


    let selectedFile = null;

    let cameraStream = null;

    let mediaRecorder = null;

    let recordedChunks = [];

    let currentCamera = "environment";


    // =====================================
    // ESPELHAMENTO DA CÂMERA
    // =====================================

    function updateCameraMirror() {

        if (currentCamera === "user") {

            cameraPreview.style.transform =
                "scaleX(-1)";

        } else {

            cameraPreview.style.transform =
                "scaleX(1)";

        }

    }


    // =====================================
    // VERIFICAR USUÁRIO
    // =====================================

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;

    }


    // =====================================
    // VERIFICAR ARTISTA
    // =====================================

    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfis")
        .select("tipo")
        .eq("id", user.id)
        .single();


    if (
        perfilError ||
        !perfil ||
        perfil.tipo !== "artista"
    ) {

        window.location.href =
            "feed.html";

        return;

    }


    // =====================================
    // MOSTRAR PRÉVIA
    // =====================================

    function showPreview(file) {

        if (!file) {
            return;
        }


        previewContainer.innerHTML = "";


        const url =
            URL.createObjectURL(file);


        if (file.type.startsWith("image/")) {

            const img =
                document.createElement("img");


            img.src = url;

            img.alt =
                "Prévia do Story";


            previewContainer.appendChild(img);

        }


        else if (
            file.type.startsWith("video/")
        ) {

            const video =
                document.createElement("video");


            video.src = url;

            video.controls = true;

            video.playsInline = true;


            previewContainer.appendChild(video);

        }

    }


    // =====================================
    // ARQUIVO DO CELULAR
    // =====================================

    fileInput.addEventListener(
        "change",
        () => {

            selectedFile =
                fileInput.files[0];


            if (!selectedFile) {
                return;
            }


            showPreview(
                selectedFile
            );


            status.textContent =
                "";

        }
    );


    // =====================================
    // ABRIR CÂMERA
    // =====================================

    openCameraButton.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices.getUserMedia
                ) {

                    status.textContent =
                        "Seu navegador não permite acesso à câmera.";

                    return;

                }


                if (cameraStream) {

                    cameraStream
                        .getTracks()
                        .forEach(
                            track => track.stop()
                        );

                }


                cameraStream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: {
                                facingMode:
                                    currentCamera
                            },

                            audio: true

                        });


                cameraPreview.srcObject =
                    cameraStream;


                cameraPreview.style.display =
                    "block";


                cameraPlaceholder.style.display =
                    "none";


                // ATIVA O ESPELHAMENTO
                // SOMENTE NA SELFIE

                updateCameraMirror();


                openCameraButton.hidden =
                    true;


                switchCameraButton.hidden =
                    false;


                takePhotoButton.hidden =
                    false;


                startVideoButton.hidden =
                    false;


                status.textContent =
                    "";


            } catch (error) {

                console.error(
                    "ERRO AO ABRIR CÂMERA:",
                    error
                );


                status.textContent =
                    "Não foi possível acessar a câmera e o microfone.";

            }

        }
    );


    // =====================================
    // TROCAR CÂMERA
    // =====================================

    switchCameraButton.addEventListener(
        "click",
        async () => {


            // SELFIE <-> TRASEIRA

            currentCamera =
                currentCamera === "environment"
                    ? "user"
                    : "environment";


            // ENCERRA A CÂMERA ATUAL

            if (cameraStream) {

                cameraStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

            }


            try {

                // ABRE A NOVA CÂMERA

                cameraStream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: {
                                facingMode:
                                    currentCamera
                            },

                            audio: true

                        });


                cameraPreview.srcObject =
                    cameraStream;


                // ATUALIZA O ESPELHAMENTO

                updateCameraMirror();


                status.textContent =
                    "";


            } catch (error) {

                console.error(
                    "ERRO AO TROCAR CÂMERA:",
                    error
                );


                status.textContent =
                    "Não foi possível trocar a câmera.";

            }

        }
    );


    // =====================================
    // TIRAR FOTO
    // =====================================

    takePhotoButton.addEventListener(
        "click",
        () => {


            if (!cameraStream) {
                return;
            }


            const width =
                cameraPreview.videoWidth;


            const height =
                cameraPreview.videoHeight;


            if (!width || !height) {

                status.textContent =
                    "A câmera ainda está iniciando.";

                return;

            }


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                width;


            canvas.height =
                height;


            const context =
                canvas.getContext("2d");


            // SELFIE:
            // SALVA A FOTO ESPELHADA

            if (currentCamera === "user") {

                context.translate(
                    width,
                    0
                );


                context.scale(
                    -1,
                    1
                );

            }


            context.drawImage(
                cameraPreview,
                0,
                0,
                width,
                height
            );


            canvas.toBlob(
                blob => {


                    if (!blob) {
                        return;
                    }


                    selectedFile =
                        new File(

                            [blob],

                            `story-${Date.now()}.jpg`,

                            {
                                type:
                                    "image/jpeg"
                            }

                        );


                    showPreview(
                        selectedFile
                    );


                    status.textContent =
                        "Foto capturada.";

                },

                "image/jpeg",

                0.92

            );

        }
    );


    // =====================================
    // COMEÇAR VÍDEO
    // =====================================

    startVideoButton.addEventListener(
        "click",
        () => {


            if (!cameraStream) {
                return;
            }


            if (
                typeof MediaRecorder ===
                "undefined"
            ) {

                status.textContent =
                    "Seu navegador não suporta gravação de vídeo.";

                return;

            }


            recordedChunks = [];


            let options = {};


            if (
                MediaRecorder.isTypeSupported(
                    "video/webm;codecs=vp9,opus"
                )
            ) {

                options = {
                    mimeType:
                        "video/webm;codecs=vp9,opus"
                };

            }


            else if (
                MediaRecorder.isTypeSupported(
                    "video/webm;codecs=vp8,opus"
                )
            ) {

                options = {
                    mimeType:
                        "video/webm;codecs=vp8,opus"
                };

            }


            else if (
                MediaRecorder.isTypeSupported(
                    "video/webm"
                )
            ) {

                options = {
                    mimeType:
                        "video/webm"
                };

            }


            else if (
                MediaRecorder.isTypeSupported(
                    "video/mp4"
                )
            ) {

                options = {
                    mimeType:
                        "video/mp4"
                };

            }


            try {

                mediaRecorder =
                    new MediaRecorder(
                        cameraStream,
                        options
                    );

            } catch (error) {

                console.error(
                    "ERRO AO CRIAR GRAVADOR:",
                    error
                );


                status.textContent =
                    "Seu navegador não conseguiu iniciar a gravação.";

                return;

            }


            // =====================================
            // DADOS DA GRAVAÇÃO
            // =====================================

            mediaRecorder.addEventListener(
                "dataavailable",
                event => {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        recordedChunks.push(
                            event.data
                        );

                    }

                }
            );


            // =====================================
            // FINALIZAR GRAVAÇÃO
            // =====================================

            mediaRecorder.addEventListener(
                "stop",
                () => {


                    const blob =
                        new Blob(
                            recordedChunks,
                            {
                                type:
                                    mediaRecorder.mimeType ||
                                    "video/webm"
                            }
                        );


                    let extensao =
                        "webm";


                    if (
                        blob.type.includes("mp4")
                    ) {

                        extensao =
                            "mp4";

                    }


                    selectedFile =
                        new File(

                            [blob],

                            `story-${Date.now()}.${extensao}`,

                            {
                                type:
                                    blob.type
                            }

                        );


                    showPreview(
                        selectedFile
                    );


                    status.textContent =
                        "Vídeo gravado.";


                    startVideoButton.hidden =
                        false;


                    stopVideoButton.hidden =
                        true;

                }
            );


            // COMEÇA A GRAVAR

            mediaRecorder.start();


            startVideoButton.hidden =
                true;


            stopVideoButton.hidden =
                false;


            status.textContent =
                "Gravando vídeo...";

        }
    );


    // =====================================
    // PARAR VÍDEO
    // =====================================

    stopVideoButton.addEventListener(
        "click",
        () => {

            if (
                mediaRecorder &&
                mediaRecorder.state ===
                "recording"
            ) {

                mediaRecorder.stop();

            }

        }
    );


    // =====================================
    // PUBLICAR STORY
    // =====================================

    publishButton.addEventListener(
        "click",
        async () => {


            if (!selectedFile) {

                status.textContent =
                    "Escolha uma mídia ou faça uma foto/vídeo.";

                return;

            }


            publishButton.disabled =
                true;


            status.textContent =
                "Publicando...";


            try {


                // =================================
                // EXTENSÃO
                // =================================

                const extensao =
                    selectedFile.name
                        .split(".")
                        .pop();


                // =================================
                // NOME DO ARQUIVO
                // =================================

                const nomeArquivo =
                    `${user.id}/${crypto.randomUUID()}.${extensao}`;


                // =================================
                // UPLOAD
                // =================================

                const {
                    error: uploadError
                } = await supabaseClient
                    .storage
                    .from("stories")
                    .upload(

                        nomeArquivo,

                        selectedFile,

                        {
                            contentType:
                                selectedFile.type,

                            upsert:
                                false
                        }

                    );


                if (uploadError) {

                    throw uploadError;

                }


                // =================================
                // URL PÚBLICA
                // =================================

                const {
                    data:
                        publicUrlData
                } =
                    supabaseClient
                        .storage
                        .from("stories")
                        .getPublicUrl(
                            nomeArquivo
                        );


                const midiaUrl =
                    publicUrlData.publicUrl;


                // =================================
                // TIPO
                // =================================

                const tipo =
                    selectedFile.type
                        .startsWith("video/")
                        ? "video"
                        : "imagem";


                // =================================
                // EXPIRA EM 24 HORAS
                // =================================

                const expiraEm =
                    new Date(
                        Date.now() +
                        24 * 60 * 60 * 1000
                    ).toISOString();


                // =================================
                // BANCO
                // =================================

                const {
                    error: insertError
                } = await supabaseClient
                    .from("stories")
                    .insert({

                        artista_id:
                            user.id,

                        midia_url:
                            midiaUrl,

                        tipo:
                            tipo,

                        expira_em:
                            expiraEm

                    });


                if (insertError) {

                    throw insertError;

                }


                // =================================
                // SUCESSO
                // =================================

                status.textContent =
                    "Story publicado com sucesso!";


                fileInput.value =
                    "";


                selectedFile =
                    null;


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

                publishButton.disabled =
                    false;

            }

        }
    );


    // =====================================
    // LIMPAR CÂMERA AO SAIR
    // =====================================

    window.addEventListener(
        "beforeunload",
        () => {

            if (cameraStream) {

                cameraStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

            }

        }
    );

});
