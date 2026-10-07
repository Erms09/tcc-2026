import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import GameCover from "./GameCover";

export default function AssistantWidget({ gamesData, favorites, likedIds }) {
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
