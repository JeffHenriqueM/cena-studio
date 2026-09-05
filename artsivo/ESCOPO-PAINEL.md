# Painel do admin — escopo

Rascunho para decidir antes de escrever código. Nada aqui está fechado.

O painel existe para a empresa trocar o conteúdo do site sem mexer no código:
fotos dos trabalhos, logos de clientes, preços, avaliações. É o primeiro pedaço
do site que precisa de backend de verdade (item 2 do BACKLOG).

---

## 1. O que o painel controla

Em ordem de valor. Dá para entregar em fatias — a fatia 1 já justifica o painel.

**Fatia 1 — Fotos dos trabalhos.** Os 8 blocos da seção "Trabalhos" já existem no
`index.html`, um por produto. Hoje o arquivo tem que ser colocado à mão em
`fotos/` com o nome exato. No painel: escolher o produto, subir a foto, pronto.
Trocar e remover pelo mesmo lugar.

**Fatia 2 — Logos de clientes.** Faixa no topo da home. Subir, reordenar, remover.

**Fatia 3 — Avaliações do Google.** Nome, texto e nota, copiados do perfil real.
A manchete ("5,0 · 42 avaliações") continua fixa até mudar de verdade.

**Fatia 4 — Produtos e preços.** Duas coisas no mesmo lugar:

- *Quais produtos entram no orçamento automático.* Uma chave por produto. Ligado,
  ele aparece no seletor e a calculadora dá a estimativa; desligado, ele continua
  existindo no site como produto que a empresa faz, mas cai em "Projetos
  Especiais" — pedido pelo WhatsApp, preço feito à mão. Serve para produto novo
  que ainda não tem preço fechado e para produto que varia demais para estimar
  (papel de parede, display de festa, balão inflável).
- *Os números.* O `TABELA` do `index.html` (m², peça, mínimo, % de instalação)
  mais arte, pressa, entrega e margem. É o que mais muda com o tempo e hoje
  exige mexer em JavaScript.

Regra: produto sem preço cadastrado não pode ser ligado. O painel bloqueia, em
vez de deixar o site dar estimativa em cima de zero.

**Fatia 5 — Clientes do portfólio.** A página de portfólio (item 6 do BACKLOG)
sai daqui: nome do cliente, segmento, foto e ordem. Todos entram com nome —
decisão do Jeff. O `PORTFOLIO.md` é só a carga inicial dessa lista; depois quem
manda é o painel. É a mesma mecânica da fatia 2 (logos) com um campo a mais, então
sai barato se vier junto.

**Fora do painel por enquanto:** textos das páginas, blog, dados da empresa
(endereço, CNPJ, horário). Mudam uma vez por ano — não pagam o custo de virar
formulário.

## 2. Fotos — onde entram

Regra que o site já segue e deve continuar seguindo: **enquanto não existe foto
real, aparece um espaço marcado, nunca imagem quebrada e nunca banco de imagem.**
Foto de banco em site de comunicação visual denuncia que não há trabalho para
mostrar.

| Onde | Quantas | Situação |
|---|---|---|
| Trabalhos (home) | 1 por produto — 8 no total | estrutura pronta, faltam os arquivos |
| Orçamento | miniatura do produto escolhido, ao lado da calculadora | a fazer — reaproveita a mesma foto do Trabalhos |
| Topo da home | 1 foto forte, a melhor fachada | a fazer |
| Logos de clientes | 1 por cliente | a fazer |
| Portfólio | 1 por cliente cadastrado | a fazer |
| Sobre | 1 da oficina ou da equipe | a fazer |
| Blog | 1 capa por post | a fazer |

Uma foto por produto cobre Trabalhos e Orçamento ao mesmo tempo — o mesmo arquivo
serve nos dois lugares. Com 8 fotos boas o site sai do estado atual.

**Preparo automático.** O painel redimensiona no navegador antes de subir:
horizontal, no máximo 1600 px, WebP com JPG de reserva, alvo de 250 KB. Ninguém
precisa saber o que é "otimizar imagem". O `LEIA-ME.txt` de `fotos/` deixa de
existir como manual e vira só o histórico.

**Autorização.** Fachada, veículo e vitrine mostram o negócio de um cliente
identificável. Vale o mesmo combinado das logos: confirmar antes de publicar.

## 3. Como isso funciona por baixo

O site é estático no GitHub Pages e carrega rápido porque não depende de nada.
Isso não pode piorar por causa do painel.

Desenho proposto:

- **Páginas públicas** continuam estáticas. Buscam um único `dados.json` com
  fotos, preços, logos e avaliações. Se a busca falhar, mostram o conteúdo que já
  está escrito no HTML — o site nunca fica em branco por causa do painel.
- **Painel** em `artsivo/painel/`, fora do índice de busca, com login. Escreve o
  `dados.json` e sobe as imagens.

Para o armazenamento e o login, duas opções reais:

**A) Firebase próprio da ARTsivos** (projeto novo, separado do
`crm-pessoal-d993d`, que já é compartilhado com outra aplicação e não deve
receber mais nada). Login por e-mail e senha, upload de imagem e permissão por
usuário prontos. Em compensação: mais um projeto para manter, e conferir antes se
o Storage do plano gratuito ainda atende sem cartão cadastrado.

**B) O próprio repositório como banco.** O painel grava `dados.json` e as fotos
direto no GitHub por API, com um token do dono. Custo zero, nada novo para
manter, e cada alteração fica versionada — dá para desfazer qualquer besteira.
Em compensação: um usuário só, token guardado no navegador dele, e a mudança leva
cerca de um minuto para aparecer no site.

**Recomendação: B.** Com os níveis de indicação descartados, o painel não precisa
mais de conta para cliente nem de permissão por papel — some a única coisa que
exigia Firebase. Todas as cinco fatias são conteúdo do site, e conteúdo do site
cabe num arquivo versionado. O que derruba B é ter mais de uma pessoa mexendo:
token é por pessoa e não dá para tirar acesso de um sem trocar o de todos.

## 4. Decisões pendentes

- **Quem faz login: só o dono, ou também alguém do balcão?** É o que decide entre
  A e B. Só o dono → B. Mais de uma pessoa → A.
