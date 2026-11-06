// Os jogos agora são cadastrados pelos desenvolvedores (e, no futuro, virão do back-end).
// Cada jogo segue este formato:
// {
//   id, title, developer, genre, type, description,
//   steam, github, discord,
//   rating, views, likes, isNew, colors, comments: []
// }
export const games = [];

export const genres = ["Todos", "Ação", "Aventura", "RPG", "Terror", "Estratégia", "Corrida"];
export const types = ["Todos", "2D", "3D"];

// Ids dos gêneros na tabela do banco (o back-end pede `id_genero` ao cadastrar um jogo).
// TODO: preencher com os ids reais quando a integração dos jogos for ligada.
export const GENRE_IDS = {
  "Ação": null,
  "Aventura": null,
  "RPG": null,
  "Terror": null,
  "Estratégia": null,
  "Corrida": null,
};
