import React from "react";

export default function GameCover({ game, large = false }) {
  return (
    <div
      className={`game-cover ${large ? "large" : ""}`}
      style={{ background: `linear-gradient(135deg, ${game.colors[0]}, ${game.colors[1]})` }}
    >
      <span className="cover-shape shape-one" />
      <span className="cover-shape shape-two" />
      <div className="cover-content">
        <small>INDIE</small>
        <strong>{game.title}</strong>
        <em>{game.genre}</em>
      </div>
    </div>
  );
}
