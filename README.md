# Clube do Papercraft — 20 Animais Papercraft para Montar

Landing page de vendas em HTML/CSS/JS puro (arquivo único, sem framework e sem
build) para o produto **"20 Animais Papercraft para Montar"**, do **Clube do Papercraft** — 20 moldes
3D de animais em PDF, para imprimir, recortar, dobrar e montar.

## Arquivos

- [index.html](index.html) — a página inteira (HTML + CSS + JS inline; a única
  dependência externa são as fontes do Google Fonts).
- [assets/](assets/) — imagens, todas geradas a partir do material do produto:
  - `capa.jpg` — a capa oficial (hoje sem uso na página)
  - `faixa-animais.jpg` — recorte da capa com os animais (hoje sem uso na página)
  - `ficha-*.jpg` — a ficha A4 inteira de cada animal (9 arquivos), usada nos
    leques de A4 e na seção das fichas
  - `animal-*.jpg` — recorte de cada animal montado, tirado da capa (10 arquivos),
    usado na galeria
  - `bicho-*.jpg` — recortes antigos, tirados do canto das fichas (9 arquivos,
    hoje sem uso na página)

Os recortes foram feitos com System.Drawing via PowerShell, a partir dos PNGs
originais (fichas em 1055×1491 e capa em 1536×1024).

## Antes de publicar — preencha este bloco

Fica no topo do `<head>` do [index.html](index.html):

```js
window.CHECKOUT_URL      = "";          // <-- link real do checkout
window.PRICE_DISPLAY     = "R$ 17,90";  // <-- exemplo, troque
window.PRICE_OLD_DISPLAY = "R$ 39,90";  // <-- exemplo, "" esconde
window.PRICE_VALUE       = 17.90;       // <-- o mesmo preço, em número
window.QTD_MOLDES        = 20;          // total de animais do kit
window.QTD_EXEMPLOS      = 10;          // quantos aparecem na página
window.WHATSAPP_URL      = "";          // "" esconde o botão flutuante
window.PIXEL_ID          = "";          // "" não carrega pixel nenhum
```

Enquanto `CHECKOUT_URL` estiver vazio, os botões rolam até a seção de oferta em
vez de levar ao checkout, e o console avisa. `QTD_MOLDES` e `QTD_EXEMPLOS` se
propagam sozinhos por todos os lugares onde os números aparecem.

## Identidade visual: tirada da capa

O hero reproduz a capa do produto **em HTML**, não como imagem — assim o título
fica nítido em qualquer tela e se adapta ao celular:

- **Título em faixas**: o "20" em amarelo com contorno azul-marinho, "ANIMAIS"
  na faixa azul, "PAPERCRAFT" na fita vermelha e "PARA MONTAR" na faixa azul
  menor, todas com o pespontinho branco tracejado da capa.
- **Subtítulo** no balão amarelo de borda tracejada.
- **Confete** de patinhas, corações e estrelas espalhado pelo fundo, e os
  **cantos de papel colorido** no topo da página.
- **Onda azul** fechando o hero, como no rodapé da capa.

As cores foram amostradas pixel a pixel da capa:

```css
--blue:#0f57cc;   /* faixa do título */
--red:#ee2018;    /* fita PAPERCRAFT */
--yellow:#fdd91f; /* o "20" */
--sky:#19a2f5;    /* onda */
--green:#3cb358;  --purple:#7841ec;  --navy:#071e52;
--cream:#fdf7ea;  /* fundo da capa */
```

Tipografia: **Luckiest Guy** no título do hero (é a fonte que mais se aproxima
da letra da capa, com o mesmo peso e cantos arredondados), Baloo 2 nos títulos
de seção e Nunito no texto.

## Estrutura da página

1. **Tarja** no topo: material digital, acesso imediato, imprime quantas vezes
   quiser.
2. **Hero** no estilo da capa: título em faixas, balão do subtítulo, CTA, selos
   de confiança e um **leque de 5 fichas A4** (uma no centro, duas de cada lado).
3. **Conheça alguns dos animais**: grid 5×2 com os 10 animais montados da capa.
4. **O que chega pra você**: 6 itens numerados e **a ficha do coelho anotada**,
   com marcadores apontando instruções, miniatura, corpo, orelhas, patas e base.
5. **Quatro passos**: imprimir, recortar, dobrar, colar, mais a lista de
   materiais.
6. **É assim que cada ficha chega**: as 9 fichas em miniatura.
7. **Bom para muita coisa**: casa, escola, presente, festa.
8. **Oferta** com outro leque de 5 fichas A4 (maior), **garantia**, **FAQ**, **CTA final** e
   **rodapé**, mais a barra fixa de preço e o botão opcional de WhatsApp.

## Pontos que dependem de você

- **Preço e checkout** ainda são exemplo.
- **As fichas estão em inglês** (a do leãozinho já veio em português). A página
  trata isso de frente: o passo a passo em português está na seção "Quatro
  passos" e há uma pergunta no FAQ. Quando traduzir todas, dá para apagar essa
  pergunta.
- **10 dos 20 animais** aparecem na galeria (os que dá para recortar da capa) e
  **9 fichas** aparecem na seção das fichas (as que existem em arquivo até
  agora). Ao receber as outras, é só gerar os recortes, acrescentar nas galerias
  e mudar `QTD_EXEMPLOS`.
- **Garantia de 7 dias** aparece em quatro lugares — confirme que é a sua
  política.

Não há depoimento, avaliação nem print de cliente na página: eles só entram
quando forem reais.

## Rodar localmente

```bash
npx serve .
```

## Publicar

```bash
git init && git add . && git commit -m "Landing page 20 Animais Papercraft"
gh repo create <nome> --private --source=. --push
```

Depois é apontar a Vercel para o repositório; cada push na `main` republica.

## Meta Pixel e Conversions API

A página manda cada evento por dois caminhos, com o **mesmo `event_id`**, para o
Meta deduplicar e contar uma conversão só:

- **Navegador**: o pixel `1631988885214161`, carregado quando `PIXEL_ID` está
  preenchido, via `fbq('track', nome, dados, { eventID })`.
- **Servidor**: [api/capi.js](api/capi.js), uma função serverless da Vercel que
  recebe `POST /api/capi` e repassa o evento para a Conversions API com o IP, o
  user-agent e os cookies `_fbp` / `_fbc` do visitante — justamente o que o
  bloqueador de anúncios do navegador derruba.

Eventos: `PageView` no carregamento e `InitiateCheckout` no clique de qualquer
botão de compra (com `value`, `currency` e `content_name`). Só os eventos da
lista `ALLOWED_EVENTS` são aceitos, porque o endpoint é público.

### O token NÃO fica no repositório

O token de acesso da CAPI é uma credencial: quem tem ele manda eventos em nome
da sua conta de anúncios. Ele fica só na variável de ambiente
**`FB_CAPI_TOKEN`**, no painel da Vercel:

1. Vercel → o projeto → **Settings → Environment Variables**
2. Name: `FB_CAPI_TOKEN`, Value: o token gerado no Gerenciador de Eventos
3. Marque Production, Preview e Development e salve
4. **Redeploy** (Deployments → o último → `...` → Redeploy): variável nova só
   vale para deploys feitos depois dela

Sem a variável, `/api/capi` responde `204` e não envia nada — a página continua
funcionando normalmente, só com o pixel do navegador.

Para testar no **Testar eventos** do Gerenciador de Eventos, crie também
`FB_CAPI_TEST_CODE` com o código `TEST#####` que aparece lá, e apague depois.

## Checkout

O link da Kiwify (`https://pay.kiwify.com.br/lqOhCnU`) está em
`window.CHECKOUT_URL`, no topo do [index.html](index.html), e é distribuído por
JS para todos os botões com a classe `.btn-buy-link` — hoje são três: o do card
de oferta, o do CTA final e o da barra fixa do rodapé. O hero não tem mais
botão de compra.
