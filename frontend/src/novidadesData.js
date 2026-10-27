// Dados de exemplo da página Novidades (atualizações e eventos).
// As atualizações apontam para jogos reais do catálogo pelo gameId.

export const gameUpdates = [
  { id: 1, gameId: 1, version: "1.2.0", note: "Novo chefe, modo difícil e ajustes de desempenho.", date: "2026-10-20" },
  { id: 2, gameId: 3, version: "1.1.0", note: "Novas fases e suporte a controle.", date: "2026-10-14" },
  { id: 3, gameId: 5, version: "0.9.5", note: "Correção de bugs e balanceamento da economia.", date: "2026-10-08" },
];

export const events = [
  {
    id: 1,
    title: "IndieHub Game Jam",
    date: "2026-11-14",
    description: "48 horas para criar um jogo do zero com o tema surpresa.",
    place: "Online",
  },
  {
    id: 2,
    title: "Live com desenvolvedores indie",
    date: "2026-11-21",
    description: "Bate-papo ao vivo sobre processo criativo e publicação.",
    place: "Discord do IndieHub",
  },
  {
    id: 3,
    title: "Feira de Jogos Independentes",
    date: "2026-12-05",
    description: "Demonstrações abertas dos jogos da comunidade.",
    place: "Presencial",
  },
];
