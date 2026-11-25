import { Router, Request, Response } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';

const router = Router();
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 6 },
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

// Cadastro de jogo: recebe capa, de 3 a 5 screenshots e plataformas selecionadas.
router.post('/jogos', upload.fields([
  { name: 'capa', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 },
]), async (req: Request, res: Response) => {
  const uploadedPaths: string[] = [];
  let createdGameId: number | null = null;

  try {
    const {
      nome, descricao, versao, preco, link_download,
      id_desenvolvedor, id_genero, tipo,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const cover = files?.capa?.[0];
    const screenshotFiles = files?.screenshots ?? [];

    if (!nome || !descricao || !versao || !cover || !id_desenvolvedor || !id_genero) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios e selecione a capa do jogo.' });
    }

    if (screenshotFiles.length < 3 || screenshotFiles.length > 5) {
      return res.status(400).json({ error: 'Envie de 3 a 5 screenshots do jogo.' });
    }

    let platformIds: number[];
    try {
      const parsed = JSON.parse(req.body.plataformas || '[]');
      platformIds = Array.isArray(parsed)
        ? [...new Set(parsed.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0))]
        : [];
    } catch {
      return res.status(400).json({ error: 'A seleção de plataformas é inválida.' });
    }

    let gameLinks: { label: string; url: string }[] = [];
    try {
      const parsedLinks = JSON.parse(req.body.links || "[]");
      gameLinks = Array.isArray(parsedLinks) ? parsedLinks.filter((link: any) => link && typeof link.url === "string" && link.url.trim()).map((link: any) => ({ label: String(link.label || "Acessar").slice(0, 60), url: link.url.trim() })) : [];
    } catch {
      return res.status(400).json({ error: "Os links informados são inválidos." });
    }

    if (platformIds.length === 0) {
      return res.status(400).json({ error: 'Selecione pelo menos uma plataforma.' });
    }

    const { data: validPlatforms, error: platformsError } = await supabase
      .from('plataformas')
      .select('id')
      .in('id', platformIds);

    if (platformsError) throw platformsError;
    if ((validPlatforms ?? []).length !== platformIds.length) {
      return res.status(400).json({ error: 'Uma ou mais plataformas selecionadas não existem.' });
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

    const { data: game, error: gameError } = await supabase
      .from('jogos')
      .insert([{
        nome,
        descricao,
        versao,
        preco: Number(preco) || 0,
        url_capa: coverUrl,
        screenshots: screenshotUrls,
        links: gameLinks,
        link_download: link_download || null,
        id_desenvolvedor,
        id_genero,
        destaque: false,
        ...(tipo ? { tipo } : {}),
      }])
      .select()
      .single();

    if (gameError) {
      await supabase.storage.from('game-media').remove(uploadedPaths);
      return res.status(400).json({ error: gameError.message });
    }

    createdGameId = game.id;

    const { error: relationError } = await supabase
      .from('jogo_plataformas')
      .insert(platformIds.map((id_plataforma) => ({
        id_jogo: game.id,
        id_plataforma,
      })));

    if (relationError) {
      await supabase.from('jogos').delete().eq('id', game.id);
      await supabase.storage.from('game-media').remove(uploadedPaths);
      return res.status(400).json({ error: relationError.message });
    }

    const { data: platformRows } = await supabase
      .from('plataformas')
      .select('nome')
      .in('id', platformIds);

    return res.status(201).json({
      message: 'Jogo cadastrado com sucesso!',
      jogo: {
        ...game,
        plataformas: (platformRows ?? []).map((platform: any) => platform.nome),
      },
    });
  } catch (err) {
    console.error(err);
    if (createdGameId) await supabase.from('jogos').delete().eq('id', createdGameId);
    if (uploadedPaths.length) {
      await supabase.storage.from('game-media').remove(uploadedPaths);
    }
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Erro interno no servidor.',
    });
  }
});

// Lista jogos, screenshots e plataformas armazenadas no Supabase.
router.get('/jogos', async (_req: Request, res: Response) => {
  try {
    const { data: jogos, error } = await supabase
      .from('jogos')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const [devs, generos, gamePlatforms, platforms] = await Promise.all([
      supabase.from('desenvolvedores').select('id, estudio'),
      supabase.from('generos').select('*'),
      supabase.from('jogo_plataformas').select('id_jogo, id_plataforma'),
      supabase.from('plataformas').select('id, nome'),
    ]);

    const estudios = new Map<any, any>((devs.data ?? []).map((d: any) => [d.id, d.estudio]));
    const nomesGenero = new Map<any, any>((generos.data ?? []).map((g: any) => [g.id, g.nome]));
    const nomesPlataforma = new Map<any, any>((platforms.data ?? []).map((p: any) => [p.id, p.nome]));
    const plataformasPorJogo = new Map<number, string[]>();

    (gamePlatforms.data ?? []).forEach((relation: any) => {
      const current = plataformasPorJogo.get(relation.id_jogo) ?? [];
      const platformName = nomesPlataforma.get(relation.id_plataforma);
      if (platformName) current.push(platformName);
      plataformasPorJogo.set(relation.id_jogo, current);
    });

    return res.status(200).json({
      jogos: (jogos ?? []).map((jogo: any) => ({
        ...jogo,
        screenshots: Array.isArray(jogo.screenshots) ? jogo.screenshots : [],
        plataformas: plataformasPorJogo.get(jogo.id) ?? [],
        destaque: Boolean(jogo.destaque),
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
