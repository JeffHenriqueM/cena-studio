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

Depois, em *Users* → **Add user**, criar **a conta padrão** — é a que as regras
abaixo já esperam, então não precisa mudar nada no resto do arquivo:

| Campo | Valor |
|---|---|
| E-mail | `admin@artsivos.com.br` |
| Senha | qualquer uma, provisória |

Esse e-mail não precisa existir de verdade nem receber nada: para o Firebase é
só um nome de usuário. Serve para testar o painel agora.

### Quando as contas reais entrarem

Crie uma conta por pessoa (é assim que se tira o acesso de uma sem mexer no das
outras), acrescente os e-mails na lista das duas regras abaixo e **apague a
conta padrão** em *Authentication → Users*. Enquanto ela existir, quem souber a
senha provisória escreve no site.

> ⚠️ Não troque a lista de e-mails por um simples `request.auth != null`. O
> Firebase Auth é **um só por projeto**: qualquer conta do FinPay ou do FIAS
> passaria a poder reescrever o site da ARTsivos. A lista de e-mails é o que
> separa as três aplicações.

## 2. Regras do Firestore

Console → **Firestore Database** → *Rules*. **Não apague o que já está lá** —
acrescente este bloco dentro do `match /databases/{database}/documents { … }`
que já existe (a lista de e-mails já vem com a conta padrão):

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
