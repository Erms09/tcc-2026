
import React, { useMemo, useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import { games } from "./data";

import Header from "./components/Header";
import CompareBar from "./components/CompareBar";
import AssistantWidget from "./components/AssistantWidget";
import TourModal from "./components/TourModal";

import Catalog from "./pages/Catalog";
import GameDetails from "./pages/GameDetails";
import Developer from "./pages/Developer";
import About from "./pages/About";
import Ranking from "./pages/Ranking";
import StudioProfile from "./pages/StudioProfile";
import Favoritos from "./pages/Favoritos";
import Comunidade from "./pages/Comunidade";
import MeuPerfil from "./pages/MeuPerfil";
import Dashboard from "./pages/Dashboard";
import Novidades from "./pages/Novidades";
import Comparar from "./pages/Comparar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Historico from "./pages/Historico";
import Notificacoes from "./pages/Notificacoes";

import { PALETTES } from "./utils/palettes";
import { loadStoredState, STORAGE_KEY } from "./utils/storage";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthScreen = location.pathname === "/";

  const stored = useMemo(() => loadStoredState(), []);

  const [user, setUser] = useState(() =>
    stored ? stored.user : null
  );

  const [gamesData, setGamesData] = useState(() =>
    stored ? stored.gamesData : games.map((g) => ({ ...g }))
  );

  const [visitedIds, setVisitedIds] = useState(() =>
    stored ? stored.visitedIds || [] : []
  );

  const [visitHistory, setVisitHistory] = useState(() =>
    stored ? stored.visitHistory || [] : []
  );
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

  const [likedIds, setLikedIds] = useState(() =>
    stored ? stored.likedIds : []
  );

  const [favorites, setFavorites] = useState(() =>
    stored ? stored.favorites : []
  );

  const [compareIds, setCompareIds] = useState(() =>
    stored ? stored.compareIds : []
  );

  const [theme, setTheme] = useState(() =>
    stored ? stored.theme : "dark"
  );

  const [tourSeen, setTourSeen] = useState(() =>
    stored ? stored.tourSeen : false
  );

  const [activity, setActivity] = useState(() => {
    if (stored) return stored.activity;

    const seeded = [];

    games.forEach((game) => {
      game.comments.forEach((comment) => {
        seeded.push({
          type: "comment",
          name: comment.name,
          text: comment.text,
          gameId: game.id,
          gameTitle: game.title,
          timeLabel: comment.timeLabel,
        });
      });
    });

    return seeded;
  });

  // Salva os dados do projeto no navegador.
  useEffect(() => {
    const snapshot = {
      user,
      gamesData,
      visitedIds,
      visitHistory,
      notifications,
      likedIds,
      favorites,
      compareIds,
      theme,
      tourSeen,
      activity,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // O aplicativo continua funcionando se o armazenamento falhar.
    }
  }, [
    user,
    gamesData,
    visitedIds,
    visitHistory,
    notifications,
    likedIds,
    favorites,
    compareIds,
    theme,
    tourSeen,
    activity,
  ]);

  // Registra cada visita aos detalhes de um jogo.
  function registerView(id) {
    const game = gamesData.find(
      (item) => String(item.id) === String(id)
    );

    if (!game) return;

    const visit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameId: game.id,
      gameTitle: game.title,
      visitedAt: new Date().toISOString(),
    };

    setVisitHistory((previous) => [visit, ...previous]);

    setVisitedIds((previous) =>
      previous.includes(game.id)
        ? previous
        : [...previous, game.id]
    );

    setGamesData((previous) =>
      previous.map((item) =>
        String(item.id) === String(id)
          ? { ...item, views: (item.views || 0) + 1 }
          : item
      )
    );
  }

  // Remove uma visita do histórico.
  function removeVisit(visitId) {
    setVisitHistory((previous) =>
      previous.filter((visit) => visit.id !== visitId)
    );
  }

  // Apaga todas as visitas registradas.
  function clearVisitHistory() {
    setVisitHistory([]);
  }

  function toggleLike(id) {
    const alreadyLiked = likedIds.includes(id);

    setLikedIds((previous) =>
      alreadyLiked
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

    setGamesData((previous) =>
      previous.map((game) =>
        game.id === id
          ? {
              ...game,
              likes: game.likes + (alreadyLiked ? -1 : 1),
            }
          : game
      )
    );

    if (!alreadyLiked) {
      const game = gamesData.find((item) => item.id === id);

      if (game && user) {
        setActivity((previous) => [
          {
            type: "like",
            name: user.name,
            gameId: game.id,
            gameTitle: game.title,
            timeLabel: "agora mesmo",
          },
          ...previous,
        ]);
      }
    }
  }

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

  function toggleCompare(id) {
    setCompareIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      if (previous.length >= 3) return previous;

      return [...previous, id];
    });
  }

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

  function handleLogout() {
    setUser(null);
    navigate("/");
  }

  function handleLogin(userData) {
    setUser(userData);
    setTourSeen(false);
  }

  function becomeDeveloper() {
    setUser((previous) =>
      previous
        ? { ...previous, role: "desenvolvedor" }
        : previous
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {!isAuthScreen && (
        <Header
          user={user}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() =>
            setTheme((current) =>
              current === "dark" ? "light" : "dark"
            )
          }
          onBecomeDeveloper={becomeDeveloper}
        />
      )}

      <div className="page-fade" key={location.pathname}>
        <Routes>
          <Route
            path="/"
            element={<Auth onLogin={handleLogin} />}
          />

          <Route
            path="/catalogo"
            element={
              <Catalog
                gamesData={gamesData}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            }
          />

          <Route
            path="/jogo/:id"
            element={
              <GameDetails
                gamesData={gamesData}
                likedIds={likedIds}
                onToggleLike={toggleLike}
                onRegisterView={registerView}
                onAddComment={addComment}
                user={user}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          <Route
            path="/novidades"
            element={
              <Novidades
                gamesData={gamesData}
                activity={activity}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          <Route
            path="/ranking"
            element={<Ranking gamesData={gamesData} />}
          />

          <Route
            path="/historico"
            element={
              <Historico
                visitHistory={visitHistory}
                onRemoveVisit={removeVisit}
                onClearHistory={clearVisitHistory}
              />
            }
          />

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

          <Route
            path="/estudio/:name"
            element={
              <StudioProfile
                gamesData={gamesData}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          <Route
            path="/favoritos"
            element={
              <Favoritos
                gamesData={gamesData}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          <Route
            path="/comunidade"
            element={<Comunidade activity={activity} />}
          />

          <Route
            path="/perfil"
            element={
              user?.role === "jogador" ? (
                <MeuPerfil
                  user={user}
                  gamesData={gamesData}
                  favorites={favorites}
                  likedIds={likedIds}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <Navigate to="/catalogo" replace />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              user?.role === "desenvolvedor" ? (
                <Dashboard
                  user={user}
                  gamesData={gamesData}
                  visitHistory={visitHistory}
                />
              ) : (
                <Navigate to="/catalogo" replace />
              )
            }
          />

          <Route
            path="/comparar"
            element={
              <Comparar
                gamesData={gamesData}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            }
          />

          <Route
            path="/desenvolvedor"
            element={
              user?.role === "desenvolvedor" ? (
                <Developer
                  onCreateGame={createGame}
                  currentUserName={user.name}
                />
              ) : (
                <Navigate to="/catalogo" replace />
              )
            }
          />

          <Route path="/sobre" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAuthScreen && user && (
        <CompareBar
          compareIds={compareIds}
          onClear={() => setCompareIds([])}
        />
      )}

      {!isAuthScreen && user && (
        <AssistantWidget
          gamesData={gamesData}
          favorites={favorites}
          likedIds={likedIds}
        />
      )}

      {!isAuthScreen && user && !tourSeen && (
        <TourModal onClose={() => setTourSeen(true)} />
      )}
    </div>
  );
}

