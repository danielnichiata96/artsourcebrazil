# MVP Checklist - Lançamento do Site

## 🎯 Objetivo

**Ter vagas no site o mais rápido possível.**

GC (Garbage Collection) pode esperar. No Dia 1, todas as vagas são novas. Nenhuma vai "morrer" nas primeiras 24-48h.

---

## ✅ Fase 1: Popular o Banco (AGORA)

### 1. Testar Fetchers
- [ ] Executar `node scripts/fetch-lever-jobs.mjs`
  - Empresa: Fanatee
  - Output: `scripts/lever-jobs-output.json`
  - Verificar: Categorias, location scopes, links

- [ ] Executar `node scripts/fetch-ashby-jobs.mjs`
  - Empresa: Deel
  - Output: `scripts/ashby-jobs-output.json`
  - Verificar: Categorias, location scopes, links

- [ ] Executar `node scripts/fetch-greenhouse-jobs.mjs`
  - Empresa: Wildlife Studios (padrão)
  - Output: `scripts/greenhouse-jobs-output.json`
  - Verificar: Categorias, location scopes, links

### 2. Validar Outputs
- [ ] Abrir cada JSON output
- [ ] Conferir estrutura de dados:
  ```json
  {
    "id": "string",
    "companyName": "string",
    "jobTitle": "string",
    "category": "Game Dev|3D|2D Art|Animation|Design|VFX",
    "location": { "scope": "remote-brazil|remote-latam|...", "text": "..." },
    "applyLink": "https://..." (link direto, não intermediário)
  }
  ```
- [ ] Validar que links de aplicação são diretos
- [ ] Conferir se categories estão corretas
- [ ] Verificar location scopes fazem sentido

### 3. Integrar com Supabase
- [ ] Confirmar schema do Supabase está correto (`jobs` table)
- [ ] Criar script para sync dos JSONs → Supabase
- [ ] Testar upsert (insert primeira vez, update na segunda)
- [ ] Verificar que não cria duplicatas
- [ ] Confirmar dados no Supabase Table Editor

### 4. Validar Frontend
- [ ] Executar `npm run dev`
- [ ] Abrir `http://localhost:4321`
- [ ] Verificar que vagas aparecem no site
- [ ] Testar filtros (categoria, location)
- [ ] Testar links de aplicação (redirecionam corretamente)
- [ ] Conferir visual está OK

### 5. Deploy
- [ ] Build de produção (`npm run build`)
- [ ] Deploy para Vercel/Netlify
- [ ] Verificar site em produção
- [ ] Testar em produção (vagas carregam, filtros funcionam)

---

## 🚀 Fase 2: Lançamento (Semana 1)

### Marketing & Divulgação
- [ ] Postar no LinkedIn
- [ ] Compartilhar em grupos relevantes
- [ ] Divulgar para primeira onda de usuários
- [ ] Monitorar feedback inicial
- [ ] Coletar métricas (visitas, cliques em vagas)

### Monitoramento
- [ ] Verificar que vagas estão sendo visualizadas
- [ ] Conferir se candidatos estão aplicando
- [ ] Monitorar erros no console
- [ ] Coletar feedback de usuários

---

## 📅 Fase 3: Pós-Lançamento (Sprint 2)

### Apenas DEPOIS de lançar:
- [ ] Adicionar mais empresas aos fetchers
  - Greenhouse: Automattic, GitLab, Monks
  - Lever: Outras empresas
  - Ashby: Ashby, outras empresas

- [ ] Criar orquestrador multi-fonte
  - Script que roda os 3 fetchers de uma vez
  - Consolida outputs
  - Sync único para Supabase

- [ ] **AGORA SIM:** Implementar Garbage Collection
  - Aplicar schema changes (sync_id, last_synced_at)
  - Atualizar os 3 fetchers com GC
  - Testar que vagas antigas são fechadas
  - Monitorar quantas vagas são fechadas por dia

- [ ] Automatizar com GitHub Actions
  - Daily cron job
  - Executa orquestrador
  - Notifica em caso de erro

---

## 🎯 Métricas de Sucesso (MVP)

### Dia 1:
- **Meta mínima:** 20+ vagas no site
- **Meta ideal:** 50+ vagas no site
- **Empresas:** Pelo menos 2-3 empresas diferentes
- **Categorias:** Distribuição razoável entre Game Dev, 3D, 2D, Design

### Semana 1:
- **Visitas:** 100+ visitantes únicos
- **Cliques em vagas:** 20+ cliques em "Aplicar"
- **Feedback:** Pelo menos 3-5 comentários/feedbacks
- **Vagas atualizadas:** Pelo menos 1 nova sync executada

---

## ⚠️ O que NÃO fazer no MVP

### ❌ NÃO se preocupe agora com:
- Garbage Collection (GC) - implementar na Sprint 2
- Automação com GitHub Actions - fazer manual por enquanto
- 20+ empresas - foque em 2-3 empresas para começar
- Perfeição nos mapeamentos - ajuste após feedback
- Analytics avançado - adicione depois
- Scraper complexo - foque nas APIs públicas

### ✅ FOQUE apenas em:
- Ter vagas no site
- Vagas com links que funcionam
- Categorização razoável
- Deploy funcionando
- Lançamento rápido

---

## 🐛 Troubleshooting Rápido

### Fetcher não retorna vagas
**Problema:** API retorna vazio ou erro
**Solução:**
1. Testar URL da API no navegador
2. Verificar se company slug está correto
3. Conferir se empresa tem vagas públicas

### Categorias erradas
**Problema:** Vagas de "Engineer" indo para "3D"
**Solução:**
1. Abrir output JSON
2. Ver título da vaga
3. Ajustar `titleCategoryMap` no fetcher
4. Re-rodar fetcher

### Links não funcionam
**Problema:** Links de aplicação retornam 404
**Solução:**
1. Verificar campo usado (applyLink vs hostedUrl)
2. Testar link manualmente no navegador
3. Ajustar normalização no fetcher

### Duplicatas no banco
**Problema:** Mesma vaga aparece 2x
**Solução:**
1. Verificar que `id` é único e estável
2. Confirmar que upsert usa `onConflict: 'id'`
3. Checar schema do Supabase (PRIMARY KEY)

---

## 📝 Comandos Rápidos

```bash
# Testar fetchers
node scripts/fetch-lever-jobs.mjs
node scripts/fetch-ashby-jobs.mjs
node scripts/fetch-greenhouse-jobs.mjs

# Ver outputs
cat scripts/lever-jobs-output.json | jq '.[0]'
cat scripts/ashby-jobs-output.json | jq '.[0]'

# Rodar site localmente
npm run dev

# Build de produção
npm run build

# Deploy (Vercel)
vercel --prod
```

---

## 🎉 Quando Considerar MVP Completo?

✅ Site está no ar (domínio funcionando)
✅ Pelo menos 20 vagas visíveis
✅ Vagas de pelo menos 2 empresas diferentes
✅ Links de aplicação funcionam
✅ Filtros básicos funcionam
✅ Visual está apresentável
✅ Primeiros usuários conseguem navegar

**→ Hora de lançar e divulgar!**

**→ GC, automação, e otimizações vêm depois.**

---

## 💡 Lembrete Final

> "Done is better than perfect."
> 
> Vagas não vão desaparecer no primeiro dia.
> 
> GC pode esperar.
> 
> Foco: Popular o banco → Lançar → Iterar

**Sprint 1:** 🎯 Popular + Lançar  
**Sprint 2:** 🗑️ GC + Automação + Escala

