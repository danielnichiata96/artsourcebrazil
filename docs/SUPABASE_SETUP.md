# Setup do Supabase - Guia Completo

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name:** `remotejobsbr` (ou outro nome)
   - **Database Password:** Escolha uma senha forte (salve em local seguro)
   - **Region:** Escolha a região mais próxima (ex: South America - São Paulo)
   - **Pricing Plan:** Free (generoso para começar)

5. Aguarde o projeto ser criado (~2 minutos)

### 2. Obter Credenciais

1. No Dashboard do projeto, vá em **Settings** > **API**
2. Anote:
   - **Project URL:** `https://xxxxx.supabase.co` → Variável `SUPABASE_URL`
   - **service_role key:** (secret, no final da página) → Variável `SUPABASE_SERVICE_ROLE_KEY`
   - **anon key:** (public key) → Variável `SUPABASE_ANON_KEY` (opcional)

⚠️ **IMPORTANTE:** A `service_role` key tem acesso total ao banco (bypassa RLS). **NUNCA** exponha no client-side!

### 3. Configurar Variáveis de Ambiente

Edite seu arquivo `.env` (criar se não existir):

```bash
# Supabase Configuration
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Aplicar Schema do Banco

Você tem **2 opções**:

#### Opção A: Via Supabase Dashboard (Mais Simples)

1. No Dashboard, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **"Run"** ou pressione `Ctrl+Enter`
6. Aguarde a execução (deve mostrar "Success. No rows returned")

#### Opção B: Via Supabase CLI (Recomendado para produção)

```bash
# Instalar Supabase CLI (global)
npm install -g supabase

# Link com seu projeto
npx supabase link --project-ref your-project-ref

# Aplicar migrations
npx supabase db push
```

### 5. Verificar Schema

No Dashboard:
1. Vá em **Table Editor**
2. Você deve ver as tabelas:
   - ✅ `companies`
   - ✅ `categories`
   - ✅ `tags`
   - ✅ `jobs`
   - ✅ `job_tags`

E as categorias iniciais devem estar criadas:
- Game Dev
- 3D
- Animation
- Design
- VFX

### 6. Testar Conexão

```bash
# Executar script de teste
node scripts/setup-supabase-schema.mjs
```

Ou criar um teste manual:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Testar conexão
const { data, error } = await supabase.from('categories').select('*');
console.log(data); // Deve mostrar as 5 categorias iniciais
```

## ✅ Checklist de Setup

- [ ] Projeto criado no Supabase
- [ ] Credenciais obtidas (URL + Service Role Key)
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Schema aplicado (SQL executado)
- [ ] Tabelas criadas e visíveis no Table Editor
- [ ] Categorias iniciais criadas (5 categorias)
- [ ] Conexão testada com sucesso

## 🔐 Segurança

### Row Level Security (RLS)

O schema cria políticas RLS que permitem **todas as operações** para facilitar o MVP. Para produção, você deve:

1. **Ajustar políticas RLS** no Dashboard:
   - Settings > API > Row Level Security
   - Ou via SQL:

```sql
-- Exemplo: Permitir leitura pública, escrita apenas para service role
DROP POLICY IF EXISTS "Allow all operations on jobs" ON jobs;
CREATE POLICY "Allow public read on jobs"
  ON jobs FOR SELECT
  USING (true);
  
CREATE POLICY "Allow service role write on jobs"
  ON jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### Service Role Key

- ✅ **Use no backend/scripts:** Seguro para uso em scripts server-side
- ❌ **NUNCA exponha no frontend:** Nunca use no código client-side (Astro Islands, componentes React, etc.)
- ✅ **Use anon key no frontend:** Para operações client-side, use `SUPABASE_ANON_KEY` com políticas RLS apropriadas

## 📊 Próximos Passos

Após o setup:

1. **Migrar dados do Airtable:**
   ```bash
   node scripts/migrate-airtable-to-supabase.mjs
   ```

2. **Testar sync Greenhouse → Supabase:**
   ```bash
   npm run fetch:greenhouse
   npm run sync:greenhouse:supabase
   ```

3. **Gerar jobs.json do Supabase:**
   ```bash
   npm run sync:supabase
   ```

## 🆘 Troubleshooting

### Erro: "relation 'companies' does not exist"
→ Schema não foi aplicado. Execute o SQL no Dashboard SQL Editor.

### Erro: "Invalid API key"
→ Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto no `.env`.

### Erro: "new row violates row-level security policy"
→ RLS está bloqueando. Verifique políticas RLS ou use service_role key.

### Erro: "permission denied for table"
→ Verifique se está usando `SERVICE_ROLE_KEY` (não `ANON_KEY`) nos scripts.

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)

