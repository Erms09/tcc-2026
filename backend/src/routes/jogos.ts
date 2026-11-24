import { Router, Request, Response } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';

const router = Router();
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 7 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      callback(new Error('Formato inválido. Envie imagens PNG, JPG ou WEBP.'));
      return;
    }
    callback(null, true);
  },
});

async function uploadImage(file: Express.Multer.File, folder: string) {
  const extension = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
  const path = `${folder}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('game-media')
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw new Error(`Falha ao salvar imagem: ${error.message}`);

  const { data } = supabase.storage.from('game-media').getPublicUrl(path);
  return data.publicUrl;
}

// Cadastro de jogo: a capa e as screenshots chegam como arquivos multipart.
router.post('/jogos', upload.fields([
  { name: 'capa', maxCount: 1 },
  { name: 'screenshots', maxCount: 6 },
]), async (req: Request, res: Response) => {
  const uploadedPaths: string[] = [];

  try {
    const {
      nome, descricao, versao, preco, link_download,
      id_desenvolvedor, id_genero, tipo,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const cover = files?.capa?.[0];
    const screenshotFiles = files?.screenshots ?? [];

    if (!nome || !descricao || !versao || !cover || !id_desenvolvedor || !id_genero) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios e selecione a capa.' });
    }

    const folder = `games/${id_desenvolvedor}`;
    const coverUrl = await uploadImage(cover, folder);
    uploadedPaths.push(coverUrl.split('/game-media/')[1]);

    const screenshotUrls: string[] = [];
    for (const file of screenshotFiles) {
      const url = await uploadImage(file, folder);
      screenshotUrls.push(url);
      uploadedPaths.push(url.split('/game-media/')[1]);
    }

    const { data, error } = await supabase
      .from('jogos')
      .insert([{
        nome,
        descricao,
        versao,
        preco: Number(preco) || 0,
        url_capa: coverUrl,
        screenshots: screenshotUrls,
        link_download: link_download || null,
        id_desenvolvedor,
        id_genero,
        ...(tipo ? { tipo } : {}),
      }])
      .select();

    if (error) {
      await supabase.storage.from('game-media').remove(uploadedPaths);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Jogo cadastrado com sucesso!',
      jogo: data[0],
    });
  } catch (err) {
    console.error(err);
    if (uploadedPaths.length) {
      await supabase.storage.from('game-media').remove(uploadedPaths);
    }
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Erro interno no servidor.',
    });
  }
});

// Lista jogos e suas imagens armazenadas no Supabase.
router.get('/jogos', async (_req: Request, res: Response) => {
  try {
    const { data: jogos, error } = await supabase
      .from('jogos')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const [devs, generos] = await Promise.all([
      supabase.from('desenvolvedores').select('id, estudio'),
      supabase.from('generos').select('*'),
    ]);

    const estudios = new Map<any, any>((devs.data ?? []).map((d: any) => [d.id, d.estudio]));
    const nomesGenero = new Map<any, any>((generos.data ?? []).map((g: any) => [g.id, g.nome]));

    return res.status(200).json({
      jogos: (jogos ?? []).map((jogo: any) => ({
        ...jogo,
        screenshots: Array.isArray(jogo.screenshots) ? jogo.screenshots : [],
        estudio: estudios.get(jogo.id_desenvolvedor) ?? null,
        genero: nomesGenero.get(jogo.id_genero) ?? null,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Lista os gêneros usados nos filtros e no cadastro.
router.get('/generos', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('generos')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ generos: data ?? [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;
