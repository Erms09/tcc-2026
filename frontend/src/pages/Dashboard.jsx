import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";

const PERIODS = [3, 6, 12];

// Gera os últimos meses (do mais antigo para o atual).
function getLastMonths(count) {
  const now = new Date();
  const months = [];

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      count: 0,
    });
  }

  return months;
}

function formatNumber(value) {
  return Number(value).toLocaleString("pt-BR");
}

function LineChart({ data }) {
  const width = 600;
  const height = 220;
  const pad = { top: 20, right: 24, bottom: 34, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxValue = Math.max(1, ...data.map((item) => item.count));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((item, index) => ({
    ...item,
    x: pad.left + index * stepX,
    y: pad.top + innerH - (item.count / maxValue) * innerH,
  }));

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${line} ${
    pad.left + (data.length - 1) * stepX
  },${pad.top + innerH}`;

  const ticks = [0, 0.5, 1].map((fraction) => ({
    value: Math.round(maxValue * fraction),
    y: pad.top + innerH - fraction * innerH,
  }));

  return (
    <svg
      className="dash-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Gráfico de visualizações por mês"
    >
      {ticks.map((tick) => (
        <g key={tick.y}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={tick.y}
            y2={tick.y}
            className="dash-grid"
          />
          <text x={pad.left - 8} y={tick.y + 4} className="dash-axis" textAnchor="end">
            {tick.value}
          </text>
        </g>
      ))}

      <polygon points={area} className="dash-area" />
      <polyline points={line} className="dash-line" />

      {points.map((p) => (
        <g key={p.key}>
          <circle cx={p.x} cy={p.y} r="5" className="dash-dot">
            <title>{`${p.label}: ${p.count} visualizações`}</title>
          </circle>
          <text x={p.x} y={height - 10} className="dash-axis" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard({ user, gamesData, visitHistory }) {
  const [period, setPeriod] = useState(6);
  const [selectedGame, setSelectedGame] = useState("all");

  const myGames = useMemo(
    () => gamesData.filter((game) => game.developer === user.name),
    [gamesData, user.name]
  );

  // Jogos considerados nos números e no gráfico (todos ou só o escolhido).
  const scopeGames = useMemo(
    () =>
      selectedGame === "all"
        ? myGames
        : myGames.filter((game) => String(game.id) === selectedGame),
    [myGames, selectedGame]
  );

  const stats = useMemo(() => {
    const views = scopeGames.reduce((total, g) => total + (g.views || 0), 0);
    const likes = scopeGames.reduce((total, g) => total + (g.likes || 0), 0);
    const comments = scopeGames.reduce(
      (total, g) => total + (g.comments ? g.comments.length : 0),
      0
    );
    const rated = scopeGames.filter((g) => g.rating > 0);
    const rating = rated.length
      ? rated.reduce((total, g) => total + g.rating, 0) / rated.length
      : 0;

    return { views, likes, comments, rating };
  }, [scopeGames]);

  // Visualizações por mês, a partir do histórico de visitas registrado.
  const monthly = useMemo(() => {
    const months = getLastMonths(period);
    const myIds = new Set(scopeGames.map((g) => g.id));

    visitHistory.forEach((visit) => {
      if (!myIds.has(visit.gameId)) return;
      const date = new Date(visit.visitedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((item) => item.key === key);
      if (month) month.count += 1;
    });

    return months;
  }, [scopeGames, visitHistory, period]);

  // Visitas do mês atual e jogo mais visto neste mês (todos os jogos do estúdio).
  const thisMonth = useMemo(() => {
    const now = new Date();
    const counts = {};
    let total = 0;

    visitHistory.forEach((visit) => {
      const date = new Date(visit.visitedAt);
      if (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth()
      ) {
        return;
      }

      const game = myGames.find((g) => g.id === visit.gameId);
      if (!game) return;

      counts[game.id] = (counts[game.id] || 0) + 1;
      total += 1;
    });

    const topId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const topGame = myGames.find((g) => String(g.id) === topId);

    return {
      total,
      topGame,
      topCount: topGame ? counts[topGame.id] : 0,
    };
  }, [myGames, visitHistory]);

  const monthlyTotal = monthly.reduce((total, m) => total + m.count, 0);

  const ranking = useMemo(
    () => [...myGames].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [myGames]
  );

  const maxViews = Math.max(1, ...ranking.map((g) => g.views || 0));

  return (
    <main className="container simple-page dash-page">
      <span className="eyebrow">DASHBOARD</span>
      <h1>Meu estúdio.</h1>
      <p>Acompanhe o desempenho dos jogos cadastrados como "{user.name}".</p>

      {myGames.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "35px" }}>
          Você ainda não tem jogos publicados. Cadastre o primeiro para ver
          suas métricas aqui.
          <div style={{ marginTop: "18px" }}>
            <Link to="/desenvolvedor" className="secondary-button">
              Cadastrar jogo
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="dash-filters">
            <label>
              Jogo
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="all">Todos os jogos</option>
                {myGames.map((game) => (
                  <option key={game.id} value={String(game.id)}>
                    {game.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="dash-period" role="group" aria-label="Período do gráfico">
              {PERIODS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={period === value ? "active" : ""}
                  onClick={() => setPeriod(value)}
                  aria-pressed={period === value}
                >
                  {value} meses
                </button>
              ))}
            </div>
          </div>

          <section className="dash-cards">
            <article className="dash-card">
              <span className="dash-card-label">Jogos publicados</span>
              <strong>{formatNumber(scopeGames.length)}</strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Visualizações</span>
              <strong>{formatNumber(stats.views)}</strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Curtidas</span>
              <strong>{formatNumber(stats.likes)}</strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Avaliação média</span>
              <strong>
                {stats.rating ? stats.rating.toFixed(1) : "—"}{" "}
                <span className="dash-star">★</span>
              </strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Comentários</span>
              <strong>{formatNumber(stats.comments)}</strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Visitas neste mês</span>
              <strong>{formatNumber(thisMonth.total)}</strong>
            </article>
            <article className="dash-card">
              <span className="dash-card-label">Mais visto no mês</span>
              {thisMonth.topGame ? (
                <>
                  <strong className="dash-card-text">{thisMonth.topGame.title}</strong>
                  <small>{formatNumber(thisMonth.topCount)} visitas</small>
                </>
              ) : (
                <strong>—</strong>
              )}
            </article>
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Visualizações por mês</h2>
              <span>Últimos {period} meses</span>
            </div>

            <LineChart data={monthly} />


            {monthlyTotal === 0 && (
              <p className="dash-note">
                Ainda não há visitas registradas neste período. Elas aparecem
                aqui conforme os jogos forem abertos.
              </p>
            )}
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Desempenho por jogo</h2>
              <span>Total de visualizações</span>
            </div>

            <ul className="dash-bars">
              {ranking.map((game) => (
                <li
                  key={game.id}
                  className={String(game.id) === selectedGame ? "dash-bar-selected" : ""}
                >
                  <div className="dash-bar-info">
                    <Link to={`/jogo/${game.id}`}>{game.title}</Link>
                    <span>
                      👁 {formatNumber(game.views || 0)} · ❤ {formatNumber(game.likes || 0)} · ★{" "}
                      {game.rating || "—"}
                    </span>
                  </div>
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${((game.views || 0) / maxViews) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
