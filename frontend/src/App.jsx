import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { games as seed, genres, types } from "./data";

/* ---------- Estado global ---------- */
const Ctx = createContext();
const useApp = () => useContext(Ctx);
const KEY = "indiehub-v2";
const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
const now = "agora mesmo";

const initialState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) return saved;
  } catch {}
  return {
    user: null, theme: "dark", tourSeen: false, games: seed,
    liked: [], favs: [], compare: [], viewed: [],
    activity: seed.flatMap((g) =>
      g.comments.map((c) => ({ type: "comment", name: c.name, text: c.text, gameId: g.id, gameTitle: g.title, timeLabel: c.timeLabel }))
    ),
  };
};

/* ---------- Peças pequenas reutilizáveis ---------- */
const Cover = ({ game, large }) => (
  <div className={`cover${large ? " large" : ""}`} style={{ background: `linear-gradient(135deg, ${game.colors[0]}, ${game.colors[1]})` }}>
    <small>INDIE</small><strong>{game.title}</strong><em>{game.genre}</em>
  </div>
);

const Stats = ({ g, rating }) => (
  <div className="stats">
    {rating && <span>★ {g.rating}</span>}
    <span>👁 {g.views}</span><span>❤ {g.likes}</span><span>💬 {g.comments.length}</span>
  </div>
);

const Empty = ({ children }) => <div className="empty">{children}</div>;

const Page = ({ tag, title, text, children }) => (
  <main className="container page">
    {tag && <span className="eyebrow">{tag}</span>}
    <h1>{title}</h1>
    {text && <p className="muted">{text}</p>}
    {children}
  </main>
);

const Field = ({ label, error, hint, children }) => (
  <label className="field">
    {label}
    {children}
    {hint && <small className="muted">{hint}</small>}
    {error && <span className="error">{error}</span>}
  </label>
);

const Grid = ({ games, list }) => (
  <div className={list ? "list-view" : "grid"}>
    {games.map((g) => <GameCard key={g.id} game={g} list={list} />)}
  </div>
);

const Activity = ({ items }) => (
  <div className="stack">
    {items.map((a, i) => (
      <div className="activity" key={i}>
        <div className="avatar">{a.name[0]}</div>
        <p>
          <strong>{a.name}</strong> {a.type === "like" ? "curtiu" : "comentou em"}{" "}
          <Link to={`/jogo/${a.gameId}`}>{a.gameTitle}</Link>
          {a.text && <span className="muted"> — "{a.text}"</span>}
        </p>
        <small className="muted">{a.timeLabel}</small>
      </div>
    ))}
    {!items.length && <Empty>Nenhuma atividade ainda.</Empty>}
  </div>
);

const Row = ({ game, pos, children }) => (
  <Link to={`/jogo/${game.id}`} className="card row-card">
    {pos && <b className="pos">#{pos}</b>}
    <div className="thumb"><Cover game={game} /></div>
    <div className="grow"><strong>{game.title}</strong><span className="muted">{children || game.developer}</span></div>
    <Stats g={game} rating />
  </Link>
);

/* ---------- Layout ---------- */
function Header() {
  const { user, theme, setTheme, logout } = useApp();
  const [open, setOpen] = useState(false);
  const dev = user.role === "desenvolvedor";
  const links = [["/catalogo", "Catálogo"], ["/ranking", "Ranking"], ["/favoritos", "Favoritos"], ["/comunidade", "Comunidade"], ["/sobre", "Sobre"]];

  return (
    <header className="header">
      <Link to="/catalogo" className="brand">◆ Indie<b>Hub</b></Link>
      <nav className="nav">{links.map(([to, t]) => <NavLink key={to} to={to}>{t}</NavLink>)}</nav>
      <div className="row">
        <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Alternar tema">
          {theme === "dark" ? "☀" : "🌙"}
        </button>
        {dev && <Link to="/desenvolvedor" className="btn primary">Cadastrar jogo</Link>}
        <div className="menu">
          <button className="avatar me" onClick={() => setOpen(!open)} aria-label="Menu do perfil">{user.name[0].toUpperCase()}</button>
          {open && (
            <div className="dropdown" onClick={() => setOpen(false)}>
              <strong>{user.name}</strong>
              <small className="muted">{user.email} · {dev ? "Desenvolvedor" : "Jogador"}</small>
              {dev ? <><Link to="/meus-jogos">Meus jogos</Link><Link to="/planos">Planos</Link></> : <Link to="/perfil">Meu perfil</Link>}
              <button className="danger" onClick={logout}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function GameCard({ game, list }) {
  const { favs, compare, ranked, toggleFav, toggleCompare } = useApp();
  const rank = ranked.findIndex((g) => g.id === game.id);
  const act = (fn) => (e) => { e.preventDefault(); fn(game.id); };
  const isFav = favs.includes(game.id);

  return (
    <Link to={`/jogo/${game.id}`} className={`card game${list ? " list" : ""}`}>
      <div className="cover-wrap">
        <Cover game={game} />
        <div className="badges">
          {rank < 3 ? <span className="badge hot">🔥 Destaque</span> : rank < 5 && <span className="badge up">📈 Em alta</span>}
          {game.isNew && <span className="badge">Novo</span>}
        </div>
        <div className="card-actions">
          <button className={compare.includes(game.id) ? "on" : ""} onClick={act(toggleCompare)} aria-label="Comparar">⇄</button>
          <button className={isFav ? "on" : ""} onClick={act(toggleFav)} aria-label="Favoritar">{isFav ? "♥" : "♡"}</button>
        </div>
        <div className="preview"><p>{game.description}</p></div>
      </div>
      <div className="card-body">
        <div className="between"><h3>{game.title}</h3><span className="rating">★ {game.rating}</span></div>
        <p className="muted">{game.developer}</p>
        <div className="tags"><span>{game.genre}</span><span>{game.type}</span></div>
        <Stats g={game} />
      </div>
    </Link>
  );
}

/* ---------- Páginas ---------- */
function Catalog() {
  const { games, ranked, activity } = useApp();
  const [f, setF] = useState({ q: "", genre: "Todos", type: "Todos" });
  const [list, setList] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const shown = games.filter(
    (g) =>
      `${g.title} ${g.developer}`.toLowerCase().includes(f.q.toLowerCase()) &&
      (f.genre === "Todos" || g.genre === f.genre) &&
      (f.type === "Todos" || g.type === f.type)
  );
  const devs = new Set(games.map((g) => g.developer)).size;
  const comments = games.reduce((n, g) => n + g.comments.length, 0);

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">CATÁLOGO DE JOGOS INDEPENDENTES</span>
          <h1>Descubra o próximo <span>grande indie.</span></h1>
          <p className="muted">Um espaço para jogadores encontrarem projetos independentes e para desenvolvedores ganharem visibilidade.</p>
          <a href="#catalogo" className="btn primary">Explorar jogos ↓</a>
          <p className="muted"><b>{games.length}</b> jogos • <b>{devs}</b> desenvolvedores • <b>{comments}</b> avaliações</p>
        </div>
        <div className="orb">INDIE<br /><span>HUB</span></div>
      </section>

      <section className="container section">
        <h2>🔥 Destaques da semana</h2>
        <p className="muted">Os jogos mais curtidos e visitados.</p>
        <Grid games={ranked.slice(0, 3)} />
      </section>

      {activity.length > 0 && (
        <section className="container section">
          <div className="between"><h2>Atividade recente</h2><Link to="/comunidade" className="btn">Ver tudo</Link></div>
          <Activity items={activity.slice(0, 5)} />
        </section>
      )}

      <main className="container section" id="catalogo">
        <div className="between">
          <h2>Todos os jogos <small className="muted">({shown.length})</small></h2>
          <div className="toggle">
            <button className={!list ? "on" : ""} onClick={() => setList(false)} aria-label="Grade">▦</button>
            <button className={list ? "on" : ""} onClick={() => setList(true)} aria-label="Lista">☰</button>
          </div>
        </div>
        <div className="filters">
          <input value={f.q} onChange={set("q")} placeholder="🔎 Buscar jogo ou desenvolvedor..." />
          <select value={f.genre} onChange={set("genre")}>{genres.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={f.type} onChange={set("type")}>{types.map((x) => <option key={x}>{x}</option>)}</select>
        </div>
        {shown.length ? <Grid games={shown} list={list} /> : <Empty>Nenhum jogo encontrado com esses filtros.</Empty>}
      </main>
    </>
  );
}

function GameDetails() {
  const id = Number(useParams().id);
  const { games, liked, favs, toggleLike, toggleFav, addView, addComment } = useApp();
  const game = games.find((g) => g.id === id);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [shot, setShot] = useState(0);
  const [support, setSupport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { addView(id); setShot(0); }, [id]);
  if (!game) return <NotFound />;

  const shots = [game.colors, [...game.colors].reverse(), [game.colors[0], "#111113"]];
  const similar = games.filter((g) => g.genre === game.genre && g.id !== id).slice(0, 3);
  const isLiked = liked.includes(id);
  const isFav = favs.includes(id);

  const submit = (e) => {
    e.preventDefault();
    if (text.trim().length < 3) return setError("Escreva pelo menos 3 caracteres antes de enviar.");
    addComment(id, text.trim());
    setText(""); setError("");
  };
  const share = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/jogo/${id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="container page">
      <Link to="/catalogo" className="muted">← Voltar para o catálogo</Link>

      <section className="detail">
        <Cover game={game} large />
        <div>
          <span className="eyebrow">{game.genre} • {game.type}</span>
          <h1>{game.title}</h1>
          <p className="muted">por <Link to={`/estudio/${encodeURIComponent(game.developer)}`}><strong>{game.developer}</strong></Link></p>
          <p className="rating">★ {game.rating} <span className="muted">avaliação da comunidade</span></p>
          <Stats g={game} />
          <p className="muted">{game.description}</p>

          <div className="actions">
            <button className={`btn ${isLiked ? "on" : ""}`} onClick={() => toggleLike(id)}>{isLiked ? "❤ Curtido" : "🤍 Curtir"} · {game.likes}</button>
            <button className={`btn ${isFav ? "on" : ""}`} onClick={() => toggleFav(id)}>{isFav ? "♥ Favoritado" : "♡ Favoritar"}</button>
            <button className="btn" onClick={share}>{copied ? "✓ Link copiado!" : "🔗 Compartilhar"}</button>
            <button className="btn" onClick={() => setSupport(!support)}>💜 Apoiar desenvolvedor</button>
          </div>
          {support && <p className="note">Recurso em modo demonstração — em breve você poderá apoiar <strong>{game.developer}</strong> por aqui.</p>}

          <div className="actions">
            {[["steam", "Steam"], ["github", "GitHub"], ["discord", "Discord"]].map(([k, name]) => (
              <a key={k} className="btn" href={game[k]} target="_blank" rel="noreferrer">{name} ↗</a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Capturas de tela</h2>
        <div className="gallery" style={{ background: `linear-gradient(135deg, ${shots[shot][0]}, ${shots[shot][1]})` }}>
          <span>Captura {shot + 1}</span>
          <button onClick={() => setShot((shot + 2) % 3)} aria-label="Anterior">‹</button>
          <button onClick={() => setShot((shot + 1) % 3)} aria-label="Próxima">›</button>
        </div>
      </section>

      <section className="section">
        <h2>Feedbacks</h2>
        <p className="muted">Ajude o desenvolvedor deixando sua opinião.</p>
        <form className="form narrow" onSubmit={submit} noValidate>
          <Field error={error}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva seu comentário..." className={error ? "invalid" : ""} />
          </Field>
          <button className="btn primary" type="submit">Enviar feedback</button>
        </form>
        <div className="stack narrow">
          {game.comments.map((c) => (
            <article className="card comment" key={c.id}>
              <div className="avatar">{c.name[0]}</div>
              <div><strong>{c.name}</strong> <small className="muted">{c.timeLabel}</small><p className="muted">{c.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      {similar.length > 0 && <section className="section"><h2>Jogos parecidos</h2><Grid games={similar} /></section>}
    </main>
  );
}

function Developer() {
  const { user, createGame } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", genre: "", type: "", description: "", steam: "", github: "", discord: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const links = [["steam", "Link da Steam", "https://store.steampowered.com/"], ["github", "Link do GitHub", "https://github.com/"], ["discord", "Link do Discord", "https://discord.com/"]];

  const validUrl = (v) => { if (!v) return true; try { new URL(v); return true; } catch { return false; } };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.title.trim().length < 2) err.title = "Digite o nome do jogo.";
    if (!form.genre) err.genre = "Selecione um gênero.";
    if (!form.type) err.type = "Selecione um tipo.";
    if (form.description.trim().length < 10) err.description = "Escreva pelo menos 10 caracteres.";
    links.forEach(([k]) => { if (!validUrl(form[k])) err[k] = "Link inválido. Use uma URL completa, ex.: https://..."; });
    setErrors(err);
    if (Object.keys(err).length) return;

    createGame({
      ...form, title: form.title.trim(), description: form.description.trim(), developer: user.name,
      ...Object.fromEntries(links.map(([k, , def]) => [k, form[k] || def])),
    });
    navigate("/meus-jogos");
  };

  const cls = (k) => (errors[k] ? "invalid" : "");

  return (
    <Page tag="ÁREA DO DESENVOLVEDOR" title="Coloque seu jogo na vitrine." text="Cadastre seu projeto e conecte jogadores às suas plataformas.">
      <div className="two-col">
        <form className="form" onSubmit={submit} noValidate>
          <Field label="Nome do jogo *" error={errors.title}><input value={form.title} onChange={set("title")} placeholder="Ex.: Meu Jogo Indie" className={cls("title")} /></Field>
          <Field label="Desenvolvedor" hint="Vinculado automaticamente à sua conta."><input value={user.name} disabled /></Field>
          <Field label="Gênero *" error={errors.genre}>
            <select value={form.genre} onChange={set("genre")} className={cls("genre")}>
              <option value="" disabled>Selecione</option>{genres.slice(1).map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Tipo *" error={errors.type}>
            <select value={form.type} onChange={set("type")} className={cls("type")}>
              <option value="" disabled>Selecione</option>{types.slice(1).map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Descrição *" error={errors.description}><textarea value={form.description} onChange={set("description")} placeholder="Conte um pouco sobre o jogo..." className={cls("description")} /></Field>
          {links.map(([k, label]) => (
            <Field key={k} label={label} error={errors[k]}><input type="url" value={form[k]} onChange={set(k)} placeholder="https://..." className={cls(k)} /></Field>
          ))}
          <div className="actions">
            <button className="btn primary" type="submit">Cadastrar jogo</button>
            <Link to="/catalogo" className="btn">Cancelar</Link>
          </div>
        </form>

        <aside className="card aside">
          <h3>Divulgação automatizada</h3>
          <p className="muted">O projeto prevê uma IA integrada para publicar automaticamente os jogos cadastrados no Instagram.</p>
          <p className="between"><span>IA de divulgação</span><b className="rating">Planejada</b></p>
          <small className="muted">A integração real será implementada no back-end.</small>
        </aside>
      </div>
    </Page>
  );
}

const About = () => (
  <Page tag="SOBRE O PROJETO" title="Um espaço para dar visibilidade aos jogos indies." text="O IndieHub é uma plataforma web de catálogo criada para ajudar desenvolvedores independentes a divulgar seus jogos, conectando criadores e jogadores.">
    <div className="two-col even">
      {[["Vitrine", "Exibição de jogos com informações do projeto."], ["Feedback", "Avaliações e comentários da comunidade."], ["Filtros", "Busca por gênero, tipo e categorias."], ["Links externos", "Acesso a Steam, GitHub e Discord."]].map(([t, d]) => (
        <div className="card pad" key={t}><b>{t}</b><p className="muted">{d}</p></div>
      ))}
    </div>
  </Page>
);

function Ranking() {
  const { ranked } = useApp();
  return (
    <Page tag="HALL DA FAMA" title="Ranking dos jogos indies." text="Ordenado por curtidas e visualizações da comunidade.">
      <div className="stack">{ranked.map((g, i) => <Row key={g.id} game={g} pos={i + 1} />)}</div>
    </Page>
  );
}

function Studio() {
  const name = decodeURIComponent(useParams().name);
  const { games } = useApp();
  const mine = games.filter((g) => g.developer === name);
  if (!mine.length) return <NotFound />;
  const sum = (k) => mine.reduce((n, g) => n + g[k], 0);
  return (
    <Page tag="ESTÚDIO" title={name} text={`${mine.length} jogo(s) • ${sum("views")} visualizações • ${sum("likes")} curtidas`}>
      <Grid games={mine} />
    </Page>
  );
}

function Favoritos() {
  const { games, favs } = useApp();
  const mine = games.filter((g) => favs.includes(g.id));
  return (
    <Page tag="SEUS FAVORITOS" title="Jogos que você marcou." text="Sua lista pessoal para acompanhar depois.">
      {mine.length ? <Grid games={mine} /> : <Empty>Você ainda não favoritou nenhum jogo. Clique no ♡ em um card.</Empty>}
    </Page>
  );
}

function Comunidade() {
  const { activity } = useApp();
  return (
    <Page tag="MURAL DA COMUNIDADE" title="O que estão dizendo." text="Comentários e curtidas recentes da comunidade.">
      <Activity items={activity} />
    </Page>
  );
}

function Perfil() {
  const { user, games, favs, liked } = useApp();
  const favGames = games.filter((g) => favs.includes(g.id));
  const comments = games.flatMap((g) => g.comments.filter((c) => c.name === user.name).map((c) => ({ ...c, game: g })));
  return (
    <Page tag="MEU PERFIL" title={user.name} text={`${user.email} · ${favGames.length} favoritos • ${liked.length} curtidos • ${comments.length} comentários`}>
      <h2>Favoritos</h2>
      {favGames.length ? <Grid games={favGames} /> : <Empty>Nenhum favorito ainda.</Empty>}
      <h2>Meus comentários</h2>
      <div className="stack">
        {comments.map((c) => (
          <article className="card comment" key={c.id}>
            <div className="avatar">{c.name[0]}</div>
            <div><strong>em <Link to={`/jogo/${c.game.id}`}>{c.game.title}</Link></strong> <small className="muted">{c.timeLabel}</small><p className="muted">{c.text}</p></div>
          </article>
        ))}
        {!comments.length && <Empty>Você ainda não comentou em nenhum jogo.</Empty>}
      </div>
    </Page>
  );
}

function MeusJogos() {
  const { user, games } = useApp();
  const mine = games.filter((g) => g.developer === user.name);
  return (
    <Page tag="PAINEL DO DESENVOLVEDOR" title="Meus jogos." text={`Jogos cadastrados como "${user.name}".`}>
      <div className="stack">
        {mine.map((g) => <Row key={g.id} game={g}>{g.genre} • {g.type}</Row>)}
        {!mine.length && <Empty>Você ainda não cadastrou nenhum jogo. <Link to="/desenvolvedor">Cadastrar agora</Link></Empty>}
      </div>
    </Page>
  );
}

const PLANS = [
  { name: "Grátis", price: "R$ 0", items: ["Cadastro de jogos ilimitado", "Estatísticas básicas", "Perfil de estúdio público"] },
  { name: "Pro", price: "R$ 29/mês", items: ["Tudo do Grátis", "Estatísticas detalhadas", "Selo de verificado", "Suporte prioritário"], best: true },
  { name: "Destaque", price: "R$ 79/mês", items: ["Tudo do Pro", "Destaque garantido na home", "Divulgação nas redes do IndieHub"] },
];

const Planos = () => (
  <Page tag="PLANOS PARA DESENVOLVEDORES" title="Escolha como divulgar seu jogo." text="Modo demonstração — nenhum pagamento é processado.">
    <div className="three-col">
      {PLANS.map((p) => (
        <div className={`card pad${p.best ? " best" : ""}`} key={p.name}>
          {p.best && <span className="badge">Mais popular</span>}
          <h3>{p.name}</h3><div className="price">{p.price}</div>
          <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
          <button className={`btn ${p.best ? "primary" : ""}`}>{p.name === "Grátis" ? "Plano atual" : "Assinar (demo)"}</button>
        </div>
      ))}
    </div>
  </Page>
);

function Comparar() {
  const { games, compare, toggleCompare } = useApp();
  const picked = games.filter((g) => compare.includes(g.id));
  if (!picked.length)
    return (
      <Page tag="COMPARADOR" title="Nenhum jogo selecionado." text="Clique no ícone ⇄ nos cards para comparar até 3 jogos.">
        <Link to="/catalogo" className="btn primary">Voltar ao catálogo</Link>
      </Page>
    );
  return (
    <Page tag="COMPARADOR" title={`Comparando ${picked.length} jogo(s).`}>
      <div className="three-col">
        {picked.map((g) => (
          <div className="card pad" key={g.id}>
            <Cover game={g} />
            <h3>{g.title}</h3>
            <ul className="plain muted">
              <li><b>Gênero:</b> {g.genre}</li><li><b>Tipo:</b> {g.type}</li><li><b>Nota:</b> ★ {g.rating}</li>
              <li><b>Visualizações:</b> {g.views}</li><li><b>Curtidas:</b> {g.likes}</li><li><b>Comentários:</b> {g.comments.length}</li>
            </ul>
            <button className="btn" onClick={() => toggleCompare(g.id)}>Remover</button>
          </div>
        ))}
      </div>
    </Page>
  );
}

function Auth() {
  const { login } = useApp();
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "jogador" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    const err = {};

    if (signup && f.name.trim().length < 2) {
      err.name = "Digite seu nome.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      err.email = "Digite um e-mail válido, ex.: voce@email.com.";
    }

    if (f.password.length < 8) {
      err.password = "A senha precisa ter pelo menos 8 caracteres.";
    }

    setErrors(err);

    if (Object.keys(err).length) return;

    try {
      // CADASTRO
      if (signup) {
        const resposta = await fetch("http://localhost:3000/cadastro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: f.name.trim(),
            email: f.email.trim(),
            senha: f.password,
          }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          setErrors({
            email: dados.mensagem || "Não foi possível cadastrar.",
          });
          return;
        }

        console.log("Cadastro realizado:", dados);

        login({
          name: dados.usuario.nome,
          email: dados.usuario.email,
          role: f.role,
        });

        return;
      }

      // LOGIN
      login({
        name: f.name.trim() || f.email.split("@")[0],
        email: f.email,
        role: f.role,
      });
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);

      setErrors({
        email: "Não foi possível conectar ao servidor.",
      });
    }
  };

  return (
    <main className="auth">
      <div className="auth-side">
        <div className="orb small">INDIE<br /><span>HUB</span></div>
        <h2>Bem-vindo ao <span>IndieHub.</span></h2>
        <p className="muted">Entre para acompanhar seus jogos favoritos ou crie uma conta para explorar o catálogo indie.</p>
      </div>
      <div className="auth-form-wrap">
        <form className="card pad form" onSubmit={submit} noValidate>
          <div className="toggle wide">
            <button type="button" className={!signup ? "on" : ""} onClick={() => { setSignup(false); setErrors({}); }}>Entrar</button>
            <button type="button" className={signup ? "on" : ""} onClick={() => { setSignup(true); setErrors({}); }}>Cadastrar</button>
          </div>
          {signup && <Field label="Nome" error={errors.name}><input value={f.name} onChange={set("name")} placeholder="Seu nome" className={errors.name ? "invalid" : ""} /></Field>}
          <Field label="E-mail" error={errors.email}><input type="email" value={f.email} onChange={set("email")} placeholder="voce@email.com" className={errors.email ? "invalid" : ""} /></Field>
          <Field label="Senha" error={errors.password}><input type="password" value={f.password} onChange={set("password")} placeholder="••••••••" className={errors.password ? "invalid" : ""} /></Field>
          <div className="toggle wide">
            {["jogador", "desenvolvedor"].map((r) => (
              <button type="button" key={r} className={f.role === r ? "on" : ""} onClick={() => setF({ ...f, role: r })}>{r === "jogador" ? "Jogador" : "Desenvolvedor"}</button>
            ))}
          </div>
          <button className="btn primary" type="submit">{signup ? "Criar conta" : "Entrar"}</button>
        </form>
      </div>
    </main>
  );
}

const NotFound = () => (
  <main className="container page center">
    <h1 className="big">404</h1>
    <p className="muted">Essa página não existe.</p>
    <Link to="/catalogo" className="btn primary">Voltar ao catálogo</Link>
  </main>
);

/* ---------- Widgets flutuantes ---------- */
function CompareBar() {
  const { compare, clearCompare } = useApp();
  if (!compare.length) return null;
  return (
    <div className="compare-bar">
      <span>{compare.length} jogo(s) para comparar</span>
      <Link to="/comparar" className="btn primary">Comparar</Link>
      <button className="btn" onClick={clearCompare}>Limpar</button>
    </div>
  );
}

function Assistant() {
  const { games, ranked, favs, liked } = useApp();
  const [open, setOpen] = useState(false);
  const seen = new Set([...favs, ...liked]);
  const genresSeen = games.filter((g) => seen.has(g.id)).map((g) => g.genre);
  const top = [...genresSeen].sort((a, b) => genresSeen.filter((x) => x === b).length - genresSeen.filter((x) => x === a).length)[0];
  const pick = ranked.find((g) => !seen.has(g.id) && (!top || g.genre === top)) || ranked[0];

  return (
    <div className="assistant">
      {open && pick && (
        <div className="card pad panel">
          <div className="between"><strong>🤖 Assistente IndieHub</strong><button onClick={() => setOpen(false)} aria-label="Fechar">✕</button></div>
          <p className="muted">Recomendamos para você:</p>
          <Cover game={pick} />
          <Link to={`/jogo/${pick.id}`} className="btn primary" onClick={() => setOpen(false)}>Ver jogo</Link>
        </div>
      )}
      <button className="fab" onClick={() => setOpen(!open)} aria-label="Assistente">🤖</button>
    </div>
  );
}

const TOUR = [
  ["Bem-vindo ao IndieHub!", "Vamos mostrar rapidinho os principais recursos."],
  ["Favorite e curta jogos", "Use o ♡ nos cards para favoritar e o botão Curtir na página do jogo."],
  ["Ranking e destaques", "Confira o Ranking e os Destaques da semana."],
  ["Compare jogos", "Clique no ícone ⇄ em até 3 cards para comparar lado a lado."],
];

function Tour() {
  const { endTour } = useApp();
  const [step, setStep] = useState(0);
  const last = step === TOUR.length - 1;
  return (
    <div className="overlay">
      <div className="card pad center modal">
        <h3>{TOUR[step][0]}</h3>
        <p className="muted">{TOUR[step][1]}</p>
        <div className="actions center">
          <button className="btn" onClick={endTour}>Pular</button>
          <button className="btn primary" onClick={() => (last ? endTour() : setStep(step + 1))}>{last ? "Concluir" : "Próximo"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [s, setS] = useState(initialState);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }, [s]);

  const update = (fn) => setS((p) => ({ ...p, ...fn(p) }));
  const mapGame = (p, id, fn) => p.games.map((g) => (g.id === id ? fn(g) : g));
  const log = (p, item) => [item, ...p.activity];

  const actions = {
    ranked: [...s.games].sort((a, b) => b.likes * 2 + b.views - (a.likes * 2 + a.views)),
    login: (user) => setS((p) => ({ ...p, user, tourSeen: false })),
    logout: () => { setS((p) => ({ ...p, user: null })); navigate("/"); },
    setTheme: (theme) => update(() => ({ theme })),
    endTour: () => update(() => ({ tourSeen: true })),
    toggleFav: (id) => update((p) => ({ favs: toggle(p.favs, id) })),
    clearCompare: () => update(() => ({ compare: [] })),
    toggleCompare: (id) => update((p) => ({
      compare: p.compare.includes(id) || p.compare.length < 3 ? toggle(p.compare, id) : p.compare,
    })),
    addView: (id) => update((p) =>
      p.viewed.includes(id) ? {} : { viewed: [...p.viewed, id], games: mapGame(p, id, (g) => ({ ...g, views: g.views + 1 })) }
    ),
    toggleLike: (id) => update((p) => {
      const on = p.liked.includes(id);
      const game = p.games.find((g) => g.id === id);
      return {
        liked: toggle(p.liked, id),
        games: mapGame(p, id, (g) => ({ ...g, likes: g.likes + (on ? -1 : 1) })),
        activity: on ? p.activity : log(p, { type: "like", name: p.user.name, gameId: id, gameTitle: game.title, timeLabel: now }),
      };
    }),
    addComment: (id, text) => update((p) => {
      const game = p.games.find((g) => g.id === id);
      const c = { id: Date.now(), name: p.user.name, text, timeLabel: now };
      return {
        games: mapGame(p, id, (g) => ({ ...g, comments: [...g.comments, c] })),
        activity: log(p, { type: "comment", name: c.name, text, gameId: id, gameTitle: game.title, timeLabel: now }),
      };
    }),
    createGame: (fields) => update((p) => {
      const id = Math.max(0, ...p.games.map((g) => g.id)) + 1;
      const colors = seed[id % seed.length].colors;
      return { games: [...p.games, { id, ...fields, rating: 0, isNew: true, colors, views: 0, likes: 0, comments: [] }] };
    }),
  };

  const { user } = s;
  if (!user && pathname !== "/") return <Navigate to="/" replace />;
  if (user && pathname === "/") return <Navigate to="/catalogo" replace />;

  const only = (role, el) => (user?.role === role ? el : <Navigate to="/catalogo" replace />);

  return (
    <Ctx.Provider value={{ ...s, ...actions }}>
      <div className="app" data-theme={s.theme}>
        {user && <Header />}
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/jogo/:id" element={<GameDetails />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/estudio/:name" element={<Studio />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/comparar" element={<Comparar />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/perfil" element={only("jogador", <Perfil />)} />
          <Route path="/meus-jogos" element={only("desenvolvedor", <MeusJogos />)} />
          <Route path="/planos" element={only("desenvolvedor", <Planos />)} />
          <Route path="/desenvolvedor" element={only("desenvolvedor", <Developer />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {user && <><CompareBar /><Assistant />{!s.tourSeen && <Tour />}</>}
      </div>
    </Ctx.Provider>
  );
}
