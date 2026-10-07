import React from "react";
import { useParams, Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import NotFound from "./NotFound";

export default function StudioProfile({ gamesData }) {
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
