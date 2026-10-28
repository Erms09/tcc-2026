import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { useApp } from "./context/AppContext";

import Header from "./components/Header";
import CompareBar from "./components/CompareBar";
import AssistantWidget from "./components/AssistantWidget";
import TourModal from "./components/TourModal";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import Toasts from "./components/Toasts";

import Auth from "./pages/Auth";

// As demais páginas só são baixadas quando o usuário as abre.
const Catalog = lazy(() => import("./pages/Catalog"));
const GameDetails = lazy(() => import("./pages/GameDetails"));
const Developer = lazy(() => import("./pages/Developer"));
const About = lazy(() => import("./pages/About"));
const Ranking = lazy(() => import("./pages/Ranking"));
const StudioProfile = lazy(() => import("./pages/StudioProfile"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Comunidade = lazy(() => import("./pages/Comunidade"));
const MeuPerfil = lazy(() => import("./pages/MeuPerfil"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Novidades = lazy(() => import("./pages/Novidades"));
const Comparar = lazy(() => import("./pages/Comparar"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Historico = lazy(() => import("./pages/Historico"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));

const PAGE_TITLES = {
  "/catalogo": "Catálogo",
  "/novidades": "Novidades",
  "/ranking": "Ranking",
  "/favoritos": "Favoritos",
  "/comunidade": "Comunidade",
  "/historico": "Histórico",
  "/notificacoes": "Notificações",
  "/perfil": "Meu perfil",
  "/dashboard": "Dashboard",
  "/desenvolvedor": "Cadastrar jogo",
  "/comparar": "Comparar jogos",
  "/sobre": "Sobre",
};

export default function App() {
  const location = useLocation();
  const isAuthScreen = location.pathname === "/";

  const {
    user,
    gamesData,
    visitHistory,
    notifications,
    likedIds,
    favorites,
    compareIds,
    theme,
    tourSeen,
    activity,
    setTheme,
    setTourSeen,
    setCompareIds,
    registerView,
    removeVisit,
    clearVisitHistory,
    toggleLike,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    toggleFavorite,
    toggleCompare,
    addComment,
    createGame,
    handleLogout,
    handleLogin,
    becomeDeveloper,
  } = useApp();

  // Atualiza o título da aba conforme a página.
  useEffect(() => {
    const page = PAGE_TITLES[location.pathname];
    document.title = page ? `${page} | IndieHub` : "IndieHub | Jogos Indies";
  }, [location.pathname]);

  return (
    <div className="app-shell" data-theme={theme}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

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
          unreadCount={notifications.filter((item) => !item.read).length}
        />
      )}

      <div
        className="page-fade"
        key={location.pathname}
        id="conteudo"
        tabIndex={-1}
      >
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </ErrorBoundary>
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

      <Toasts />
    </div>
  );
}

