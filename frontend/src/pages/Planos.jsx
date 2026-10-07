import React from "react";

export default function Planos() {
  const plans = [
    {
      name: "Grátis",
      price: "R$ 0",
      features: ["Cadastro de jogos ilimitado", "Estatísticas básicas", "Perfil de estúdio público"]
    },
    {
      name: "Pro",
      price: "R$ 29/mês",
      features: ["Tudo do Grátis", "Estatísticas detalhadas", "Selo de verificado", "Suporte prioritário"],
      highlight: true
    },
    {
      name: "Destaque",
      price: "R$ 79/mês",
      features: ["Tudo do Pro", "Destaque garantido na home", "Divulgação nas redes do IndieHub"]
    }
  ];

  return (
    <main className="container simple-page">
      <span className="eyebrow">PLANOS PARA DESENVOLVEDORES</span>
      <h1>Escolha como divulgar seu jogo.</h1>
      <p>Modo demonstração — nenhum pagamento é processado.</p>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div className={`plan-card ${plan.highlight ? "highlight" : ""}`} key={plan.name}>
            {plan.highlight && <span className="plan-tag">Mais popular</span>}
            <h3>{plan.name}</h3>
            <div className="plan-price">{plan.price}</div>
            <ul>
              {plan.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button className={plan.highlight ? "primary-button" : "secondary-button"} type="button">
              {plan.name === "Grátis" ? "Plano atual" : "Assinar (demo)"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
