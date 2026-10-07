import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("jogador");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const newErrors = {};

    if (tab === "cadastro" && name.trim().length < 2) {
      newErrors.name = "Digite seu nome completo.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Digite um e-mail válido, ex.: voce@email.com.";
    }

    if (password.length < 6) {
      newErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      onLogin({ name: tab === "entrar" ? email.split("@")[0] : name, email, role });
      setLoading(false);
      navigate("/catalogo");
    }, 900);
  }

  function switchTab(newTab) {
    setTab(newTab);
    setErrors({});
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

            <div className="role-select">
              <span className="role-select-label">Entrar como:</span>
              <div className="role-options">
                <button
                  type="button"
                  className={`role-btn ${role === "jogador" ? "active" : ""}`}
                  onClick={() => setRole("jogador")}
                >
                  Jogador
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "desenvolvedor" ? "active" : ""}`}
                  onClick={() => setRole("desenvolvedor")}
                >
                  Desenvolvedor
                </button>
              </div>
            </div>

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
