import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="container not-found">
      <h1>404</h1>
      <p>Essa página não existe.</p>
      <button className="primary-button" onClick={() => navigate("/")}>Voltar ao catálogo</button>
    </main>
  );
}
