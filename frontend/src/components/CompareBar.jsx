import React from "react";
import { Link } from "react-router-dom";

export default function CompareBar({ compareIds, onClear }) {
  if (compareIds.length === 0) return null;
  return (
    <div className="compare-bar">
      <span>{compareIds.length} jogo(s) selecionado(s) para comparar</span>
      <div className="compare-bar-actions">
        <Link to="/comparar" className="primary-button">Comparar</Link>
        <button className="secondary-button" onClick={onClear} type="button">Limpar</button>
      </div>
    </div>
  );
}
