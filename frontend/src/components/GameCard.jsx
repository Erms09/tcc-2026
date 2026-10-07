import React from "react";
import { Link } from "react-router-dom";
import GameCover from "./GameCover";

export default function GameCard({ game, isFavorite, onToggleFavorite, view, isHighlight, isTrending, isComparing, onToggleCompare }) {
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
