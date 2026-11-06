import { GENRE_IDS } from "../data";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Cada rota do back-end devolve o texto do erro em uma chave (mensagem, erro ou error).
    throw new Error(data.mensagem || data.erro || data.error || "Ocorreu um erro. Tente novamente.");
  }

  return data;
}

export function cadastrarUsuario({ nome, email, senha }) {
  return request("/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha })
  });
}

export function logarUsuario({ email, senha }) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });
}

// ---------------------------------------------------------------------------
// Tornar-se desenvolvedor
//
// Rota do back-end: POST /devs
//   Corpo:    { id, estudio, bio }   (id = id do usuário)
//   Sucesso:  201 com { mensagem, desenvolvedor: { id, estudio, bio } }
//   Erro:     status 4xx/5xx com { erro: "texto do erro" }
//
// Vem ligado por padrão. Para trabalhar sem back-end, coloque
// VITE_DEVELOPER_API=false no .env do frontend.
// ---------------------------------------------------------------------------
export const DEVELOPER_API_ENABLED = import.meta.env.VITE_DEVELOPER_API !== "false";

export function cadastrarDesenvolvedor({ idUsuario, nomeEstudio, bio }) {
  return request("/devs", {
    method: "POST",
    body: JSON.stringify({
      id: idUsuario,
      estudio: nomeEstudio,
      bio
    })
  });
}

// ---------------------------------------------------------------------------
// Cadastro de jogo
//
// Rota do back-end: POST /jogos
//   Corpo: { nome, descricao, versao, preco, url_capa, link_download,
//            id_desenvolvedor, id_genero }
//   Sucesso (201): { message, jogo: { id, ... } }
//
// Vem ligado por padrão. Para trabalhar sem back-end, coloque
// VITE_GAMES_API=false no .env do frontend.
// O id do gênero vem de GENRE_IDS em data.js (ids da tabela de gêneros).
// ---------------------------------------------------------------------------
export const GAMES_API_ENABLED = import.meta.env.VITE_GAMES_API !== "false";

export function cadastrarJogo({
  title, description, version, price, coverUrl, downloadUrl, genre, idDesenvolvedor
}) {
  const idGenero = GENRE_IDS[genre];

  if (!idGenero) {
    return Promise.reject(
      new Error("O gênero ainda não foi ligado ao banco. Preencha GENRE_IDS em data.js.")
    );
  }

  return request("/jogos", {
    method: "POST",
    body: JSON.stringify({
      nome: title,
      descricao: description,
      versao: version,
      preco: price,
      url_capa: coverUrl,
      link_download: downloadUrl || null,
      id_desenvolvedor: idDesenvolvedor,
      id_genero: idGenero
    })
  });
}
