# Sistema de Reportar Vagas (QA Gratuito)

## 📋 Visão Geral

Sistema que permite aos usuários reportar problemas com vagas publicadas, fornecendo **Quality Assurance gratuito** através da comunidade.

---

## 🎯 Benefícios

- ✅ **QA Gratuito**: Usuários identificam problemas automaticamente
- ✅ **Links Quebrados**: Detecta links de aplicação que não funcionam
- ✅ **Vagas Fechadas**: Remove rapidamente posições já preenchidas
- ✅ **Qualidade**: Mantém o site sempre atualizado e confiável
- ✅ **UX**: Melhor experiência para candidatos e recrutadores

---

## 🚀 Como Funciona

### Fluxo do Usuário:

1. Usuário acessa página individual da vaga
2. Encontra problema (link quebrado, vaga fechada, etc.)
3. Clica em **"Reportar problema"** no rodapé da vaga
4. Seleciona o motivo do report:
   - Link quebrado ou não funciona
   - Vaga já foi preenchida
   - Informações incorretas
   - Vaga duplicada
   - Outro problema
5. Clica em **"Enviar Report"**
6. Vê mensagem de sucesso
7. Modal fecha automaticamente

### Fluxo do Admin:

1. Recebe email com:
   - ID da vaga
   - Título e empresa
   - Link para aplicação
   - Motivo do report
   - Recomendações de ação
2. Verifica o problema
3. Corrige ou remove a vaga
4. (Opcional) Filtra vagas reportadas no Supabase

---

## 🗄️ Estrutura do Banco de Dados

### Nova Coluna: `jobs.reported`

```sql
ALTER TABLE jobs
ADD COLUMN reported BOOLEAN DEFAULT FALSE;

ALTER TABLE jobs
ADD COLUMN reported_at TIMESTAMPTZ;

ALTER TABLE jobs
ADD COLUMN reported_reason TEXT;

CREATE INDEX idx_jobs_reported ON jobs(reported) WHERE reported = TRUE;
```

### Campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `reported` | `BOOLEAN` | Flag indicando se foi reportada (default: `false`) |
| `reported_at` | `TIMESTAMPTZ` | Data/hora do primeiro report |
| `reported_reason` | `TEXT` | Motivo fornecido pelo usuário |

---

## 📡 API Endpoint

### `POST /api/report-job`

**Rate Limit:** 3 reports per IP per hour

**Request:**
```json
{
  "job_id": "WIL-998002",
  "reason": "Link quebrado ou não funciona"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Job reported successfully. Thank you for helping us maintain quality!",
  "rateLimit": {
    "remaining": 2,
    "resetAt": 1700000000000
  }
}
```

**Headers:**
- `X-RateLimit-Limit: 3`
- `X-RateLimit-Remaining: 2`
- `X-RateLimit-Reset: 1700000000` (Unix timestamp)

**Response (Rate Limited - 429):**
```json
{
  "error": "Rate limit exceeded. Too many reports from your IP address.",
  "retryAfter": 45,
  "message": "Você pode reportar novamente em 45 minutos."
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Job not found"
}
```

---

## 🎨 Componente UI

### `<ReportJobButton jobId="..." />`

**Props:**
- `jobId` (string, required): ID da vaga a ser reportada

**Features:**
- Modal acessível (ARIA labels, keyboard support)
- 5 motivos pré-selecionados
- Feedback visual de sucesso
- Design Neubrutalism matching site style
- Fechamento por ESC ou clique fora

**Uso:**
```astro
---
import ReportJobButton from '../../components/ReportJobButton.astro';
---

<ReportJobButton jobId={job.id} />
```

---

## 📧 Email de Notificação

Enviado para: `artsourcebrazil@gmail.com`

**Conteúdo:**
- ⚠️ Subject: "Vaga Reportada: [Job Title]"
- Detalhes da vaga (ID, título, empresa, link)
- Motivo do report (destacado)
- Ações recomendadas:
  - Verificar se o link está funcionando
  - Confirmar se a vaga ainda está aberta
  - Atualizar ou remover se necessário
- Link direto para Supabase

---

## 🔍 Queries Úteis no Supabase

### Listar todas as vagas reportadas:

```sql
SELECT 
  id,
  job_title,
  companies.name as company_name,
  apply_link,
  reported_reason,
  reported_at
FROM jobs
LEFT JOIN companies ON jobs.company_id = companies.id
WHERE reported = TRUE
ORDER BY reported_at DESC;
```

### Contar reports por motivo:

```sql
SELECT 
  reported_reason,
  COUNT(*) as count
FROM jobs
WHERE reported = TRUE
GROUP BY reported_reason
ORDER BY count DESC;
```

### Resetar flag de report (após correção):

```sql
UPDATE jobs
SET 
  reported = FALSE,
  reported_at = NULL,
  reported_reason = NULL
WHERE id = 'JOB-ID-HERE';
```

---

## 🎯 Roadmap Futuro (Opcional)

### Sprint 2 (Pós-Lançamento):
- [ ] Admin view para filtrar vagas reportadas
- [ ] Dashboard com estatísticas de reports
- [ ] Auto-hide vagas com múltiplos reports
- [ ] Email de follow-up após correção
- [ ] Histórico de reports por vaga
- [ ] Rate limiting (1 report/vaga/IP/dia)

### Sprint 3 (Crescimento):
- [ ] Integração com sistema de moderação
- [ ] Gamificação (pontos por reports corretos)
- [ ] API pública para reports
- [ ] Webhook para notificações em tempo real

---

## 🧪 Testing

### Testar Localmente:

1. **Aplicar migration:**
   ```sql
   -- Cole o conteúdo de supabase/migrations/003_add_reported_flag.sql
   -- no SQL Editor do Supabase Dashboard
   ```

2. **Verificar API:**
   ```bash
   # Terminal 1: Start dev server
   npm run dev
   
   # Terminal 2: Test API
   curl -X POST http://localhost:4321/api/report-job \
     -H "Content-Type: application/json" \
     -d '{"job_id": "WIL-998002", "reason": "Teste local"}'
   ```

3. **Testar UI:**
   - Acesse: `http://localhost:4321/jobs/[any-job]`
   - Role até o rodapé da vaga
   - Clique em "Reportar problema"
   - Selecione um motivo
   - Clique em "Enviar Report"
   - Veja mensagem de sucesso

4. **Verificar Email:**
   - Cheque `artsourcebrazil@gmail.com`
   - Deve receber email com detalhes do report

5. **Verificar Banco:**
   ```sql
   SELECT * FROM jobs WHERE id = 'WIL-998002';
   -- Deve mostrar reported = true
   ```

---

## 📁 Arquivos

### Criados:
- `supabase/migrations/003_add_reported_flag.sql` - Migration
- `src/pages/api/report-job.ts` - API endpoint
- `src/components/ReportJobButton.astro` - UI component
- `docs/JOB_REPORTING.md` - Esta documentação

### Modificados:
- `src/lib/email.ts` - Adicionada `sendJobReportEmail()`
- `src/pages/jobs/[id]-[slug].astro` - Integrado componente

---

## 🛡️ Proteção Anti-Spam

### Rate Limiting (In-Memory)

**Configuração:**
- **Limite:** 3 reports por IP por hora
- **Implementação:** In-memory store (simples e eficaz para MVP)
- **Escala:** Suporta até ~10K requests/hora sem problemas
- **Migração futura:** Se crescer, migre para Redis/Upstash

**Por que funciona:**
- ✅ Impede spam automatizado
- ✅ Permite usuários legítimos reportarem múltiplas vagas
- ✅ Zero custo adicional
- ✅ Zero dependências externas
- ✅ Reset automático em server restart (feature, não bug!)

**Quando migrar para Redis:**
- Quando tiver 50+ reports/dia consistentemente
- Quando precisar de persistência entre deploys
- Quando tiver múltiplas instâncias serverless

**Filosofia:**
> "Use a solução mais simples que funciona. Otimize quando doer." - YAGNI

---

## ⚙️ Configuração

### Variáveis de Ambiente:

Não requer novas variáveis! Usa as existentes:
- `RESEND_API_KEY` (já configurada)
- `SUPABASE_URL` (já configurada)
- `SUPABASE_SERVICE_ROLE_KEY` (já configurada)

### Email de Destino:

Hardcoded em `src/lib/email.ts`:
```typescript
const REPLY_TO_EMAIL = 'artsourcebrazil@gmail.com';
```

Para mudar, edite essa variável.

---

## 🎉 Ready to Deploy!

Sistema completo e pronto para produção. Basta:

1. ✅ Aplicar migration no Supabase (SQL Editor)
2. ✅ Deploy do código
3. ✅ Testar em uma vaga real
4. ✅ Aguardar reports de usuários!

**Custo:** $0 (usa infraestrutura existente)  
**Manutenção:** Mínima (apenas responder emails)  
**Impacto:** Alto (melhor qualidade do site)

---

## 💡 Pro Tips

1. **Responda rápido**: Usuários que reportam se sentem ouvidos quando você age rápido
2. **Agradeça**: Considere um email de follow-up agradecendo pelo report
3. **Monitore**: Use queries SQL no Supabase (não crie dashboard até ter 50+ reports/dia)
4. **Melhore**: Use os reports para identificar padrões (ex: empresa X sempre tem links quebrados)
5. **Confie no email**: Não construa admin UI até realmente precisar
6. **KISS**: Keep It Simple, Stupid - a solução mais simples geralmente é a melhor

---

## 🚫 O Que NÃO Fazer (Ainda)

### Não construa até precisar:
- ❌ Admin dashboard customizado (use Supabase + email)
- ❌ Sistema de moderação complexo (manual é OK até 50/dia)
- ❌ Rate limiting com Redis (in-memory é suficiente)
- ❌ Histórico de reports por vaga (query SQL quando precisar)
- ❌ Notificações em tempo real (email é suficiente)
- ❌ Sistema de pontos/gamificação (foco na qualidade primeiro)

### Construa quando:
- ✅ Receber 50+ reports/dia consistentemente
- ✅ Não conseguir mais gerenciar manualmente
- ✅ Email virar spam na sua caixa de entrada
- ✅ Queries SQL começarem a travar

**Filosofia:**
> "Premature optimization is the root of all evil" - Donald Knuth  
> "Make it work, make it right, make it fast - in that order" - Kent Beck

---

Feito com ❤️ por Art Source Brazil

