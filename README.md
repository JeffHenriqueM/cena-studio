# Cena Studio — site + painel

Site estático (sem build, sem dependências) publicado pelo GitHub Pages.

| Arquivo | O que é | URL |
|---|---|---|
| `index.html` | Landing page pública do estúdio | `/` |
| `painel/index.html` | Painel interno: mapa de salas, quem estará em cada sala, reservas | `/painel/` |

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

## Limite conhecido do painel

As reservas ficam no `localStorage` do navegador — cada aparelho tem a sua cópia e nada
é compartilhado entre celular e computador. Para virar a agenda real do estúdio,
precisa de backend (naturalmente um módulo do NeuroCRM sobre o Firestore).
