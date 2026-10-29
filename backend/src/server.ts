import express from 'express';
import cors from 'cors';
import cadastroRouter from './routes/cadastro.js';
import loginRouter from './routes/login.js';
import devsRouter from './routes/devs.js';
import jogosRouter from './routes/jogos.js';
import { supabase } from './config/supabase.js';

const server = express();

server.use(cors());
server.use(express.json());

server.use(cadastroRouter);
server.use(loginRouter);
server.use(devsRouter);
server.use(jogosRouter);

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

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
