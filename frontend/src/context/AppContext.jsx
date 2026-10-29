import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { games } from "../data";
import { PALETTES } from "../utils/palettes";
import { loadStoredState, STORAGE_KEY } from "../utils/storage";
import { cadastrarDesenvolvedor, DEVELOPER_API_ENABLED } from "../utils/api";

const AppContext = createContext(null);

// Guarda todo o estado do aplicativo (usuário, jogos, favoritos etc.)
// e as funções que o alteram. As telas pegam o que precisam com useApp().
export function AppProvider({ children }) {
  const navigate = useNavigate();

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

  // Mensagens de confirmação (toasts)
  const [toasts, setToasts] = useState([]);

  function dismissToast(id) {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }

  function showToast(message, type = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((previous) => [...previous, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3500);
  }

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

    const favoriteGame = gamesData.find((item) => item.id === id);
    showToast(
      wasFavorite
        ? `${favoriteGame ? favoriteGame.title : "Jogo"} removido dos favoritos.`
        : `${favoriteGame ? favoriteGame.title : "Jogo"} adicionado aos favoritos.`
    );

    if (!wasFavorite) {
      const game = favoriteGame;
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
    if (!compareIds.includes(id) && compareIds.length >= 3) {
      showToast("Você pode comparar até 3 jogos ao mesmo tempo.", "error");
      return;
    }

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
    showToast("Comentário publicado!");

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

    showToast("Jogo cadastrado com sucesso!");

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

  // Controla a janela "Tornar-se desenvolvedor".
  const [devModalOpen, setDevModalOpen] = useState(false);

  function openDevModal() {
    setDevModalOpen(true);
  }

  function closeDevModal() {
    setDevModalOpen(false);
  }

  // Recebe { studioName, bio }. Lança um erro com a mensagem a mostrar
  // na janela se algo falhar (ex.: back-end fora do ar).
  async function becomeDeveloper({ studioName, bio }) {
    let saved = { studioName, bio };

    if (DEVELOPER_API_ENABLED) {
      const response = await cadastrarDesenvolvedor({
        idUsuario: user?.id,
        nomeEstudio: studioName,
        bio,
      });

      // Usa o que o back-end devolveu, se vier algo.
      if (response?.desenvolvedor) {
        saved = {
          studioName: response.desenvolvedor.nome_estudio || studioName,
          bio: response.desenvolvedor.bio ?? bio,
        };
      }
    }

    setUser((previous) =>
      previous ? { ...previous, role: "desenvolvedor", ...saved } : previous
    );

    setDevModalOpen(false);
    showToast(`Bem-vindo, ${saved.studioName}! Agora você pode publicar jogos.`);

    addNotification({
      type: "game",
      title: "Você agora é desenvolvedor",
      message: `O estúdio ${saved.studioName} foi criado. Cadastre seu primeiro jogo.`,
    });

    navigate("/desenvolvedor");
  }

  const value = {
    // estado
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
    toasts,

    // ações
    setTheme,
    setTourSeen,
    setCompareIds,
    registerView,
    removeVisit,
    clearVisitHistory,
    toggleLike,
    addNotification,
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
    devModalOpen,
    openDevModal,
    closeDevModal,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp precisa ser usado dentro de <AppProvider>.");
  }

  return context;
}
