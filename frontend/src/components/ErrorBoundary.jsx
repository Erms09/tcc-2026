import React from "react";

// Evita a tela branca: se alguma página quebrar, mostra uma mensagem
// amigável com opção de tentar de novo.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Erro na página:", error);
  }

  componentDidUpdate(previousProps) {
    // Ao trocar de página, tenta renderizar de novo.
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container error-boundary" role="alert">
          <h1>Algo deu errado.</h1>
          <p>Não foi possível carregar esta página. Tente novamente.</p>
          <div className="error-boundary-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => this.setState({ hasError: false })}
            >
              Tentar de novo
            </button>
            <a className="secondary-button" href="/catalogo">
              Ir para o catálogo
            </a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
