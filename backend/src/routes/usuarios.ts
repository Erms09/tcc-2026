import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

router.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;

  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nome: nome,
      email: email,
      senha: senha
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar usuário"
    });
  }

  res.status(201).json({
    mensagem: "Usuário cadastrado com sucesso!",
    usuario: data
  });
});

export default router;