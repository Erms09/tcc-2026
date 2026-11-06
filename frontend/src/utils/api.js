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
// Contrato esperado do back-end (ainda não implementado):
//   POST /desenvolvedor
//   Corpo:    { id_usuario, nome_estudio, bio }
//   Sucesso:  200/201 com { desenvolvedor: { nome_estudio, bio } }
//   Erro:     status 4xx/5xx com { mensagem: "texto do erro" }
//
// Para ligar ao back-end, crie a rota e defina VITE_DEVELOPER_API=true
// no .env do frontend. Enquanto isso, os dados ficam só no navegador.
// ---------------------------------------------------------------------------
export const DEVELOPER_API_ENABLED = import.meta.env.VITE_DEVELOPER_API === "true";

export function cadastrarDesenvolvedor({ idUsuario, nomeEstudio, bio }) {
  return request("/desenvolvedor", {
    method: "POST",
    body: JSON.stringify({
      id_usuario: idUsuario,
      nome_estudio: nomeEstudio,
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
// Para ligar, defina VITE_GAMES_API=true no .env do frontend e preencha
// GENRE_IDS em data.js com os ids da tabela de gêneros.
// ---------------------------------------------------------------------------
export const GAMES_API_ENABLED = import.meta.env.VITE_GAMES_API === "true";

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
