
import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

// Solicitar para se tornar desenvolvedor
router.post("/devs", async (req, res) => {
  try {
    
    const { id, estudio, bio } = req.body;
    
    if (!id) {
      return res.status(400).json({
        erro: "O ID do usuário é obrigatório.",
      });
    }

    const { data, error } = await supabase
  .from("desenvolvedores")
  .insert({
    id,
    estudio,
    bio,
  })
  .select()
  .single();

    if (error) {
      console.error("Erro ao cadastrar desenvolvedor:", error);

      return res.status(500).json({
        erro: "Não foi possível cadastrar o desenvolvedor.",
      });
    }

    return res.status(201).json({
      mensagem: "Usuário cadastrado como desenvolvedor!",
      desenvolvedor: data,
    });
  } catch (error) {
    console.error("Erro interno:", error);

    return res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
});

export default router;