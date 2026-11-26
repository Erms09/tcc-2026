import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import "./novidades.css";

export default function Novidades({ gamesData, favorites, onToggleFavorite }) {
  // Os jogos com maior id são os cadastrados mais recentemente.
  const recentGames = useMemo(
    () => [...gamesData].sort((a, b) => b.id - a.id).slice(0, 3),
    [gamesData]
  );

  return (
    <main className="container simple-page news-page">
      <span className="eyebrow">NOVIDADES</span>
      <h1>O que há de novo.</h1>
      <p>Confira os jogos que chegaram recentemente ao IndieHub.</p>

      <section className="news-section">
        <h2>🆕 Jogos recém-publicados</h2>
        {recentGames.length === 0 && (
          <div className="empty-state">
            Nenhum jogo publicado ainda. Os lançamentos aparecem aqui.
          </div>
        )}

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

    </main>
  );
}
