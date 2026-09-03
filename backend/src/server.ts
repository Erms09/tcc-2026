import express from 'express';
import usuariosRouter from './routes/cadastro.js';
import { supabase } from './config/supabase.js';

const server = express();

server.use(express.json());
server.use(usuariosRouter);

server.get('/', (req, res) => {
  res.send('Servidor Rodando!');
});

// Teste de conexão com o Supabase
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

// Onde o servidor está rodando
server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});