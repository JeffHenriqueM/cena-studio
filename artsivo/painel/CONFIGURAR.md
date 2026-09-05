# Painel da ARTsivos — o que falta ligar no Firebase

O painel está escrito e publicado em `/artsivo/painel/`. Ele só funciona depois
de três ajustes no console do Firebase, no projeto **`finpay-134b0`** — o mesmo
projeto que já hospeda o FinPay, o FIAS e o site do CENA.

> ⚠️ **Este projeto é compartilhado.** Tudo aqui é escopado em `artsivos_site`
> (Firestore) e `artsivos/` (Storage). Nada toca no que o FinPay e o FIAS usam —
> **desde que as regras sejam somadas às que já existem, nunca substituídas.**
> Por isso as regras abaixo são para colar no console, e por isso este repositório
> **não** tem `firestore.rules` nem `storage.rules`: um `firebase deploy` daqui
> apagaria as regras das outras duas aplicações.

## 1. Ligar o login por e-mail e senha

Console → **Authentication** → *Sign-in method* → **E-mail/senha** → ativar.

Depois, em *Users* → **Add user**, criar a conta de quem vai mexer no painel
(e-mail + senha). Cada pessoa que precisar entrar ganha uma conta própria — é
assim que se tira o acesso de uma sem mexer no das outras.

## 2. Regras do Firestore

Console → **Firestore Database** → *Rules*. **Não apague o que já está lá** —
acrescente este bloco dentro do `match /databases/{database}/documents { … }`
que já existe, e troque os e-mails pelos reais:

```
    // Conteúdo do site da ARTsivos: qualquer um lê, só o admin escreve.
    match /artsivos_site/{doc} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in ['admin@artsivos.com.br'];
    }
```

Leitura pública é de propósito: é o site aberto lendo os preços e as fotos.
Não guarde nada privado nessa coleção.

## 3. Regras do Storage

Console → **Storage** → *Rules*. Mesma coisa: acrescentar, não substituir.

```
    match /artsivos/{caminho=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in ['admin@artsivos.com.br'];
    }
```

Se o Storage ainda não tiver sido iniciado no projeto, o console pede para
escolher a região na primeira vez.

---

## Como o painel conversa com o site

- O painel grava **um documento só**: `artsivos_site/publico`.
- As fotos vão para `artsivos/fotos/` no Storage, já encolhidas (máx. 1600 px,
  WebP, alvo de 250 KB) — o corte acontece no navegador, antes de subir.
- A home carrega `dados.js`, que lê esse documento pela API REST do Firestore.
  **Sem SDK**: são poucos KB e nenhuma biblioteca.
- Se a leitura falhar, demorar ou vier vazia, a página fica exatamente como está
  escrita no HTML. O site nunca fica em branco por causa do painel.

## O que o painel já controla

| Fatia | Situação |
|---|---|
| 1 — Fotos dos trabalhos | **pronta** |
| 4 — Preços e quais produtos entram no orçamento | **pronta** |
| 2 — Logos de clientes | falta a faixa existir na home |
| 3 — Avaliações do Google | falta a seção existir na home |
| 5 — Clientes do portfólio | falta a página de portfólio existir |

As três de baixo são a mesma mecânica das duas de cima; o que falta é o lugar
no site público onde elas apareceriam.
