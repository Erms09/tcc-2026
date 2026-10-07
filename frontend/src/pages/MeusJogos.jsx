import React from "react";
import { Link } from "react-router-dom";
import GameCover from "../components/GameCover";
import { getBadges } from "../utils/badges";

export default function MeusJogos({ user, gamesData }) {
  const myGames = gamesData.filter((g) => g.developer === user.name);
  const totalViews = myGames.reduce((total, g) => total + g.views, 0);
  const totalLikes = myGames.reduce((total, g) => total + g.likes, 0);

  return (
    <main className="container simple-page">
      <span className="eyebrow">PAINEL DO DESENVOLVEDOR</span>
      <h1>Meus jogos.</h1>
      <p>Jogos cadastrados com o nome "{user.name}".</p>

      <div className="stats-bar">
        <span><strong>{myGames.length}</strong> jogos</span>
        <span className="stats-dot">•</span>
        <span><strong>{totalViews}</strong> visualizações</span>
        <span className="stats-dot">•</span>
        <span><strong>{totalLikes}</strong> curtidas</span>
      </div>

      {myGames.length > 0 ? (
        <div className="my-games-list">
          {myGames.map((game) => (
            <div className="my-game-row" key={game.id}>
              <div className="ranking-cover">
                <GameCover game={game} />
              </div>
              <div className="ranking-info">
                <strong>{game.title}</strong>
                <span>{game.genre} • {game.type}</span>
                <div className="badge-row">
                  {getBadges(game).map((b) => (
                    <span className="mini-badge" key={b}>{b}</span>
                  ))}
                </div>
              </div>
              <div className="ranking-stats">
                <span>★ {game.rating}</span>
                <span>👁 {game.views}</span>
                <span>❤ {game.likes}</span>
                <span>💬 {game.comments.length}</span>
              </div>
              <Link to={`/jogo/${game.id}`} className="secondary-button">Ver</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: "35px" }}>
          Você ainda não cadastrou nenhum jogo com esse nome. Use "Cadastrar jogo" e escreva
          exatamente "{user.name}" no campo Desenvolvedor.
        </div>
      )}
    </main>
  );
}
