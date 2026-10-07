import React from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";

export default function MeuPerfil({ user, gamesData, favorites, likedIds }) {
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
