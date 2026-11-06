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

O front funciona sozinho (dados no navegador) e tem pontos prontos para ligar ao back-end. Cada ponto é ativado por uma variável no `.env` do frontend.

| Recurso | Variável | Onde está o código |
|---|---|---|
| Login e cadastro | (sempre ligado) | `frontend/src/utils/api.js` |
| Tornar-se desenvolvedor | `VITE_DEVELOPER_API=true` | `cadastrarDesenvolvedor` em `api.js` |
| Cadastro de jogo | `VITE_GAMES_API=true` | `cadastrarJogo` em `api.js` |

**Cadastro de jogo (`POST /jogos`):** o front já envia `nome, descricao, versao, preco, url_capa, link_download, id_desenvolvedor, id_genero`. Falta preencher `GENRE_IDS` em `frontend/src/data.js` com os ids da tabela de gêneros.

**Tornar-se desenvolvedor:** a função `cadastrarDesenvolvedor` foi escrita para `POST /desenvolvedor` com `{ id_usuario, nome_estudio, bio }`. O back-end implementou `POST /devs` com `{ id, estudio, bio }`, então é preciso ajustar `api.js` para esse formato antes de ligar a variável.

**Login (pendente no back-end):** para o desenvolvedor continuar como desenvolvedor depois de sair e entrar, a resposta do `POST /login` deve trazer o estúdio:

```
{ "usuario": { "id": 1, "nome": "...", "email": "...",
               "desenvolvedor": { "estudio": "Pixel Forge", "bio": "..." } } }   // ou "desenvolvedor": null
```

Enquanto isso não existir, o estúdio e a bio ficam guardados neste navegador.

**Listar jogos:** o catálogo começa vazio e os jogos ficam no navegador. Quando houver uma rota de listagem, carregue-a no estado `gamesData` de `frontend/src/context/AppContext.jsx`.

## Limitações conhecidas

- As rotas do backend ainda não usam autenticação por token (JWT).
- Parte dos dados do catálogo (curtidas, visualizações, comentários) é guardada no navegador (`localStorage`).
