# 🎮 DEV CITY

Site estilo **GTA** com **Estúdio Selfie**: a pessoa tira uma selfie e uma IA
grátis (rodando no próprio navegador!) coloca ela **dentro do mundo de Dev
City** — sem login, sem instalar nada, sem pagar nada.

## 🌐 Jogue agora

👉 **https://hdjlucas-maker.github.io/dev-city/**

> 💡 Funciona melhor no **celular** — a câmera nativa deixa a selfie incrível
> (e tudo funciona até em Wi-Fi sem HTTPS local).

## ✨ O que tem dentro

- **🌴 Modo principal — ME COLOCAR NO MUNDO GTA**: uma IA local (MediaPipe)
  recorta você da selfie — rosto, cabelo e corpo reais, sem inventar nada — e
  coloca em pé no cenário, com título estilo capa de jogo. **100% no seu
  aparelho** (a foto não sai de lá);
- **🎭 VIRAR A LENDA**: uma IA grátis na nuvem (Space do Hugging Face, sem
  login) troca o seu rosto na arte de um personagem — Jaque, Jason ou Lucas;
  se a IA falhar, o site cai automaticamente no modo 🌴 (nunca fica sem arte!);
- **Palco principal**: cards de personagens, dinheiro subindo no HUD e o card
  "SUA LENDA" com a sua criação;
- Tudo é **HTML + CSS + JavaScript puro** — sem servidor, sem instalação.

## 🚀 Rodar no seu computador

```bash
./abrir-site.sh
# abre em http://localhost:8000
# e mostra o endereço para abrir no celular pela rede Wi-Fi
```

## 📚 Quer entender como funciona?

Leia o [`APRENDER.md`](APRENDER.md) — guia didático em português explicando
cada IA (detector de rosto, recorte de pessoa, troca de rosto na nuvem) e cada
truque do projeto (canvas, posterização, máscaras...).

---

Projeto de estudo da família: **Jaque** (a lenda do palco) e **Lucas** (o dev). 💜
