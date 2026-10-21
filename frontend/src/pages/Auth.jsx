import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarUsuario, logarUsuario } from "../utils/api";

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  function validate() {
    const newErrors = {};

    if (tab === "cadastro" && name.trim().length < 2) {
      newErrors.name = "Digite seu nome completo.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Digite um e-mail válido, ex.: voce@email.com.";
    }

    if (tab === "cadastro" && password.length < 8) {
      newErrors.password = "A senha precisa ter pelo menos 8 caracteres.";
    }

    if (tab === "entrar" && !password) {
      newErrors.password = "Digite sua senha.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const result =
        tab === "entrar"
          ? await logarUsuario({ email, senha: password })
          : await cadastrarUsuario({ nome: name.trim(), email, senha: password });

      const usuario = result.usuario;
      onLogin({ id: usuario.id, name: usuario.nome, email: usuario.email, role: "jogador" });
      navigate("/catalogo");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(newTab) {
    setTab(newTab);
    setErrors({});
    setServerError("");
  }

  return (
    <main className="auth-page">
      <div className="auth-side">
        <div className="auth-orb">INDIE<br /><span>HUB</span></div>
        <h2>Bem-vindo de volta.<br /><span>Ou comece agora.</span></h2>
        <p>
          Entre para acompanhar seus jogos favoritos, ou crie uma conta
          para começar a explorar o catálogo indie.
        </p>
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark">◆</span>
            <span>Indie<span>Hub</span></span>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${tab === "entrar" ? "active" : ""}`}
              onClick={() => switchTab("entrar")}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`auth-tab-btn ${tab === "cadastro" ? "active" : ""}`}
              onClick={() => switchTab("cadastro")}
              type="button"
            >
              Cadastrar
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {tab === "cadastro" && (
              <label>Nome
                <input
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </label>
            )}

            <label>E-mail
              <input
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label>Senha
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            {serverError && <div className="server-error">{serverError}</div>}

            <button className="primary-button auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : tab === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}