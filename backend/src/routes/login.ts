import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

const router = Router();

// Validação do Login
function validarLogin(email: string, senha: string) {
    if (!email?.trim()) {
        return 'Email é obrigatório!';
    }

    if (!senha?.trim()) {
        return 'Senha é obrigatória!';
    }

    return null;
}

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    const erro = validarLogin(email, senha);

    if (erro) {
        return res.status(400).json({
            mensagem: erro
        });
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, senha')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Erro no login do usuário:', error);

        return res.status(500).json({
            mensagem: 'Erro ao buscar usuário'
        });
    }

    res.status(200).json({
        mensagem: 'Usuário encontrado!',
        usuario: {
            id: data.id,
            nome: data.nome,
            email: data.email
        }
    });
});

export default router;