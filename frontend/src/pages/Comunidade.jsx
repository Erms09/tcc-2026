import React from "react";
import { Link } from "react-router-dom";

export default function Comunidade({ activity }) {
  return (
    <main className="container simple-page">
      <span className="eyebrow">MURAL DA COMUNIDADE</span>
      <h1>O que estão dizendo.</h1>
      <p>Todos os comentários e curtidas recentes da comunidade.</p>

      <div className="activity-feed" style={{ marginTop: "35px" }}>
        {activity.map((item, index) => (
          <div className="activity-item" key={index}>
            <div className="avatar">{item.name[0]}</div>
            <p>
              <strong>{item.name}</strong>{" "}
              {item.type === "like" ? "curtiu" : "comentou em"}{" "}
              <Link to={`/jogo/${item.gameId}`}>{item.gameTitle}</Link>
              {item.text && <span className="activity-text"> — "{item.text}"</span>}
            </p>
            <span className="activity-time">{item.timeLabel}</span>
          </div>
        ))}
        {activity.length === 0 && (
          <div className="empty-state">Nenhuma atividade ainda.</div>
        )}
      </div>
    </main>
  );
}
