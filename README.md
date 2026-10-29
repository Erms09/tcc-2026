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

## Integração com o back-end (a fazer)

- **Jogos:** o catálogo começa vazio. Os jogos cadastrados pelos desenvolvedores ficam hoje no navegador (`localStorage`). Quando houver back-end, basta carregar a lista em `frontend/src/context/AppContext.jsx` (estado `gamesData`) e enviar o cadastro em `createGame`.
- **Tornar-se desenvolvedor:** a janela pede nome do estúdio e bio. Para enviar ao back-end, crie a rota abaixo e defina `VITE_DEVELOPER_API=true` no `.env` do frontend. A função já está pronta em `frontend/src/utils/api.js` (`cadastrarDesenvolvedor`).

```
POST /desenvolvedor
Corpo:   { "id_usuario": 1, "nome_estudio": "Pixel Forge", "bio": "..." }
Sucesso: { "desenvolvedor": { "nome_estudio": "Pixel Forge", "bio": "..." } }
Erro:    { "mensagem": "texto do erro" }   (status 4xx/5xx)
```

## Limitações conhecidas

- As rotas do backend ainda não usam autenticação por token (JWT).
- Parte dos dados do catálogo (curtidas, visualizações, comentários) é guardada no navegador (`localStorage`).
