export const STORAGE_KEY = "indiehub-state-v2";
const OLD_STORAGE_KEY = "indiehub-state-v1";

// Valores iniciais de tudo que é guardado no navegador.
const EMPTY_STATE = {
  user: null,
  gamesData: [],
  visitedIds: [],
  visitHistory: [],
  notifications: [],
  likedIds: [],
  favorites: [],
  compareIds: [],
  theme: "dark",
  tourSeen: false,
  activity: [],
};

function readKey(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function loadStoredState() {
  try {
    const current = readKey(STORAGE_KEY);
    if (current) return { ...EMPTY_STATE, ...current };

    // Migração: a versão antiga trazia jogos de exemplo. Mantém só o login
    // e as preferências, e descarta o restante.
    const old = readKey(OLD_STORAGE_KEY);
    if (old) {
      localStorage.removeItem(OLD_STORAGE_KEY);
      return {
        ...EMPTY_STATE,
        user: old.user || null,
        theme: old.theme || "dark",
        tourSeen: Boolean(old.tourSeen),
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Estúdio e bio de cada desenvolvedor, guardados por id de usuário.
// Enquanto o login não devolver esses dados, é isso que faz o desenvolvedor
// continuar sendo desenvolvedor depois de sair e entrar de novo.
const DEV_PROFILES_KEY = "indiehub-dev-profiles-v1";

export function loadDevProfile(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(DEV_PROFILES_KEY) || "{}");
    return all[userId] || null;
  } catch {
    return null;
  }
}

export function saveDevProfile(userId, profile) {
  try {
    const all = JSON.parse(localStorage.getItem(DEV_PROFILES_KEY) || "{}");
    all[userId] = profile;
    localStorage.setItem(DEV_PROFILES_KEY, JSON.stringify(all));
  } catch {
    // sem espaço ou bloqueado: segue sem guardar
  }
}
