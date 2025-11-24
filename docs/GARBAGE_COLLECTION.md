# Garbage Collection - Estratégia de Vagas Fantasmas

## 🚨 O Problema das "Vagas Fantasmas"

### Cenário Real:
1. **Segunda-feira:** Wildlife Studios publica vaga "Senior 3D Artist"
2. **Script roda:** Vaga é salva no Supabase com `status = 'ativa'`
3. **Quarta-feira:** Wildlife fecha a vaga (preenchida ou cancelada)
4. **Script roda novamente:** API da Wildlife **não retorna mais essa vaga**
5. **Resultado:** Vaga continua `status = 'ativa'` no seu banco **para sempre** ❌

### Por que isso acontece?

Os fetchers atuais apenas fazem **INSERT** ou **UPDATE**:

```javascript
// ❌ PROBLEMA: Apenas processa o que vem da API
for (const job of apiJobs) {
  await supabase
    .from('jobs')
    .upsert({
      id: job.id,
      status: 'ativa',
      // ... outros campos
    });
}

// ❌ Vagas que NÃO vieram da API ficam órfãs!
```

**Consequência:** Seu site mostra vagas que não existem mais, candidatos se frustram, sua credibilidade cai.

---

## ✅ A Solução: Sync Sessions

### Conceito

Cada execução do fetcher é uma "sessão de sincronização" com ID único. Apenas as vagas **tocadas** nessa sessão permanecem ativas.

### Arquitetura

```
┌─────────────────────────────────────────────────────┐
│ 1. Início da Sync Session                           │
│    sync_id = UUID.generate()                        │
│    timestamp = now()                                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 2. Processar Cada Vaga da API                       │
│    upsert({                                         │
│      ...job_data,                                   │
│      sync_id: sync_id,         ← Marca como "viva" │
│      last_synced_at: timestamp                      │
│    })                                               │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 3. Garbage Collection (Final da Sessão)            │
│    UPDATE jobs                                      │
│    SET status = 'closed'                            │
│    WHERE company_id = 'wildlife-studios'            │
│      AND sync_id != current_sync_id                 │
│      AND status = 'ativa'                           │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementação

### Passo 1: Atualizar Schema do Supabase

```sql
-- Adicionar colunas para Garbage Collection
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS sync_id UUID,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();

-- Índice para performance na query de GC
CREATE INDEX IF NOT EXISTS idx_jobs_sync_id ON jobs(sync_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_id, status);
```

### Passo 2: Modificar Fetchers

#### Antes (❌ Sem GC):
```javascript
async function fetchJobs() {
  const jobs = await fetchFromAPI();
  
  for (const job of jobs) {
    await supabase.from('jobs').upsert(normalizeJob(job));
  }
  
  console.log('✅ Done!');
}
```

#### Depois (✅ Com GC):
```javascript
import { randomUUID } from 'node:crypto';

async function fetchJobs() {
  // 1. Criar Sync Session
  const syncId = randomUUID();
  const syncTimestamp = new Date().toISOString();
  
  console.log(`🔄 Starting Sync Session: ${syncId}`);
  
  // 2. Processar vagas (marca com sync_id)
  const jobs = await fetchFromAPI();
  const processedIds = [];
  
  for (const job of jobs) {
    const normalized = normalizeJob(job);
    
    await supabase.from('jobs').upsert({
      ...normalized,
      sync_id: syncId,              // ← Marca como "tocada"
      last_synced_at: syncTimestamp,
      status: 'ativa',
    });
    
    processedIds.push(normalized.id);
  }
  
  console.log(`✅ Processed ${processedIds.length} jobs`);
  
  // 3. Garbage Collection
  await garbageCollectJobs(syncId, 'wildlife-studios');
}

/**
 * Mark jobs that weren't in this sync as closed
 */
async function garbageCollectJobs(currentSyncId, companyId) {
  console.log(`🗑️  Running Garbage Collection for ${companyId}...`);
  
  const { data, error } = await supabase
    .from('jobs')
    .update({ 
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)
    .eq('status', 'ativa')
    .neq('sync_id', currentSyncId);
  
  if (error) {
    console.error('❌ GC Error:', error);
    return;
  }
  
  console.log(`🗑️  Closed ${data?.length || 0} stale jobs`);
}
```

---

## 📊 Exemplo de Fluxo Completo

### Dia 1: Primeira Sync
```
API retorna:
- job-001 (3D Artist)
- job-002 (Animator)
- job-003 (Engineer)

Banco após sync (sync_id = aaa-111):
id       | status  | sync_id
---------|---------|----------
job-001  | ativa   | aaa-111
job-002  | ativa   | aaa-111
job-003  | ativa   | aaa-111
```

### Dia 2: Segunda Sync (job-002 foi fechada)
```
API retorna:
- job-001 (3D Artist)
- job-003 (Engineer)
- job-004 (Designer) ← NOVA

Processamento (sync_id = bbb-222):
1. Upsert job-001 → sync_id = bbb-222
2. Upsert job-003 → sync_id = bbb-222
3. Upsert job-004 → sync_id = bbb-222 (nova)

Garbage Collection:
UPDATE jobs SET status = 'closed'
WHERE company_id = 'wildlife-studios'
  AND status = 'ativa'
  AND sync_id != 'bbb-222'
  
→ Fecha job-002 (sync_id ainda é aaa-111)

Banco após GC:
id       | status  | sync_id  | closed_at
---------|---------|----------|------------------
job-001  | ativa   | bbb-222  | null
job-002  | closed  | aaa-111  | 2025-01-16T10:00
job-003  | ativa   | bbb-222  | null
job-004  | ativa   | bbb-222  | null
```

---

## 🎯 Estratégias Avançadas

### 1. Grace Period (Período de Tolerância)

Evita fechar vagas por falhas temporárias da API:

```javascript
// Só fecha vagas que não foram sincronizadas há mais de 7 dias
await supabase
  .from('jobs')
  .update({ status: 'closed' })
  .eq('company_id', companyId)
  .eq('status', 'ativa')
  .lt('last_synced_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
```

**Vantagem:** Protege contra:
- API temporariamente fora
- Rate limiting
- Erros de rede

**Desvantagem:** Vagas fechadas demoram até 7 dias para sumir

### 2. Soft Delete (Arquivar ao invés de fechar)

```javascript
// Ao invés de status = 'closed', use 'archived'
await supabase
  .from('jobs')
  .update({ 
    status: 'archived',
    archived_at: new Date().toISOString(),
  })
  .eq('company_id', companyId)
  .neq('sync_id', currentSyncId);

// Frontend filtra: WHERE status NOT IN ('closed', 'archived')
```

**Vantagem:** Histórico de vagas para analytics

### 3. Multi-Source Reconciliation

Se você busca a mesma vaga de múltiplas fontes (ex: vaga no site + vaga no Remotive):

```javascript
// Marca vaga como "vista" em qualquer fonte
await supabase
  .from('job_sources')
  .upsert({
    job_id: jobId,
    source: 'remotive',
    sync_id: syncId,
    last_seen_at: now(),
  });

// Só fecha se NENHUMA fonte viu a vaga
await supabase.rpc('close_jobs_not_seen_anywhere', { sync_id: syncId });
```

---

## 🧪 Como Testar

### Teste 1: Simular Vaga Fechada

```javascript
// 1. Rodar fetcher normalmente
node scripts/fetch-greenhouse-jobs.mjs

// 2. No Supabase, obter um job_id
// SELECT id, title, sync_id FROM jobs LIMIT 1;

// 3. Manualmente remover do resultado da API (editar script)
const jobs = apiJobs.filter(j => j.id !== 'JOB_ID_TO_TEST');

// 4. Rodar fetcher novamente
node scripts/fetch-greenhouse-jobs.mjs

// 5. Verificar que a vaga foi fechada
// SELECT * FROM jobs WHERE id = 'JOB_ID_TO_TEST';
// → status deve ser 'closed'
```

### Teste 2: Verificar Logs

```bash
node scripts/fetch-greenhouse-jobs.mjs

# Output esperado:
# 🔄 Starting Sync Session: 123e4567-e89b-12d3-a456-426614174000
# ✅ Processed 15 jobs
# 🗑️  Running Garbage Collection for wildlife-studios...
# 🗑️  Closed 3 stale jobs
```

---

## ⚠️ Cuidados Importantes

### 1. Company-Specific GC
```javascript
// ❌ ERRADO: Fecha vagas de TODAS as empresas
await supabase.from('jobs').update({ status: 'closed' });

// ✅ CERTO: Só fecha vagas da empresa sendo sincronizada
await supabase
  .from('jobs')
  .update({ status: 'closed' })
  .eq('company_id', 'wildlife-studios'); // ← CRÍTICO!
```

### 2. Status Transitions
```javascript
// ❌ ERRADO: Pode reabrir vagas manualmente fechadas
.eq('status', 'ativa')

// ✅ CERTO: Só fecha vagas que estavam ativas
.in('status', ['ativa', 'pending_approval'])
```

### 3. Sync Frequency

```javascript
// Se rodar muito frequente (< 1 hora), use grace period
const GRACE_PERIOD_HOURS = 2;

await supabase
  .from('jobs')
  .update({ status: 'closed' })
  .neq('sync_id', currentSyncId)
  .lt('last_synced_at', 
    new Date(Date.now() - GRACE_PERIOD_HOURS * 60 * 60 * 1000).toISOString()
  );
```

---

## 📋 Checklist de Implementação

### Schema Changes:
- [ ] Adicionar coluna `sync_id UUID` na tabela `jobs`
- [ ] Adicionar coluna `last_synced_at TIMESTAMPTZ` na tabela `jobs`
- [ ] Adicionar coluna `closed_at TIMESTAMPTZ` na tabela `jobs`
- [ ] Criar índices para performance (`sync_id`, `company_id + status`)

### Fetcher Changes:
- [ ] Gerar `sync_id` no início de cada execução
- [ ] Adicionar `sync_id` e `last_synced_at` em todos os upserts
- [ ] Implementar função `garbageCollectJobs()`
- [ ] Chamar GC no final de cada fetcher
- [ ] Adicionar logs de GC (quantas vagas fechadas)

### Testing:
- [ ] Testar GC com vaga removida manualmente
- [ ] Verificar que apenas a empresa correta é afetada
- [ ] Confirmar que vagas 'closed' não são reabertas
- [ ] Testar grace period se implementado

### Monitoring:
- [ ] Log do sync_id em cada execução
- [ ] Contagem de vagas processadas
- [ ] Contagem de vagas fechadas por GC
- [ ] Alertas se muitas vagas fechadas de uma vez (possível bug)

---

## 🎯 Próximos Passos

1. **Atualizar schema do Supabase** com novas colunas
2. **Modificar os 3 fetchers** (Greenhouse, Lever, Ashby) para incluir sync_id
3. **Testar com uma empresa** (ex: Wildlife Studios)
4. **Monitorar logs** para ver quantas vagas são fechadas
5. **Considerar grace period** se houver falsos positivos

---

## 📚 Referências

- **Soft Deletes:** https://en.wikipedia.org/wiki/Soft_delete
- **ETL Best Practices:** Sync sessions são padrão em pipelines de dados
- **Idempotência:** Garantir que executar o script 2x não causa problemas

---

## 🐛 Troubleshooting

### Problema: Muitas vagas sendo fechadas
**Causa:** API retornou menos vagas que o normal (rate limit, bug)

**Solução:**
```javascript
// Adicionar validação antes do GC
const minExpectedJobs = 10; // Wildlife normalmente tem 15+ vagas

if (processedIds.length < minExpectedJobs) {
  console.warn('⚠️  Too few jobs processed, skipping GC');
  return;
}
```

### Problema: Vagas não estão sendo fechadas
**Causa:** Filtro errado na query de GC

**Solução:**
```javascript
// Debug: Mostrar quais vagas seriam fechadas
const { data } = await supabase
  .from('jobs')
  .select('id, title, sync_id')
  .eq('company_id', companyId)
  .neq('sync_id', currentSyncId);

console.log('Would close:', data);
```

### Problema: Vaga reaparece depois de fechada
**Causa:** Empresa republicou a vaga com mesmo ID

**Solução:** Isso é comportamento correto! A vaga foi reaberta.

---

## ✅ Status Atual

**Implementação:** ❌ NÃO IMPLEMENTADO nos fetchers atuais

**Prioridade:** 🔴 ALTA (problema crítico de UX)

**Próxima ação:** Atualizar schema do Supabase e modificar fetchers

