import React from "react";
import GameCard from "../components/GameCard";

export default function Favoritos({ gamesData, favorites, onToggleFavorite }) {
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
