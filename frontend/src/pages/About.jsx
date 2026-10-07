import React from "react";

export default function About() {
  return (
    <main className="container simple-page">
      <span className="eyebrow">SOBRE O PROJETO</span>
      <h1>Um espaço para dar visibilidade aos jogos indies.</h1>
      <p>
        O IndieHub é uma plataforma web de catálogo criada para auxiliar
        desenvolvedores independentes na divulgação de seus jogos,
        conectando criadores e jogadores.
      </p>
      <div className="about-grid">
        <div><b>Vitrine</b><span>Exibição de jogos com informações do projeto.</span></div>
        <div><b>Feedback</b><span>Avaliações e comentários da comunidade.</span></div>
        <div><b>Filtros</b><span>Busca por gênero, tipo e categorias.</span></div>
        <div><b>Links externos</b><span>Acesso a Steam, GitHub e Discord.</span></div>
      </div>
    </main>
  );
}
