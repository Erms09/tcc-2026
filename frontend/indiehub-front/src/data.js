export const games = [
  {
    id: 1,
    title: "Neon Hollow",
    developer: "Pixel Forge",
    genre: "Ação",
    type: "2D",
    rating: 4.8,
    isNew: true,
    description: "Explore uma cidade neon tomada por criaturas e descubra o que aconteceu com seus habitantes.",
    colors: ["#6d28d9", "#ec4899"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 412,
    likes: 58,
    comments: [
      { id: 1, name: "Lucas", text: "A proposta do jogo é muito boa!", timeLabel: "há 2 dias" },
      { id: 2, name: "Ana", text: "Gostei bastante do visual.", timeLabel: "há 1 dia" }
    ]
  },
  {
    id: 2,
    title: "Forestbound",
    developer: "Wild Byte",
    genre: "Aventura",
    type: "3D",
    rating: 4.6,
    isNew: false,
    description: "Uma aventura independente em uma floresta misteriosa cheia de segredos.",
    colors: ["#14532d", "#22c55e"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 289,
    likes: 34,
    comments: [
      { id: 1, name: "Marcos", text: "A trilha sonora combina muito com a floresta.", timeLabel: "há 3 dias" }
    ]
  },
  {
    id: 3,
    title: "Starfall",
    developer: "Orbit Games",
    genre: "RPG",
    type: "2D",
    rating: 4.9,
    isNew: false,
    description: "Viaje por planetas desconhecidos e construa sua própria história entre as estrelas.",
    colors: ["#0f172a", "#2563eb"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 530,
    likes: 71,
    comments: [
      { id: 1, name: "Bia", text: "Melhor RPG indie que joguei esse ano.", timeLabel: "há 5 horas" },
      { id: 2, name: "Rafa", text: "A exploração espacial é incrível.", timeLabel: "há 1 dia" }
    ]
  },
  {
    id: 4,
    title: "Dead Signal",
    developer: "Night Owl Studio",
    genre: "Terror",
    type: "3D",
    rating: 4.5,
    isNew: true,
    description: "Um sinal misterioso leva você a uma estação abandonada onde nada é o que parece.",
    colors: ["#18181b", "#dc2626"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 198,
    likes: 22,
    comments: []
  },
  {
    id: 5,
    title: "Tiny Kingdom",
    developer: "Mango Dev",
    genre: "Estratégia",
    type: "2D",
    rating: 4.4,
    isNew: false,
    description: "Construa seu pequeno reino, administre recursos e enfrente desafios.",
    colors: ["#92400e", "#f59e0b"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 145,
    likes: 15,
    comments: [
      { id: 1, name: "Duda", text: "Viciante, joguei o dia todo sem perceber.", timeLabel: "há 4 dias" }
    ]
  },
  {
    id: 6,
    title: "Driftline",
    developer: "Turbo Cat",
    genre: "Corrida",
    type: "3D",
    rating: 4.7,
    isNew: false,
    description: "Corridas rápidas, pistas estilizadas e muita liberdade para personalizar seu carro.",
    colors: ["#164e63", "#06b6d4"],
    steam: "https://store.steampowered.com/",
    github: "https://github.com/",
    discord: "https://discord.com/",
    views: 267,
    likes: 40,
    comments: []
  }
];

export const genres = ["Todos", "Ação", "Aventura", "RPG", "Terror", "Estratégia", "Corrida"];
export const types = ["Todos", "2D", "3D"];