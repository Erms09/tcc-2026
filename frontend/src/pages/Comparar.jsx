import React from "react";
import { Link } from "react-router-dom";
import GameCover from "../components/GameCover";

export default function Comparar({ gamesData, compareIds, onToggleCompare }) {
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
