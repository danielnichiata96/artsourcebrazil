# Plano de Migração: Airtable → Supabase

## 🎯 Decisão Estratégica

**Pivot completo para Supabase** para resolver limitações do Airtable:
- ✅ **Robustez de banco de dados real** - Acaba com erros de API (rate limits, NOT_AUTHORIZED)
- ✅ **Interface visual mantida** - Table Editor do Supabase oferece experiência similar ao Airtable
- ✅ **Performance superior** - PostgreSQL é muito mais rápido que Airtable
- ✅ **Custos melhores em escala** - Free tier generoso, Pro mais barato que Airtable
- ✅ **Flexibilidade técnica** - SQL, migrations, RLS, extensões PostgreSQL

## 📋 Arquitetura Nova

### Fluxo Proposto

```
APIs (Greenhouse/Ashby/Lever)
    ↓
[Orquestrador Scripts] → Supabase (PostgreSQL)
    ↓
[Table Editor Visual] ← Gestão manual de vagas
    ↓
[Build Script] → jobs.json (geração estática para frontend)
```

### Vantagens vs Airtable

| Aspecto | Airtable | Supabase |
|---------|----------|----------|
| **Banco de Dados** | Proprietário (limitado) | PostgreSQL (padrão da indústria) |
| **Performance** | Rate limits (5 req/s) | Sem limites artificiais |
| **Interface Visual** | ✅ Excelente | ✅ Table Editor (similar) |
| **Queries Complexas** | Limitadas | SQL completo |
| **Custos** | $12-24/mês (limitado) | $25/mês (8GB, 250GB bandwidth) |
| **Escalabilidade** | Limitada | Ilimitada |
| **Migrations** | Manual | Versionadas (Git) |
| **Type Safety** | Não | ✅ TypeScript gen-types |

## 🗄️ Schema do Banco de Dados

### Tabela: `jobs`

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,                    -- Ex: 'WIL-998002'
  company_id UUID REFERENCES companies(id),
  category_id UUID REFERENCES categories(id),
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  apply_link TEXT NOT NULL,
  date_posted DATE NOT NULL,
  location_scope TEXT NOT NULL,           -- 'remote-brazil', 'hybrid', etc.
  contract_type TEXT,                     -- 'CLT', 'PJ', 'Internship', etc.
  status TEXT DEFAULT 'ativa',            -- 'ativa', 'inativa'
  source TEXT NOT NULL,                   -- 'greenhouse', 'ashby', 'lever', 'manual'
  company_logo_url TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT,                   -- 'BRL', 'USD', 'EUR'
  location_detail TEXT,
  location_country_code TEXT(2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date_posted ON jobs(date_posted DESC);
CREATE INDEX idx_jobs_source ON jobs(source);
```

### Tabela: `companies`

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
```

### Tabela: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,              -- 'Game Dev', '3D', 'Animation', 'Design', 'VFX'
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_name ON categories(name);
```

### Tabela: `tags`

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,              -- 'Unity', 'TypeScript', '3D', etc.
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
```

### Tabela: `job_tags` (many-to-many)

```sql
CREATE TABLE job_tags (
  job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);

CREATE INDEX idx_job_tags_job ON job_tags(job_id);
CREATE INDEX idx_job_tags_tag ON job_tags(tag_id);
```

### Enums (PostgreSQL)

```sql
CREATE TYPE location_scope_type AS ENUM (
  'remote-brazil',
  'remote-latam',
  'remote-worldwide',
  'hybrid',
  'onsite'
);

CREATE TYPE contract_type AS ENUM (
  'CLT',
  'PJ',
  'B2B',
  'Freelance',
  'Estágio',
  'Internship'
);

CREATE TYPE job_status AS ENUM (
  'ativa',
  'inativa',
  'rascunho'
);

CREATE TYPE job_source AS ENUM (
  'greenhouse',
  'ashby',
  'lever',
  'manual'
);
```

## 🔄 Processo de Migração

### Fase 1: Setup Supabase

1. **Criar projeto no Supabase**
   - Acessar supabase.com
   - Criar novo projeto
   - Anotar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

2. **Configurar variáveis de ambiente**
   ```bash
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Instalar dependências**
   ```bash
   npm install @supabase/supabase-js
   npm install --save-dev @supabase/cli
   ```

### Fase 2: Criar Schema

1. **Criar migrations**
   ```bash
   npx supabase init
   npx supabase migration new create_jobs_schema
   ```

2. **Definir schema completo** (ver SQL acima)

3. **Aplicar migrations**
   ```bash
   npx supabase db push
   ```

### Fase 3: Popular Dados no Supabase

1. **Script de sincronização** (`scripts/sync-greenhouse-to-supabase.mjs`)
   - Buscar vagas do Greenhouse (ou outras fontes)
   - Normalizar e transformar para formato Supabase
   - Inserir no Supabase com upsert
   - Validar integridade

2. **Testar migração** com subset de dados primeiro

### Fase 4: Reescrever Scripts

1. **`sync-greenhouse-to-supabase.mjs`**
   - Substituir cliente Airtable por Supabase
   - Usar upsert para deduplicação automática
   - Manter lógica de normalização e cleanup

2. **`sync-supabase.mjs`** (gera `jobs.json` do Supabase)
   - Query Supabase com SQL
   - Gerar `jobs.json` mantendo formato atual
   - Manter compatibilidade com frontend

### Fase 5: Atualizar Build Process

1. **Atualizar `package.json` scripts**
   ```json
   {
     "fetch:greenhouse": "node scripts/fetch-greenhouse-jobs.mjs",
     "sync:greenhouse": "node scripts/sync-greenhouse-to-supabase.mjs",
     "sync:jobs": "node scripts/sync-supabase.mjs",
     "sync:full": "npm run fetch:greenhouse && npm run sync:greenhouse && npm run sync:jobs"
   }
   ```

2. **Atualizar prebuild** para usar Supabase

## 📊 Comparação de Operações

### Airtable (Atual)

```javascript
// Criar registro
await base('Job Postings').create(fields);

// Buscar registros
await base('Job Postings')
  .select({ filterByFormula: `{Status} = 'Ativa'` })
  .all();

// Atualizar registro
await base('Job Postings').update(recordId, fields);
```

### Supabase (Novo)

```javascript
// Criar/Atualizar (upsert)
await supabase
  .from('jobs')
  .upsert({ id, ...fields }, { onConflict: 'id' });

// Buscar registros
await supabase
  .from('jobs')
  .select('*, companies(*), categories(*), job_tags(tags(*))')
  .eq('status', 'ativa')
  .order('date_posted', { ascending: false });

// Atualizar registro
await supabase
  .from('jobs')
  .update(fields)
  .eq('id', jobId);
```

## ✅ Checklist de Migração

- [ ] Projeto Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Schema do banco criado (migrations)
- [ ] Script de migração Airtable → Supabase
- [ ] Dados migrados e validados
- [ ] `sync-greenhouse-to-supabase.mjs` criado
- [ ] `sync-supabase.mjs` criado
- [ ] Scripts npm atualizados
- [ ] Frontend testado com dados do Supabase
- [ ] Documentação atualizada
- [ ] Airtable deprecado (manter backup)

## 🚀 Benefícios Imediatos

1. **Sem erros de API** - PostgreSQL não tem rate limits artificiais
2. **Performance** - Queries SQL muito mais rápidas
3. **Deduplicação robusta** - Upsert nativo do PostgreSQL
4. **Interface visual mantida** - Table Editor do Supabase
5. **Escalabilidade** - Preparado para milhares de vagas
6. **Type Safety** - TypeScript types gerados automaticamente
7. **Migrations versionadas** - Schema em Git
8. **Backup automático** - Supabase faz backups diários

## 📝 Próximos Passos

1. **Setup inicial** (Fase 1-2)
2. **Migrar dados** (Fase 3)
3. **Reescrever scripts** (Fase 4)
4. **Testar end-to-end** (Fase 5)
5. **Deprecar Airtable** (após validação completa)

