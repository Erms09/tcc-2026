import React from "react";
import { useApp } from "../context/AppContext";

// Mensagens rápidas de confirmação no canto da tela.
export default function Toasts() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.type}`} key={toast.id}>
          <span>{toast.type === "error" ? "⚠" : "✓"}</span>
          <p>{toast.message}</p>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => dismissToast(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
