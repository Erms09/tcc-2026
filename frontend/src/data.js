// Os jogos vêm do back-end (GET /jogos). Esta lista só serve de reserva sem servidor.
// Cada jogo segue este formato:
// {
//   id, title, developer, genre, type, description,
//   steam, github, discord,
//   rating, views, likes, isNew, colors, comments: []
// }
export const games = [];

// Gêneros de reserva: com o servidor ligado, a lista vem do banco (GET /generos).
export const genres = ["Todos", "Ação", "Aventura", "RPG", "Terror", "Estratégia", "Corrida"];
export const types = ["Todos", "2D", "3D"];
