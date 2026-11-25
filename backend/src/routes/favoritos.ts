import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// A tabela "bibliotecas" exige um status. Quem favorita um jogo entra na lista com este status.
const STATUS_PADRAO = 'quero_jogar';

// Listar os ids dos jogos favoritos de um usuário
router.get('/favoritos/:idUsuario', async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.params.idUsuario);

    if (!idUsuario) {
      return res.status(400).json({ error: 'Usuário inválido.' });
    }

    const { data, error } = await supabase
      .from('bibliotecas')
      .select('id_jogo')
      .eq('id_usuario', idUsuario)
      .eq('favorito', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      favoritos: (data ?? []).map((linha: any) => linha.id_jogo)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Favoritar ou desfavoritar um jogo
router.put('/favoritos', async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_jogo, favorito } = req.body;

    if (!id_usuario || !id_jogo || typeof favorito !== 'boolean') {
      return res.status(400).json({ error: 'Informe id_usuario, id_jogo e favorito (true ou false).' });
    }

    if (favorito) {
      // A restrição única no banco impede favoritos duplicados.
      const { error } = await supabase
        .from('bibliotecas')
        .upsert(
          { id_usuario, id_jogo, favorito: true, status: STATUS_PADRAO },
          { onConflict: 'id_usuario,id_jogo' }
        );

      if (error) return res.status(400).json({ error: error.message });
    } else {
      const { error } = await supabase
        .from('bibliotecas')
        .update({ favorito: false })
        .eq('id_usuario', id_usuario)
        .eq('id_jogo', id_jogo);

      if (error) return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ favorito });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;
