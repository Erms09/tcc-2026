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
      id_genero
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
          id_genero
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

// Listar os jogos (já com o nome do estúdio e do gênero de cada um)
router.get('/jogos', async (_req: Request, res: Response) => {
  try {
    const { data: jogos, error } = await supabase
      .from('jogos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Nomes buscados à parte: se uma dessas consultas falhar, os jogos ainda são listados.
    const [devs, generos] = await Promise.all([
      supabase.from('desenvolvedores').select('id, estudio'),
      supabase.from('generos').select('*')
    ]);

    const estudios = new Map<any, any>((devs.data ?? []).map((d: any) => [d.id, d.estudio]));
    const nomesGenero = new Map<any, any>((generos.data ?? []).map((g: any) => [g.id, g.nome]));

    return res.status(200).json({
      jogos: (jogos ?? []).map((jogo: any) => ({
        ...jogo,
        estudio: estudios.get(jogo.id_desenvolvedor) ?? null,
        genero: nomesGenero.get(jogo.id_genero) ?? null
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Listar os gêneros (o front usa para montar os filtros e para cadastrar o jogo)
router.get('/generos', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('generos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ generos: data ?? [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;