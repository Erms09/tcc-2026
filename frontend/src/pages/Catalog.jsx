import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { genres, types } from "../data";

export default function Catalog({ gamesData, activity, favorites, onToggleFavorite, compareIds, onToggleCompare }) {
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
