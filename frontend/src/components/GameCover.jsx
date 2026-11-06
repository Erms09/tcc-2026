import React, { useEffect, useState } from "react";

// Mostra a capa do jogo. Se não houver imagem (ou o link falhar), usa o degradê.
export default function GameCover({ game, large = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const colors = game.colors || ["#4c1d95", "#1e1b4b"];
  const showImage = Boolean(game.coverUrl) && !imageFailed;

  // Se o link da capa mudar, tenta carregar de novo.
  useEffect(() => {
    setImageFailed(false);
  }, [game.coverUrl]);

  return (
    <div
      className={`game-cover ${large ? "large" : ""}`}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      role="img"
      aria-label={`Capa do jogo ${game.title}`}
    >
      {showImage ? (
        <img
          src={game.coverUrl}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <span className="cover-shape shape-one" />
          <span className="cover-shape shape-two" />
          <div className="cover-content">
            <small>INDIE</small>
            <strong>{game.title}</strong>
            <em>{game.genre}</em>
          </div>
        </>
      )}
    </div>
  );
}
