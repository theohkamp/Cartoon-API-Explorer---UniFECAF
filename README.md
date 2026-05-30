# Cartoon API Explorer

Projeto acadêmico da disciplina **Web Programming Front-End**, desenvolvido para o quarto semestre do curso de **Análise e Desenvolvimento de Sistemas**.

## Descrição

O **Cartoon API Explorer** é um site estático que consome dados reais de uma API pública de personagens e cria cards dinamicamente com JavaScript puro. A API principal utilizada é a API de personagens de **Os Simpsons**, por estar relacionada a desenhos animados populares dos anos 90 e 2000.

Caso a API principal esteja indisponível durante a execução, o código tenta carregar a API pública de Rick and Morty como alternativa, mantendo a demonstração do consumo de API funcionando.

## Objetivo acadêmico

Demonstrar, de forma prática e organizada, os fundamentos de desenvolvimento front-end estudados na disciplina:

- estrutura semântica com HTML5;
- estilização responsiva com CSS3;
- manipulação do DOM com JavaScript;
- criação dinâmica de elementos HTML;
- consumo assíncrono de API com `fetch()`;
- tratamento de erros e estados de interface.

## Funcionalidades

- carregamento de personagens por API pública;
- cards criados dinamicamente com JavaScript;
- exibição de nome, imagem, status, gênero, ocupação ou informação equivalente;
- interface em português, com normalização dos campos curtos retornados pela API;
- pesquisa por nome em tempo real;
- botão para limpar a pesquisa;
- filtro para visualizar todos os personagens ou somente favoritos;
- filtros por gênero e status, preenchidos conforme os dados carregados;
- favoritos salvos no `localStorage`;
- contador de resultados;
- mensagens de carregamento, erro e lista vazia;
- botão para tentar carregar novamente após falha;
- botão de voltar ao topo;
- layout responsivo para celulares, tablets e computadores.

## Tecnologias utilizadas

- HTML5;
- CSS3 puro;
- JavaScript puro;
- `fetch()`;
- DOM manipulation;
- `localStorage`.

Nenhum framework, biblioteca externa, backend, banco de dados ou etapa de build é necessário.

## API utilizada

API principal:

```text
https://apisimpsons.fly.dev/api/personajes?limit=1000
```

Estrutura verificada da resposta:

- a lista de personagens vem na propriedade `docs`;
- os campos principais são `_id`, `Nombre`, `Historia`, `Imagen`, `Genero`, `Estado` e `Ocupacion`;
- a resposta também inclui dados de paginação, como `totalDocs`, `limit`, `totalPages`, `page` e `hasNextPage`.

API alternativa, usada apenas se a principal falhar:

```text
https://rickandmortyapi.com/api/character
```

## Como executar localmente

Opção 1: abrir diretamente no navegador.

1. Acesse a pasta `cartoon-api-explorer`.
2. Abra o arquivo `index.html` com um navegador moderno.

Opção 2: usar Live Server no VS Code.

1. Abra a pasta `cartoon-api-explorer` no VS Code.
2. Clique com o botão direito em `index.html`.
3. Selecione `Open with Live Server`.

## Estrutura de pastas

```text
cartoon-api-explorer/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── docs/
    ├── parte-teorica.md
    └── checklist-entrega.md
```

## Consumo da API

O consumo dos dados é feito no arquivo `js/script.js`, por meio da função `fetch()`. Como `fetch()` retorna uma Promise, o projeto utiliza `async/await` para deixar o fluxo mais legível.

O código verifica se a resposta HTTP foi bem-sucedida com `response.ok`. Em seguida, transforma a resposta em JSON usando `response.json()`. Se ocorrer algum erro de rede, erro HTTP ou formato inesperado de dados, a interface exibe uma mensagem amigável e registra os detalhes técnicos com `console.error()`.

## Criação dinâmica dos cards

Os cards não estão escritos diretamente no HTML. O arquivo `index.html` contém apenas o contêiner:

```html
<div class="grade-personagens" id="listaPersonagens" aria-live="polite"></div>
```

Depois que os dados são carregados, o JavaScript usa `document.createElement()`, `textContent`, `appendChild()` e `append()` para criar os elementos de cada card e inseri-los no DOM.

## Normalização e idioma dos dados

A interface do projeto foi escrita em português. Como a API principal retorna vários campos em espanhol, o JavaScript normaliza os valores curtos mais importantes antes de exibi-los, como gênero, status e algumas ocupações recorrentes.

As descrições longas dos personagens vêm diretamente da API pública e podem permanecer em espanhol. Essa decisão mantém o projeto dentro do escopo da disciplina, sem adicionar uma segunda API de tradução, chaves externas ou dependências desnecessárias.