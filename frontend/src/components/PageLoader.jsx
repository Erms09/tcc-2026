import React from "react";

// Mostrado enquanto uma página é carregada sob demanda.
export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Carregando página">
      <span className="page-loader-spinner" />
      <span>Carregando...</span>
    </div>
  );
}
