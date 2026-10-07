import React, { useState } from "react";

export default function TourModal({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Bem-vindo ao IndieHub!", text: "Vamos mostrar rapidinho os principais recursos da plataforma." },
    { title: "Favorite e curta jogos", text: "Use o ♡ nos cards para favoritar, e o botão \"Curtir\" na página do jogo." },
    { title: "Ranking e destaques", text: "Confira o Ranking e os Destaques da semana para ver os jogos mais populares." },
    { title: "Compare jogos", text: "Clique no ícone ⇄ em até 3 cards para comparar lado a lado." }
  ];
  const isLast = step === steps.length - 1;

  return (
    <div className="tour-overlay">
      <div className="tour-modal">
        <h3>{steps[step].title}</h3>
        <p>{steps[step].text}</p>
        <div className="tour-dots">
          {steps.map((_, i) => (
            <span key={i} className={`tour-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
        <div className="tour-actions">
          <button className="secondary-button" onClick={onClose} type="button">Pular</button>
          <button
            className="primary-button"
            type="button"
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
          >
            {isLast ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
