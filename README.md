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
| Listar jogos | `GET /jogos` → `{ jogos: [...] }` (já com `estudio` e `genero`) | `VITE_GAMES_API=false` |
| Listar gêneros | `GET /generos` → `{ generos: [{ id, nome }] }` | `VITE_GAMES_API=false` |

**Gêneros:** vêm do banco (`GET /generos`). Os filtros do catálogo e o formulário de cadastro usam essa lista, e o `id_genero` é descoberto pelo nome. A rota lê a tabela `generos` (coluna `nome`); se no banco o nome for outro, ajuste em `backend/src/routes/jogos.ts`.

**Catálogo:** os jogos são carregados do banco quando o usuário entra. Curtidas, visualizações, comentários e avaliação ainda ficam guardados no navegador de cada pessoa. O tipo (2D/3D) e os links da Steam, GitHub e Discord não existem no banco, então aparecem só no navegador de quem cadastrou o jogo.

**Estúdio no banco:** o jogo guarda `id_desenvolvedor`, que é o id do usuário na tabela `desenvolvedores`. Se um usuário virou desenvolvedor antes da integração e ainda não está nessa tabela, o front registra o estúdio automaticamente na primeira vez que ele cadastrar um jogo.

**Login (pendente no back-end):** para o desenvolvedor continuar como desenvolvedor depois de sair e entrar em outro navegador, a resposta do `POST /login` deve trazer o estúdio:

```
{ "usuario": { "id": 1, "nome": "...", "email": "...",
               "desenvolvedor": { "estudio": "Pixel Forge", "bio": "..." } } }   // ou "desenvolvedor": null
```

Enquanto isso não existir, o estúdio e a bio também ficam guardados neste navegador.

## Limitações conhecidas

- As rotas do backend ainda não usam autenticação por token (JWT).
- Parte dos dados do catálogo (curtidas, visualizações, comentários) é guardada no navegador (`localStorage`).
