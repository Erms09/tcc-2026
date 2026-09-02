import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

const router = Router();

// Validação do Cadastro
  function validarUsuario(nome: string, email: string, senha: string) {
  if (!nome.trim()) {
    return 'Nome é obrigatório';
  }
  if (!email.trim()) {
    return 'Email é obrigatório';
  }
  if (!senha.trim()) {
    return 'Senha é obrigatória';
  }
  if (senha.length < 8){
    return 'A senha deve conter no mínimo 8 caracteres'
  }

// Verifica se o email possui um formato válido
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
}

router.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  const erro = validarUsuario(nome, email, senha);

// Interrompe o cadastro se algum dado for inválido
  if (erro) {
    return res.status(400).json({
      mensagem: erro
    });
  }

// Cria o hash da senha antes de enviar ao banco
  const senhaHash = await bcrypt.hash(senha, 10);

// Insere os dados no Banco de Dados
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome: nome,
      email: email,
      senha: senhaHash
    })
    .select('id, nome, email')
    .single();

  if (error) {
    console.error('Erro ao cadastrar usuário:', error);

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário'
    });
  }

  res.status(201).json({
    mensagem: 'Usuário cadastrado com sucesso!',
    usuario: data
  });
});

export default router;