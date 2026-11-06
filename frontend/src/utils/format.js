// Preço em reais. Zero ou vazio = jogo gratuito.
export function formatPrice(price) {
  const value = Number(price);
  if (!value) return "Gratuito";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
