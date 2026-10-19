/* 
    ==========================================================
    DEV CITY — a lógica do site (receita de bolo completa)
    ==========================================================

    1) Lógica de Programação
        Saber a sequencia que o computador/projeto
        quer que você execute as coisas

    2) Algoritmo
        Receita de bolo, passo a passo, para que o computador entenda o que você quer que ele faça


    ALGORITMO 1  [FEITO ✔]
    [x] Saber quem é quem (imagem, botão...)
    [x] Saber que o botão foi clicado (qual botão)
    [x] Trocar a foto e o nome do personagem

    ALGORITMO 2  [FEITO ✔ - o "ENTRAR NO JOGO"]
    [x] Pegar a imagem do usuário (câmera do celular / webcam / arquivo)
    [x] Enviar para a IA imagem + o que eu quero que ela faça
    [x] Receber a imagem da IA
    [x] Colocar a imagem no site

    3) Variáveis
        - É um pedacinho da memória do computador que você pode guardar alguma coisa

    4) Funções
        É um pedacinho de código que SÓ EXECUTA QUANDO VOCÊ CHAMA ELA

    HTML = document
    querySelector = selecionar ALGO no HTML
    ( ) = entre parenteses você coloca o que você quer selecionar
    console.log() = mostrar no console do navegador (aperte F12 para ver!)
    ==========================================================
*/


/* ==========================================================
   AS CONFIGURAÇÕES (mexa aqui sem medo!)

   PERSONAGENS = quem dá para "vestir" (a troca de rosto)
       rotulo = nome que aparece no site
       palco  = imagem normal usada no site
       troca  = imagem usada pela IA como corpo (alta qualidade)
       cor    = cor do nome
   ========================================================== */

const PERSONAGENS = {
    jaque: { rotulo: "JAQUE", palco: "img/jaque-removebg-preview.png", troca: "img/lucia.png", cor: "#ff3cac" },
    jason: { rotulo: "JASON", palco: "img/jason.png", troca: "img/jason.png", cor: "#00b2c9" },
    lucas: { rotulo: "LUCAS", palco: "img/lucas.png", troca: "img/cj.png", cor: "#7ed37e" }
}

// A IA GRÁTIS de troca de rosto (um Space do Hugging Face, aberto, sem login)
// Ela recebe: sua selfie + a arte do personagem -> devolve a arte com seu rosto!
const ESPACO_IA = "https://tonyassi-face-swap.hf.space"

// Os cenários que a IA já desenhou para os cartazes (reserva, sempre funcionam)
const CENARIOS = [
    "img/cenarios/cenario1.jpg",
    "img/cenarios/cenario2.jpg",
    "img/cenarios/cenario3.jpg",
    "img/cenarios/cenario4.jpg"
]

// As frases que aparecem enquanto a IA trabalha (trocam de tempo em tempo)
const FRASES_CARREGANDO = [
    "Mandando sua selfie para a IA... ✉️",
    "A IA está olhando para o seu rosto... 👀",
    "Desenhando você no estilo GTA... 🎨",
    "Pintando o pôr do sol e o neon... 🌴",
    "Caprichando nos contornos grossos... ✏️",
    "Quase pronto! Não feche a janela... ⏳"
]


/* ==========================================================
   NOSSA MEMÓRIA (as variáveis que guardam o estado do site)
   ========================================================== */

let nome = document.querySelector(".nome")
let personagem = document.querySelector(".personagem")

let personagemEscolhido = "jaque"     // qual card está selecionado
let nomeJogador = "Você"              // nome digitado no estúdio
let corJogador = "#ff3cac"            // cor escolhida para o nome
let fluxoCamera = null                // a "torneirinha" de vídeo da câmera
let resultadoSrc = ""                 // endereço da arte pronta
let resultadoPalcoSrc = ""            // versão recortada (fundo transparente) p/ o palco
let resultadoEhQuadro = false         // true = arte retangular (pôster com moldura)
let ultimoModo = "troca"              // "troca" (rosto na arte) ou "cartaz"
let relogioFrases = null              // troca as frases do carregando
let relogioSlides = null              // troca as artes do carregando
let dinheiroAtual = 69420             // o dinheiro do HUD :)


/* ==========================================================
   ESCREVER O NOME NO PALCO

   O nome gigante calcula o próprio tamanho no CSS usando a
   variável --letras. Assim "JAQUE" fica enorme e
   "VOLUCASCÊ" encolhe sozinho para caber na tela. :)
   ========================================================== */

function escreverNome(texto, cor) {

    nome.textContent = texto

    // passa para o CSS quantas letras o nome tem (mínimo 4)
    document.documentElement.style.setProperty("--letras", Math.max(texto.length, 4))

    if (cor) nome.style.color = cor
}

// já deixa o primeiro nome ("Jaque") no tamanho certo ao abrir o site
escreverNome(nome.textContent)


/* ==========================================================
   ALGORITMO 1 — ESCOLHER UM PERSONAGEM QUE JÁ EXISTE
   ========================================================== */

// Quando clica num card do menu de baixo
function escolherCard(chave, elemento) {

    personagemEscolhido = chave
    const p = PERSONAGENS[chave]

    escreverNome(p.rotulo, p.cor)
    personagem.src = p.palco
    personagem.classList.remove("quadro")

    marcarCard(elemento)
}

// Deixa a "bordinha amarela" só no card clicado
function marcarCard(elemento) {
    document.querySelectorAll(".card").forEach(function (card) {
        card.classList.remove("selecionado")
    })
    if (elemento) elemento.classList.add("selecionado")
}


/* ==========================================================
   ABRIR E FECHAR O ESTÚDIO
   ========================================================== */

function abrirEstudio() {
    document.getElementById("estudio").classList.remove("escondido")
    mostrarPasso("foto")
    prepararModoFoto()
}

function fecharEstudio() {
    document.getElementById("estudio").classList.add("escondido")
    desligarCamera()
    pararRelogios()
}

// Esconde todos os passos e mostra SÓ o que queremos
function mostrarPasso(qual) {
    document.querySelectorAll(".estudio .passo").forEach(function (passo) {
        passo.classList.add("escondido")
    })
    document.getElementById("passo-" + qual).classList.remove("escondido")
}

// Escreve um recadinho no passo da câmera
function avisoCamera(texto) {
    document.getElementById("aviso-camera").innerHTML = texto
}


/* ==========================================================
   PASSO 1 — PEGAR A FOTO

   No CELULAR: abrimos a câmera NATIVA (é melhor: tela cheia,
   qualidade alta e funciona até em Wi-Fi, sem HTTPS!)

   No COMPUTADOR: tentamos a webcam; se não tiver, usamos
   o botão de escolher uma foto que já existe.
   ========================================================== */

function ehCelular() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.matchMedia("(pointer: coarse)").matches
}

function prepararModoFoto() {

    const palcoCamera = document.getElementById("palco-camera")
    const botaoCapturar = document.getElementById("botao-capturar")

    // Dica extra se o site foi aberto clicando no arquivo direto
    if (location.protocol === "file:") {
        avisoCamera("💡 Dica: abra o site pelo 'abrir-site.sh' para tudo funcionar 100%")
    }

    // CELULAR -> câmera nativa (dentro do navegador não precisa de nada!)
    if (ehCelular()) {
        palcoCamera.classList.add("escondido")
        botaoCapturar.innerHTML = "📸 ABRIR A CÂMERA"
        botaoCapturar.onclick = function () {
            document.getElementById("arquivo-camera").click()
        }
        return
    }

    // COMPUTADOR sem lugar seguro (ex: http:// no Wi-Fi) -> só arquivo
    const podeUsarWebcam = window.isSecureContext &&
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia

    if (!podeUsarWebcam) {
        palcoCamera.classList.add("escondido")
        botaoCapturar.innerHTML = "📸 TIRAR FOTO (webcam indisponível)"
        botaoCapturar.onclick = function () {
            avisoCamera("Sem webcam aqui 😉 escolha uma foto que já existe!")
            document.getElementById("arquivo-galeria").click()
        }
        return
    }

    // COMPUTADOR com webcam -> liga o vídeo ao vivo
    palcoCamera.classList.remove("escondido")
    botaoCapturar.innerHTML = "📸 TIRAR FOTO"
    botaoCapturar.onclick = tirarFoto
    ligarCamera()
}

// Pede permissão e liga a webcam
async function ligarCamera() {

    desligarCamera() // se já tinha uma câmera ligada, desliga primeiro

    const video = document.getElementById("video")
    try {
        fluxoCamera = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
            audio: false
        })
        video.srcObject = fluxoCamera
        avisoCamera("")
    } catch (erro) {
        // Sem webcam? Sem problema: manda para o modo de arquivo
        console.log("Sem webcam:", erro)
        document.getElementById("palco-camera").classList.add("escondido")
        document.getElementById("botao-capturar").innerHTML = "🖼️ ESCOLHER UMA FOTO"
        document.getElementById("botao-capturar").onclick = function () {
            document.getElementById("arquivo-galeria").click()
        }
        avisoCamera("Nenhuma câmera encontrada — escolha uma foto 😉")
    }
}

// Desliga a webcam de verdade (senão a luzinha fica acesa!)
function desligarCamera() {
    if (fluxoCamera) {
        fluxoCamera.getTracks().forEach(function (canal) { canal.stop() })
        fluxoCamera = null
        document.getElementById("video").srcObject = null
    }
}

// Congela o vídeo num canvas (tira a foto mesmo!)
function tirarFoto() {

    const video = document.getElementById("video")
    if (!video.videoWidth) {
        avisoCamera("Espere a câmera ligar antes de tirar a foto 🙂")
        return
    }

    const canvas = document.getElementById("foto")
    const ctx = canvas.getContext("2d")

    // a câmera é retangular; recortamos um QUADRADO do meio
    const lado = Math.min(video.videoWidth, video.videoHeight)
    const sx = (video.videoWidth - lado) / 2
    const sy = (video.videoHeight - lado) / 2

    // espelha (vira ao contrário) para ficar igual você se viu na tela
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, lado, lado, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    depoisDePegarFoto()
}

// Veio uma foto do celular ou da galeria?
function usarArquivo(evento) {
    const arquivo = evento.target.files[0]
    if (!arquivo) return

    const enderecoTemporario = URL.createObjectURL(arquivo)
    const imagem = new Image()

    imagem.onload = function () {
        const canvas = document.getElementById("foto")
        const ctx = canvas.getContext("2d")

        const lado = Math.min(imagem.width, imagem.height)
        const sx = (imagem.width - lado) / 2
        const sy = (imagem.height - lado) / 2
        ctx.drawImage(imagem, sx, sy, lado, lado, 0, 0, canvas.width, canvas.height)

        URL.revokeObjectURL(enderecoTemporario)
        evento.target.value = "" // limpa para poder escolher a mesma foto de novo
        depoisDePegarFoto()
    }

    imagem.src = enderecoTemporario
}

// Depois de ter a foto: a IA do navegador procura o rosto e enquadra
async function depoisDePegarFoto() {

    // já temos a foto -> apaga a luzinha da câmera
    desligarCamera()

    avisoCamera("🔎 A IA do seu aparelho está procurando seu rosto...")

    // se a internet falhar, esperamos no máximo 12 segundos
    await comTempoLimite(enquadrarRosto(), 12000).catch(function () { })

    avisoCamera("")
    mostrarPasso("confirmar")

    // atualiza o nome do personagem escolhido no botão da troca de rosto
    document.getElementById("alvo-nome").innerHTML = PERSONAGENS[personagemEscolhido].rotulo

    // e deixa marcado o botãozinho certo na escolha "vou virar..."
    document.querySelectorAll(".alvo").forEach(function (botaoAlvo) {
        botaoAlvo.classList.toggle("selecionado", botaoAlvo.dataset.chave === personagemEscolhido)
    })
}


/* ==========================================================
   A IA DE ROSTO DO NAVEGADOR (MediaPipe)

   Isso é uma IA de verdade que roda NO SEU APARELHO
   (não precisa de internet depois de baixada!). Ela só
   diz ONDE o rosto está na foto, para enquadrar bonito.
   ========================================================== */

let detectorRosto = null
let visaoMediaPipe = null

// Traz a biblioteca MediaPipe (uma vez só) e deixa pronta para usar
async function carregarVisao() {
    if (visaoMediaPipe) return visaoMediaPipe

    // import() = "traz" uma biblioteca na hora que precisa
    const modulo = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs")
    const visao = await modulo.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
    )
    visaoMediaPipe = { modulo, visao }
    return visaoMediaPipe
}

async function carregarDetectorRosto() {
    if (detectorRosto) return detectorRosto

    const { modulo, visao } = await carregarVisao()
    detectorRosto = await modulo.FaceDetector.createFromOptions(visao, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
        },
        runningMode: "IMAGE"
    })
    return detectorRosto
}

// Recorta um quadrado em volta do rosto (com uma margem bonita)
async function enquadrarRosto() {

    const foto = document.getElementById("foto")
    const detector = await carregarDetectorRosto()
    const achado = detector.detect(foto)

    if (!achado || !achado.detections || !achado.detections.length) return

    const caixa = achado.detections[0].boundingBox
    const tamanho = foto.width

    // lado do quadrado = largura do rosto x 2.6 (sobra um espacinho)
    const lado = Math.min(tamanho, Math.max(220, caixa.width * 2.6))
    const centroX = caixa.originX + caixa.width / 2
    const centroY = caixa.originY + caixa.height / 2

    // não deixa o quadrado sair da foto
    let corteX = Math.max(0, Math.min(tamanho - lado, centroX - lado / 2))
    let corteY = Math.max(0, Math.min(tamanho - lado, centroY - lado / 2))

    const temp = document.createElement("canvas")
    temp.width = tamanho
    temp.height = tamanho
    temp.getContext("2d").drawImage(foto, corteX, corteY, lado, lado, 0, 0, tamanho, tamanho)

    const ctx = foto.getContext("2d")
    ctx.clearRect(0, 0, tamanho, tamanho)
    ctx.drawImage(temp, 0, 0)
}


/* ==========================================================
   PASSO 2 — ESCOLHER OS DETALHES
   ========================================================== */

// Os botõezinhos de cor do nome
function escolherCor(botao, cor) {
    corJogador = cor
    document.querySelectorAll(".cor").forEach(function (b) { b.classList.remove("selecionada") })
    botao.classList.add("selecionada")
}

// Escolhe em QUEM o rosto vai ser colocado (no modo troca de rosto)
function escolherAlvo(chave, botao) {
    personagemEscolhido = chave
    document.getElementById("alvo-nome").innerHTML = PERSONAGENS[chave].rotulo
    document.querySelectorAll(".alvo").forEach(function (outro) {
        outro.classList.remove("selecionado")
    })
    botao.classList.add("selecionado")
}

// Volta para o passo da foto
function voltarFoto() {
    mostrarPasso("foto")
    prepararModoFoto()
}


/* ==========================================================
   PASSO 3 — A MÁGICA: TROCAR O ROSTO COM A IA GRÁTIS

   O plano (algoritmo):
   1) manda a selfie para a IA
   2) manda a arte do personagem para a IA
   3) pede: "troque o rosto da arte pelo da selfie"
   4) espera, recebe, e mostra!
   ========================================================== */

async function virarPersonagem() {

    nomeJogador = (document.getElementById("nome-jogador").value || "Você").toUpperCase()
    ultimoModo = "troca"

    mostrarPasso("carregando")
    comecarCarregando()

    try {
        // tenta 2 vezes (a IA às vezes está com fila)
        const endereco = await comTempoLimite(comTentativas(trocarRostoNAIA, 2), 130000)

        pararRelogios()

        // baixa a arte para dentro do site (como uma foto que você salva)
        const resposta = await fetch(endereco)
        const bolha = await resposta.blob()
        const imagem = await carregarImagem(URL.createObjectURL(bolha))

        // a IA devolve o personagem com fundo preto -> recortamos com um loop de pixels
        const canvas = document.createElement("canvas")
        canvas.width = imagem.width
        canvas.height = imagem.height
        canvas.getContext("2d").drawImage(imagem, 0, 0)
        removerFundoPreto(canvas)

        resultadoSrc = canvas.toDataURL("image/png")
        resultadoPalcoSrc = resultadoSrc
        resultadoEhQuadro = false

        mostrarResultado("🎉 Sua lenda nasceu! Feita pela IA grátis — salve a imagem se quiser guardar.")

    } catch (erro) {
        // A IA não respondeu? Sem drama: o modo local coloca VOCÊ na cena!
        console.log("A troca de rosto falhou:", erro)
        pararRelogios()
        await colocarNoMundoGTA("A IA de troca de rosto não respondeu agora (internet ou fila). Então usei o modo local: coloquei você no mundo de Dev City! 🌴")
    }
}

// A conversa com a IA (o "algoritmo 2" acontecendo de verdade)
async function trocarRostoNAIA() {

    const selfie = document.getElementById("foto").toDataURL("image/jpeg", 0.85)
    const arte = PERSONAGENS[personagemEscolhido].troca

    // 1) manda a selfie
    const enderecoSelfie = await enviarArquivoParaIA(selfie, "selfie.jpg")

    // 2) manda a arte do personagem
    const enderecoArte = await enviarArquivoParaIA(arte, "personagem.png")

    // 3) pede a troca de rosto
    const pedido = await fetch(ESPACO_IA + "/gradio_api/call/swap_faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: [
                { path: enderecoSelfie, meta: { _type: "gradio.FileData" } },
                { path: enderecoArte, meta: { _type: "gradio.FileData" } }
            ]
        })
    })
    const { event_id } = await pedido.json()

    // 4) espera o resultado (o servidor avisa quando terminar)
    const resposta = await fetch(ESPACO_IA + "/gradio_api/call/swap_faces/" + event_id)
    const texto = await lerEventos(resposta)

    return extrairResultado(texto)
}

// Envia uma imagem (em texto base64 ou endereço) para a IA
async function enviarArquivoParaIA(imagem, nomeArquivo) {

    // transforma em "arquivo" para poder enviar
    const bolha = await (await fetch(imagem)).blob()

    const formulario = new FormData()
    formulario.append("files", bolha, nomeArquivo)

    const resposta = await fetch(ESPACO_IA + "/gradio_api/upload", {
        method: "POST",
        body: formulario
    })
    const caminhos = await resposta.json()
    return caminhos[0]
}

// Lê o "rio de avisos" que o servidor manda (até dizer que terminou)
async function lerEventos(resposta) {
    const leitor = resposta.body.getReader()
    const decodificador = new TextDecoder()
    let texto = ""

    while (true) {
        const { value, done } = await leitor.read()
        if (done) break
        texto += decodificador.decode(value, { stream: true })
        if (texto.includes("event: complete") || texto.includes("event: error")) break
    }

    try { leitor.cancel() } catch (erro) { }
    return texto
}

// Pega o endereço da imagem no meio da resposta
function extrairResultado(texto) {

    if (texto.includes("event: error") || !texto.includes("event: complete")) {
        throw new Error("A IA não conseguiu trocar o rosto")
    }

    const bloco = texto.split("event: complete")[1]
    const linha = bloco.split("\n").find(function (linha) {
        return linha.startsWith("data:")
    })

    const lista = JSON.parse(linha.slice(5))
    let endereco = lista[0].url || lista[0].path

    if (endereco.startsWith("/")) {
        endereco = ESPACO_IA + "/gradio_api/file=" + endereco
    }
    return endereco
}

// Fundo preto vira transparente (loop de pixels, igual ao filtro!)
function removerFundoPreto(canvas) {

    const ctx = canvas.getContext("2d")
    const dados = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = dados.data

    for (let i = 0; i < pixels.length; i += 4) {

        // brilho = o maior valor entre vermelho, verde e azul
        const brilho = Math.max(pixels[i], pixels[i + 1], pixels[i + 2])

        if (brilho < 26) {
            // bem escuro = fundo -> transparente
            pixels[i + 3] = 0
        } else if (brilho < 80) {
            // meio escuro = borda -> semi transparente (suaviza o recorte)
            pixels[i + 3] = Math.round((brilho - 26) * 255 / 54)
        }
    }

    ctx.putImageData(dados, 0, 0)
}


/* ==========================================================
   MODO "MUNDO GTA" — VOCÊ dentro do cenário! (100% local)

   Este é o modo principal e SEMPRE funciona:
   1) a IA do aparelho RECORTA você da selfie
      (rosto, cabelo e corpo ficam exatamente como são!);
   2) aplica um "filtro de desenho" leve para combinar com a arte;
   3) coloca você EM PÉ no cenário, com sombra no chão;
   4) monta o título estilo capa de jogo.
   ========================================================== */

let segmentadorPessoa = null

// A IA que separa a PESSOA do FUNDO (MediaPipe Selfie Segmenter)
async function carregarSegmentador() {
    if (segmentadorPessoa) return segmentadorPessoa

    const { modulo, visao } = await carregarVisao()
    segmentadorPessoa = await modulo.ImageSegmenter.createFromOptions(visao, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite"
        },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: true
    })
    return segmentadorPessoa
}

// Devolve um canvas só com a PESSOA (o fundo fica transparente)
async function recortarPessoa() {

    const foto = document.getElementById("foto")
    const segmentador = await carregarSegmentador()
    const resultado = segmentador.segment(foto)

    let dadosMascara = null
    let larguraMascara = 0
    let alturaMascara = 0

    // ESTE modelo tem uma única categoria: "selfie" (a pessoa)!
    // a confiança de cada pixel vai de 0 (fundo) a 1 (pessoa)
    if (resultado.confidenceMasks && resultado.confidenceMasks.length) {
        const mascara = resultado.confidenceMasks[0]
        dadosMascara = mascara.getAsFloat32Array()
        larguraMascara = mascara.width
        alturaMascara = mascara.height
    } else if (resultado.categoryMask) {
        // plano B: a máscara de categorias (aqui, 0 = pessoa e 255 = fundo)
        const mascara = resultado.categoryMask
        const categorias = mascara.getAsUint8Array()
        dadosMascara = new Float32Array(categorias.length)
        for (let i = 0; i < categorias.length; i++) {
            dadosMascara[i] = categorias[i] === 255 ? 0 : 1
        }
        larguraMascara = mascara.width
        alturaMascara = mascara.height
    }

    if (!dadosMascara) throw new Error("sem máscara")

    // 1) transforma a máscara numa imagem branca com transparência
    const mascaraPequena = document.createElement("canvas")
    mascaraPequena.width = larguraMascara
    mascaraPequena.height = alturaMascara
    const ctxMascara = mascaraPequena.getContext("2d")
    const imagemMascara = ctxMascara.createImageData(larguraMascara, alturaMascara)

    for (let i = 0; i < dadosMascara.length; i++) {
        // confiança de 0 a 1 -> transparência de 0 a 255 (com beirada suave)
        const alfa = Math.max(0, Math.min(255, Math.round((dadosMascara[i] - 0.25) * 255 / 0.5)))
        imagemMascara.data[i * 4] = 255
        imagemMascara.data[i * 4 + 1] = 255
        imagemMascara.data[i * 4 + 2] = 255
        imagemMascara.data[i * 4 + 3] = alfa
    }
    ctxMascara.putImageData(imagemMascara, 0, 0)

    // 2) aumenta a máscara para o tamanho da foto (as beiradas ficam macias)
    const mascaraGrande = document.createElement("canvas")
    mascaraGrande.width = foto.width
    mascaraGrande.height = foto.height
    const ctxGrande = mascaraGrande.getContext("2d")
    ctxGrande.drawImage(mascaraPequena, 0, 0, foto.width, foto.height)
    const leituraMascara = ctxGrande.getImageData(0, 0, foto.width, foto.height)

    // 3) aplica a máscara como transparência na foto
    const recorte = document.createElement("canvas")
    recorte.width = foto.width
    recorte.height = foto.height
    const ctxRecorte = recorte.getContext("2d")
    ctxRecorte.drawImage(foto, 0, 0)

    const imagem = ctxRecorte.getImageData(0, 0, foto.width, foto.height)
    let pixelsDePessoa = 0

    for (let i = 0; i < imagem.data.length; i += 4) {
        imagem.data[i + 3] = leituraMascara.data[i + 3]
        if (imagem.data[i + 3] > 200) pixelsDePessoa++
    }
    ctxRecorte.putImageData(imagem, 0, 0)

    // se quase nada foi recortado, provavelmente não achou pessoa -> desiste
    if (pixelsDePessoa < foto.width * foto.height * 0.05) {
        throw new Error("pessoa não encontrada na foto")
    }

    // 4) esmaece a parte de baixo (a pessoa "entra" na cena sem corte seco)
    ctxRecorte.globalCompositeOperation = "destination-out"
    const desvanecer = ctxRecorte.createLinearGradient(0, recorte.height * 0.80, 0, recorte.height)
    desvanecer.addColorStop(0, "rgba(0,0,0,0)")
    desvanecer.addColorStop(1, "rgba(0,0,0,1)")
    ctxRecorte.fillStyle = desvanecer
    ctxRecorte.fillRect(0, recorte.height * 0.80, recorte.width, recorte.height * 0.20)
    ctxRecorte.globalCompositeOperation = "source-over"

    // 5) a luz do pôr do sol do GTA (um tom quente por cima da pessoa)
    ctxRecorte.globalCompositeOperation = "source-atop"
    const luz = ctxRecorte.createLinearGradient(0, 0, recorte.width, recorte.height)
    luz.addColorStop(0, "rgba(255, 150, 60, 0.18)")
    luz.addColorStop(1, "rgba(140, 50, 160, 0.16)")
    ctxRecorte.fillStyle = luz
    ctxRecorte.fillRect(0, 0, recorte.width, recorte.height)
    ctxRecorte.globalCompositeOperation = "source-over"

    try { resultado.close() } catch (erro) { }

    return recorte
}

// O MODO PRINCIPAL: coloca VOCÊ (igualzinho) dentro da cena GTA
async function colocarNoMundoGTA(recado) {

    nomeJogador = (document.getElementById("nome-jogador").value || "Você").toUpperCase()
    ultimoModo = "mundo"

    if (!recado) {
        mostrarPasso("carregando")
        comecarCarregando("A IA do seu aparelho está recortando você... ✂️")
        await esperar(900) // só um segundinho para ver a tela de carregando
    }

    pararRelogios()

    // espera as fontes carregarem para o desenho sair bonito
    try {
        await document.fonts.load('150px "Pricedown Bl"')
        await document.fonts.load('150px "Bangers"')
    } catch (erro) { }

    // 1) tenta recortar a pessoa com a IA local (se falhar, tem plano B)
    let pessoa = null
    try {
        pessoa = await comTempoLimite(recortarPessoa(), 20000)
    } catch (erro) {
        console.log("Recorte automático indisponível:", erro)
    }

    // 2) sorteia um cenário que a IA desenhou
    const cenarioSorteado = CENARIOS[Math.floor(Math.random() * CENARIOS.length)]
    const cenario = await carregarImagem(cenarioSorteado)

    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext("2d")

    if (cenario) {
        // recorta a beiradinha de baixo (onde fica a marca d'água da IA)
        desenharPreenchendo(ctx, cenario, 0, 0, 1080, 1350, 0.90)
    } else {
        // nem o cenário carregou? um degradê bonito resolve
        const fundo = ctx.createLinearGradient(0, 0, 1080, 1350)
        fundo.addColorStop(0, "#150a24")
        fundo.addColorStop(1, "#43143f")
        ctx.fillStyle = fundo
        ctx.fillRect(0, 0, 1080, 1350)
    }

    // 3) sombra escura embaixo (para o título aparecer)
    const sombra = ctx.createLinearGradient(0, 420, 0, 1350)
    sombra.addColorStop(0, "#00000000")
    sombra.addColorStop(1, "#000000d9")
    ctx.fillStyle = sombra
    ctx.fillRect(0, 420, 1080, 930)

    if (pessoa) {

        // 4) VOCÊ em pé na cena (rosto, cabelo e corpo iguais aos da foto!)
        const alturaPessoa = 780
        const larguraPessoa = alturaPessoa * (pessoa.width / pessoa.height)
        const x = 560 - larguraPessoa / 2
        const y = 1290 - alturaPessoa

        // sombra no chão (uma elipse escura)
        const sombraChao = ctx.createRadialGradient(560, 1280, 10, 560, 1280, 260)
        sombraChao.addColorStop(0, "#00000099")
        sombraChao.addColorStop(1, "#00000000")
        ctx.fillStyle = sombraChao
        ctx.beginPath()
        ctx.ellipse(560, 1280, 260, 55, 0, 0, Math.PI * 2)
        ctx.fill()

        // aplica o filtro de desenho na pessoa (mantém as beiradas transparentes)
        const pessoaComFiltro = aplicarFiltroGTA(pessoa, 18)
        ctx.drawImage(pessoaComFiltro, x, y, larguraPessoa, alturaPessoa)

        // guarda a pessoa recortada para o PALCO do site (fundo transparente!)
        resultadoPalcoSrc = pessoaComFiltro.toDataURL("image/png")
        resultadoEhQuadro = false

    } else {

        // PLANO B: se o recorte da pessoa não rolou, monta o cartão polaroid
        montarPolaroid(ctx)

        resultadoPalcoSrc = ""
        resultadoEhQuadro = true
    }

    // 5) vinheta nos cantos (cara de capa de jogo)
    const vinheta = ctx.createRadialGradient(540, 600, 380, 540, 600, 980)
    vinheta.addColorStop(0, "#00000000")
    vinheta.addColorStop(1, "#00000088")
    ctx.fillStyle = vinheta
    ctx.fillRect(0, 0, 1080, 1350)

    // 6) o TÍTULO estilo GTA (embaixo, à esquerda)
    ctx.textAlign = "left"
    const tinta = ctx.createLinearGradient(60, 0, 760, 0)
    tinta.addColorStop(0, "#ff3cac")
    tinta.addColorStop(1, "#ffd319")

    ctx.font = '150px "Pricedown Bl", "Bangers"'
    ctx.lineWidth = 20
    ctx.strokeStyle = "#000000"
    ctx.strokeText("DEV CITY", 60, 1240)
    ctx.fillStyle = tinta
    ctx.fillText("DEV CITY", 60, 1240)

    // fitinha com o nome da pessoa
    ctx.font = '48px "Pricedown Bl", "Bangers"'
    const larguraNome = ctx.measureText(nomeJogador).width
    ctx.fillStyle = "#000000bb"
    caminhoArredondado(ctx, 60, 1268, larguraNome + 60, 66, 14)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.fillText(nomeJogador, 90, 1318)

    // recadinho no canto
    ctx.font = '28px "Inter", sans-serif'
    ctx.fillStyle = "#ffffffaa"
    ctx.textAlign = "right"
    ctx.fillText("🌴 no mundo de Dev City", 1020, 1318)

    resultadoSrc = canvas.toDataURL("image/jpeg", 0.92)

    // se caiu no plano B (não achou pessoa), avisa com honestidade
    const recadoFinal = recado || (pessoa
        ? "🌴 Agora sim: VOCÊ dentro do mundo de Dev City — com seu rosto, seu cabelo e seu corpo!"
        : "🤔 Não consegui recortar você da foto (talvez não tenha uma pessoa nela, ou a internet caiu). Montei um cartão polaroid com cenário feito por IA — mas tenta de novo com uma selfie de frente, vai ficar incrível!")

    mostrarResultado(recadoFinal)
}

// O cartão polaroid (usado só se o recorte da pessoa falhar)
function montarPolaroid(ctx) {

    const selfie = aplicarFiltroGTA(document.getElementById("foto"), 14)
    const inclinacao = (Math.random() * 8 - 4) * Math.PI / 180 // -4° a +4°
    const x = 220
    const y = 260
    const largura = 640
    const altura = 760

    ctx.save()
    // gira um pouquinho em volta do centro do cartão
    ctx.translate(x + largura / 2, y + altura / 2)
    ctx.rotate(inclinacao)
    ctx.translate(-(x + largura / 2), -(y + altura / 2))

    // cartão branco com sombrinha
    ctx.shadowColor = "#000000aa"
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 24
    caminhoArredondado(ctx, x, y, largura, altura, 10)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.shadowColor = "transparent"

    // a selfie dentro do cartão
    ctx.drawImage(selfie, x + 30, y + 30, 580, 580)

    // a faixinha de baixo do polaroid
    ctx.fillStyle = "#1a1a1a"
    ctx.font = '54px "Pricedown Bl", "Bangers"'
    ctx.textAlign = "center"
    ctx.fillText(nomeJogador + " · DEV CITY", x + largura / 2, y + 700)
    ctx.restore()

    // a FITINHA ADESIVA em cima do cartão :)
    ctx.save()
    ctx.translate(150, 250)
    ctx.rotate(-25 * Math.PI / 180)
    ctx.fillStyle = "#ffd319bb"
    ctx.fillRect(0, 0, 220, 70)
    ctx.globalAlpha = 0.35
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(8, 8, 204, 12)
    ctx.restore()
}

// O "filtro GTA": deixa a foto com cara de desenho
// 1) mais colorido e contrastado 2) POSTERIZAR (poucos tons de cor)
function aplicarFiltroGTA(canvasOriginal, tons) {

    const canvas = document.createElement("canvas")
    canvas.width = 580
    canvas.height = 580
    const ctx = canvas.getContext("2d")

    try { ctx.filter = "saturate(1.5) contrast(1.12)" } catch (erro) { }

    const lado = Math.min(canvasOriginal.width, canvasOriginal.height)
    const sx = (canvasOriginal.width - lado) / 2
    const sy = (canvasOriginal.height - lado) / 2
    ctx.drawImage(canvasOriginal, sx, sy, lado, lado, 0, 0, 580, 580)
    ctx.filter = "none"

    const dados = ctx.getImageData(0, 0, 580, 580)
    const pixels = dados.data
    const niveis = tons || 14 // quantos tons cada cor vai ter (menos tons = mais desenho)

    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.round(pixels[i] / 255 * niveis) / niveis * 255         // vermelho
        pixels[i + 1] = Math.round(pixels[i + 1] / 255 * niveis) / niveis * 255 // verde
        pixels[i + 2] = Math.round(pixels[i + 2] / 255 * niveis) / niveis * 255 // azul

        // deixa mais "quente" (pôr do sol): mais vermelho, menos azul
        pixels[i] = Math.min(255, pixels[i] * 1.1)
        pixels[i + 2] = pixels[i + 2] * 0.92
    }

    ctx.putImageData(dados, 0, 0)
    return canvas
}


/* ==========================================================
   PASSO 4 — O RESULTADO E ENTRAR NO JOGO
   ========================================================== */

function mostrarResultado(recado) {

    document.getElementById("titulo-resultado").innerHTML =
        ultimoModo === "mundo"
            ? nomeJogador + " em Dev City"
            : "Você virou " + PERSONAGENS[personagemEscolhido].rotulo + "!"

    document.getElementById("resultado").src = resultadoSrc
    document.getElementById("aviso-resultado").innerHTML = recado

    mostrarPasso("resultado")
}

// Tenta de novo o mesmo modo (mundo GTA ou troca de rosto)
function repetirGeracao() {
    if (ultimoModo === "troca") {
        virarPersonagem()
    } else {
        colocarNoMundoGTA()
    }
}

// Baixa a imagem para o seu aparelho
async function baixarResultado() {

    const link = document.createElement("a")
    link.download = "dev-city-" + nomeJogador.toLowerCase() + (resultadoEhQuadro ? ".jpg" : ".png")
    link.href = resultadoSrc
    link.click()
}

// A ARTE VIRA SEU PERSONAGEM NO SITE (o final da história!)
function usarComoPersonagem() {

    escreverNome(nomeJogador, corJogador)
    // no modo mundo, o palco recebe VOCÊ recortado (fundo transparente!)
    personagem.src = resultadoPalcoSrc || resultadoSrc
    personagem.classList.toggle("quadro", resultadoEhQuadro)

    adicionarCardLenda()
    animarDinheiro(100000)
    fecharEstudio()
}

// Cria (ou atualiza) o card "SUA LENDA" no menu
function adicionarCardLenda() {

    const menu = document.querySelector(".menu")
    let card = document.getElementById("card-eu")

    if (!card) {
        // cria o card novo do zero (o jeito JavaScript de fazer HTML)
        card = document.createElement("button")
        card.id = "card-eu"
        card.className = "card"
        card.innerHTML = '<img alt="Sua lenda"><span>SUA LENDA</span>'
        card.onclick = function () {
            escreverNome(nomeJogador, corJogador)
            personagem.src = resultadoPalcoSrc || resultadoSrc
            personagem.classList.toggle("quadro", resultadoEhQuadro)
            marcarCard(card)
        }
        menu.appendChild(card)
    }

    // a fotinho do card é o seu rosto (a selfie!)
    card.querySelector("img").src = document.getElementById("foto").toDataURL("image/jpeg", 0.8)
    marcarCard(card)
}


/* ==========================================================
   AJUDANTES (funções pequenas que usamos em vários lugares)
   ========================================================== */

// Espera um tempo: esperar(1000) = espera 1 segundo
function esperar(milissegundos) {
    return new Promise(function (pronto) {
        setTimeout(pronto, milissegundos)
    })
}

// Se a promessa demorar mais que o limite, desiste e dá erro
function comTempoLimite(promessa, limite) {
    return Promise.race([
        promessa,
        new Promise(function (_, desistir) {
            setTimeout(function () { desistir(new Error("Demorou demais")) }, limite)
        })
    ])
}

// Tenta de novo algumas vezes se der erro (a IA às vezes está na fila)
async function comTentativas(funcao, vezes) {
    let ultimoErro
    for (let tentativa = 1; tentativa <= vezes; tentativa++) {
        try {
            return await funcao()
        } catch (erro) {
            console.log("Tentativa " + tentativa + " falhou:", erro)
            ultimoErro = erro
            await esperar(1500)
        }
    }
    throw ultimoErro
}

// Carrega uma imagem de um endereço (ou arquivo) para usar no canvas
function carregarImagem(endereco) {
    return new Promise(function (resolver, rejeitar) {
        const imagem = new Image()
        imagem.onload = function () { resolver(imagem) }
        imagem.onerror = function () { resolver(null) }
        imagem.src = endereco
    })
}

// Desenha preenchendo o espaço todo, cortando o que sobra
// (igual ao "object-fit: cover" do CSS)
function desenharPreenchendo(ctx, imagem, x, y, largura, altura, corteDeBaixo) {

    const corte = corteDeBaixo || 1
    const fonteLargura = imagem.width
    const fonteAltura = imagem.height * corte

    const escala = Math.max(largura / fonteLargura, altura / fonteAltura)
    const desenhoLargura = fonteLargura * escala
    const desenhoAltura = fonteAltura * escala

    ctx.drawImage(
        imagem,
        0, 0, fonteLargura, fonteAltura,
        x + (largura - desenhoLargura) / 2, y + (altura - desenhoAltura) / 2,
        desenhoLargura, desenhoAltura
    )
}

// Desenha o caminho de um retângulo com cantos arredondados
function caminhoArredondado(ctx, x, y, largura, altura, raio) {
    ctx.beginPath()
    ctx.moveTo(x + raio, y)
    ctx.arcTo(x + largura, y, x + largura, y + altura, raio)
    ctx.arcTo(x + largura, y + altura, x, y + altura, raio)
    ctx.arcTo(x, y + altura, x, y, raio)
    ctx.arcTo(x, y, x + largura, y, raio)
    ctx.closePath()
}

// A tela de carregando: frases + artes trocando
function comecarCarregando(fraseInicial) {

    let numeroDaFrase = 0
    document.getElementById("mensagem-loading").innerHTML = fraseInicial || FRASES_CARREGANDO[0]

    relogioFrases = setInterval(function () {
        numeroDaFrase = (numeroDaFrase + 1) % FRASES_CARREGANDO.length
        document.getElementById("mensagem-loading").innerHTML = FRASES_CARREGANDO[numeroDaFrase]
    }, 3500)

    // rodízio de artes no fundo (como a tela de carregamento do GTA)
    const artes = ["img/lucia.png", "img/jason.png", "img/cj.png", "img/jaque-removebg-preview.png"]
    let numeroDaArte = 0
    const img = document.getElementById("arte-carregando")

    relogioSlides = setInterval(function () {
        img.style.opacity = 0
        setTimeout(function () {
            numeroDaArte = (numeroDaArte + 1) % artes.length
            img.src = artes[numeroDaArte]
            img.style.opacity = 1
        }, 400)
    }, 2500)
}

function pararRelogios() {
    clearInterval(relogioFrases)
    clearInterval(relogioSlides)
    relogioFrases = null
    relogioSlides = null
}

// O dinheiro do HUD vai subindo quando você entra no jogo :)
function animarDinheiro(ganho) {

    const elemento = document.getElementById("dinheiro")
    const alvo = dinheiroAtual + ganho
    const passos = 30
    let passo = 0

    const relogio = setInterval(function () {
        passo++
        const valor = Math.round(dinheiroAtual + (alvo - dinheiroAtual) * (passo / passos))
        elemento.innerHTML = "$ " + valor.toLocaleString("pt-BR")
        if (passo >= passos) {
            clearInterval(relogio)
            dinheiroAtual = alvo
        }
    }, 30)
}
