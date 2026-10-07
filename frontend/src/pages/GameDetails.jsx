import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import GameCover from "../components/GameCover";
import GameCard from "../components/GameCard";
import NotFound from "./NotFound";

export default function GameDetails({ gamesData, likedIds, onToggleLike, onRegisterView, onAddComment, user, favorites, onToggleFavorite }) {
  const { id } = useParams();
  const gameId = Number(id);
  const game = gamesData.find((item) => item.id === gameId);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [sending, setSending] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  useEffect(() => {
    onRegisterView(gameId);
  }, [gameId]);

  if (!game) return <NotFound />;

  const isLiked = likedIds.includes(game.id);
  const isFavorite = favorites.includes(game.id);

  const screenshots = [
    { label: "Captura 1", colors: game.colors },
    { label: "Captura 2", colors: [game.colors[1], game.colors[0]] },
    { label: "Captura 3", colors: [game.colors[0], "#111113"] }
  ];

  const similarGames = gamesData
    .filter((g) => g.genre === game.genre && g.id !== game.id)
    .slice(0, 3);

  function addComment(e) {
    e.preventDefault();
    if (comment.trim().length < 3) {
      setCommentError("Escreva pelo menos 3 caracteres antes de enviar.");
      return;
    }
    setCommentError("");
    setSending(true);
    setTimeout(() => {
      onAddComment(game.id, {
        id: Date.now(),
        name: user ? user.name : "Você",
        text: comment.trim(),
        timeLabel: "agora mesmo"
      });
      setComment("");
      setSending(false);
    }, 700);
  }

  function handleShare() {
    const url = window.location.origin + `/jogo/${game.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <main className="container detail-page">
      <Link to="/" className="back-link">← Voltar para o catálogo</Link>

      <section className="detail-hero">
        <GameCover game={game} large />
        <div className="detail-info">
          <span className="eyebrow">{game.genre} • {game.type}</span>
          <h1>{game.title}</h1>
          <p className="developer-name">
            por{" "}
            <Link to={`/estudio/${encodeURIComponent(game.developer)}`}>
              <strong>{game.developer}</strong>
            </Link>
          </p>
          <div className="big-rating">★ {game.rating} <span>avaliação da comunidade</span></div>

          <div className="detail-stats">
            <span>👁 {game.views} visualizações</span>
            <span>💬 {game.comments.length} comentários</span>
          </div>

          <p>{game.description}</p>

          <div className="detail-actions">
            <button
              className={`like-button ${isLiked ? "active" : ""}`}
              onClick={() => onToggleLike(game.id)}
              type="button"
            >
              {isLiked ? "❤ Curtido" : "🤍 Curtir"} · {game.likes}
            </button>

            <button
              className={`favorite-inline-btn ${isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(game.id)}
              type="button"
            >
              {isFavorite ? "♥ Favoritado" : "♡ Favoritar"}
            </button>

            <button className="support-button" onClick={handleShare} type="button">
              {shared ? "✓ Link copiado!" : "🔗 Compartilhar"}
            </button>

            <button
              className="support-button"
              onClick={() => setSupportOpen(true)}
              type="button"
            >
              💜 Apoiar desenvolvedor
            </button>
          </div>

          {supportOpen && (
            <div className="support-note">
              <p>
                Esse recurso está em modo demonstração — em breve você poderá apoiar
                <strong> {game.developer}</strong> diretamente por aqui.
              </p>
              <button className="support-close" onClick={() => setSupportOpen(false)} type="button">
                Fechar
              </button>
            </div>
          )}

          <div className="external-links">
            <a href={game.steam} target="_blank" rel="noreferrer">Steam ↗</a>
            <a href={game.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={game.discord} target="_blank" rel="noreferrer">Discord ↗</a>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <span className="eyebrow">GALERIA</span>
        <h2>Capturas de tela</h2>
        <div className="gallery-viewer">
          <div
            className="gallery-slide"
            style={{ background: `linear-gradient(135deg, ${screenshots[screenshotIndex].colors[0]}, ${screenshots[screenshotIndex].colors[1]})` }}
          >
            <span>{screenshots[screenshotIndex].label}</span>
          </div>
          <button
            className="gallery-nav gallery-prev"
            onClick={() => setScreenshotIndex((i) => (i === 0 ? screenshots.length - 1 : i - 1))}
            type="button"
            aria-label="Captura anterior"
          >
            ‹
          </button>
          <button
            className="gallery-nav gallery-next"
            onClick={() => setScreenshotIndex((i) => (i === screenshots.length - 1 ? 0 : i + 1))}
            type="button"
            aria-label="Próxima captura"
          >
            ›
          </button>
        </div>
        <div className="gallery-dots">
          {screenshots.map((s, i) => (
            <button
              key={i}
              className={`gallery-dot ${i === screenshotIndex ? "active" : ""}`}
              onClick={() => setScreenshotIndex(i)}
              type="button"
              aria-label={`Ver ${s.label}`}
            />
          ))}
        </div>
      </section>

      <section className="feedback-section">
        <div>
          <span className="eyebrow">COMUNIDADE</span>
          <h2>Feedbacks</h2>
          <p>Ajude o desenvolvedor deixando sua opinião.</p>
        </div>
        <form className="comment-form" onSubmit={addComment} noValidate>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className={commentError ? "input-error" : ""}
          />
          {commentError && <span className="field-error">{commentError}</span>}
          <button className="primary-button" type="submit" disabled={sending}>
            {sending ? <span className="spinner" /> : "Enviar feedback"}
          </button>
        </form>
        <div className="comments">
          {game.comments.map((item) => (
            <article className="comment" key={item.id}>
              <div className="avatar">{item.name[0]}</div>
              <div>
                <div className="comment-head">
                  <strong>{item.name}</strong>
                  <span className="comment-time">{item.timeLabel}</span>
                </div>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {similarGames.length > 0 && (
        <section className="similar-section">
          <span className="eyebrow">RECOMENDADOS</span>
          <h2>Jogos parecidos</h2>
          <div className="game-grid">
            {similarGames.map((g) => (
              <GameCard key={g.id} game={g} view="grid" isFavorite={false} onToggleFavorite={() => {}} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
