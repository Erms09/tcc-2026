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
    throw new Error(data.mensagem || "Ocorreu um erro. Tente novamente.");
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