import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// Cadastrar um novo jogo
router.post('/jogos', async (req: Request, res: Response) => {
  try {
    const {
      nome,
      descricao,
      versao,
      preco,
      url_capa,
      link_download,
      id_desenvolvedor,
      id_genero,
      id_subgenero
    } = req.body;

    // Validação do jogo
    if (!nome || !descricao || !versao || !url_capa || !id_desenvolvedor || !id_genero) {
      return res.status(400).json({ error: 'Preenche todos os campos obrigatórios.' });
    }

    // Inserir o jogo no banco
    const { data, error } = await supabase
      .from('jogos')
      .insert([
        {
          nome,
          descricao,
          versao,
          preco: preco || 0.00,
          url_capa,
          link_download,
          id_desenvolvedor,
          id_genero,
          id_subgenero: id_subgenero || null
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Jogo cadastrado com sucesso!',
      jogo: data[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;