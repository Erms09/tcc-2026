
import React from "react";
import { Link } from "react-router-dom";

export default function Historico({
  visitHistory = [],
  onRemoveVisit,
  onClearHistory,
}) {
  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Data indisponível";
    }

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="history-page">
      <div className="history-heading">
        <div>
          <p className="eyebrow">SUA ATIVIDADE</p>
          <h1>Histórico de visitas</h1>
          <p>Consulte os jogos que você acessou e quando visitou cada um.</p>
        </div>

        {visitHistory.length > 0 && (
          <button type="button" onClick={onClearHistory}>
            Limpar histórico
          </button>
        )}
      </div>

      {visitHistory.length === 0 ? (
        <section className="history-empty">
          <h2>Nenhuma visita por enquanto</h2>
          <p>
            Quando você abrir os detalhes de um jogo, a visita aparecerá aqui.
          </p>
          <Link to="/catalogo">Explorar catálogo</Link>
        </section>
      ) : (
        <section className="history-list">
          {visitHistory.map((visit) => (
            <article className="history-item" key={visit.id}>
              <div>
                <Link to={`/jogo/${visit.gameId}`}>
                  {visit.gameTitle}
                </Link>
                <p>Visitado em {formatDate(visit.visitedAt)}</p>
              </div>

              <button
                type="button"
                aria-label={`Remover visita de ${visit.gameTitle}`}
                onClick={() => onRemoveVisit(visit.id)}
              >
                Excluir
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
