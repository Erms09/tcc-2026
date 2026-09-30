import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useParams, useNavigate, useLocation, Navigate } from "react-router-dom";
import { games, genres, types } from "./data";

const PALETTES = [
  ["#6d28d9", "#ec4899"],
  ["#14532d", "#22c55e"],
  ["#0f172a", "#2563eb"],
  ["#18181b", "#dc2626"],
  ["#92400e", "#f59e0b"],
  ["#164e63", "#06b6d4"]
];

function getBadges(game) {
  const badges = [];
  if (game.likes >= 50) badges.push("⭐ 50+ curtidas");
  if (game.views >= 300) badges.push("👁 300+ visualizações");
  if (game.comments.length >= 2) badges.push("💬 Comunidade ativa");
  return badges;
}

function Header({ user, onLogout, theme, onToggleTheme }) {
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

function GameCover({ game, large = false }) {
  return (
    <div
      className={`game-cover ${large ? "large" : ""}`}
      style={{ background: `linear-gradient(135deg, ${game.colors[0]}, ${game.colors[1]})` }}
    >
      <span className="cover-shape shape-one" />
      <span className="cover-shape shape-two" />
      <div className="cover-content">
        <small>INDIE</small>
        <strong>{game.title}</strong>
        <em>{game.genre}</em>
      </div>
    </div>
  );
}

function GameCard({ game, isFavorite, onToggleFavorite, view, isHighlight, isTrending, isComparing, onToggleCompare }) {
  function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(game.id);
  }

  function handleCompareClick(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleCompare(game.id);
  }

  return (
    <Link to={`/jogo/${game.id}`} className={`game-card ${view === "list" ? "game-card-list" : ""}`}>
      <div className="game-cover-wrap">
        <GameCover game={game} />
        <div className="badge-stack">
          {isHighlight && <span className="badge-highlight">🔥 Destaque da semana</span>}
          {!isHighlight && isTrending && <span className="badge-trending">📈 Em alta</span>}
          {game.isNew && <span className="badge-new">Novo</span>}
        </div>
        <div className="card-top-actions">
          {onToggleCompare && (
            <button
              className={`compare-btn ${isComparing ? "active" : ""}`}
              onClick={handleCompareClick}
              type="button"
              aria-label="Comparar jogo"
              title="Adicionar à comparação"
            >
              ⇄
            </button>
          )}
          <button
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={handleFavoriteClick}
            type="button"
            aria-label="Favoritar jogo"
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>
        <div className="hover-preview">
          <p>{game.description}</p>
          <span>{game.comments.length} comentários</span>
        </div>
      </div>
      <div className="game-card-body">
        <div className="game-title-row">
          <h3>{game.title}</h3>
          <span className="rating">★ {game.rating}</span>
        </div>
        <p>{game.developer}</p>
        <div className="tags">
          <span>{game.genre}</span>
          <span>{game.type}</span>
        </div>
        <div className="card-stats">
          <span>👁 {game.views}</span>
          <span>❤ {game.likes}</span>
          <span>💬 {game.comments.length}</span>
        </div>
      </div>
    </Link>
  );
}

function Catalog({ gamesData, activity, favorites, onToggleFavorite, compareIds, onToggleCompare }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");
  const [type, setType] = useState("Todos");
  const [view, setView] = useState("grid");

  const ranked = useMemo(() => {
    return [...gamesData]
      .map((g) => ({ ...g, score: g.likes * 2 + g.views }))
      .sort((a, b) => b.score - a.score);
  }, [gamesData]);

  const highlightIds = useMemo(() => ranked.slice(0, 3).map((g) => g.id), [ranked]);
  const trendingIds = useMemo(() => ranked.slice(3, 5).map((g) => g.id), [ranked]);

  const filteredGames = useMemo(() => {
    return gamesData.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(search.toLowerCase()) ||
        game.developer.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = genre === "Todos" || game.genre === genre;
      const matchesType = type === "Todos" || game.type === type;
      return matchesSearch && matchesGenre && matchesType;
    });
  }, [gamesData, search, genre, type]);

  const stats = useMemo(() => {
    const developersCount = new Set(gamesData.map((g) => g.developer)).size;
    const commentsCount = gamesData.reduce((total, g) => total + g.comments.length, 0);
    return { gamesCount: gamesData.length, developersCount, commentsCount };
  }, [gamesData]);

  const highlightGames = useMemo(
    () => ranked.filter((g) => highlightIds.includes(g.id)),
    [ranked, highlightIds]
  );

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">CATÁLOGO DE JOGOS INDEPENDENTES</span>
          <h1>Descubra o próximo<br /><span>grande indie.</span></h1>
          <p>
            Um espaço para jogadores encontrarem projetos independentes
            e para desenvolvedores ganharem visibilidade.
          </p>
          <a href="#catalogo" className="primary-button">Explorar jogos ↓</a>

          <div className="stats-bar">
            <span><strong>{stats.gamesCount}</strong> jogos</span>
            <span className="stats-dot">•</span>
            <span><strong>{stats.developersCount}</strong> desenvolvedores</span>
            <span className="stats-dot">•</span>
            <span><strong>{stats.commentsCount}</strong> avaliações</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="floating-card card-a">🎮<b>Projetos<br />indies</b></div>
          <div className="floating-card card-b">★ <b>Feedback<br />da comunidade</b></div>
          <div className="hero-orb">INDIE<br /><span>HUB</span></div>
        </div>
      </section>

      {highlightGames.length > 0 && (
        <section className="container highlight-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DESTAQUES</span>
              <h2>🔥 Destaques da semana</h2>
              <p>Os jogos mais curtidos e visitados nos últimos dias.</p>
            </div>
          </div>
          <div className="game-grid highlight-grid">
            {highlightGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                view="grid"
                isHighlight
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
                isComparing={compareIds.includes(game.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        </section>
      )}

      {activity.length > 0 && (
        <section className="container activity-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COMUNIDADE</span>
              <h2>Atividade recente</h2>
            </div>
            <Link to="/comunidade" className="secondary-button">Ver tudo</Link>
          </div>
          <div className="activity-feed">
            {activity.slice(0, 5).map((item, index) => (
              <div className="activity-item" key={index}>
                <div className="avatar">{item.name[0]}</div>
                <p>
                  <strong>{item.name}</strong>{" "}
                  {item.type === "like" ? "curtiu" : "comentou em"}{" "}
                  <Link to={`/jogo/${item.gameId}`}>{item.gameTitle}</Link>
                  {item.text && <span className="activity-text"> — "{item.text}"</span>}
                </p>
                <span className="activity-time">{item.timeLabel}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <main className="container" id="catalogo">
        <section className="section-heading">
          <div>
            <span className="eyebrow">VITRINE</span>
            <h2>Jogos em destaque</h2>
            <p>Encontre projetos independentes e conheça seus criadores.</p>
          </div>
          <div className="section-heading-right">
            <span className="result-count">{filteredGames.length} jogos</span>
            <div className="view-toggle">
              <button
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
                type="button"
                aria-label="Ver em grade"
              >
                ▦
              </button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
                type="button"
                aria-label="Ver em lista"
              >
                ☰
              </button>
            </div>
          </div>
        </section>

        <section className="filters">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎  Buscar jogo ou desenvolvedor..."
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((item) => <option key={item}>{item}</option>)}
          </select>
        </section>

        {filteredGames.length ? (
          <div className={view === "list" ? "game-list" : "game-grid"}>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                view={view}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
                isHighlight={highlightIds.includes(game.id)}
                isTrending={trendingIds.includes(game.id)}
                isComparing={compareIds.includes(game.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">Nenhum jogo encontrado com esses filtros.</div>
        )}
      </main>
    </>
  );
}

function GameDetails({ gamesData, likedIds, onToggleLike, onRegisterView, onAddComment, user, favorites, onToggleFavorite }) {
  const { id } = useParams();
  const gameId = Number(id);
  const game = gamesData.find((item) => item.id === gameId);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [sending, setSending] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  useEffect(() => {
    onRegisterView(gameId);
  }, [gameId]);

  if (!game) return <NotFound />;

  const isLiked = likedIds.includes(game.id);
  const isFavorite = favorites.includes(game.id);

  const screenshots = [
    { label: "Captura 1", colors: game.colors },
    { label: "Captura 2", colors: [game.colors[1], game.colors[0]] },
    { label: "Captura 3", colors: [game.colors[0], "#111113"] }
  ];

  const similarGames = gamesData
    .filter((g) => g.genre === game.genre && g.id !== game.id)
    .slice(0, 3);

  function addComment(e) {
    e.preventDefault();
    if (comment.trim().length < 3) {
      setCommentError("Escreva pelo menos 3 caracteres antes de enviar.");
      return;
    }
    setCommentError("");
    setSending(true);
    setTimeout(() => {
      onAddComment(game.id, {
        id: Date.now(),
        name: user ? user.name : "Você",
        text: comment.trim(),
        timeLabel: "agora mesmo"
      });
      setComment("");
      setSending(false);
    }, 700);
  }

  function handleShare() {
    const url = window.location.origin + `/jogo/${game.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <main className="container detail-page">
      <Link to="/" className="back-link">← Voltar para o catálogo</Link>

      <section className="detail-hero">
        <GameCover game={game} large />
        <div className="detail-info">
          <span className="eyebrow">{game.genre} • {game.type}</span>
          <h1>{game.title}</h1>
          <p className="developer-name">
            por{" "}
            <Link to={`/estudio/${encodeURIComponent(game.developer)}`}>
              <strong>{game.developer}</strong>
            </Link>
          </p>
          <div className="big-rating">★ {game.rating} <span>avaliação da comunidade</span></div>

          <div className="detail-stats">
            <span>👁 {game.views} visualizações</span>
            <span>💬 {game.comments.length} comentários</span>
          </div>

          <p>{game.description}</p>

          <div className="detail-actions">
            <button
              className={`like-button ${isLiked ? "active" : ""}`}
              onClick={() => onToggleLike(game.id)}
              type="button"
            >
              {isLiked ? "❤ Curtido" : "🤍 Curtir"} · {game.likes}
            </button>

            <button
              className={`favorite-inline-btn ${isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(game.id)}
              type="button"
            >
              {isFavorite ? "♥ Favoritado" : "♡ Favoritar"}
            </button>

            <button className="support-button" onClick={handleShare} type="button">
              {shared ? "✓ Link copiado!" : "🔗 Compartilhar"}
            </button>

            <button
              className="support-button"
              onClick={() => setSupportOpen(true)}
              type="button"
            >
              💜 Apoiar desenvolvedor
            </button>
          </div>

          {supportOpen && (
            <div className="support-note">
              <p>
                Esse recurso está em modo demonstração — em breve você poderá apoiar
                <strong> {game.developer}</strong> diretamente por aqui.
              </p>
              <button className="support-close" onClick={() => setSupportOpen(false)} type="button">
                Fechar
              </button>
            </div>
          )}

          <div className="external-links">
            <a href={game.steam} target="_blank" rel="noreferrer">Steam ↗</a>
            <a href={game.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={game.discord} target="_blank" rel="noreferrer">Discord ↗</a>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <span className="eyebrow">GALERIA</span>
        <h2>Capturas de tela</h2>
        <div className="gallery-viewer">
          <div
            className="gallery-slide"
            style={{ background: `linear-gradient(135deg, ${screenshots[screenshotIndex].colors[0]}, ${screenshots[screenshotIndex].colors[1]})` }}
          >
            <span>{screenshots[screenshotIndex].label}</span>
          </div>
          <button
            className="gallery-nav gallery-prev"
            onClick={() => setScreenshotIndex((i) => (i === 0 ? screenshots.length - 1 : i - 1))}
            type="button"
            aria-label="Captura anterior"
          >
            ‹
          </button>
          <button
            className="gallery-nav gallery-next"
            onClick={() => setScreenshotIndex((i) => (i === screenshots.length - 1 ? 0 : i + 1))}
            type="button"
            aria-label="Próxima captura"
          >
            ›
          </button>
        </div>
        <div className="gallery-dots">
          {screenshots.map((s, i) => (
            <button
              key={i}
              className={`gallery-dot ${i === screenshotIndex ? "active" : ""}`}
              onClick={() => setScreenshotIndex(i)}
              type="button"
              aria-label={`Ver ${s.label}`}
            />
          ))}
        </div>
      </section>

      <section className="feedback-section">
        <div>
          <span className="eyebrow">COMUNIDADE</span>
          <h2>Feedbacks</h2>
          <p>Ajude o desenvolvedor deixando sua opinião.</p>
        </div>
        <form className="comment-form" onSubmit={addComment} noValidate>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className={commentError ? "input-error" : ""}
          />
          {commentError && <span className="field-error">{commentError}</span>}
          <button className="primary-button" type="submit" disabled={sending}>
            {sending ? <span className="spinner" /> : "Enviar feedback"}
          </button>
        </form>
        <div className="comments">
          {game.comments.map((item) => (
            <article className="comment" key={item.id}>
              <div className="avatar">{item.name[0]}</div>
              <div>
                <div className="comment-head">
                  <strong>{item.name}</strong>
                  <span className="comment-time">{item.timeLabel}</span>
                </div>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {similarGames.length > 0 && (
        <section className="similar-section">
          <span className="eyebrow">RECOMENDADOS</span>
          <h2>Jogos parecidos</h2>
          <div className="game-grid">
            {similarGames.map((g) => (
              <GameCard key={g.id} game={g} view="grid" isFavorite={false} onToggleFavorite={() => {}} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Developer({ onCreateGame, currentUserName }) {
  const [form, setForm] = useState({
    title: "", dev: currentUserName || "", genre: "", type: "", description: "",
    steam: "", github: "", discord: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function isValidUrl(value) {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  function validate() {
    const newErrors = {};
    if (form.title.trim().length < 2) newErrors.title = "Digite o nome do jogo.";
    if (!form.genre) newErrors.genre = "Selecione um gênero.";
    if (!form.type) newErrors.type = "Selecione um tipo.";
    if (form.description.trim().length < 10) newErrors.description = "Escreva pelo menos 10 caracteres na descrição.";
    if (!isValidUrl(form.steam)) newErrors.steam = "Link inválido. Use uma URL completa, ex.: https://...";
    if (!isValidUrl(form.github)) newErrors.github = "Link inválido. Use uma URL completa, ex.: https://...";
    if (!isValidUrl(form.discord)) newErrors.discord = "Link inválido. Use uma URL completa, ex.: https://...";
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setSubmitted(false);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      onCreateGame({
        title: form.title.trim(),
        developer: currentUserName,
        genre: form.genre,
        type: form.type,
        description: form.description.trim(),
        steam: form.steam || "https://store.steampowered.com/",
        github: form.github || "https://github.com/",
        discord: form.discord || "https://discord.com/"
      });
      setLoading(false);
      setSubmitted(true);
    }, 900);
  }

  return (
    <main className="container developer-page">
      <section className="page-intro">
        <span className="eyebrow">ÁREA DO DESENVOLVEDOR</span>
        <h1>Coloque seu jogo na vitrine.</h1>
        <p>Cadastre seu projeto e conecte jogadores às suas plataformas.</p>
      </section>

      <div className="developer-layout">
        <form className="dev-form" onSubmit={handleSubmit} noValidate>
          <label>Nome do jogo<span className="required-mark">*</span>
            <input
              placeholder="Ex.: Meu Jogo Indie"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>

          <label>Desenvolvedor
            <input
              value={currentUserName}
              disabled
              className="input-locked"
            />
            <small className="field-hint">Vinculado automaticamente à sua conta.</small>
          </label>

          <label>Gênero<span className="required-mark">*</span>
            <select
              value={form.genre}
              onChange={(e) => updateField("genre", e.target.value)}
              className={errors.genre ? "input-error" : ""}
            >
              <option value="" disabled>Selecione</option>
              {genres.slice(1).map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.genre && <span className="field-error">{errors.genre}</span>}
          </label>

          <label>Tipo<span className="required-mark">*</span>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={errors.type ? "input-error" : ""}
            >
              <option value="" disabled>Selecione</option>
              {types.slice(1).map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </label>

          <label>Descrição<span className="required-mark">*</span>
            <textarea
              placeholder="Conte um pouco sobre o jogo..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>

          <label>Link da Steam
            <input
              type="url"
              placeholder="https://..."
              value={form.steam}
              onChange={(e) => updateField("steam", e.target.value)}
              className={errors.steam ? "input-error" : ""}
            />
            {errors.steam && <span className="field-error">{errors.steam}</span>}
          </label>

          <label>Link do GitHub
            <input
              type="url"
              placeholder="https://..."
              value={form.github}
              onChange={(e) => updateField("github", e.target.value)}
              className={errors.github ? "input-error" : ""}
            />
            {errors.github && <span className="field-error">{errors.github}</span>}
          </label>

          <label>Link do Discord
            <input
              type="url"
              placeholder="https://..."
              value={form.discord}
              onChange={(e) => updateField("discord", e.target.value)}
              className={errors.discord ? "input-error" : ""}
            />
            {errors.discord && <span className="field-error">{errors.discord}</span>}
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Cadastrar jogo"}
            </button>
            <Link to="/catalogo" className="secondary-button">Cancelar</Link>
          </div>
          {submitted && (
            <div className="success">
              ✓ Jogo cadastrado com sucesso! Confira em{" "}
              <Link to="/meus-jogos">Meus jogos</Link>.
            </div>
          )}
        </form>

        <aside className="dev-card">
          <span className="status-dot" />
          <h3>Divulgação automatizada</h3>
          <p>
            O diferencial do projeto prevê uma IA integrada para publicar
            automaticamente os jogos cadastrados no Instagram.
          </p>
          <div className="automation-status">
            <span>IA de divulgação</span><b>Planejada</b>
          </div>
          <small>A integração real com Instagram/IA será implementada no back-end.</small>
        </aside>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="container simple-page">
      <span className="eyebrow">SOBRE O PROJETO</span>
      <h1>Um espaço para dar visibilidade aos jogos indies.</h1>
      <p>
        O IndieHub é uma plataforma web de catálogo criada para auxiliar
        desenvolvedores independentes na divulgação de seus jogos,
        conectando criadores e jogadores.
      </p>
      <div className="about-grid">
        <div><b>Vitrine</b><span>Exibição de jogos com informações do projeto.</span></div>
        <div><b>Feedback</b><span>Avaliações e comentários da comunidade.</span></div>
        <div><b>Filtros</b><span>Busca por gênero, tipo e categorias.</span></div>
        <div><b>Links externos</b><span>Acesso a Steam, GitHub e Discord.</span></div>
      </div>
    </main>
  );
}

function Ranking({ gamesData }) {
  const ranked = useMemo(() => {
    return [...gamesData]
      .map((g) => ({ ...g, score: g.likes * 2 + g.views }))
      .sort((a, b) => b.score - a.score);
  }, [gamesData]);

  return (
    <main className="container simple-page ranking-page">
      <span className="eyebrow">HALL DA FAMA</span>
      <h1>Ranking dos jogos indies.</h1>
      <p>Ordenado por curtidas e visualizações da comunidade.</p>

      <div className="ranking-list">
        {ranked.map((game, index) => (
          <Link to={`/jogo/${game.id}`} className="ranking-row" key={game.id}>
            <span className="ranking-position">#{index + 1}</span>
            <div className="ranking-cover">
              <GameCover game={game} />
            </div>
            <div className="ranking-info">
              <strong>{game.title}</strong>
              <span>{game.developer}</span>
            </div>
            <div className="ranking-stats">
              <span>★ {game.rating}</span>
              <span>👁 {game.views}</span>
              <span>❤ {game.likes}</span>
              <span>💬 {game.comments.length}</span>
            </div>
          </Link>
        ))}
        {ranked.length === 0 && (
          <div className="empty-state">Nenhum jogo cadastrado ainda.</div>
        )}
      </div>
    </main>
  );
}

function StudioProfile({ gamesData }) {
  const { name } = useParams();
  const studioName = decodeURIComponent(name);
  const studioGames = gamesData.filter((g) => g.developer === studioName);

  if (studioGames.length === 0) return <NotFound />;

  const totalViews = studioGames.reduce((total, g) => total + g.views, 0);
  const totalLikes = studioGames.reduce((total, g) => total + g.likes, 0);

  return (
    <main className="container simple-page">
      <Link to="/catalogo" className="back-link">← Voltar para o catálogo</Link>
      <span className="eyebrow">ESTÚDIO</span>
      <h1>{studioName}</h1>
      <p>{studioGames.length} jogo(s) publicado(s) no IndieHub.</p>

      <div className="stats-bar">
        <span><strong>{totalViews}</strong> visualizações no total</span>
        <span className="stats-dot">•</span>
        <span><strong>{totalLikes}</strong> curtidas no total</span>
      </div>

      <div className="game-grid" style={{ marginTop: "35px" }}>
        {studioGames.map((game) => (
          <GameCard key={game.id} game={game} view="grid" isFavorite={false} onToggleFavorite={() => {}} />
        ))}
      </div>
    </main>
  );
}

function Favoritos({ gamesData, favorites, onToggleFavorite }) {
  const favGames = gamesData.filter((g) => favorites.includes(g.id));

  return (
    <main className="container simple-page">
      <span className="eyebrow">SEUS FAVORITOS</span>
      <h1>Jogos que você marcou.</h1>
      <p>Sua lista pessoal para acompanhar depois.</p>

      {favGames.length > 0 ? (
        <div className="game-grid" style={{ marginTop: "35px" }}>
          {favGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              view="grid"
              isFavorite
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: "35px" }}>
          Você ainda não favoritou nenhum jogo. Clique no ♡ em um card para adicionar aqui.
        </div>
      )}
    </main>
  );
}

function Comunidade({ activity }) {
  return (
    <main className="container simple-page">
      <span className="eyebrow">MURAL DA COMUNIDADE</span>
      <h1>O que estão dizendo.</h1>
      <p>Todos os comentários e curtidas recentes da comunidade.</p>

      <div className="activity-feed" style={{ marginTop: "35px" }}>
        {activity.map((item, index) => (
          <div className="activity-item" key={index}>
            <div className="avatar">{item.name[0]}</div>
            <p>
              <strong>{item.name}</strong>{" "}
              {item.type === "like" ? "curtiu" : "comentou em"}{" "}
              <Link to={`/jogo/${item.gameId}`}>{item.gameTitle}</Link>
              {item.text && <span className="activity-text"> — "{item.text}"</span>}
            </p>
            <span className="activity-time">{item.timeLabel}</span>
          </div>
        ))}
        {activity.length === 0 && (
          <div className="empty-state">Nenhuma atividade ainda.</div>
        )}
      </div>
    </main>
  );
}

function MeuPerfil({ user, gamesData, favorites, likedIds }) {
  const favGames = gamesData.filter((g) => favorites.includes(g.id));
  const likedGames = gamesData.filter((g) => likedIds.includes(g.id));
  const myComments = [];
  gamesData.forEach((g) => {
    g.comments.forEach((c) => {
      if (c.name === user.name) myComments.push({ ...c, gameId: g.id, gameTitle: g.title });
    });
  });

  return (
    <main className="container simple-page">
      <span className="eyebrow">MEU PERFIL</span>
      <h1>{user.name}</h1>
      <p>{user.email} · Jogador</p>

      <div className="stats-bar">
        <span><strong>{favGames.length}</strong> favoritos</span>
        <span className="stats-dot">•</span>
        <span><strong>{likedGames.length}</strong> curtidos</span>
        <span className="stats-dot">•</span>
        <span><strong>{myComments.length}</strong> comentários</span>
      </div>

      <div className="section-heading" style={{ marginTop: "45px" }}>
        <div><h2>Favoritos</h2></div>
      </div>
      {favGames.length > 0 ? (
        <div className="game-grid">
          {favGames.map((g) => (
            <GameCard key={g.id} game={g} view="grid" isFavorite onToggleFavorite={() => {}} />
          ))}
        </div>
      ) : (
        <div className="empty-state">Nenhum favorito ainda.</div>
      )}

      <div className="section-heading" style={{ marginTop: "45px" }}>
        <div><h2>Meus comentários</h2></div>
      </div>
      {myComments.length > 0 ? (
        <div className="comments">
          {myComments.map((c) => (
            <article className="comment" key={c.id}>
              <div className="avatar">{c.name[0]}</div>
              <div>
                <div className="comment-head">
                  <strong>em <Link to={`/jogo/${c.gameId}`}>{c.gameTitle}</Link></strong>
                  <span className="comment-time">{c.timeLabel}</span>
                </div>
                <p>{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Você ainda não comentou em nenhum jogo.</div>
      )}
    </main>
  );
}

function MeusJogos({ user, gamesData }) {
  const myGames = gamesData.filter((g) => g.developer === user.name);
  const totalViews = myGames.reduce((total, g) => total + g.views, 0);
  const totalLikes = myGames.reduce((total, g) => total + g.likes, 0);

  return (
    <main className="container simple-page">
      <span className="eyebrow">PAINEL DO DESENVOLVEDOR</span>
      <h1>Meus jogos.</h1>
      <p>Jogos cadastrados com o nome "{user.name}".</p>

      <div className="stats-bar">
        <span><strong>{myGames.length}</strong> jogos</span>
        <span className="stats-dot">•</span>
        <span><strong>{totalViews}</strong> visualizações</span>
        <span className="stats-dot">•</span>
        <span><strong>{totalLikes}</strong> curtidas</span>
      </div>

      {myGames.length > 0 ? (
        <div className="my-games-list">
          {myGames.map((game) => (
            <div className="my-game-row" key={game.id}>
              <div className="ranking-cover">
                <GameCover game={game} />
              </div>
              <div className="ranking-info">
                <strong>{game.title}</strong>
                <span>{game.genre} • {game.type}</span>
                <div className="badge-row">
                  {getBadges(game).map((b) => (
                    <span className="mini-badge" key={b}>{b}</span>
                  ))}
                </div>
              </div>
              <div className="ranking-stats">
                <span>★ {game.rating}</span>
                <span>👁 {game.views}</span>
                <span>❤ {game.likes}</span>
                <span>💬 {game.comments.length}</span>
              </div>
              <Link to={`/jogo/${game.id}`} className="secondary-button">Ver</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: "35px" }}>
          Você ainda não cadastrou nenhum jogo com esse nome. Use "Cadastrar jogo" e escreva
          exatamente "{user.name}" no campo Desenvolvedor.
        </div>
      )}
    </main>
  );
}

function Planos() {
  const plans = [
    {
      name: "Grátis",
      price: "R$ 0",
      features: ["Cadastro de jogos ilimitado", "Estatísticas básicas", "Perfil de estúdio público"]
    },
    {
      name: "Pro",
      price: "R$ 29/mês",
      features: ["Tudo do Grátis", "Estatísticas detalhadas", "Selo de verificado", "Suporte prioritário"],
      highlight: true
    },
    {
      name: "Destaque",
      price: "R$ 79/mês",
      features: ["Tudo do Pro", "Destaque garantido na home", "Divulgação nas redes do IndieHub"]
    }
  ];

  return (
    <main className="container simple-page">
      <span className="eyebrow">PLANOS PARA DESENVOLVEDORES</span>
      <h1>Escolha como divulgar seu jogo.</h1>
      <p>Modo demonstração — nenhum pagamento é processado.</p>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div className={`plan-card ${plan.highlight ? "highlight" : ""}`} key={plan.name}>
            {plan.highlight && <span className="plan-tag">Mais popular</span>}
            <h3>{plan.name}</h3>
            <div className="plan-price">{plan.price}</div>
            <ul>
              {plan.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button className={plan.highlight ? "primary-button" : "secondary-button"} type="button">
              {plan.name === "Grátis" ? "Plano atual" : "Assinar (demo)"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function Comparar({ gamesData, compareIds, onToggleCompare }) {
  const compareGames = gamesData.filter((g) => compareIds.includes(g.id));

  if (compareGames.length === 0) {
    return (
      <main className="container simple-page">
        <span className="eyebrow">COMPARADOR</span>
        <h1>Nenhum jogo selecionado.</h1>
        <p>Volte ao catálogo e clique no ícone ⇄ nos cards para comparar até 3 jogos.</p>
        <Link to="/catalogo" className="primary-button">Voltar ao catálogo</Link>
      </main>
    );
  }

  return (
    <main className="container simple-page">
      <span className="eyebrow">COMPARADOR</span>
      <h1>Comparando {compareGames.length} jogo(s).</h1>

      <div className="compare-table">
        {compareGames.map((game) => (
          <div className="compare-col" key={game.id}>
            <GameCover game={game} />
            <h3>{game.title}</h3>
            <span className="compare-dev">{game.developer}</span>
            <ul>
              <li><b>Gênero:</b> {game.genre}</li>
              <li><b>Tipo:</b> {game.type}</li>
              <li><b>Nota:</b> ★ {game.rating}</li>
              <li><b>Visualizações:</b> {game.views}</li>
              <li><b>Curtidas:</b> {game.likes}</li>
              <li><b>Comentários:</b> {game.comments.length}</li>
            </ul>
            <button className="secondary-button" onClick={() => onToggleCompare(game.id)} type="button">
              Remover
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function Auth({ onLogin }) {
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

function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="container not-found">
      <h1>404</h1>
      <p>Essa página não existe.</p>
      <button className="primary-button" onClick={() => navigate("/")}>Voltar ao catálogo</button>
    </main>
  );
}

function CompareBar({ compareIds, onClear }) {
  if (compareIds.length === 0) return null;
  return (
    <div className="compare-bar">
      <span>{compareIds.length} jogo(s) selecionado(s) para comparar</span>
      <div className="compare-bar-actions">
        <Link to="/comparar" className="primary-button">Comparar</Link>
        <button className="secondary-button" onClick={onClear} type="button">Limpar</button>
      </div>
    </div>
  );
}

function AssistantWidget({ gamesData, favorites, likedIds }) {
  const [open, setOpen] = useState(false);

  const recommendation = useMemo(() => {
    const likedGames = gamesData.filter((g) => favorites.includes(g.id) || likedIds.includes(g.id));
    let genre = null;
    if (likedGames.length > 0) {
      const counts = {};
      likedGames.forEach((g) => {
        counts[g.genre] = (counts[g.genre] || 0) + 1;
      });
      genre = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    }
    const pool = genre
      ? gamesData.filter((g) => g.genre === genre && !favorites.includes(g.id) && !likedIds.includes(g.id))
      : [...gamesData].sort((a, b) => b.likes - a.likes);
    return pool[0] || gamesData[0];
  }, [gamesData, favorites, likedIds]);

  return (
    <div className="assistant-widget">
      {open && recommendation && (
        <div className="assistant-panel">
          <div className="assistant-head">
            <strong>🤖 Assistente IndieHub</strong>
            <button onClick={() => setOpen(false)} type="button" aria-label="Fechar">✕</button>
          </div>
          <p>Baseado no que você curtiu, recomendamos:</p>
          <div className="assistant-rec">
            <GameCover game={recommendation} />
            <div>
              <strong>{recommendation.title}</strong>
              <span>{recommendation.genre}</span>
            </div>
          </div>
          <Link to={`/jogo/${recommendation.id}`} className="primary-button" onClick={() => setOpen(false)}>
            Ver jogo
          </Link>
        </div>
      )}
      <button className="assistant-fab" onClick={() => setOpen(!open)} type="button" aria-label="Assistente IndieHub">
        🤖
      </button>
    </div>
  );
}

function TourModal({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Bem-vindo ao IndieHub!", text: "Vamos mostrar rapidinho os principais recursos da plataforma." },
    { title: "Favorite e curta jogos", text: "Use o ♡ nos cards para favoritar, e o botão \"Curtir\" na página do jogo." },
    { title: "Ranking e destaques", text: "Confira o Ranking e os Destaques da semana para ver os jogos mais populares." },
    { title: "Compare jogos", text: "Clique no ícone ⇄ em até 3 cards para comparar lado a lado." }
  ];
  const isLast = step === steps.length - 1;

  return (
    <div className="tour-overlay">
      <div className="tour-modal">
        <h3>{steps[step].title}</h3>
        <p>{steps[step].text}</p>
        <div className="tour-dots">
          {steps.map((_, i) => (
            <span key={i} className={`tour-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
        <div className="tour-actions">
          <button className="secondary-button" onClick={onClose} type="button">Pular</button>
          <button
            className="primary-button"
            type="button"
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
          >
            {isLast ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = "indiehub-state-v1";

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthScreen = location.pathname === "/";

  const stored = useMemo(() => loadStoredState(), []);

  const [user, setUser] = useState(() => (stored ? stored.user : null));
  const [gamesData, setGamesData] = useState(() =>
    stored ? stored.gamesData : games.map((g) => ({ ...g }))
  );
  const [visitedIds, setVisitedIds] = useState(() => (stored ? stored.visitedIds : []));
  const [likedIds, setLikedIds] = useState(() => (stored ? stored.likedIds : []));
  const [favorites, setFavorites] = useState(() => (stored ? stored.favorites : []));
  const [compareIds, setCompareIds] = useState(() => (stored ? stored.compareIds : []));
  const [theme, setTheme] = useState(() => (stored ? stored.theme : "dark"));
  const [tourSeen, setTourSeen] = useState(() => (stored ? stored.tourSeen : false));
  const [activity, setActivity] = useState(() => {
    if (stored) return stored.activity;
    const seeded = [];
    games.forEach((g) => {
      g.comments.forEach((c) => {
        seeded.push({ type: "comment", name: c.name, text: c.text, gameId: g.id, gameTitle: g.title, timeLabel: c.timeLabel });
      });
    });
    return seeded;
  });

  useEffect(() => {
    const snapshot = {
      user, gamesData, visitedIds, likedIds, favorites,
      compareIds, theme, tourSeen, activity
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // localStorage indisponível (ex.: modo privado) — segue sem persistir
    }
  }, [user, gamesData, visitedIds, likedIds, favorites, compareIds, theme, tourSeen, activity]);

  function registerView(id) {
    if (visitedIds.includes(id)) return;
    setVisitedIds((prev) => [...prev, id]);
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, views: g.views + 1 } : g))
    );
  }

  function toggleLike(id) {
    const alreadyLiked = likedIds.includes(id);
    setLikedIds((prev) =>
      alreadyLiked ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, likes: g.likes + (alreadyLiked ? -1 : 1) } : g))
    );
    if (!alreadyLiked) {
      const game = gamesData.find((g) => g.id === id);
      if (game && user) {
        setActivity((prev) => [
          { type: "like", name: user.name, gameId: game.id, gameTitle: game.title, timeLabel: "agora mesmo" },
          ...prev
        ]);
      }
    }
  }

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function addComment(id, comment) {
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, comments: [...g.comments, comment] } : g))
    );
    const game = gamesData.find((g) => g.id === id);
    if (game) {
      setActivity((prev) => [
        { type: "comment", name: comment.name, text: comment.text, gameId: game.id, gameTitle: game.title, timeLabel: comment.timeLabel },
        ...prev
      ]);
    }
  }

  function createGame(fields) {
    setGamesData((prev) => {
      const newId = Math.max(0, ...prev.map((g) => g.id)) + 1;
      const palette = PALETTES[newId % PALETTES.length];
      return [
        ...prev,
        {
          id: newId,
          ...fields,
          rating: 0,
          isNew: true,
          colors: palette,
          views: 0,
          likes: 0,
          comments: []
        }
      ];
    });
  }

  function handleLogout() {
    setUser(null);
    navigate("/");
  }

  function handleLogin(userData) {
    setUser(userData);
    setTourSeen(false);
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {!isAuthScreen && (
        <Header
          user={user}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
      )}
      <div className="page-fade" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Auth onLogin={handleLogin} />} />
          <Route
            path="/catalogo"
            element={
              <Catalog
                gamesData={gamesData}
                activity={activity}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            }
          />
          <Route
            path="/jogo/:id"
            element={
              <GameDetails
                gamesData={gamesData}
                likedIds={likedIds}
                onToggleLike={toggleLike}
                onRegisterView={registerView}
                onAddComment={addComment}
                user={user}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route path="/ranking" element={<Ranking gamesData={gamesData} />} />
          <Route path="/estudio/:name" element={<StudioProfile gamesData={gamesData} />} />
          <Route
            path="/favoritos"
            element={<Favoritos gamesData={gamesData} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          />
          <Route path="/comunidade" element={<Comunidade activity={activity} />} />
          <Route
            path="/perfil"
            element={
              user?.role === "jogador"
                ? <MeuPerfil user={user} gamesData={gamesData} favorites={favorites} likedIds={likedIds} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route
            path="/meus-jogos"
            element={
              user?.role === "desenvolvedor"
                ? <MeusJogos user={user} gamesData={gamesData} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route
            path="/planos"
            element={user?.role === "desenvolvedor" ? <Planos /> : <Navigate to="/catalogo" replace />}
          />
          <Route
            path="/comparar"
            element={<Comparar gamesData={gamesData} compareIds={compareIds} onToggleCompare={toggleCompare} />}
          />
          <Route
            path="/desenvolvedor"
            element={
              user?.role === "desenvolvedor"
                ? <Developer onCreateGame={createGame} currentUserName={user.name} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route path="/sobre" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAuthScreen && user && <CompareBar compareIds={compareIds} onClear={() => setCompareIds([])} />}
      {!isAuthScreen && user && <AssistantWidget gamesData={gamesData} favorites={favorites} likedIds={likedIds} />}
      {!isAuthScreen && user && !tourSeen && <TourModal onClose={() => setTourSeen(true)} />}
    </div>
  );
}