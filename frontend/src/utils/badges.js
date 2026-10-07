export function getBadges(game) {
  const badges = [];
  if (game.likes >= 50) badges.push("⭐ 50+ curtidas");
  if (game.views >= 300) badges.push("👁 300+ visualizações");
  if (game.comments.length >= 2) badges.push("💬 Comunidade ativa");
  return badges;
}
