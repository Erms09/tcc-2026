import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { gameUpdates, events } from "../novidadesData";
import "./novidades.css";

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  }).replace(".", "");
}

export default function Novidades({ gamesData, activity, favorites, onToggleFavorite }) {
  // Os jogos com maior id são os cadastrados mais recentemente.
  const recentGames = useMemo(
    () => [...gamesData].sort((a, b) => b.id - a.id).slice(0, 3),
    [gamesData]
  );

  const topGame = useMemo(
    () =>
      [...gamesData].sort(
        (a, b) => (b.likes || 0) - (a.likes || 0)
      )[0],
    [gamesData]
  );

  const recentActivity = activity.slice(0, 4);

  const updates = gameUpdates
    .map((update) => ({
      ...update,
      game: gamesData.find((g) => g.id === update.gameId),
    }))
    .filter((update) => update.game);

  return (
    <main className="container simple-page news-page">
      <span className="eyebrow">NOVIDADES</span>
      <h1>O que há de novo.</h1>
      <p>Jogos recém-publicados, atualizações, eventos e destaques da comunidade.</p>

      <section className="news-section">
        <h2>🆕 Jogos recém-publicados</h2>
        <div className="game-grid">
          {recentGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              view="grid"
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      <div className="news-columns">
        <section className="news-section">
          <h2>🔧 Atualizações</h2>
          <ul className="news-list">
            {updates.map((update) => (
              <li className="news-item" key={update.id}>
                <div className="news-date">{formatDate(update.date)}</div>
                <div>
                  <Link to={`/jogo/${update.game.id}`}>
                    {update.game.title} <span className="news-tag">v{update.version}</span>
                  </Link>
                  <p>{update.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="news-section">
          <h2>📅 Eventos</h2>
          <ul className="news-list">
            {events.map((event) => (
              <li className="news-item" key={event.id}>
                <div className="news-date">{formatDate(event.date)}</div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <span className="news-tag">{event.place}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="news-section">
        <h2>⭐ Destaques da comunidade</h2>

        {topGame && (
          <div className="news-highlight">
            <span>Jogo mais curtido</span>
            <Link to={`/jogo/${topGame.id}`}>{topGame.title}</Link>
            <small>❤ {topGame.likes} curtidas · por {topGame.developer}</small>
          </div>
        )}

        <div className="activity-feed" style={{ marginTop: "16px" }}>
          {recentActivity.map((item, index) => (
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
          {recentActivity.length === 0 && (
            <div className="empty-state">Nenhuma atividade ainda.</div>
          )}
        </div>
        <p style={{ marginTop: "14px" }}>
          <Link to="/comunidade">Ver tudo na comunidade →</Link>
        </p>
      </section>
    </main>
  );
}
