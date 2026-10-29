import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import "./become-developer.css";

const NAME_MIN = 2;
const NAME_MAX = 40;
const BIO_MIN = 10;
const BIO_MAX = 280;

// Janela que pede o nome do estúdio e a bio quando o jogador
// clica em "Tornar-se desenvolvedor".
export default function BecomeDeveloperModal() {
  const { devModalOpen, closeDevModal, becomeDeveloper } = useApp();

  const [studioName, setStudioName] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef(null);

  // Ao abrir: limpa o formulário e foca no primeiro campo.
  useEffect(() => {
    if (!devModalOpen) return;

    setStudioName("");
    setBio("");
    setErrors({});
    setServerError("");
    setLoading(false);

    const timer = setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [devModalOpen]);

  // Esc fecha a janela.
  useEffect(() => {
    if (!devModalOpen) return;

    function handleKey(event) {
      if (event.key === "Escape" && !loading) closeDevModal();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [devModalOpen, loading, closeDevModal]);

  if (!devModalOpen) return null;

  function validate() {
    const newErrors = {};
    const name = studioName.trim();
    const description = bio.trim();

    if (name.length < NAME_MIN) {
      newErrors.studioName = "Digite o nome do estúdio.";
    } else if (name.length > NAME_MAX) {
      newErrors.studioName = `Use no máximo ${NAME_MAX} caracteres.`;
    }

    if (description.length < BIO_MIN) {
      newErrors.bio = `Escreva pelo menos ${BIO_MIN} caracteres sobre o estúdio.`;
    } else if (description.length > BIO_MAX) {
      newErrors.bio = `Use no máximo ${BIO_MAX} caracteres.`;
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await becomeDeveloper({
        studioName: studioName.trim(),
        bio: bio.trim(),
      });
    } catch (error) {
      setServerError(error.message || "Não foi possível concluir. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div
      className="dev-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) closeDevModal();
      }}
    >
      <form
        className="dev-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-modal-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <button
          className="dev-modal-close"
          type="button"
          aria-label="Fechar"
          onClick={closeDevModal}
          disabled={loading}
        >
          ✕
        </button>

        <span className="eyebrow">NOVO ESTÚDIO</span>
        <h2 id="dev-modal-title">Tornar-se desenvolvedor</h2>
        <p className="dev-modal-text">
          Conte um pouco sobre você. Essas informações aparecem na página do
          seu estúdio e nos jogos que você publicar.
        </p>

        <label>
          Nome do estúdio
          <input
            ref={nameInputRef}
            type="text"
            value={studioName}
            maxLength={NAME_MAX}
            placeholder="Ex.: Pixel Forge"
            className={errors.studioName ? "input-error" : ""}
            aria-invalid={Boolean(errors.studioName)}
            onChange={(e) => setStudioName(e.target.value)}
            disabled={loading}
          />
          {errors.studioName && (
            <span className="field-error">{errors.studioName}</span>
          )}
        </label>

        <label>
          Bio do estúdio
          <textarea
            rows={4}
            value={bio}
            maxLength={BIO_MAX}
            placeholder="Fale sobre o estúdio, o que vocês criam e o que inspira seus jogos."
            className={errors.bio ? "input-error" : ""}
            aria-invalid={Boolean(errors.bio)}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
          />
          <span className="dev-modal-counter">
            {bio.length}/{BIO_MAX}
          </span>
          {errors.bio && <span className="field-error">{errors.bio}</span>}
        </label>

        {serverError && (
          <div className="dev-modal-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="dev-modal-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={closeDevModal}
            disabled={loading}
          >
            Cancelar
          </button>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar estúdio"}
          </button>
        </div>
      </form>
    </div>
  );
}
