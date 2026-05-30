const API_SIMPSONS = "https://apisimpsons.fly.dev/api/personajes?limit=1000";
const API_RICK_MORTY = "https://rickandmortyapi.com/api/character";
const CHAVE_FAVORITOS = "cartoon-api-explorer-favoritos";
const TEXTO_INDISPONIVEL = "Informação não disponível";

let personagens = [];
let personagensFiltrados = [];
let favoritos = [];
let apiAtual = "simpsons";

document.addEventListener("DOMContentLoaded", () => {
  favoritos = carregarFavoritos();
  configurarEventos();
  buscarPersonagens();
});

async function buscarPersonagens() {
  exibirCarregamento(true);
  exibirErro("");
  alternarBotaoRecarregar(false);

  try {
    const dados = await consumirApi(API_SIMPSONS);
    apiAtual = "simpsons";
    personagens = obterListaDaResposta(dados).map((item) =>
      normalizarPersonagem(item, "simpsons")
    );
    ordenarPersonagensPorNome();
    preencherFiltrosDisponiveis();
    atualizarFonteApi("Fonte dos dados: Os Simpsons");
    filtrarPersonagens();
  } catch (erroPrincipal) {
    console.error("Falha ao consumir a API principal de Os Simpsons:", erroPrincipal);

    try {
      const dadosAlternativos = await consumirApi(API_RICK_MORTY);
      apiAtual = "rick";
      personagens = obterListaDaResposta(dadosAlternativos).map((item) =>
        normalizarPersonagem(item, "rick")
      );
      ordenarPersonagensPorNome();
      preencherFiltrosDisponiveis();
      atualizarFonteApi("Fonte dos dados: Rick and Morty");
      exibirErro(
        "A fonte principal de dados não respondeu. Carregamos uma fonte alternativa de personagens para você continuar explorando."
      );
      filtrarPersonagens();
    } catch (erroAlternativo) {
      personagens = [];
      personagensFiltrados = [];
      renderizarPersonagens([]);
      atualizarContador(0);
      exibirErro(
        "Não foi possível carregar os personagens no momento. Verifique sua conexão e tente novamente."
      );
      alternarBotaoRecarregar(true);
      console.error("Falha ao consumir a API alternativa:", erroAlternativo);
    }
  } finally {
    exibirCarregamento(false);
  }
}

async function consumirApi(url) {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status} ao acessar ${url}`);
  }

  return resposta.json();
}

function obterListaDaResposta(dados) {
  if (Array.isArray(dados.docs)) {
    return dados.docs;
  }

  if (Array.isArray(dados.results)) {
    return dados.results;
  }

  if (Array.isArray(dados)) {
    return dados;
  }

  return [];
}

function normalizarPersonagem(item, origemApi) {
  const nome = item.Nombre || item.nombre || item.name || "Nome não disponível";
  const imagem = item.Imagen || item.imagen || item.image || "";
  const genero = traduzirGenero(
    item.Genero || item.genero || item.gender || TEXTO_INDISPONIVEL
  );
  const estado = traduzirEstado(
    item.Estado || item.estado || item.status || TEXTO_INDISPONIVEL
  );
  const ocupacao =
    traduzirOcupacaoCurta(
      item.Ocupacion || item.ocupacion || item.occupation || item.species || TEXTO_INDISPONIVEL
    );
  const descricao =
    item.Historia ||
    item.historia ||
    item.description ||
    item.location?.name ||
    TEXTO_INDISPONIVEL;

  return {
    id: String(item._id || item.id || nome),
    nome: nome.trim(),
    imagem,
    genero,
    estado,
    ocupacao,
    descricao,
    origemApi,
  };
}

function ordenarPersonagensPorNome() {
  personagens.sort((personagemAtual, proximoPersonagem) =>
    prepararNomeParaOrdenacao(personagemAtual.nome).localeCompare(
      prepararNomeParaOrdenacao(proximoPersonagem.nome),
      "pt-BR",
      {
      sensitivity: "base",
      }
    )
  );
}

function prepararNomeParaOrdenacao(nome) {
  return nome.replace(/^[^a-zA-ZÀ-ÿ0-9]+/, "").trim();
}

function traduzirGenero(valor) {
  const traducoes = {
    femenino: "Feminino",
    female: "Feminino",
    masculino: "Masculino",
    male: "Masculino",
    unknown: "Desconhecido",
    desconocido: "Desconhecido",
  };

  return traduzirValorSimples(valor, traducoes);
}

function traduzirEstado(valor) {
  const traducoes = {
    vivo: "Vivo",
    alive: "Vivo",
    fallecido: "Falecido",
    dead: "Falecido",
    desconocido: "Desconhecido",
    unknown: "Desconhecido",
    ficticio: "Fictício",
  };

  return traduzirValorSimples(valor, traducoes);
}

function traduzirOcupacaoCurta(valor) {
  const traducoes = {
    desconocido: "Desconhecido",
    jubilado: "Aposentado",
    desempleado: "Desempregado",
    alumno: "Aluno",
    estudiante: "Estudante",
    maestro: "Professor",
    maestra: "Professora",
    "ama de casa": "Dona de casa",
    rabino: "Rabino",
    juez: "Juiz",
    granjero: "Fazendeiro",
    mascota: "Mascote",
    superhéroe: "Super-herói",
    superheroe: "Super-herói",
    supervillano: "Supervilão",
    human: "Humano",
    alien: "Alienígena",
  };

  return traduzirValorSimples(valor, traducoes);
}

function traduzirValorSimples(valor, traducoes) {
  if (!valor || valor === TEXTO_INDISPONIVEL) {
    return TEXTO_INDISPONIVEL;
  }

  const valorTexto = String(valor).trim();
  const chave = valorTexto.toLowerCase();

  return traducoes[chave] || valorTexto;
}

function configurarEventos() {
  const campoBusca = document.querySelector("#campoBusca");
  const filtroExibicao = document.getElementById("filtroExibicao");
  const filtroGenero = document.getElementById("filtroGenero");
  const filtroStatus = document.getElementById("filtroStatus");
  const botaoLimpar = document.getElementById("botaoLimpar");
  const botaoRecarregar = document.getElementById("botaoRecarregar");
  const botaoTopo = document.getElementById("botaoTopo");

  campoBusca.addEventListener("input", filtrarPersonagens);
  filtroExibicao.addEventListener("change", filtrarPersonagens);
  filtroGenero.addEventListener("change", filtrarPersonagens);
  filtroStatus.addEventListener("change", filtrarPersonagens);

  botaoLimpar.addEventListener("click", () => {
    campoBusca.value = "";
    filtroExibicao.value = "todos";
    filtroGenero.value = "todos";
    filtroStatus.value = "todos";
    filtrarPersonagens();
    campoBusca.focus();
  });

  botaoRecarregar.addEventListener("click", buscarPersonagens);

  botaoTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", controlarBotaoTopo);
}

function filtrarPersonagens() {
  const termoBusca = document.querySelector("#campoBusca").value.trim().toLowerCase();
  const filtroExibicao = document.getElementById("filtroExibicao").value;
  const filtroGenero = document.getElementById("filtroGenero").value;
  const filtroStatus = document.getElementById("filtroStatus").value;

  personagensFiltrados = personagens.filter((personagem) => {
    const correspondeBusca = personagem.nome.toLowerCase().includes(termoBusca);
    const correspondeFavorito =
      filtroExibicao === "todos" || favoritos.includes(personagem.id);
    const correspondeGenero =
      filtroGenero === "todos" || personagem.genero === filtroGenero;
    const correspondeStatus =
      filtroStatus === "todos" || personagem.estado === filtroStatus;

    return correspondeBusca && correspondeFavorito && correspondeGenero && correspondeStatus;
  });

  renderizarPersonagens(personagensFiltrados);
  atualizarContador(personagensFiltrados.length);
}

function preencherFiltrosDisponiveis() {
  const generos = obterValoresUnicos(personagens.map((personagem) => personagem.genero));
  const status = obterValoresUnicos(personagens.map((personagem) => personagem.estado));

  preencherSelectComOpcoes("filtroGenero", generos, "Todos os gêneros");
  preencherSelectComOpcoes("filtroStatus", status, "Todos os status");
}

function obterValoresUnicos(valores) {
  return valores
    .filter((valor) => valor && valor !== TEXTO_INDISPONIVEL)
    .filter((valor, indice, array) => array.indexOf(valor) === indice)
    .sort((valorAtual, proximoValor) =>
      valorAtual.localeCompare(proximoValor, "pt-BR", { sensitivity: "base" })
    );
}

function preencherSelectComOpcoes(idSelect, opcoes, textoPadrao) {
  const select = document.getElementById(idSelect);
  const valorAtual = select.value;

  select.textContent = "";

  const opcaoPadrao = document.createElement("option");
  opcaoPadrao.value = "todos";
  opcaoPadrao.textContent = textoPadrao;
  select.appendChild(opcaoPadrao);

  opcoes.forEach((opcao) => {
    const elementoOpcao = document.createElement("option");
    elementoOpcao.value = opcao;
    elementoOpcao.textContent = opcao;
    select.appendChild(elementoOpcao);
  });

  const valoresDisponiveis = ["todos", ...opcoes];
  select.value = valoresDisponiveis.includes(valorAtual) ? valorAtual : "todos";
}

function renderizarPersonagens(lista) {
  const listaPersonagens = document.getElementById("listaPersonagens");
  const mensagemVazio = document.getElementById("mensagemVazio");

  listaPersonagens.textContent = "";

  if (lista.length === 0) {
    mensagemVazio.classList.remove("oculto");
    return;
  }

  mensagemVazio.classList.add("oculto");

  lista.forEach((personagem) => {
    const card = criarCardPersonagem(personagem);
    listaPersonagens.appendChild(card);
  });
}

function criarCardPersonagem(personagem) {
  const card = document.createElement("article");
  card.classList.add("card-personagem");

  const areaImagem = document.createElement("div");
  areaImagem.classList.add("imagem-card");

  const placeholder = document.createElement("span");
  placeholder.classList.add("placeholder-imagem");
  placeholder.textContent = obterIniciais(personagem.nome);
  placeholder.setAttribute("aria-label", "Imagem não disponível");

  if (personagem.imagem) {
    const imagem = document.createElement("img");
    imagem.src = personagem.imagem;
    imagem.alt = `Imagem de ${personagem.nome}`;
    placeholder.classList.add("oculto");

    imagem.addEventListener("error", () => {
      imagem.classList.add("imagem-oculta");
      placeholder.classList.remove("oculto");
    });

    areaImagem.appendChild(imagem);
  }

  areaImagem.appendChild(placeholder);

  const conteudo = document.createElement("div");
  conteudo.classList.add("conteudo-card");

  const titulo = document.createElement("h3");
  titulo.textContent = personagem.nome;

  const genero = criarLinhaInformacao("Gênero", personagem.genero);
  const estado = criarLinhaInformacao("Status", personagem.estado);
  const ocupacao = criarLinhaInformacao(
    apiAtual === "rick" ? "Espécie" : "Ocupação",
    personagem.ocupacao
  );

  const descricao = document.createElement("p");
  descricao.classList.add("descricao-card");
  descricao.textContent = `Descrição original: ${limitarTexto(personagem.descricao, 180)}`;

  const acoes = document.createElement("div");
  acoes.classList.add("acoes-card");

  const botaoFavorito = document.createElement("button");
  botaoFavorito.type = "button";
  botaoFavorito.classList.add("botao-favorito");
  botaoFavorito.textContent = favoritos.includes(personagem.id) ? "♥" : "♡";
  botaoFavorito.setAttribute(
    "aria-label",
    favoritos.includes(personagem.id)
      ? `Remover ${personagem.nome} dos favoritos`
      : `Adicionar ${personagem.nome} aos favoritos`
  );

  if (favoritos.includes(personagem.id)) {
    botaoFavorito.classList.add("ativo");
  }

  botaoFavorito.addEventListener("click", () => {
    alternarFavorito(personagem.id);
  });

  acoes.appendChild(botaoFavorito);
  conteudo.append(titulo, genero, estado, ocupacao, descricao, acoes);
  card.append(areaImagem, conteudo);

  return card;
}

function criarLinhaInformacao(rotulo, valor) {
  const linha = document.createElement("p");
  linha.classList.add("linha-card");

  const destaque = document.createElement("strong");
  destaque.textContent = `${rotulo}: `;

  const texto = document.createTextNode(valor || TEXTO_INDISPONIVEL);

  linha.appendChild(destaque);
  linha.appendChild(texto);

  return linha;
}

function atualizarContador(total) {
  const contador = document.getElementById("contadorResultados");
  const totalGeral = personagens.length;

  if (totalGeral === 0) {
    contador.textContent = "Nenhum personagem carregado.";
    return;
  }

  contador.textContent = `${total} de ${totalGeral} personagem(ns) exibido(s).`;
}

function exibirCarregamento(estaCarregando) {
  const mensagemCarregamento = document.getElementById("mensagemCarregamento");
  mensagemCarregamento.classList.toggle("oculto", !estaCarregando);
}

function exibirErro(mensagem) {
  const mensagemErro = document.getElementById("mensagemErro");
  const mensagemVazio = document.getElementById("mensagemVazio");

  if (!mensagem) {
    mensagemErro.textContent = "";
    mensagemErro.classList.add("oculto");
    return;
  }

  mensagemErro.textContent = mensagem;
  mensagemErro.classList.remove("oculto");
  mensagemVazio.classList.add("oculto");
}

function carregarFavoritos() {
  try {
    const favoritosSalvos = localStorage.getItem(CHAVE_FAVORITOS);
    return favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
  } catch (erro) {
    console.error("Não foi possível carregar os favoritos:", erro);
    return [];
  }
}

function salvarFavoritos() {
  try {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
  } catch (erro) {
    console.error("Não foi possível salvar os favoritos:", erro);
  }
}

function alternarFavorito(idPersonagem) {
  if (favoritos.includes(idPersonagem)) {
    favoritos = favoritos.filter((id) => id !== idPersonagem);
  } else {
    favoritos.push(idPersonagem);
  }

  salvarFavoritos();
  filtrarPersonagens();
}

function alternarBotaoRecarregar(deveExibir) {
  const botaoRecarregar = document.getElementById("botaoRecarregar");
  botaoRecarregar.classList.toggle("oculto", !deveExibir);
}

function atualizarFonteApi(texto) {
  const fonteApi = document.getElementById("fonteApi");
  fonteApi.textContent = texto;
}

function controlarBotaoTopo() {
  const botaoTopo = document.getElementById("botaoTopo");
  botaoTopo.classList.toggle("visivel", window.scrollY > 450);
}

function limitarTexto(texto, limite) {
  if (!texto || texto === TEXTO_INDISPONIVEL) {
    return TEXTO_INDISPONIVEL;
  }

  return texto.length > limite ? `${texto.slice(0, limite).trim()}...` : texto;
}

function obterIniciais(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
