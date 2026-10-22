import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Notificacoes({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
}) {
  const [filter, setFilter] = useState("todas");
  const unreadCount = notifications.filter((item) => !item.read).length;

  const visibleNotifications = useMemo(() => {
    if (filter === "nao-lidas") return notifications.filter((item) => !item.read);
    if (filter === "lidas") return notifications.filter((item) => item.read);
    return notifications;
  }, [notifications, filter]);

  function formatDate(value) {
    if (!value) return "Agora";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível";
    return date.toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function getIcon(type) {
    const icons = {
      welcome: "👋", favorite: "❤️", comment: "💬",
      game: "🎮", achievement: "🏆", review: "⭐", system: "🔔",
    };
    return icons[type] || "🔔";
  }

  function handleClearAll() {
    if (notifications.length > 0 && window.confirm("Deseja apagar todas as notificações?")) {
      onClearAll?.();
    }
  }

  return (
    <main className="container simple-page notifications-page">
      <div className="notifications-heading">
        <div>
          <span className="eyebrow">CENTRAL DE ATIVIDADES</span>
          <h1>Notificações</h1>
          <p>Acompanhe as novidades e atividades da sua conta no IndieHub.</p>
        </div>
        <div className="notifications-counter">
          <strong>{unreadCount}</strong>
          <span>{unreadCount === 1 ? "não lida" : "não lidas"}</span>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="notifications-filters" aria-label="Filtrar notificações">
          <button className={filter === "todas" ? "active" : ""} onClick={() => setFilter("todas")} type="button">Todas</button>
          <button className={filter === "nao-lidas" ? "active" : ""} onClick={() => setFilter("nao-lidas")} type="button">Não lidas</button>
          <button className={filter === "lidas" ? "active" : ""} onClick={() => setFilter("lidas")} type="button">Lidas</button>
        </div>
        <div className="notifications-tools">
          {unreadCount > 0 && <button className="secondary-button" onClick={onMarkAllRead} type="button">Marcar todas como lidas</button>}
          {notifications.length > 0 && <button className="notification-clear" onClick={handleClearAll} type="button">Limpar tudo</button>}
        </div>
      </div>

      {visibleNotifications.length > 0 ? (
        <div className="notifications-list">
          {visibleNotifications.map((item) => (
            <article className={`notification-card ${item.read ? "is-read" : "is-unread"}`} key={item.id}>
              <div className="notification-icon" aria-hidden="true">{getIcon(item.type)}</div>
              <div className="notification-content">
                <div className="notification-title-row">
                  <h2>{item.title || "Notificação do IndieHub"}</h2>
                  {!item.read && <span className="notification-unread-dot" title="Não lida" />}
                </div>
                <p>{item.message}</p>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                {item.gameId !== undefined && item.gameId !== null && (
                  <Link className="notification-game-link" to={`/jogo/${item.gameId}`} onClick={() => onMarkRead?.(item.id)}>Ver jogo</Link>
                )}
              </div>
              <div className="notification-actions">
                {!item.read && <button type="button" onClick={() => onMarkRead?.(item.id)}>Marcar como lida</button>}
                <button type="button" className="notification-delete" onClick={() => onDelete?.(item.id)} aria-label={`Excluir notificação: ${item.title || "notificação"}`}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="notifications-empty">
          <span aria-hidden="true">🔔</span>
          <h2>{filter === "nao-lidas" ? "Tudo em dia!" : filter === "lidas" ? "Nenhuma notificação lida" : "Nenhuma notificação por aqui"}</h2>
          <p>{filter === "nao-lidas" ? "Você já conferiu todas as suas notificações." : "Quando houver novidades, elas aparecerão nesta página."}</p>
          <Link to="/catalogo" className="primary-button">Explorar catálogo</Link>
        </div>
      )}
    </main>
  );
}
