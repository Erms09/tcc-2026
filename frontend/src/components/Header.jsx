import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./ui.css";

const MORE_LINKS = [
  { to: "/historico", label: "Histórico" },
  { to: "/notificacoes", label: "Notificações", badge: true },
  { to: "/sobre", label: "Sobre" },
];

export default function Header({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onBecomeDeveloper,
  unreadCount = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const location = useLocation();

  const moreIsActive = MORE_LINKS.some((item) =>
    location.pathname.startsWith(item.to)
  );

  // Fecha os menus ao clicar fora ou apertar Esc.
  useEffect(() => {
    function handleClick(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Fecha os menus ao trocar de página.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <header className="header">
      <Link to="/catalogo" className="brand">
        <span className="brand-mark">◆</span>
        <span>
          Indie<span>Hub</span>
        </span>
      </Link>

      <nav className="nav" aria-label="Navegação principal">
        <NavLink to="/catalogo" end>
          Catálogo
        </NavLink>
        <NavLink to="/novidades">Novidades</NavLink>
        <NavLink to="/ranking">Ranking</NavLink>
        <NavLink to="/favoritos">Favoritos</NavLink>
        <NavLink to="/comunidade">Comunidade</NavLink>

        {user?.role === "desenvolvedor" && (
          <NavLink to="/dashboard">Dashboard</NavLink>
        )}

        <div className="nav-more" ref={moreRef}>
          <button
            type="button"
            className={`nav-more-btn ${moreIsActive ? "active" : ""}`}
            onClick={() => setMoreOpen((previous) => !previous)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            Mais ▾
            {unreadCount > 0 && (
              <span className="nav-badge" aria-label={`${unreadCount} notificações novas`}>
                {unreadCount}
              </span>
            )}
          </button>

          {moreOpen && (
            <div className="nav-more-menu">
              {MORE_LINKS.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="header-right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          type="button"
          title="Alternar tema"
          aria-label="Alternar tema claro/escuro"
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>

        {user?.role === "desenvolvedor" && (
          <>
            <Link to="/desenvolvedor" className="header-button">
              Cadastrar jogo
            </Link>

            <Link
              to="/desenvolvedor"
              className="header-button-mobile"
              aria-label="Cadastrar jogo"
            >
              +
            </Link>
          </>
        )}

        {user && (
          <div className="profile-menu" ref={profileRef}>
            <button
              className="profile-avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              aria-label="Abrir menu do perfil"
              aria-expanded={menuOpen}
            >
              {user.name[0].toUpperCase()}
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>

                  {user.role === "desenvolvedor" && user.studioName && (
                    <span>🎮 {user.studioName}</span>
                  )}

                  <span className="profile-role-badge">
                    {user.role === "desenvolvedor" ? "Desenvolvedor" : "Jogador"}
                  </span>
                </div>

                <div className="profile-dropdown-links">
                  {user.role === "jogador" ? (
                    <>
                      <Link to="/perfil">Meu perfil</Link>

                      <button
                        className="become-dev-btn"
                        type="button"
                        onClick={() => {
                          onBecomeDeveloper();
                          setMenuOpen(false);
                        }}
                      >
                        🚀 Tornar-se desenvolvedor
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard">Dashboard</Link>
                      <Link to="/desenvolvedor">Cadastrar jogo</Link>
                    </>
                  )}
                </div>

                <button
                  className="profile-logout"
                  onClick={onLogout}
                  type="button"
                >
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
