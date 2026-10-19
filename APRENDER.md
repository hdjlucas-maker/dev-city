# 📚 APRENDER.md — Como o DEV CITY funciona por dentro

> Este arquivo é o seu **guia de estudo**. Ele explica, em português simples,
> tudo o que foi construído no site, por que cada peça existe e onde você pode
> mexer para aprender mais. Leia com o site aberto no navegador do lado. 😉

---

## 🎯 O que o site faz (visão geral)

O DEV CITY é uma página que parece a tela de seleção de personagem de um jogo
estilo GTA. A estrela do show é o **Estúdio Selfie**:

1. A pessoa escolhe uma lenda (Jaque, Jason, Lucas) ou entra pelo botão **📸 ENTRAR NO JOGO**;
2. Tira uma selfie (no celular abre a **câmera nativa**; no PC, webcam ou uma foto do computador);
3. Uma **IA de rosto que roda no aparelho** (MediaPipe) acha o rosto e enquadra a foto;
4. Dois caminhos mágicos:
   - **🌴 ME COLOCAR NO MUNDO GTA** (o principal!) — uma IA no aparelho **recorta a pessoa** da selfie (rosto, cabelo e corpo reais, sem inventar nada!) e coloca você **em pé dentro de um cenário**;
   - **🎭 VIRAR A LENDA** — uma IA grátis **na nuvem** (sem login!) coloca o rosto da pessoa na arte do personagem escolhido (Jaque, Jason ou Lucas);
5. A arte vira o personagem no palco, o dinheiro sobe no HUD e nasce o card **SUA LENDA**;
6. Dá para **salvar a imagem** no aparelho.

**Tudo isso sem cadastro, sem senha e sem pagar nada.**

---

## 🏗️ A arquitetura (o mapa do tesouro)

```
 ┌─────────────────────────────── SEU NAVEGADOR (celular ou PC) ──────────────────────────────┐
 │                                                                                            │
 │  index.html ──► a estrutura (o palco, os cards, o estúdio de 4 passos)                     │
 │  styles.css ──► a beleza (fonte Pricedown, degradês, HUD, modo celular)                    │
 │  scripts.js ──► a inteligência (o fluxo que você programou!)                               │
 │                                                                                            │
 │  1. Câmera       →  celular: câmera nativa | PC: webcam | PC sem câmera: escolher arquivo  │
 │  2. IA local     →  MediaPipe acha o rosto e enquadra a foto                               │
 │  3. IA local 2   →  MediaPipe recorta a PESSOA (o fundo fica transparente)                 │
 │  4. Composição   →  canvas põe você em pé no cenário (modo 🌴, 100% local)                  │
 │  5. IA na nuvem  →  Space grátis do Hugging Face troca o rosto (só no modo 🎭)              │
 └────────────────────────────────────────────────────────────────────────────────────────────┘
```

Nada de Node.js, nada de Python, nada de servidor especial: o `scripts.js` roda
inteiro no navegador de quem visita. É por isso que funciona em qualquer aparelho.

---

## 🧠 Os 4 algoritmos do `scripts.js` (a receita de bolo)

### ALGORITMO 1 — Escolher um personagem no palco
**Função:** `escolherCard(chave, elemento)`
- Troca a imagem e o **nome gigante** do palco;
- O nome calcula o próprio tamanho: quanto mais letras, menor a fonte
  (veja a variável `--letras` no CSS — truque bem legal!);
- `marcarCard()` deixa a bordinha amarela só no card selecionado.

### ALGORITMO 2 — Pegar a foto (mobile-first!)
**Funções:** `prepararModoFoto()`, `tirarFoto()`, `usarArquivo(evento)`

A decisão mais importante do projeto: **câmera é coisa de celular**. Então:

| Situação | O que acontece |
| --- | --- |
| Celular | O botão abre a **câmera nativa** (`<input capture="user">`). Tela cheia, alta qualidade, funciona até em Wi-Fi sem HTTPS! |
| PC com webcam | Vídeo ao vivo com a mirinha e o "● REC", como uma câmera de jogo. |
| PC **sem** webcam (o caso do Lucas!) | O site percebe sozinho e vira "escolher uma foto 😉". |

Depois da foto, a função `depoisDePegarFoto()` chama a **IA de rosto**.

### ALGORITMO 3 — Enquadrar o rosto com IA local (MediaPipe)
**Funções:** `carregarDetectorRosto()` e `enquadrarRosto()`
- O `import()` "puxa" a biblioteca MediaPipe na hora que precisa;
- Ela é uma IA de verdade (BlazeFace) que roda **no próprio aparelho**;
- Ela devolve uma caixinha (`boundingBox`) com a posição do rosto;
- Recortamos um quadrado em volta do rosto ×2.6 (com margem bonita);
- Se a internet falhar, tem `comTempoLimite()`: espera no máximo 12s e segue
  com o recorte central — **o site nunca trava**.

### ALGORITMO 4 — Os dois finais mágicos

#### 🎭 Trocar o rosto com IA grátis na nuvem
**Funções:** `virarPersonagem()` → `trocarRostoNAIA()` → `enviarArquivoParaIA()`

O Space `tonyassi/face-swap` do Hugging Face faz a troca de rosto **sem pedir
login**. A conversa com ele tem 4 passos (é assim que clientes Gradio funcionam):

1. `fetch(.../gradio_api/upload)` — envia a selfie (arquivo FormData) e recebe um caminho;
2. Mesmo upload para a arte do personagem (ela está na pasta `img/`);
3. `fetch(.../gradio_api/call/swap_faces)` — pede a mágica: `[selfie, arte]` e recebe um `event_id`;
4. `fetch(.../call/swap_faces/{event_id})` — lê o "rio de avisos" (SSE) até
   aparecer `event: complete` e pega o endereço da imagem pronta.

Detalhes espertos do código:
- `comTentativas()` tenta 2 vezes (a IA pública às vezes está na fila);
- `comTempoLimite()` desiste em 130s e cai no plano B;
- **Plano B automático:** se a nuvem falhar, `colocarNoMundoGTA()` assume — a
  experiência **nunca termina sem uma arte**;
- `removerFundoPreto()`: a IA devolve o personagem com fundo preto; um loop de
  pixels (igualzinho ao do filtro!) transforma preto em transparente, com uma
  transição suave — por isso o personagem "entra" na cena do jogo.

#### 🌴 Colocar VOCÊ no mundo GTA (100% local — o modo principal!)
**Funções:** `colocarNoMundoGTA()` → `carregarSegmentador()` → `recortarPessoa()`
- A IA **ImageSegmenter** (do mesmo MediaPipe) devolve uma **máscara**: para
  cada pixel, a confiança (0 a 1) de que ali é a pessoa;
- Essa máscara vira **transparência**: o fundo some e sobra só você — rosto,
  cabelo e corpo **iguais aos da foto**, sem inventar nada;
- `aplicarFiltroGTA()` dá um toque de desenho (posterização) para você combinar
  com a cena, e um degradê esmaece a base (o corte de baixo some);
- `desenharPreenchendo()` copia um dos 4 cenários de `img/cenarios/` (desenhados
  pela IA grátis Pollinations) e você entra **em pé**, com sombra no chão;
- Tudo desenhado num `<canvas>` de 1080×1350 (tamanho ideal para Stories!),
  com o título DEV CITY e o seu nome;
- **No palco do site**, o personagem vira **você recortado** (PNG transparente)
  — você aparece dentro do Dev City de verdade!
- Se o recorte falhar (internet caiu, foto sem pessoa...), o plano B é o
  `montarPolaroid()`: a selfie num cartão polaroid com fita adesiva — **nunca
  fica sem arte**.

---

## 📁 Os arquivos do projeto

| Arquivo | O que é |
| --- | --- |
| `index.html` | A estrutura: HUD, palco, cards, estúdio de 4 passos |
| `styles.css` | O visual: fonte Pricedown, cores, celular-primeiro, modo PC |
| `scripts.js` | Todo o fluxo explicado acima, comentado passo a passo |
| `abrir-site.sh` | Liga o servidor local e mostra o endereço para abrir no **celular** |
| `img/` | Artes dos personagens + `img/cenarios/` (4 cenários de IA) |
| `APRENDER.md` | Este guia :) |

---

## ▶️ Como usar

```bash
# No terminal, dentro da pasta do projeto:
./abrir-site.sh
```

- No computador: `http://localhost:8000`
- No celular (mesma rede Wi-Fi): o script mostra o endereço, tipo `http://192.168.x.x:8000`

> 💡 No celular a selfie fica MUITO melhor (câmera nativa!).

---

## 🔒 Privacidade, em bom português

- A selfie **não fica guardada em lugar nenhum**;
- No modo **🌴 me colocar no mundo GTA** (o principal), a foto **não sai do
  aparelho** — recorte, filtro e composição rodam 100% localmente;
- No modo **🎭 virar a lenda**, a selfie é enviada só na hora para o Space
  público do Hugging Face (que faz a troca). Depois, o resultado volta para o seu aparelho;
- As duas IAs locais (detector de rosto e recorte da pessoa) rodam 100% no aparelho.

---

## 🧪 Como os testes foram feitos

Um robô de navegador (Puppeteer) testou os 3 cenários de verdade:

1. **Celular emulado (iPhone)** — selfie **realista** → recorte da pessoa + mundo GTA (4s!) → entrar no jogo ✅
2. **PC com webcam** — vídeo ao vivo → capturar → mundo GTA ✅
3. **PC sem webcam** — o site cai sozinho no modo arquivo → troca de rosto na nuvem (~10s) ✅

A troca de rosto rodou **de graça, sem login**, e o recorte da pessoa foi
**100% no navegador** — sem mandar selfie para ninguém.

---

## 🌱 Ideias para aprender mais (ordem de dificuldade)

1. **Trocar as frases do carregando** → `FRASES_CARREGANDO` no `scripts.js`;
2. **Mudar as cores do site** → variáveis no topo do `styles.css` (`:root`);
3. **Trocar os cenários** → substitua os arquivos em `img/cenarios/`;
4. **Novo personagem** → adicione uma entrada em `PERSONAGENS` e um card no HTML;
5. **Ajustar o filtro de desenho** → mude `niveis` em `aplicarFiltroGTA()`;
6. **Melhorar o recorte da lenda** → mexa nos números `26` e `80` de `removerFundoPreto()`;
7. **Ajustar o recorte da pessoa** → os limiares `0.25` e `0.5` de `recortarPessoa()` controlam o quanto do fundo some.

---

## ⚠️ Notas honestas sobre as IAs grátis

- O Space de troca de rosto é **público e comunitário**: às vezes fica na fila.
  Por isso existe o plano B (cartaz) — e o botão "OUTRA VERSÃO" para tentar de novo;
- O modelo de troca de rosto (inswapper) é gratuito para **uso pessoal/estudo**,
  não para uso comercial — este é um projeto de aprendizado;
- Os cenários foram gerados com a IA grátis **Pollinations** (sem chave de API);
- Fonte **Pricedown** (a "fonte do GTA") via <https://fonts.cdnfonts.com/css/pricedown>.

---

## Feito com carinho 🎮

Projeto de estudo da família: **Jaque** (a lenda do palco) e **Lucas** (o dev).
Se você chegou até aqui, você já entendeu mais de IA no navegador do que 99% das pessoas. 😉
