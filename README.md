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
SUPABASE_KEY=<chave secreta service_role do projeto>
```

No Supabase, execute o arquivo `backend/sql/game-media.sql` no **SQL Editor**. Ele cria o bucket público `game-media` e adiciona a coluna `screenshots` à tabela `jogos`. Configure `SUPABASE_KEY` com a chave secreta `service_role` no arquivo `backend/.env` (somente no back-end, nunca no frontend).

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
| Cadastro de jogo | `POST /jogos` multipart com `capa` e até 6 arquivos `screenshots`, além dos dados do jogo | `VITE_GAMES_API=false` |
| Listar jogos | `GET /jogos` → `{ jogos: [...] }` (já com `estudio` e `genero`) | `VITE_GAMES_API=false` |
| Favoritos | `GET /favoritos/:idUsuario` → `{ favoritos: [id_jogo] }` e `PUT /favoritos` com `{ id_usuario, id_jogo, favorito }` (tabela `bibliotecas`) | `VITE_GAMES_API=false` |
| Listar gêneros | `GET /generos` → `{ generos: [{ id, nome }] }` | `VITE_GAMES_API=false` |

**Gêneros:** vêm do banco (`GET /generos`). Os filtros do catálogo e o formulário de cadastro usam essa lista, e o `id_genero` é descoberto pelo nome. A rota lê a tabela `generos` (coluna `nome`); se no banco o nome for outro, ajuste em `backend/src/routes/jogos.ts`.

**Imagens dos jogos:** a capa e até 6 screenshots são selecionadas como arquivos no computador, enviadas pelo back-end ao bucket público `game-media` do Supabase Storage e salvas como URLs no registro do jogo. O bucket precisa existir e a coluna `screenshots` precisa ser criada pelo SQL acima. **Catálogo:** os jogos são carregados do banco quando o usuário entra. Curtidas, visualizações, comentários e avaliação ainda ficam guardados no navegador de cada pessoa. O **tipo (2D/3D) vem do banco** (coluna `tipo`). Os links da Steam, GitHub e Discord não existem no banco, então aparecem só no navegador de quem cadastrou o jogo.

**Estúdio no banco:** o jogo guarda `id_desenvolvedor`, que é o id do usuário na tabela `desenvolvedores`. Se um usuário virou desenvolvedor antes da integração e ainda não está nessa tabela, o front registra o estúdio automaticamente na primeira vez que ele cadastrar um jogo.

**Login:** a resposta do `POST /login` traz o estúdio quando o usuário é desenvolvedor: `{ usuario: { id, nome, email, desenvolvedor: { estudio, bio } | null } }`. Assim o papel de desenvolvedor vale em qualquer navegador.

**Favoritos:** ficam na tabela `bibliotecas` (`favorito = true`; a linha nova entra com `status = 'na_lista'`) e seguem o usuário em qualquer navegador. Curtidas, comentários, visualizações e avaliação ainda ficam guardados no navegador.

**Tour de boas-vindas:** aparece uma vez por usuário em cada navegador.

## Limitações conhecidas

- As rotas do backend ainda não usam autenticação por token (JWT).
- Parte dos dados do catálogo (curtidas, visualizações, comentários) é guardada no navegador (`localStorage`).
