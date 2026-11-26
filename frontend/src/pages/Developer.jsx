import React, { useState } from "react";
import { Link } from "react-router-dom";
import { types } from "../data";
import { useApp } from "../context/AppContext";

const PLATFORM_OPTIONS = [
  { id: 1, name: "PC (Windows)" },
  { id: 2, name: "Linux" },
  { id: 4, name: "Android" },
  { id: 7, name: "Mac" },
  { id: 8, name: "Web" },
  { id: 10, name: "Console" },
];

async function resizeImageToTarget(file, targetWidth, targetHeight) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Não foi possível abrir essa imagem."));
      element.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Não foi possível ajustar essa imagem.");

    // Preenche o formato de destino sem deformar a imagem, cortando apenas o excesso central.
    const scale = Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
    const sourceWidth = targetWidth / scale;
    const sourceHeight = targetHeight / scale;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;

    context.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    );

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Não foi possível exportar a imagem.")),
        "image/jpeg",
        0.9
      );
    });

    const safeName = file.name.replace(/\.[^.]+$/, "") || "imagem";
    return new File([blob], `${safeName}-indiehub.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function createInitialForm(currentUserName = "") {
  return {
    title: "",
    dev: currentUserName || "",
    genre: "",
    type: "",
    description: "",
    version: "",
    price: "",
    isFree: false,
    coverFile: null,
    screenshots: [null, null, null],
    platforms: [],
    links: [{ label: "", url: "" }],
  };
}

export default function Developer({ onCreateGame, currentUserName }) {
  const { genreList } = useApp();
  const [form, setForm] = useState(() => createInitialForm(currentUserName));
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
    if (!form.isFree) {
      if (form.price.trim() === "") {
        newErrors.price = "Informe o preço ou marque a opção Gratuito.";
      } else {
        const priceNumber = Number(form.price.replace(",", "."));
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) newErrors.price = "Digite um preço maior que zero ou marque Gratuito.";
      }
    }
    if (!form.coverFile) newErrors.coverFile = "Selecione a capa do jogo.";
    const selectedScreenshots = form.screenshots.filter(Boolean);
    if (selectedScreenshots.length < 3 || selectedScreenshots.length > 5) newErrors.screenshots = "Selecione pelo menos 3 screenshots (máximo de 5).";
    if (form.platforms.length === 0) newErrors.platforms = "Selecione pelo menos uma plataforma.";
    if (form.description.trim().length < 10) newErrors.description = "Escreva pelo menos 10 caracteres na descrição.";
    form.links.forEach((link, index) => {
      if (link.url.trim() && !isValidUrl(link.url.trim())) newErrors[`link-${index}`] = "Informe uma URL completa, começando com https://.";
      if (link.url.trim() && !link.label.trim()) newErrors[`link-label-${index}`] = "Dê um nome para este link.";
    });
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
        price: form.isFree ? 0 : Number(form.price.replace(",", ".")),
        coverFile: form.coverFile,
        screenshots: form.screenshots.filter(Boolean),
        platforms: form.platforms,
        downloadUrl: (form.links.find((link) => /^(baixar|download)$/i.test(link.label.trim()))?.url || "").trim(),
        links: form.links
          .filter((link) => link.url.trim() && !/^(baixar|download)$/i.test(link.label.trim()))
          .map((link) => ({ label: link.label.trim() || "Acessar", url: link.url.trim() }))
      });
      setSubmitted(true);
      setForm(createInitialForm(currentUserName));
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
          <label>Nome do jogo
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

          <label>Gênero
            <select
              value={form.genre}
              onChange={(e) => updateField("genre", e.target.value)}
              className={errors.genre ? "input-error" : ""}
            >
              <option value="" disabled>Selecione</option>
              {genreList.slice(1).map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.genre && <span className="field-error" role="alert">{errors.genre}</span>}
          </label>

          <label>Tipo
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

          <label>Descrição
            <textarea
              placeholder="Conte um pouco sobre o jogo..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={errors.description ? "input-error" : ""}
            />
            {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
          </label>

          <label>Versão
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

          <div className="price-field">
            <div className="price-field-heading">
              <label htmlFor="game-price">Preço (R$)</label>
            </div>
            <input
              id="game-price"
              inputMode="decimal"
              placeholder="Ex.: 19,90"
              value={form.price}
              disabled={form.isFree}
              onChange={(e) => updateField("price", e.target.value)}
              className={errors.price ? "input-error" : ""}
              aria-invalid={Boolean(errors.price)}
            />
            <label className="free-toggle">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((previous) => ({
                    ...previous,
                    isFree: checked,
                    price: checked ? "" : previous.price,
                  }));
                }}
              />
              <span>Gratuito</span>
            </label>
            {errors.price && <span className="field-error" role="alert">{errors.price}</span>}
          </div>

          <section className="media-upload-section">
            <div className="form-section-heading">
              <span className="form-section-icon">▧</span>
              <div><h2>Imagens do jogo</h2><p>Mostre seu jogo com imagens nítidas e bem enquadradas.</p></div>
            </div>
            <label className="upload-card">
              <span className="upload-card-icon">▰</span>
              <strong>Capa do jogo</strong>
              <span className="upload-card-copy">Uma única capa será usada na biblioteca, no catálogo e na página do jogo.</span>
              <input
                key={form.coverFile?.name || "cover-empty"}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  let adjusted;
                  try { adjusted = await resizeImageToTarget(file, 490, 215); } catch (error) {
                    setErrors((previous) => ({ ...previous, coverFile: error.message }));
                    e.target.value = "";
                    return;
                  }
                  setErrors((previous) => ({ ...previous, coverFile: "" }));
                  updateField("coverFile", adjusted);
                }}
                className={errors.coverFile ? "input-error" : ""}
                aria-invalid={Boolean(errors.coverFile)}
              />
              <small className="field-hint">Ajuste automático para 490 × 215 px. A imagem é recortada ao centro, sem deformar.</small>
              {form.coverFile && <small className="file-selected">✓ {form.coverFile.name}</small>}
              {errors.coverFile && <span className="field-error" role="alert">{errors.coverFile}</span>}
            </label>
            <div className="screenshots-upload-card">
              <div className="screenshots-upload-heading">
                <div>
                  <strong>Screenshots do jogo</strong>
                  <span className="upload-card-copy">Escolha uma imagem por caixa. As três primeiras são obrigatórias.</span>
                </div>
                <span className="screenshots-count">{form.screenshots.filter(Boolean).length}/5</span>
              </div>
              <div className="screenshot-slots">
                {form.screenshots.map((file, index) => (
                  <label className={`screenshot-slot ${file ? "has-file" : ""}`} key={index}>
                    <span className="screenshot-slot-number">{String(index + 1).padStart(2, "0")}</span>
                    <strong>Screenshot {index + 1}</strong>
                    <span className="screenshot-slot-action">{file ? "Trocar imagem" : "Selecionar imagem"}</span>
                    <input
                      key={file?.name || `empty-${index}`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;
                        let adjusted;
                        try { adjusted = await resizeImageToTarget(file, 1920, 1080); } catch (error) {
                          setErrors((previous) => ({ ...previous, screenshots: error.message }));
                          e.target.value = "";
                          return;
                        }
                        const next = [...form.screenshots];
                        next[index] = adjusted;
                        updateField("screenshots", next);
                        setErrors((previous) => ({ ...previous, screenshots: "" }));
                      }}
                    />
                    {file && <small className="file-selected">{file.name}</small>}
                    {!file && <small className="field-hint">PNG, JPG ou WEBP</small>}
                  </label>
                ))}
                {form.screenshots.length < 5 && (
                  <button
                    type="button"
                    className="add-screenshot-button"
                    onClick={() => updateField("screenshots", [...form.screenshots, null])}
                  >
                    <span>+</span>
                    <strong>Adicionar</strong>
                    <small>Mais uma screenshot</small>
                  </button>
                )}
              </div>
              {errors.screenshots && <span className="field-error" role="alert">{errors.screenshots}</span>}
              <small className="field-hint">Ajuste automático para 1920 × 1080 px (16:9). A imagem é recortada ao centro, sem deformar. Máximo de 5 screenshots.</small>
            </div>
          </section>

          <fieldset className="platform-fieldset">
            <legend>Plataformas disponíveis</legend>
            <div className="platform-options">
              {PLATFORM_OPTIONS.map((platform) => (
                <label className="platform-option" key={platform.id}>
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(platform.id)}
                    onChange={(e) => updateField("platforms", e.target.checked
                      ? [...form.platforms, platform.id]
                      : form.platforms.filter((id) => id !== platform.id))}
                  />
                  <span>{platform.name}</span>
                </label>
              ))}
            </div>
            {errors.platforms && <span className="field-error" role="alert">{errors.platforms}</span>}
          </fieldset>

          <section className="links-editor">
            <div className="links-editor-heading">
              <div><h3>Links do jogo</h3><p>Adicione páginas, lojas, comunidades e outros endereços do seu jogo.</p></div>
              <button type="button" className="add-link-button" onClick={() => updateField("links", [...form.links, { label: "", url: "" }])} aria-label="Adicionar link">+</button>
            </div>
            {form.links.map((link, index) => (
              <div className="link-entry" key={index}>
                <div className="link-entry-fields">
                  <input
                    value={link.label}
                    onChange={(e) => updateField("links", form.links.map((item, i) => i === index ? { ...item, label: e.target.value } : item))}
                    placeholder="Nome do link (ex.: Steam, GitHub, Itch.io)"
                    aria-label={`Nome do link ${index + 1}`}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateField("links", form.links.map((item, i) => i === index ? { ...item, url: e.target.value } : item))}
                    placeholder="Cole aqui o endereço (ex.: https://store.steampowered.com/...)"
                    aria-label={`Endereço do link ${index + 1}`}
                    className={errors[`link-${index}`] ? "input-error" : ""}
                  />
                </div>
                {form.links.length > 1 && <button type="button" className="remove-link-button" onClick={() => updateField("links", form.links.filter((_, i) => i !== index))} aria-label="Remover link">×</button>}
                {errors[`link-${index}`] && <span className="field-error">{errors[`link-${index}`]}</span>}
                {errors[`link-label-${index}`] && <span className="field-error">{errors[`link-label-${index}`]}</span>}
              </div>
            ))}
            <small className="field-hint">Para que um link apareça como botão de download, use o nome “Download” ou “Baixar”.</small>
          </section>

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

        <aside className="dev-card automation-coming-soon">
          <span className="status-dot" />
          <span className="automation-eyebrow">NOVIDADE A CAMINHO</span>
          <h3>Divulgação automatizada</h3>
          <div className="coming-soon-label">Em breve...</div>
          <p>
            Estamos preparando uma ferramenta para divulgar os jogos cadastrados
            automaticamente nas redes sociais. Em breve, seu projeto poderá ganhar
            ainda mais visibilidade por aqui.
          </p>
          <small>Estamos trabalhando para trazer essa novidade ao IndieHub.</small>
        </aside>
      </div>
    </main>
  );
}
