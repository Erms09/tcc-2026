# IndieHub

Plataforma web de catálogo de jogos independentes (TCC). Jogadores descobrem, favoritam e comentam jogos; desenvolvedores cadastram seus projetos e acompanham o desempenho em um dashboard.

## Estrutura

- `frontend/`: React 19 + Vite + react-router-dom
- `backend/`: Node.js + Express + TypeScript, com banco no Supabase
- `documentação/`: documentos do TCC

## Como rodar

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` com:

```
SUPABASE_URL=<url do projeto no Supabase>
SUPABASE_KEY=<chave do projeto>
```

Depois:

```bash
npm run dev      # compila e inicia em http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # abre em http://localhost:5173
```

Para apontar para outro endereço de backend, defina `VITE_API_URL` no ambiente do frontend (padrão: `http://localhost:3000`).

## Principais telas

Login e cadastro, catálogo com filtros, detalhes do jogo (curtidas, comentários, favoritos), ranking, comparador, favoritos, histórico, notificações, comunidade, novidades, perfil de estúdio, cadastro de jogo e dashboard do desenvolvedor.

## Integração com o back-end

O front conversa com o back-end (`VITE_API_URL`, padrão `http://localhost:3000`). Para trabalhar só com o front, desligue as integrações no `.env` do frontend (veja `frontend/.env.example`).

| Recurso | Rota | Variável para desligar |
|---|---|---|
| Login e cadastro | `POST /login`, `POST /cadastro` | (sempre ligado) |
| Tornar-se desenvolvedor | `POST /devs` com `{ id, estudio, bio }` | `VITE_DEVELOPER_API=false` |
| Cadastro de jogo | `POST /jogos` com `{ nome, descricao, versao, preco, url_capa, link_download, id_desenvolvedor, id_genero }` | `VITE_GAMES_API=false` |

**Gêneros:** o back-end pede `id_genero`. Os ids ficam em `GENRE_IDS`, no arquivo `frontend/src/data.js`, e precisam ser iguais aos da tabela de gêneros do banco.

**Estúdio no banco:** o jogo guarda `id_desenvolvedor`, que é o id do usuário na tabela `desenvolvedores`. Se um usuário virou desenvolvedor antes da integração e ainda não está nessa tabela, o front registra o estúdio automaticamente na primeira vez que ele cadastrar um jogo.

**Login (pendente no back-end):** para o desenvolvedor continuar como desenvolvedor depois de sair e entrar em outro navegador, a resposta do `POST /login` deve trazer o estúdio:

```
{ "usuario": { "id": 1, "nome": "...", "email": "...",
               "desenvolvedor": { "estudio": "Pixel Forge", "bio": "..." } } }   // ou "desenvolvedor": null
```

Enquanto isso não existir, o estúdio e a bio também ficam guardados neste navegador.

**Listar jogos (pendente):** os jogos cadastrados são enviados ao banco, mas o catálogo ainda lê os jogos guardados no navegador. Quando houver uma rota de listagem, carregue-a no estado `gamesData` de `frontend/src/context/AppContext.jsx`.

## Limitações conhecidas

- As rotas do backend ainda não usam autenticação por token (JWT).
- Parte dos dados do catálogo (curtidas, visualizações, comentários) é guardada no navegador (`localStorage`).
