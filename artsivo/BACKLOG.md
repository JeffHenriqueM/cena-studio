# ARTsivos — backlog

Coisas combinadas com o Jeff para fazer quando o material chegar.
Ele vai passar o conteúdo real depois; nada aqui pode ser inventado.

---

## 1. Avaliações do Google

Seção de depoimentos em carrossel, cartões brancos sobre fundo escuro:
avatar com a inicial, nome, "Cliente · Google", as cinco estrelas e o texto.
Referência: a seção equivalente do site da Agilize.

**Dado real já confirmado:** a ARTsivos tem **5,0 com 42 avaliações no Google**.
Esse número vale como manchete da seção ("5,0 · 42 avaliações no Google").

Falta: o texto e o nome de cada avaliação que a empresa quiser destacar
(copiar do perfil do Google, sem inventar nenhuma).

## 2. Logos de clientes

Faixa de logos no topo da home — a prova social mais forte da página da Agilize.
Falta: os arquivos das logos e a autorização de cada cliente para aparecer.

**Junto com isso: painel do admin.** A empresa precisa poder trocar, adicionar e
remover cliente sem mexer no código. Isso é o primeiro pedaço do site que exige
backend de verdade (login + armazenamento + upload de imagem) — combinar o
escopo antes de começar. Provavelmente cresce para gerenciar também as fotos de
trabalhos e as avaliações.

## 3. Endereço, horário e CNPJ

No rodapé e na página da empresa. É o que mostra que existe loja e gente de verdade.
Falta: endereço completo, horário de atendimento (dias e faixas) e o CNPJ.

## 4. Fluxo de trabalho declarado

"Visita, vistoria, projeto e orçamento sem compromisso" dito com todas as letras,
como fluxo **ideal** — deixando claro no texto que não precisa ser assim: quem já
sabe o que quer pula direto para o orçamento.
Falta: confirmar com a empresa quais etapas eles realmente fazem e em que ordem,
e se a visita é gratuita em toda a região que atendem.

## 5. Níveis de indicação (página à parte)

Aproveitar o modelo do projeto Clube de Sócios (`~/Documents/Projetos/clube-socios`):
papéis (admin / membro / cliente) e níveis que controlam desconto, com indicação
que passa por aprovação do admin.

O que se aproveita é o **modelo**, não o código: aquele projeto é React + Vite e
guarda tudo em `localStorage`; este site é HTML estático sem build no GitHub Pages.
As telas teriam que ser reescritas no padrão do site. Vale copiar a ideia de
`src/types.ts` (nível com desconto padrão e override por serviço) e o formato de
`src/data/store.ts`, escrito para virar Firestore trocando um arquivo só.

Decidido: entra como **página separada**, sem mexer na indicação atual da home —
que é sem login de propósito (código determinístico, a empresa conta o crédito
fora do site) e funciona sem nada nas costas.

Depende do mesmo backend do item 2 (login + armazenamento + permissão por papel).
`localStorage` não serve aqui: cada navegador teria os próprios dados, o admin
editando no celular não mudaria o que o visitante vê, e o nível do cliente ficaria
editável pelo console.

Falta: a empresa definir a escada de benefício (quantas indicações para cada
nível e o que cada um ganha) — hoje nem o R$ 50 por indicação está confirmado.

## 6. Pessoa física e pessoa jurídica na mesma home

Decidido: o site fala com os dois. **Home única**, com uma escolha logo no topo
("você é pessoa física ou empresa?"), e a página se molda ao que a pessoa clicar —
ordem das seções, produtos em destaque, exemplos e tom do texto. A escolha fica
guardada no navegador, então quem já respondeu não responde de novo.

Importante: a escolha é uma **faixa dentro da página**, não uma porta antes dela.
Página que obriga a clicar para ver qualquer coisa perde visita e atrapalha a
busca do Google. Quem ignora a pergunta continua vendo o site inteiro, montado
para empresa, que é a maioria.

Cada lado ganha a sua página depois: fachada, totem e frota de um lado; papel de
parede, adesivo de parede e display de festa do outro.

Falta: confirmar com a empresa quanto o residencial pesa no faturamento — é o que
diz se essa página merece o mesmo capricho da de empresa ou se é secundária.

## 7. Página de portfólio

Sai do `PORTFOLIO.md`: os segmentos atendidos (imobiliário, alimentação, saúde e
beleza, comércio, residencial e eventos), cada um com os trabalhos que a empresa
já fez. É a prova de que existe rodagem, e funciona mesmo antes das fotos boas
chegarem.

Falta: autorização de cada cliente citado pelo nome. Sem autorização, o segmento
fica, o nome sai.

---

## Já pendente de antes

- Fotos dos trabalhos (`fotos/`, nomes em `fotos/LEIA-ME.txt`)
- Tabela de preços real (`TABELA` no `index.html`)
- Formas de pagamento reais
- Regras do programa de indicação (R$ 50, prazo, acúmulo)
- Promessa de resposta em 2 horas
- `LEAD_ENDPOINT` no `radar.js` (Formspree ou equivalente)
- Logo em arquivo (`artsivo/logo.png`)
