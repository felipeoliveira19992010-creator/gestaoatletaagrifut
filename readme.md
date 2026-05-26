# Itajaí Agrifut - Upload Direto

Esta pasta pode ser enviada diretamente no Netlify por drag and drop.

Ela usa React e Babel via CDN para rodar o arquivo `app.tsx` no navegador. Para um deploy mais profissional e rápido, use a pasta `agrifut-netlify`, que gera um build Vite.

## Salvar dados no Supabase

1. Crie um projeto grátis no Supabase.
2. No Supabase, abra `SQL Editor`, cole o conteúdo de `supabase-schema.sql` e execute.
3. No Supabase, copie:
   - Project URL
   - `service_role` key
4. No Netlify, abra o site e vá em `Site configuration > Environment variables`.
5. Crie estas variáveis:
   - `SUPABASE_URL`: Project URL do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` key do Supabase

Quando publicado no Netlify com as variáveis configuradas, o app salva os dados no Supabase pela função `/.netlify/functions/storage`.
Se as variáveis não existirem, ele usa `localStorage` como fallback.

## Acesso inicial

- Professor demo: `prof` / `prof123`

## Arquivos importantes

- `netlify/functions/storage.mjs`: função que grava e lê os dados no Supabase.
- `supabase-schema.sql`: tabela necessária no Supabase.
- `storage.js`: cliente que usa a função Netlify ou fallback local.
