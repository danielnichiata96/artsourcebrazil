# Daily Workflow - Manual Job Curation

> **Filosofia**: Qualidade > Automação. Você é o curador, não um robô.

---

## ☕ O "Ritual do Café da Manhã"

**Frequência**: 1x por dia (08:00 - 09:00)  
**Duração**: ~30-45 minutos  
**Objetivo**: Curar as melhores vagas criativas do dia

---

## 📋 Checklist Diário

### **1️⃣ Buscar Vagas (5-10 min)**

```bash
cd ~/Documents/remotejobsbr

# Puxa vagas de todas as fontes
npm run fetch:all

# Output esperado:
# ✅ Greenhouse: 15 jobs
# ✅ Ashby: 0 jobs
# ✅ Lever: 8 jobs
# 📦 Total: 23 jobs coletados
```

**O que acontece:**
- Scripts batem nas APIs do Greenhouse, Ashby, Lever
- Categorizam automaticamente (`categorizeJob()`)
- Salvam em `scripts/*-jobs-output.json`

---

### **2️⃣ Sincronizar para Supabase (5-10 min)**

```bash
# Opção A: Sync tudo de uma vez (recomendado)
npm run sync:all

# Opção B: Sync individual (se algum fonte falhou)
npm run sync:greenhouse
npm run sync:lever
```

**O que acontece:**
- Lê os JSON gerados pelo fetch
- Aplica AI enhancement (Gemini melhora as descrições)
- Faz UPSERT no Supabase
- Status inicial: `status: 'ativa'` (todas aprovadas por padrão)

**⚠️ Nota**: Com sua curadoria manual, talvez queira mudar para `status: 'draft'` por padrão. Ver seção "Modo Draft" abaixo.

---

### **3️⃣ Curadoria no Supabase (15-20 min)**

#### **Opção A: Supabase Dashboard (Rápido)**

1. **Acesse**: https://supabase.com → Seu Projeto → Table Editor → `jobs`
2. **Filtrar**: `status = 'ativa'` AND `created_at > hoje`
3. **Revisar cada vaga:**
   - ✅ Boa vaga criativa → Deixar como está
   - ❌ Marketing genérico/RH/Contabilidade → `status = 'fechada'`
   - 🗑️ Spam/Irrelevante → DELETE

#### **Opção B: Admin Dashboard (Melhor UX - Future)**

Você já tem o dashboard em `/admin`:

1. Login com senha
2. Ver lista de "Pendentes"
3. Botões: ✅ Aprovar | ❌ Rejeitar
4. Bulk actions para aprovar várias de uma vez

**🔧 TODO**: Adaptar dashboard para mostrar jobs de hoje (não só drafts).

---

### **4️⃣ Rebuild do Site (2 min)**

#### **Opção A: Automático (Se configurou VERCEL_DEPLOY_HOOK)**

O script `sync:all` já disparou o rebuild. Aguarde ~2 min.

```bash
# Verifica se rebuild foi disparado
# (deve ter aparecido no final do sync:all)
✅ Vercel rebuild triggered successfully!
```

#### **Opção B: Manual (Se não tem webhook ainda)**

```bash
# Via Vercel CLI
vercel --prod

# Ou pelo dashboard da Vercel
# → Deployments → Redeploy
```

#### **Opção C: Git Push (Sempre funciona)**

```bash
git add .
git commit -m "chore: daily job curation $(date +%Y-%m-%d)"
git push origin main
# ✅ Vercel auto-deploys
```

---

### **5️⃣ Divulgação (5-10 min)**

**Escolher a "Vaga do Dia":**

Critérios:
- 💎 Empresa conhecida (Wildlife, Ubisoft, etc.)
- 🎨 Vaga 100% criativa (3D Artist, Game Designer, VFX)
- 💰 Salário bom OU remoto global
- 🆕 Acabou de abrir (posted_date = hoje)

**Postar no LinkedIn:**

```
🎮 VAGA ABERTA: [Título da Vaga]

[Empresa] está contratando [cargo]!

📍 [Localização]
💼 [Tipo de contrato]
💰 [Salário se tiver]

👉 Candidate-se: [link do seu site]/jobs/[job-id]

#VagasRemotasBrasil #GameDev #[AreaDaVaga]
```

**Exemplo Real:**
```
🎮 VAGA ABERTA: Senior 3D Game Artist

Wildlife Studios está contratando para Brawl Stars!

📍 Remoto - Brasil
💼 CLT
💰 R$ 12-18k

Requisitos: Experiência com Stylized Art, Maya/Blender, 
pipeline de mobile games.

👉 Candidate-se: artsourcebrazil.com/jobs/WIL-998002

#VagasRemotasBrasil #GameDev #3DArt
```

---

## ⚙️ Configuração Inicial (Uma vez)

### **Modo Draft (Recomendado para Curadoria Manual)**

Se você quer revisar ANTES de publicar:

**1. Alterar scripts de sync para status='draft':**

```bash
# Em cada sync-*-to-supabase.mjs, mudar:
status: 'ativa'  →  status: 'draft'
```

**2. Workflow ajustado:**
```
fetch:all → sync:all (status=draft) 
→ Revisar no Supabase 
→ Aprovar manualmente (draft → ativa)
→ Rebuild site
```

**3. Admin Dashboard passa a funcionar:**
```
/admin → Lista só drafts → Aprovar/Rejeitar → Auto-rebuild
```

---

## 📊 Métricas a Monitorar

### **Diariamente:**

```sql
-- Total de vagas ativas
SELECT COUNT(*) FROM jobs WHERE status = 'ativa';

-- Vagas adicionadas hoje
SELECT COUNT(*) FROM jobs 
WHERE created_at::date = CURRENT_DATE;

-- Breakdown por categoria
SELECT category_id, COUNT(*) 
FROM jobs WHERE status = 'ativa'
GROUP BY category_id;

-- Vagas por empresa (top 5)
SELECT company_id, COUNT(*) 
FROM jobs WHERE status = 'ativa'
GROUP BY company_id
ORDER BY COUNT(*) DESC
LIMIT 5;
```

### **Semanalmente:**

- Quantas vagas você rejeitou? (para ajustar categorização)
- Qual categoria tem mais vagas?
- Qual empresa posta mais?

---

## 🚀 Evolução do Workflow

### **Fase 1: Manual Total (Agora)**
```
Você roda scripts → Você aprova → Você faz rebuild
```
**Vantagens**: Controle total, aprende o mercado  
**Desvantagens**: 30-45 min/dia do seu tempo

---

### **Fase 2: Semi-Automático (3-6 meses)**
```
Cron roda scripts → Você aprova → Auto-rebuild
```
**Setup**: GitHub Actions cron (1x/dia às 08:00)  
**Você**: Só entra para aprovar (10-15 min/dia)

---

### **Fase 3: Automático com Regras (1 ano)**
```
Cron roda → IA categoriza + aprova automaticamente → Auto-rebuild
```
**Regras de Auto-Aprovação:**
- Empresa whitelist (Wildlife, Ubisoft, etc.)
- Categoria = Art, Engineering, Design
- Salário > X
- Título não contém ["Marketing", "RH", "Sales"]

**Você**: Só monitora exceções (5 min/dia)

---

## 📝 Scripts Úteis

### **Ver vagas de hoje:**
```bash
# No terminal
npm run dev

# Acessar: http://localhost:4321/admin
# Filtrar: created_at >= hoje
```

### **Resetar vagas de teste:**
```sql
-- No Supabase SQL Editor
DELETE FROM jobs WHERE source = 'manual';
```

### **Backup antes de experimentar:**
```bash
# Export do Supabase
npm run sync:supabase
# ✅ Cria backup em src/data/jobs.json
```

---

## 🎯 Checklist Semanal (Sextas)

- [ ] Revisar vagas que ninguém aplicou (marcar como fechadas?)
- [ ] Checar se empresas removeram vagas (sync atualiza isso)
- [ ] Analisar qual categoria teve mais vagas
- [ ] Planejar post do LinkedIn da próxima semana
- [ ] Fazer backup do Supabase (`npm run sync:supabase`)

---

## 🆘 Troubleshooting

### **Fetch falhou:**
```bash
# Rodar individualmente para ver o erro
npm run fetch:greenhouse
npm run fetch:ashby
npm run fetch:lever

# Erros comuns:
# - Rate limit: Aguardar 1h e tentar de novo
# - API key inválida: Checar .env
# - Empresa removeu API pública: Remover do script
```

### **Sync não aplicou IA:**
```bash
# Checar se tem API key
echo $GOOGLE_GEMINI_API_KEY

# Se vazio, descrições não serão melhoradas
# Adicionar no .env e rodar sync de novo
```

### **Site não atualizou:**
```bash
# 1. Checar se Supabase tem os jobs
npm run test:supabase

# 2. Forçar rebuild
git commit --allow-empty -m "force rebuild"
git push origin main

# 3. Checar logs da Vercel
# → Vercel Dashboard → Deployments → Ver logs
```

---

## 📚 Documentos Relacionados

- [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md) - Visão técnica completa
- [CATEGORIES_GUIDE.md](./CATEGORIES_GUIDE.md) - Como funciona a categorização
- [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) - Como usar o dashboard
- [FETCHERS_GUIDE.md](./FETCHERS_GUIDE.md) - Como adicionar novas fontes

---

**Última atualização**: $(date +%Y-%m-%d)

