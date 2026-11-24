-- Execute uma vez no SQL Editor do Supabase.
-- O bucket é público para que o catálogo consiga exibir as imagens.
insert into storage.buckets (id, name, public)
values ('game-media', 'game-media', true)
on conflict (id) do update set public = true;

-- URLs das screenshots enviadas para cada jogo.
alter table public.jogos
add column if not exists screenshots jsonb not null default '[]'::jsonb;

-- Jogos novos entram no catálogo sem destaque editorial automático.
alter table public.jogos
add column if not exists destaque boolean not null default false;
