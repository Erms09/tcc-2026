$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== IndieHub - Instalador da Funcionalidade 8 ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$appPath = Join-Path $projectRoot "frontend/src/App.jsx"
$headerPath = Join-Path $projectRoot "frontend/src/components/Header.jsx"
$cssPath = Join-Path $projectRoot "frontend/src/styles.css"
$pagePath = Join-Path $projectRoot "frontend/src/pages/Notificacoes.jsx"

foreach ($path in @($appPath, $headerPath, $cssPath)) {
    if (-not (Test-Path $path)) {
        Write-Host "Nao encontrei: $path" -ForegroundColor Red
        Write-Host "Abra o PowerShell dentro da pasta principal tcc-2026 e execute novamente."
        exit 1
    }
}

$app = Get-Content -Raw -Encoding UTF8 $appPath
$header = Get-Content -Raw -Encoding UTF8 $headerPath
$css = Get-Content -Raw -Encoding UTF8 $cssPath

if ($app.Contains('import Notificacoes from "./pages/Notificacoes";') -or $app.Contains('path="/notificacoes"')) {
    Write-Host "A funcionalidade de notificacoes parece ja estar instalada. Nao fiz alteracoes." -ForegroundColor Yellow
    exit 0
}

# Confere todos os pontos de integracao antes de alterar qualquer arquivo.
$required = @(
    'import Historico from "./pages/Historico";',
    'const [visitHistory, setVisitHistory] = useState(() =>',
    'function toggleFavorite(id) {',
    'function addComment(id, comment) {',
    'function createGame(fields) {',
    '<NavLink to="/historico">Histórico</NavLink>',
    '.history-page {'
)
foreach ($needle in $required) {
    if (-not ($app + "`n" + $header + "`n" + $css).Contains($needle)) {
        Write-Host "Nao encontrei um trecho esperado do projeto: $needle" -ForegroundColor Red
        Write-Host "Nenhum arquivo foi alterado. Envie esta mensagem para o ChatGPT."
        exit 1
    }
}

# Faz backup dos arquivos antes de escrever.
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item $appPath "$appPath.bak-$stamp"
Copy-Item $headerPath "$headerPath.bak-$stamp"
Copy-Item $cssPath "$cssPath.bak-$stamp"
if (Test-Path $pagePath) { Copy-Item $pagePath "$pagePath.bak-$stamp" }

$page = @'
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
'@

# Integra o componente e o estado no App.
$app = $app.Replace('import Historico from "./pages/Historico";', 'import Historico from "./pages/Historico";' + "`r`n" + 'import Notificacoes from "./pages/Notificacoes";')

$statePattern = '(?s)(  const \[visitHistory, setVisitHistory\] = useState\(\(\) =>\s*stored \? stored\.visitHistory \|\| \[\] : \[\]\s*\);)'
$stateAddition = @'

  const [notifications, setNotifications] = useState(() =>
    stored?.notifications || [
      {
        id: "welcome-indiehub",
        type: "welcome",
        title: "Bem-vindo ao IndieHub!",
        message: "Explore jogos independentes, conheça estúdios e descubra novas aventuras.",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]
  );
'@
$app = [regex]::Replace($app, $statePattern, [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    return $m.Groups[1].Value + $stateAddition
}, 1)
if (-not $app.Contains('stored?.notifications')) { throw "Falha ao adicionar estado das notificacoes." }

$app = $app.Replace("      visitHistory,`r`n      likedIds,", "      visitHistory,`r`n      notifications,`r`n      likedIds,")
$app = $app.Replace("    visitHistory,`r`n    likedIds,", "    visitHistory,`r`n    notifications,`r`n    likedIds,")
# Compatibilidade com finais de linha LF.
$app = $app.Replace("      visitHistory,`n      likedIds,", "      visitHistory,`n      notifications,`n      likedIds,")
$app = $app.Replace("    visitHistory,`n    likedIds,", "    visitHistory,`n    notifications,`n    likedIds,")

$favoritePattern = '(?s)function\s+toggleFavorite\s*\(\s*id\s*\)\s*\{.*?\r?\n\s*\}'
$newFavorite = @'
  function addNotification(notification) {
    setNotifications((previous) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...notification,
      },
      ...previous,
    ]);
  }

  function markNotificationRead(id) {
    setNotifications((previous) =>
      previous.map((item) => item.id === id ? { ...item, read: true } : item)
    );
  }

  function markAllNotificationsRead() {
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
  }

  function deleteNotification(id) {
    setNotifications((previous) => previous.filter((item) => item.id !== id));
  }

  function clearNotifications() {
    setNotifications([]);
  }

  function toggleFavorite(id) {
    const wasFavorite = favorites.includes(id);
    setFavorites((previous) =>
      wasFavorite ? previous.filter((item) => item !== id) : [...previous, id]
    );

    if (!wasFavorite) {
      const game = gamesData.find((item) => item.id === id);
      if (game) {
        addNotification({
          type: "favorite",
          title: "Jogo adicionado aos favoritos",
          message: `${game.title} agora está na sua lista de favoritos.`,
          gameId: game.id,
        });
      }
    }
  }
'@
$app = [regex]::Replace($app, $favoritePattern, $newFavorite, 1)
if ($app -notmatch 'function\s+addNotification\s*\(\s*notification\s*\)') { throw "Nao consegui substituir toggleFavorite. Nenhum arquivo foi gravado." }

$commentPattern = '(?s)  function addComment\(id, comment\) \{.*?\r?\n  \}'
$commentReplacement = @'
  function addComment(id, comment) {
    setGamesData((previous) =>
      previous.map((game) =>
        game.id === id
          ? { ...game, comments: [...game.comments, comment] }
          : game
      )
    );

    const game = gamesData.find((item) => item.id === id);

    if (game) {
      setActivity((previous) => [
        {
          type: "comment",
          name: comment.name,
          text: comment.text,
          gameId: game.id,
          gameTitle: game.title,
          timeLabel: comment.timeLabel,
        },
        ...previous,
      ]);

      addNotification({
        type: "comment",
        title: "Comentário publicado",
        message: `Seu comentário em ${game.title} foi publicado.`,
        gameId: game.id,
      });
    }
  }
'@
$app = [regex]::Replace($app, $commentPattern, $commentReplacement, 1)
if (-not $app.Contains("Seu comentário em")) { throw "Nao consegui integrar notificacoes de comentarios. Nenhum arquivo foi gravado." }

$createPattern = '(?s)  function createGame\(fields\) \{.*?\r?\n  \}'
$createReplacement = @'
  function createGame(fields) {
    const newId = Math.max(0, ...gamesData.map((game) => game.id)) + 1;
    const palette = PALETTES[newId % PALETTES.length];

    setGamesData((previous) => [
      ...previous,
      {
        id: newId,
        ...fields,
        rating: 0,
        isNew: true,
        colors: palette,
        views: 0,
        likes: 0,
        comments: [],
      },
    ]);

    addNotification({
      type: "game",
      title: "Jogo publicado no IndieHub",
      message: `${fields.title || "Seu novo jogo"} foi adicionado ao catálogo.`,
      gameId: newId,
    });
  }
'@
$app = [regex]::Replace($app, $createPattern, $createReplacement, 1)
if (-not $app.Contains("Jogo publicado no IndieHub")) { throw "Nao consegui atualizar createGame. Nenhum arquivo foi gravado." }

$routePattern = '(?s)(          <Route\s+path="/historico"\s+element=\{\s*<Historico\s+visitHistory=\{visitHistory\}\s+onRemoveVisit=\{removeVisit\}\s+onClearHistory=\{clearVisitHistory\}\s*/>\s*\}\s*/>)'
$routeReplacement = '$1' + "`r`n`r`n" + @'
          <Route
            path="/notificacoes"
            element={
              <Notificacoes
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onDelete={deleteNotification}
                onClearAll={clearNotifications}
              />
            }
          />
'@
$app = [regex]::Replace($app, $routePattern, $routeReplacement, 1)
if (-not $app.Contains('path="/notificacoes"')) { throw "Nao consegui adicionar a rota. Nenhum arquivo foi gravado." }

$header = $header.Replace('        <NavLink to="/historico">Histórico</NavLink>', '        <NavLink to="/historico">Histórico</NavLink>' + "`r`n" + '        <NavLink to="/notificacoes">Notificações</NavLink>')
if (-not $header.Contains('to="/notificacoes"')) { throw "Nao consegui adicionar o link no menu. Nenhum arquivo foi gravado." }

if (-not $css.Contains(".notifications-page")) {
$css += @'

/* Central de notificações */
.notifications-page { width: min(1100px, 88%); margin: 0 auto; padding: 42px 0 85px; }
.notifications-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 30px; }
.notifications-heading h1 { margin: 10px 0; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -.04em; }
.notifications-heading p { margin: 0; color: var(--muted); line-height: 1.65; }
.notifications-counter { min-width: 100px; display: grid; justify-items: center; gap: 4px; padding: 17px 22px; border: 1px solid var(--border); background: var(--panel); border-radius: 14px; }
.notifications-counter strong { color: #d8b4fe; font-size: 1.8rem; }
.notifications-counter span { color: var(--muted); font-size: .78rem; }
.notifications-toolbar, .notifications-filters, .notifications-tools { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.notifications-toolbar { padding-bottom: 18px; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
.notifications-filters button, .notification-clear { background: transparent; border: 1px solid var(--border); border-radius: 9px; color: var(--muted); padding: 9px 13px; font-weight: 750; cursor: pointer; }
.notifications-filters button.active, .notifications-filters button:hover, .notification-clear:hover { border-color: var(--accent); color: var(--white); }
.notifications-tools .secondary-button { padding: 9px 13px; font-size: .8rem; }
.notifications-list { display: grid; gap: 12px; }
.notification-card { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: start; gap: 15px; padding: 20px; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; transition: border-color .2s ease, background .2s ease; }
.notification-card.is-unread { border-color: rgba(168, 85, 247, .55); background: linear-gradient(100deg, rgba(168, 85, 247, .08), var(--panel) 55%); }
.notification-icon { width: 46px; height: 46px; display: grid; place-items: center; border-radius: 13px; background: var(--panel-2); font-size: 1.25rem; }
.notification-content { min-width: 0; }
.notification-title-row { display: flex; align-items: center; gap: 10px; }
.notification-title-row h2 { margin: 1px 0 8px; font-size: 1rem; }
.notification-content p { color: var(--muted); line-height: 1.6; margin: 0 0 10px; font-size: .9rem; }
.notification-content time { color: var(--muted); font-size: .75rem; }
.notification-unread-dot { flex-shrink: 0; width: 8px; height: 8px; background: #c084fc; border-radius: 50%; margin-top: -6px; }
.notification-game-link { display: inline-block; margin-left: 14px; color: #d8b4fe; font-size: .8rem; font-weight: 800; }
.notification-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.notification-actions button { background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); padding: 7px 9px; font-size: .75rem; font-weight: 750; white-space: nowrap; cursor: pointer; }
.notification-actions button:hover { border-color: var(--accent); color: var(--white); }
.notification-actions .notification-delete:hover { border-color: #f87171; color: #fca5a5; }
.notifications-empty { text-align: center; padding: 55px 20px; background: var(--panel); border: 1px dashed var(--border); border-radius: 16px; }
.notifications-empty > span { font-size: 2.2rem; }
.notifications-empty h2 { margin: 15px 0 8px; }
.notifications-empty p { color: var(--muted); margin: 0 0 22px; line-height: 1.6; }
@media (max-width: 650px) {
  .notifications-heading { align-items: flex-start; }
  .notifications-counter { min-width: 75px; padding: 12px; }
  .notification-card { grid-template-columns: 42px minmax(0, 1fr); padding: 15px; gap: 12px; }
  .notification-icon { width: 42px; height: 42px; }
  .notification-actions { grid-column: 2; flex-direction: row; flex-wrap: wrap; align-items: flex-start; }
}
@media (max-width: 450px) {
  .notifications-heading { flex-direction: column; }
  .notifications-toolbar { align-items: flex-start; flex-direction: column; }
  .notifications-tools { justify-content: flex-start; }
}
'@
}

# Só grava depois de preparar e validar todas as alterações em memória.
Set-Content -Path $pagePath -Value $page -Encoding UTF8
Set-Content -Path $appPath -Value $app -Encoding UTF8
Set-Content -Path $headerPath -Value $header -Encoding UTF8
Set-Content -Path $cssPath -Value $css -Encoding UTF8

Write-Host ""
Write-Host "Pronto! A funcionalidade 8 foi instalada nos arquivos locais." -ForegroundColor Green
Write-Host "Arquivos atualizados:"
Write-Host " - frontend/src/pages/Notificacoes.jsx"
Write-Host " - frontend/src/App.jsx"
Write-Host " - frontend/src/components/Header.jsx"
Write-Host " - frontend/src/styles.css"
Write-Host ""
Write-Host "Backups dos arquivos anteriores foram criados com a extensao .bak-$stamp"
Write-Host "Agora execute npm run dev dentro da pasta frontend para testar."
Write-Host ""
Read-Host "Pressione Enter para fechar"
