import React, { useState } from "react";
import { Link } from "react-router-dom";
import { genres, types } from "../data";

export default function Developer({ onCreateGame, currentUserName }) {
  const [form, setForm] = useState({
    title: "", dev: currentUserName || "", genre: "", type: "", description: "",
    version: "", price: "", coverUrl: "", downloadUrl: "",
    steam: "", github: "", discord: ""
  });
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function isValidUrl(value) {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  function validate() {
    const newErrors = {};
    if (form.title.trim().length < 2) newErrors.title = "Digite o nome do jogo.";
    if (!form.genre) newErrors.genre = "Selecione um gênero.";
    if (!form.type) newErrors.type = "Selecione um tipo.";
    if (!form.version.trim()) newErrors.version = "Informe a versão, ex.: 1.0.0";
    else if (form.version.trim().length > 20) newErrors.version = "Use no máximo 20 caracteres.";
    if (form.price.trim() !== "") {
      const priceNumber = Number(form.price.replace(",", "."));
      if (!Number.isFinite(priceNumber) || priceNumber < 0) newErrors.price = "Digite um valor válido, ex.: 19,90 (ou deixe vazio se for grátis).";
    }
    if (!form.coverUrl.trim()) newErrors.coverUrl = "Informe o link da imagem de capa.";
    else if (!isValidUrl(form.coverUrl)) newErrors.coverUrl = "Link inválido. Use uma URL completa, ex.: https://...";
    if (!isValidUrl(form.downloadUrl)) newErrors.downloadUrl = "Link inválido. Use uma URL completa, ex.: https://...";
    if (form.description.trim().length < 10) newErrors.description = "Escreva pelo menos 10 caracteres na descrição.";
    if (!isValidUrl(form.steam)) newErrors.steam = "Link inválido. Use uma URL completa, ex.: https://...";
    if (!isValidUrl(form.github)) newErrors.github = "Link inválido. Use uma URL completa, ex.: https://...";
    if (!isValidUrl(form.discord)) newErrors.discord = "Link inválido. Use uma URL completa, ex.: https://...";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setSubmitted(false);
    setServerError("");
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await onCreateGame({
        title: form.title.trim(),
        developer: currentUserName,
        genre: form.genre,
        type: form.type,
        description: form.description.trim(),
        version: form.version.trim(),
        price: form.price.trim() === "" ? 0 : Number(form.price.replace(",", ".")),
        coverUrl: form.coverUrl.trim(),
        downloadUrl: form.downloadUrl.trim(),
        steam: form.steam || "https://store.steampowered.com/",
        github: form.github || "https://github.com/",
        discord: form.discord || "https://discord.com/"
      });
      setSubmitted(true);
      setForm({
        title: "", dev: currentUserName || "", genre: "", type: "", description: "",
        version: "", price: "", coverUrl: "", downloadUrl: "",
        steam: "", github: "", discord: ""
      });
    } catch (err) {
      setServerError(err.message || "Não foi possível cadastrar o jogo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container developer-page">
      <section className="page-intro">
        <span className="eyebrow">ÁREA DO DESENVOLVEDOR</span>
        <h1>Coloque seu jogo na vitrine.</h1>
        <p>Cadastre seu projeto e conecte jogadores às suas plataformas.</p>
      </section>

      <div className="developer-layout">
        <form className="dev-form" onSubmit={handleSubmit} noValidate>
          <label>Nome do jogo<span className="required-mark">*</span>
            <input
              placeholder="Ex.: Meu Jogo Indie"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error" role="alert">{errors.title}</span>}
          </label>

          <label>Desenvolvedor
            <input
              value={currentUserName}
              disabled
              className="input-locked"
            />
            <small className="field-hint">Vinculado automaticamente à sua conta.</small>
          </label>

          <label>Gênero<span className="required-mark">*</span>
            <select
              value={form.genre}
              onChange={(e) => updateField("genre", e.target.value)}
              className={errors.genre ? "input-error" : ""}
            >
              <option value="" disabled>Selecione</option>
              {genres.slice(1).map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.genre && <span className="field-error" role="alert">{errors.genre}</span>}
          </label>

          <label>Tipo<span className="required-mark">*</span>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={errors.type ? "input-error" : ""}
            >
              <option value="" disabled>Selecione</option>
              {types.slice(1).map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <span className="field-error" role="alert">{errors.type}</span>}
          </label>

          <label>Descrição<span className="required-mark">*</span>
            <textarea
              placeholder="Conte um pouco sobre o jogo..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
          </label>

          <label>Versão<span className="required-mark">*</span>
            <input
              placeholder="Ex.: 1.0.0"
              value={form.version}
              maxLength={20}
              onChange={(e) => updateField("version", e.target.value)}
              className={errors.version ? "input-error" : ""}
              aria-invalid={Boolean(errors.version)}
            />
            {errors.version && <span className="field-error" role="alert">{errors.version}</span>}
          </label>

          <label>Preço (R$)
            <input
              inputMode="decimal"
              placeholder="Deixe vazio se for gratuito"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className={errors.price ? "input-error" : ""}
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price && <span className="field-error" role="alert">{errors.price}</span>}
          </label>

          <label>Imagem de capa (link)<span className="required-mark">*</span>
            <input
              type="url"
              placeholder="https://..."
              value={form.coverUrl}
              onChange={(e) => updateField("coverUrl", e.target.value)}
              className={errors.coverUrl ? "input-error" : ""}
              aria-invalid={Boolean(errors.coverUrl)}
            />
            <small className="field-hint">Link direto para a imagem (png, jpg ou webp).</small>
            {errors.coverUrl && <span className="field-error" role="alert">{errors.coverUrl}</span>}
          </label>

          <label>Link para baixar o jogo
            <input
              type="url"
              placeholder="https://..."
              value={form.downloadUrl}
              onChange={(e) => updateField("downloadUrl", e.target.value)}
              className={errors.downloadUrl ? "input-error" : ""}
              aria-invalid={Boolean(errors.downloadUrl)}
            />
            {errors.downloadUrl && <span className="field-error" role="alert">{errors.downloadUrl}</span>}
          </label>

          <label>Link da Steam
            <input
              type="url"
              placeholder="https://..."
              value={form.steam}
              onChange={(e) => updateField("steam", e.target.value)}
              className={errors.steam ? "input-error" : ""}
            />
            {errors.steam && <span className="field-error" role="alert">{errors.steam}</span>}
          </label>

          <label>Link do GitHub
            <input
              type="url"
              placeholder="https://..."
              value={form.github}
              onChange={(e) => updateField("github", e.target.value)}
              className={errors.github ? "input-error" : ""}
            />
            {errors.github && <span className="field-error" role="alert">{errors.github}</span>}
          </label>

          <label>Link do Discord
            <input
              type="url"
              placeholder="https://..."
              value={form.discord}
              onChange={(e) => updateField("discord", e.target.value)}
              className={errors.discord ? "input-error" : ""}
            />
            {errors.discord && <span className="field-error" role="alert">{errors.discord}</span>}
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Cadastrar jogo"}
            </button>
            <Link to="/catalogo" className="secondary-button">Cancelar</Link>
          </div>
          {serverError && (
            <div className="server-error" role="alert">{serverError}</div>
          )}
          {submitted && (
            <div className="success">
              ✓ Jogo cadastrado com sucesso! Confira em{" "}
              <Link to="/dashboard">Dashboard</Link>.
            </div>
          )}
        </form>

        <aside className="dev-card">
          <span className="status-dot" />
          <h3>Divulgação automatizada</h3>
          <p>
            O diferencial do projeto prevê uma IA integrada para publicar
            automaticamente os jogos cadastrados no Instagram.
          </p>
          <div className="automation-status">
            <span>IA de divulgação</span><b>Planejada</b>
          </div>
          <small>A integração real com Instagram/IA será implementada no back-end.</small>
        </aside>
      </div>
    </main>
  );
}
