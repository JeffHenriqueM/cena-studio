# Cena Studio — site + painel

Site estático (sem build, sem dependências) publicado pelo GitHub Pages.

| Arquivo | O que é | URL |
|---|---|---|
| `index.html` | Landing page pública do estúdio | `/` |
| `painel/index.html` | Painel interno: agenda, vendas/rede, custos mês a mês e pacotes | `/painel/` |
| `artsivo/index.html` | Site da ARTsivos Comunicação Visual (outra empresa, mesma hospedagem) | `/artsivo/` |

## Como editar

Os dois arquivos são HTML puro com CSS e JS embutidos. Edite, faça commit e o Pages
republica sozinho em ~1 minuto.

## Antes de divulgar — trocar os placeholders

Tudo abaixo é fictício e precisa virar o dado real:

- **WhatsApp:** `PHONE = "5583999999999"` no script do `index.html` (e o link do rodapé)
- **Marca:** "CENA / Cena Studio"
- **Endereço:** Av. Exemplo, 1200 — sala 4, Manaíra, João Pessoa — PB
- **Contato:** `@cena.studio`, `oi@cenastudio.com.br`, CNPJ
- **Preços e pacotes:** valores de hora, meia diária, diária, Live Shopping Pro, mentoria
- **Oferta FIAS:** o FIAS (Viral Analyst) é o app de inteligência de conteúdo para quem vende gravando —
  analisar vídeo viral, base de conhecimento, roteiros com IA, cenas pré-gravadas, sessão de gravação,
  produtos e perfis. O bloco da oferta no `index.html` descreve essas funções.
  O contador de vagas fica em `FIAS_TOTAL` / `FIAS_TOMADAS`, no script do `index.html`
- **Painel:** clientes, telefones e a agenda semeada são inventados

## Custos já cadastrados

Internet R$ 349 (valor simulado de link dedicado — trocar pelo do contrato), aluguel R$ 1.500,
funcionário R$ 2.000 e ar-condicionado R$ 3.000. O ar-condicionado entrou como **investimento**
(compra e instalação, conta só no mês em que aconteceu) — se no seu caso for despesa mensal,
edite o lançamento e mude o tipo para "Todo mês".

## Limite conhecido do painel

As reservas ficam no `localStorage` do navegador — cada aparelho tem a sua cópia e nada
é compartilhado entre celular e computador. Para virar a agenda real do estúdio,
precisa de backend (naturalmente um módulo do NeuroCRM sobre o Firestore).

## ARTsivos (`/artsivo/`)

Site independente, hospedado na mesma pasta só para não pagar dois domínios.
Não compartilha nada com o CENA além da hospedagem — paleta, conteúdo e script são próprios.

Placeholders a trocar antes de divulgar:

- **WhatsApp:** `PHONE = "5583999999999"` no script do `artsivo/index.html`
- **Redes:** `instagram.com/artsivos`, `facebook.com/artsivos`, `tiktok.com/@artsivos`
- **Endereço, e-mail, CNPJ e horário** no rodapé
- **Logo:** hoje a marca é escrita em CSS (ART cinza + sivos vermelho). Para usar o arquivo real,
  coloque `artsivo/logo.png` e troque o `<a class="marca">` do topo por um `<img>`.
- **Textos de apoio** (prazo de 1 dia útil, "equipe própria de instalação", horário, segmentos)
  ainda são rascunho — os nove produtos são os reais.
- **Captura de contato:** `LEAD_ENDPOINT` no script. Enquanto estiver vazio, o pedido só vira
  mensagem de WhatsApp e nada fica registrado se a pessoa não enviar. Com uma URL de formulário
  (Formspree, Google Forms, API própria), cada pedido montado é gravado antes de abrir o WhatsApp.

O orçamento não calcula preço de propósito: em comunicação visual o valor depende do material,
e número chutado no site vira desconforto na hora de fechar. O formulário monta a mensagem de
WhatsApp com produto, medida, aplicação, prazo e serviços — o preço vai na resposta.
