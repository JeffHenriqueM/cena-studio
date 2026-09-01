# Cena Studio — site + painel

Site estático (sem build, sem dependências) publicado pelo GitHub Pages.

| Arquivo | O que é | URL |
|---|---|---|
| `index.html` | Landing page pública do estúdio | `/` |
| `painel/index.html` | Painel interno: agenda, vendas/rede, custos mês a mês e pacotes | `/painel/` |

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
