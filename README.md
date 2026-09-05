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
Não compartilha nada com o CENA além da hospedagem.

| Arquivo | Página |
|---|---|
| `artsivo/index.html` | home: produtos, orçamento com estimativa, pagamento, dúvidas |
| `artsivo/estilo.css` | CSS de todas as páginas do site |
| `artsivo/sobre/index.html` | sobre a empresa |
| `artsivo/blog/index.html` | lista de artigos |
| `artsivo/blog/<slug>/index.html` | artigos (3 publicados) |

### Já é real
- WhatsApp `5583986062797` e Instagram `@artsivospb`
- Os nove produtos

### Ainda é rascunho — confirmar com a empresa
- **Tabela de preços:** `TABELA` no script do `index.html`. Os valores são de exemplo.
  A página deixa claro que é estimativa, mas número errado gera expectativa errada.
  Mexer só nos números (`m2`, `peca`, `min`, `inst`) — a conta se ajusta sozinha.
  Também `ARTE`, `PRESSA`, `ENTREGA`, `RETIRADA` e `MARGEM` (faixa de ±12%).
- **Formas de pagamento:** PIX com desconto, 12x, sinal de 50%, nota fiscal — nada confirmado.
- **Promessa de resposta em 2 horas** no horário comercial: só manter se alguém garantir.
- **Endereço, e-mail, CNPJ, horário** no rodapé; textos do "sobre"; instalação com equipe própria.
- **Captura de contato:** `LEAD_ENDPOINT` no topo do `radar.js` — um único lugar, usado
  tanto pelo orçamento quanto pelo convite dos 5 minutos. Vazio = nada fica registrado
  se a pessoa não for para o WhatsApp. Preencher com a URL de um Formspree/Google Forms/API.
- **Logo:** a marca é escrita em CSS. Para usar o arquivo real, coloque `artsivo/logo.png`
  e troque o `<a class="marca">` por um `<img>`.
- **Fotos de trabalhos:** a seção "Trabalhos" já existe com 8 espaços; enquanto o arquivo
  não estiver em `artsivo/fotos/`, o site mostra o nome do arquivo que falta no lugar da
  imagem. Nomes e formato em `artsivo/fotos/LEIA-ME.txt`. É o que mais falta.
- **Legendas dos trabalhos:** descrevem o tipo de peça, sem nome de cliente. Se a empresa
  puder citar clientes (com autorização), vale trocar.

### Radar de visita (`radar.js`)
Carregado nas cinco páginas. Guarda no navegador da pessoa o que ela olhou — produtos
clicados, páginas lidas, se simulou orçamento e quanto deu, tempo com a aba na frente —
e depois de **5 minutos** de uso real abre um convite pedindo nome, WhatsApp, e-mail e
o que está procurando (já vem preenchido com o que ela olhou). Quem já preencheu o
orçamento não vê o convite; quem diz "agora não" não vê de novo. O tempo só corre com a
aba visível, então 5 minutos são 5 minutos de verdade.

O orçamento mostra uma faixa de valor (estimativa) e dois botões: fechar pelo WhatsApp
ou pedir um preço melhor. Preço fechado é sempre feito à mão.
