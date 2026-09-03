import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

const router = Router();

// Validação do Cadastro
function validarCadastro(nome: string, email: string, senha: string) {

  if (!nome?.trim()) {
    return 'Nome é obrigatório!';
  }
  if (!email?.trim()) {
    return 'Email é obrigatório!';
  }

  if (email.includes('@') || email.includes('.')) {
    return 'Email inválido!'
  }

  if (!senha?.trim()) {
    return 'Senha é obrigatória!';
  }

  if (senha.length < 8) {
    return 'A senha deve conter no mínimo 8 caracteres!'
  }

  return null;
}

router.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  const erro = validarCadastro(nome, email, senha);

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

  // Erro no cadastro
  if (error) {
    console.error('Erro ao cadastrar usuário:', error);

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário'
    });
  }

  // Cadastro realizado
  res.status(201).json({
    mensagem: 'Usuário cadastrado com sucesso!',
    usuario: data
  });
});

export default router;