
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import GameCover from "../components/GameCover";
import GameCard from "../components/GameCard";
import NotFound from "./NotFound";

export default function GameDetails({
  gamesData,
  likedIds,
  onToggleLike,
  onRegisterView,
  onAddComment,
  user,
  favorites,
  onToggleFavorite,
}) {
  const { id } = useParams();
  const gameId = Number(id);
  const game = gamesData.find((item) => item.id === gameId);

  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [sending, setSending] = useState(false);
  const [shared, setShared] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  useEffect(() => {
    onRegisterView(gameId);
  }, [gameId]);

  if (!game) return <NotFound />;

  const comments = game.comments || [];
  const colors = game.colors || ["#6d28d9", "#ec4899"];
  const isLiked = likedIds.includes(game.id);
  const isFavorite = favorites.includes(game.id);
  const rating = Number(game.rating) || 0;

  const screenshots = [
    { label: "Visão do universo", colors },
    { label: "Outro ângulo", colors: [colors[1], colors[0]] },
    { label: "Exploração", colors: [colors[0], "#111113"] },
  ];

  const similarGames = gamesData
    .filter(
      (item) =>
        item.id !== game.id &&
        (item.genre === game.genre || item.type === game.type)
    )
    .slice(0, 3);

  function addComment(event) {
    event.preventDefault();

    if (comment.trim().length < 3) {
      setCommentError("Escreva pelo menos 3 caracteres.");
      return;
    }

    setCommentError("");
    setSending(true);

    onAddComment(game.id, {
      id: Date.now(),
      name: user ? user.name : "Visitante",
      text: comment.trim(),
      timeLabel: "agora mesmo",
    });

    setComment("");
    setSending(false);
  }

  async function handleShare() {
    const url = `${window.location.origin}/jogo/${game.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      window.prompt("Copie o link do jogo:", url);
    }

    window.setTimeout(() => setShared(false), 2000);
  }

  return (
    <main className="container detail-page">
      <Link to="/catalogo" className="back-link">
        ← Voltar para o catálogo
      </Link>

      {/* Apresentação principal */}
      <section className="detail-hero detail-hero-upgraded">
        <div className="detail-cover-column">
          <GameCover game={game} large />

          <div className="detail-cover-caption">
            <span>INDIEHUB</span>
            <span>{game.isNew ? "✦ Novo jogo" : "Jogo independente"}</span>
          </div>
        </div>

        <div className="detail-info detail-info-upgraded">
          <div className="detail-badges">
            <span className="detail-badge">{game.genre}</span>
            <span className="detail-badge">{game.type}</span>
            {game.isNew && (
              <span className="detail-badge detail-badge-new">
                NOVO
              </span>
            )}
          </div>

          <span className="eyebrow">CONHEÇA ESTE UNIVERSO</span>
          <h1>{game.title}</h1>

          <p className="developer-name">
            Desenvolvido por{" "}
            <Link to={`/estudio/${encodeURIComponent(game.developer)}`}>
              <strong>{game.developer}</strong>
            </Link>
          </p>

          <div className="detail-rating-card">
            <div className="detail-rating-stars" aria-label={`Nota ${rating.toFixed(1)} de 5`}>
              <span>★</span>
              <strong>{rating.toFixed(1)}</strong>
              <small>/ 5</small>
            </div>
            <p>Nota cadastrada para este jogo</p>
          </div>

          <div className="detail-stats detail-stats-upgraded">
            <div className="detail-stat">
              <span className="detail-stat-icon">👁</span>
              <div>
                <strong>{Number(game.views) || 0}</strong>
                <span>Visualizações</span>
              </div>
            </div>

            <div className="detail-stat">
              <span className="detail-stat-icon">♥</span>
              <div>
                <strong>{Number(game.likes) || 0}</strong>
                <span>Curtidas</span>
              </div>
            </div>

            <div className="detail-stat">
              <span className="detail-stat-icon">💬</span>
              <div>
                <strong>{comments.length}</strong>
                <span>Comentários</span>
              </div>
            </div>
          </div>

          <p className="detail-description">
            {game.description || "Nenhuma descrição foi cadastrada para este jogo."}
          </p>

          <div className="detail-actions detail-actions-upgraded">
            {game.steam && (
              <a
                className="primary-button detail-play-button"
                href={game.steam}
                target="_blank"
                rel="noreferrer"
              >
                🎮 Ver jogo ↗
              </a>
            )}

            <button
              className={`favorite-inline-btn ${isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(game.id)}
              type="button"
              aria-pressed={isFavorite}
            >
              {isFavorite ? "♥ Na sua lista" : "♡ Favoritar"}
            </button>

            <button
              className={`like-button ${isLiked ? "active" : ""}`}
              onClick={() => onToggleLike(game.id)}
              type="button"
              aria-pressed={isLiked}
            >
              {isLiked ? "❤ Curtido" : "🤍 Curtir"}
            </button>

            <button
              className="support-button"
              onClick={handleShare}
              type="button"
            >
              {shared ? "✓ Link copiado!" : "🔗 Compartilhar"}
            </button>
          </div>

          <div className="external-links detail-external-links">
            {game.steam && (
              <a href={game.steam} target="_blank" rel="noreferrer">
                Steam ↗
              </a>
            )}
            {game.github && (
              <a href={game.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
            {game.discord && (
              <a href={game.discord} target="_blank" rel="noreferrer">
                Discord ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Sobre e informações */}
      <section className="detail-about-section">
        <div className="detail-section-heading">
          <span className="eyebrow">DESCUBRA</span>
          <h2>Sobre o jogo</h2>
        </div>

        <div className="detail-about-grid">
          <article className="detail-about-card">
            <span className="detail-about-icon">📖</span>
            <h3>Descrição</h3>
            <p>{game.description || "Descrição não disponível."}</p>
          </article>

          <article className="detail-about-card">
            <span className="detail-about-icon">🎯</span>
            <h3>Gêneros e formato</h3>
            <div className="tags detail-tags">
              <span>{game.genre}</span>
              <span>{game.type}</span>
              <span>Independente</span>
            </div>
          </article>

          <article className="detail-about-card">
            <span className="detail-about-icon">🏢</span>
            <h3>Desenvolvedor</h3>
            <p>{game.developer}</p>
            <Link
              className="detail-studio-link"
              to={`/estudio/${encodeURIComponent(game.developer)}`}
            >
              Conhecer estúdio →
            </Link>
          </article>
        </div>
      </section>

      {/* Galeria */}
      <section className="gallery-section detail-gallery-upgraded">
        <span className="eyebrow">VISUAL DO JOGO</span>
        <h2>Galeria</h2>
        <p className="detail-section-description">
          Confira diferentes composições visuais deste jogo.
        </p>

        <div className="gallery-viewer">
          <div
            className="gallery-slide"
            style={{
              background: `linear-gradient(135deg, ${screenshots[screenshotIndex].colors[0]}, ${screenshots[screenshotIndex].colors[1]})`,
            }}
          >
            <span>{screenshots[screenshotIndex].label}</span>
          </div>

          <button
            className="gallery-nav gallery-prev"
            onClick={() =>
              setScreenshotIndex((index) =>
                index === 0 ? screenshots.length - 1 : index - 1
              )
            }
            type="button"
            aria-label="Captura anterior"
          >
            ‹
          </button>

          <button
            className="gallery-nav gallery-next"
            onClick={() =>
              setScreenshotIndex((index) =>
                index === screenshots.length - 1 ? 0 : index + 1
              )
            }
            type="button"
            aria-label="Próxima captura"
          >
            ›
          </button>
        </div>

        <div className="gallery-dots">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.label}
              className={`gallery-dot ${index === screenshotIndex ? "active" : ""}`}
              onClick={() => setScreenshotIndex(index)}
              type="button"
              aria-label={`Ver ${screenshot.label}`}
            />
          ))}
        </div>
      </section>

      {/* Comentários */}
      <section className="feedback-section detail-feedback-upgraded">
        <div>
          <span className="eyebrow">COMUNIDADE</span>
          <h2>Comentários</h2>
          <p>Compartilhe sua opinião sobre o jogo.</p>
        </div>

        <form className="comment-form" onSubmit={addComment} noValidate>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="O que você achou deste jogo?"
            className={commentError ? "input-error" : ""}
            maxLength={500}
            aria-label="Escreva seu comentário"
          />

          <div className="detail-comment-footer">
            <span>{comment.length}/500 caracteres</span>
            <button
              className="primary-button"
              type="submit"
              disabled={sending}
            >
              {sending ? "Enviando..." : "Enviar comentário"}
            </button>
          </div>

          {commentError && (
            <span className="field-error">{commentError}</span>
          )}
        </form>

        <div className="comments">
          {comments.length === 0 ? (
            <div className="detail-no-comments">
              <span>💬</span>
              <h3>Seja o primeiro a comentar</h3>
              <p>Seu comentário pode iniciar a conversa sobre este jogo.</p>
            </div>
          ) : (
            comments.map((item) => (
              <article className="comment" key={item.id}>
                <div className="avatar">
                  {(item.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="detail-comment-content">
                  <div className="comment-head">
                    <strong>{item.name || "Visitante"}</strong>
                    <span className="comment-time">
                      {item.timeLabel || ""}
                    </span>
                  </div>
                  <p>{item.text}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Recomendações */}
      {similarGames.length > 0 && (
        <section className="similar-section detail-similar-upgraded">
          <div className="detail-section-heading">
            <span className="eyebrow">CONTINUE EXPLORANDO</span>
            <h2>Você também pode gostar</h2>
          </div>

          <div className="game-grid">
            {similarGames.map((similarGame) => (
              <GameCard
                key={similarGame.id}
                game={similarGame}
                view="grid"
                isFavorite={favorites.includes(similarGame.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
