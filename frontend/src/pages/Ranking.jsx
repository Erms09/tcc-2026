import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import GameCover from "../components/GameCover";

export default function Ranking({ gamesData }) {
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
