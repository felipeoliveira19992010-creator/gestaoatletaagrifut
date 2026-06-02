# Itajaí Agrifut - Netlify

Pasta pronta para deploy no Netlify a partir do arquivo `agrifut-7.tsx`.

## Deploy pelo Netlify com Supabase

1. Crie um projeto grátis no Supabase.
2. No Supabase, abra `SQL Editor`, cole o conteúdo de `supabase-schema.sql` e execute.
3. No Supabase, copie:
   - Project URL
   - `service_role` key
4. No Netlify, abra o site e vá em `Site configuration > Environment variables`.
5. Crie estas variáveis:
   - `SUPABASE_URL`: Project URL do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` key do Supabase
6. Suba esta pasta para um repositório Git.
7. No Netlify, escolha o repositório.
8. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`

O arquivo `netlify.toml` já contém essas configurações.

Quando publicado no Netlify com as variáveis configuradas, o app salva os dados no Supabase pela função `/.netlify/functions/storage`.
Rodando localmente, ou se as variáveis não existirem, ele usa `localStorage` como fallback.

## Rodar localmente

```bash
npm install
npm run dev
```

## Acesso inicial

- Professor demo: `prof` / `prof123`

## Arquivos importantes

- `netlify/functions/storage.mjs`: função que grava e lê os dados no Supabase.
- `supabase-schema.sql`: tabela necessária no Supabase.
- `src/storage.ts`: cliente que usa a função Netlify ou fallback local.
