import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// Lista os comentários e notas de um jogo.
router.get('/feedbacks/:idJogo', async (req: Request, res: Response) => {
  try {
    const idJogo = Number(req.params.idJogo);
    if (!Number.isInteger(idJogo) || idJogo <= 0) {
      return res.status(400).json({ error: 'Jogo inválido.' });
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .select('id, texto_feedback, nota, id_usuario, created_at')
      .eq('id_jogo', idJogo)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const userIds = [...new Set((data ?? []).map((item: any) => item.id_usuario))];
    const { data: users, error: usersError } = userIds.length
      ? await supabase.from('usuarios').select('id, nome').in('id', userIds)
      : { data: [], error: null };

    if (usersError) return res.status(400).json({ error: usersError.message });

    const names = new Map((users ?? []).map((user: any) => [user.id, user.nome]));
    return res.status(200).json({
      feedbacks: (data ?? []).map((item: any) => ({
        id: item.id,
        text: item.texto_feedback,
        nota: item.nota,
        name: names.get(item.id_usuario) || 'Usuário',
        createdAt: item.created_at,
        timeLabel: new Date(item.created_at).toLocaleDateString('pt-BR'),
      })),
    });
  } catch (error) {
    console.error('Erro ao listar feedbacks:', error);
    return res.status(500).json({ error: 'Não foi possível carregar os comentários.' });
  }
});

// Registra um comentário e uma nota de 1 a 5 para o jogo.
router.post('/feedbacks', async (req: Request, res: Response) => {
  try {
    const idJogo = Number(req.body.id_jogo);
    const idUsuario = Number(req.body.id_usuario);
    const texto = typeof req.body.texto_feedback === 'string'
      ? req.body.texto_feedback.trim()
      : '';
    const nota = Number(req.body.nota);

    if (!Number.isInteger(idJogo) || idJogo <= 0 ||
        !Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({ error: 'Usuário ou jogo inválido.' });
    }
    if (texto.length < 3 || texto.length > 500) {
      return res.status(400).json({ error: 'O comentário deve ter entre 3 e 500 caracteres.' });
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'A nota deve ser de 1 a 5 estrelas.' });
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        texto_feedback: texto,
        nota,
        id_usuario: idUsuario,
        id_jogo: idJogo,
      })
      .select('id, texto_feedback, nota, id_usuario, created_at')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', idUsuario)
      .single();

    if (userError) return res.status(400).json({ error: userError.message });

    return res.status(201).json({
      feedback: {
        id: data.id,
        text: data.texto_feedback,
        nota: data.nota,
        name: user.nome,
        createdAt: data.created_at,
        timeLabel: 'agora mesmo',
      },
    });
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return res.status(500).json({ error: 'Não foi possível publicar seu comentário.' });
  }
});

export default router;
