import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header({ user, onLogout, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/catalogo" className="brand">
        <span className="brand-mark">◆</span>
        <span>Indie<span>Hub</span></span>
      </Link>

      <nav className="nav">
        <NavLink to="/catalogo" end>Catálogo</NavLink>
        <NavLink to="/ranking">Ranking</NavLink>
        <NavLink to="/favoritos">Favoritos</NavLink>
        <NavLink to="/comunidade">Comunidade</NavLink>
        <NavLink to="/sobre">Sobre</NavLink>
        {user?.role === "desenvolvedor" && (
          <NavLink to="/desenvolvedor">Sou desenvolvedor</NavLink>
        )}
      </nav>

      <div className="header-right">
        <button className="icon-btn" onClick={onToggleTheme} type="button" title="Alternar tema" aria-label="Alternar tema claro/escuro">
          {theme === "dark" ? "☀" : "🌙"}
        </button>

        {user?.role === "desenvolvedor" && (
          <>
            <Link to="/desenvolvedor" className="header-button">Cadastrar jogo</Link>
            <Link to="/desenvolvedor" className="header-button-mobile" aria-label="Cadastrar jogo">+</Link>
          </>
        )}

        {user && (
          <div className="profile-menu">
            <button
              className="profile-avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              {user.name[0].toUpperCase()}
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span className="profile-role-badge">
                    {user.role === "desenvolvedor" ? "Desenvolvedor" : "Jogador"}
                  </span>
                </div>
                <div className="profile-dropdown-links">
                  {user.role === "jogador" ? (
                    <Link to="/perfil" onClick={() => setMenuOpen(false)}>Meu perfil</Link>
                  ) : (
                    <>
                      <Link to="/meus-jogos" onClick={() => setMenuOpen(false)}>Meus jogos</Link>
                      <Link to="/planos" onClick={() => setMenuOpen(false)}>Planos</Link>
                    </>
                  )}
                </div>
                <button className="profile-logout" onClick={onLogout} type="button">
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
