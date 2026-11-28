import express from 'express';
import cors from 'cors';
import cadastroRouter from './routes/cadastro.js';
import loginRouter from './routes/login.js';
import devsRouter from './routes/devs.js';
import jogosRouter from './routes/jogos.js';
import favoritosRouter from './routes/favoritos.js';
import feedbacksRouter from './routes/feedbacks.js';
import { supabase } from './config/supabase.js';

const server = express();

server.use(cors());
server.use(express.json());

server.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

server.use(cadastroRouter);
server.use(loginRouter);
server.use(devsRouter);
server.use(jogosRouter);
server.use(favoritosRouter);
server.use(feedbacksRouter);

// Mensagens amigáveis para erros de upload do Multer.
server.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && (err.name === 'MulterError' || err.message.startsWith('Formato inválido'))) {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
});

supabase
  .from('usuarios')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return;
    }
    console.log('Supabase conectado! Dados:', data);
  });

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
