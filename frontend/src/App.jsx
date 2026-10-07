import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
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
import MeusJogos from "./pages/MeusJogos";
import Planos from "./pages/Planos";
import Comparar from "./pages/Comparar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { PALETTES } from "./utils/palettes";
import { loadStoredState, STORAGE_KEY } from "./utils/storage";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthScreen = location.pathname === "/";

  const stored = useMemo(() => loadStoredState(), []);

  const [user, setUser] = useState(() => (stored ? stored.user : null));
  const [gamesData, setGamesData] = useState(() =>
    stored ? stored.gamesData : games.map((g) => ({ ...g }))
  );
  const [visitedIds, setVisitedIds] = useState(() => (stored ? stored.visitedIds : []));
  const [likedIds, setLikedIds] = useState(() => (stored ? stored.likedIds : []));
  const [favorites, setFavorites] = useState(() => (stored ? stored.favorites : []));
  const [compareIds, setCompareIds] = useState(() => (stored ? stored.compareIds : []));
  const [theme, setTheme] = useState(() => (stored ? stored.theme : "dark"));
  const [tourSeen, setTourSeen] = useState(() => (stored ? stored.tourSeen : false));
  const [activity, setActivity] = useState(() => {
    if (stored) return stored.activity;
    const seeded = [];
    games.forEach((g) => {
      g.comments.forEach((c) => {
        seeded.push({ type: "comment", name: c.name, text: c.text, gameId: g.id, gameTitle: g.title, timeLabel: c.timeLabel });
      });
    });
    return seeded;
  });

  useEffect(() => {
    const snapshot = {
      user, gamesData, visitedIds, likedIds, favorites,
      compareIds, theme, tourSeen, activity
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // localStorage indisponível (ex.: modo privado) — segue sem persistir
    }
  }, [user, gamesData, visitedIds, likedIds, favorites, compareIds, theme, tourSeen, activity]);

  function registerView(id) {
    if (visitedIds.includes(id)) return;
    setVisitedIds((prev) => [...prev, id]);
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, views: g.views + 1 } : g))
    );
  }

  function toggleLike(id) {
    const alreadyLiked = likedIds.includes(id);
    setLikedIds((prev) =>
      alreadyLiked ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, likes: g.likes + (alreadyLiked ? -1 : 1) } : g))
    );
    if (!alreadyLiked) {
      const game = gamesData.find((g) => g.id === id);
      if (game && user) {
        setActivity((prev) => [
          { type: "like", name: user.name, gameId: game.id, gameTitle: game.title, timeLabel: "agora mesmo" },
          ...prev
        ]);
      }
    }
  }

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function addComment(id, comment) {
    setGamesData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, comments: [...g.comments, comment] } : g))
    );
    const game = gamesData.find((g) => g.id === id);
    if (game) {
      setActivity((prev) => [
        { type: "comment", name: comment.name, text: comment.text, gameId: game.id, gameTitle: game.title, timeLabel: comment.timeLabel },
        ...prev
      ]);
    }
  }

  function createGame(fields) {
    setGamesData((prev) => {
      const newId = Math.max(0, ...prev.map((g) => g.id)) + 1;
      const palette = PALETTES[newId % PALETTES.length];
      return [
        ...prev,
        {
          id: newId,
          ...fields,
          rating: 0,
          isNew: true,
          colors: palette,
          views: 0,
          likes: 0,
          comments: []
        }
      ];
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
    setUser((prev) => (prev ? { ...prev, role: "desenvolvedor" } : prev));
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {!isAuthScreen && (
        <Header
          user={user}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onBecomeDeveloper={becomeDeveloper}
        />
      )}
      <div className="page-fade" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Auth onLogin={handleLogin} />} />
          <Route
            path="/catalogo"
            element={
              <Catalog
                gamesData={gamesData}
                activity={activity}
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
          <Route path="/ranking" element={<Ranking gamesData={gamesData} />} />
          <Route path="/estudio/:name" element={<StudioProfile gamesData={gamesData} />} />
          <Route
            path="/favoritos"
            element={<Favoritos gamesData={gamesData} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          />
          <Route path="/comunidade" element={<Comunidade activity={activity} />} />
          <Route
            path="/perfil"
            element={
              user?.role === "jogador"
                ? <MeuPerfil user={user} gamesData={gamesData} favorites={favorites} likedIds={likedIds} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route
            path="/meus-jogos"
            element={
              user?.role === "desenvolvedor"
                ? <MeusJogos user={user} gamesData={gamesData} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route
            path="/planos"
            element={user?.role === "desenvolvedor" ? <Planos /> : <Navigate to="/catalogo" replace />}
          />
          <Route
            path="/comparar"
            element={<Comparar gamesData={gamesData} compareIds={compareIds} onToggleCompare={toggleCompare} />}
          />
          <Route
            path="/desenvolvedor"
            element={
              user?.role === "desenvolvedor"
                ? <Developer onCreateGame={createGame} currentUserName={user.name} />
                : <Navigate to="/catalogo" replace />
            }
          />
          <Route path="/sobre" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAuthScreen && user && <CompareBar compareIds={compareIds} onClear={() => setCompareIds([])} />}
      {!isAuthScreen && user && <AssistantWidget gamesData={gamesData} favorites={favorites} likedIds={likedIds} />}
      {!isAuthScreen && user && !tourSeen && <TourModal onClose={() => setTourSeen(true)} />}
    </div>
  );
}