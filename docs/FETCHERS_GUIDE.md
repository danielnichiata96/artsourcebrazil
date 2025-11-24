# Guia de Fetchers de Vagas

Este documento explica como usar os fetchers para coletar vagas de diferentes ATSs (Applicant Tracking Systems).

---

## 📦 Fetchers Disponíveis

### 1. **Greenhouse** (`fetch-greenhouse-jobs.mjs`)
✅ **Status:** Implementado e testado

**Empresas suportadas:**
- Wildlife Studios (`wildlifestudios`)
- Automattic (`automattic`)
- GitLab (`gitlab`)
- AE.Studio (`aestudio`)
- Monks (`monks`)

**Como usar:**
```bash
# Editar COMPANY_SLUG no arquivo
# scripts/fetch-greenhouse-jobs.mjs:17
const COMPANY_SLUG = 'automattic'; // Altere aqui

# Executar
node scripts/fetch-greenhouse-jobs.mjs

# Output: scripts/greenhouse-jobs-output.json
```

**API Endpoint:**
```
https://boards-api.greenhouse.io/v1/boards/{company}/jobs
```

---

### 2. **Lever** (`fetch-lever-jobs.mjs`)
✅ **Status:** Implementado (pronto para testar)

**Empresas suportadas:**
- Fanatee (`fanatee`)
- Outras empresas usando Lever

**Como usar:**
```bash
# Editar COMPANY_SLUG no arquivo
# scripts/fetch-lever-jobs.mjs:17
const COMPANY_SLUG = 'fanatee'; // Altere aqui
const COMPANY_NAME = 'Fanatee';   // Altere aqui

# Executar
node scripts/fetch-lever-jobs.mjs

# Output: scripts/lever-jobs-output.json
```

**API Endpoint:**
```
https://api.lever.co/v0/postings/{company}?mode=json
```

---

### 3. **Ashby** (`fetch-ashby-jobs.mjs`)
✅ **Status:** Implementado (pronto para testar)

**Empresas suportadas:**
- Deel (`deel`)
- Ashby (`ashby`)
- Outras empresas usando Ashby

**Como usar:**
```bash
# Editar COMPANY_SLUG no arquivo
# scripts/fetch-ashby-jobs.mjs:16
const COMPANY_SLUG = 'deel';     // Altere aqui
const COMPANY_NAME = 'Deel';     // Altere aqui

# Executar
node scripts/fetch-ashby-jobs.mjs

# Output: scripts/ashby-jobs-output.json
```

**API Endpoint (GraphQL):**
```
https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams
```

---

## 🧪 Como Testar os Fetchers

### Teste 1: Lever (Fanatee)
```bash
cd /Users/danieljyojinichiata/Documents/remotejobsbr
node scripts/fetch-lever-jobs.mjs
```

**Output esperado:**
```
🚀 Fetching jobs from Lever API...
📋 Company: fanatee
════════════════════════════════════════════════════════════
🔍 Fetching from: https://api.lever.co/v0/postings/fanatee?mode=json
📦 Found X jobs
🔄 Processing jobs...
[1/X] Processing: Game Developer
  ✅ Created: FAN-abc123 - Game Dev
════════════════════════════════════════════════════════════
✅ Successfully processed X jobs
📄 Output saved to: scripts/lever-jobs-output.json
📊 Summary:
Categories: { 'Game Dev': X, ... }
Location Scopes: { 'remote-worldwide': X, ... }
```

### Teste 2: Ashby (Deel)
```bash
cd /Users/danieljyojinichiata/Documents/remotejobsbr
node scripts/fetch-ashby-jobs.mjs
```

**Output esperado:**
```
🚀 Fetching jobs from Ashby API (GraphQL)...
📋 Company: deel
════════════════════════════════════════════════════════════
🔍 Fetching job board...
📦 Found X jobs
🔄 Processing jobs...
[1/X] Processing: Senior Software Engineer
  ✅ Created: DEE-abc12345 - Game Dev
════════════════════════════════════════════════════════════
✅ Successfully processed X jobs
📄 Output saved to: scripts/ashby-jobs-output.json
📊 Summary:
Categories: { 'Game Dev': X, 'Design': Y, ... }
Location Scopes: { 'remote-latam': X, 'remote-worldwide': Y, ... }
```

---

## 🔧 Configuração dos Fetchers

### Variáveis de Configuração

Cada fetcher tem as seguintes variáveis no topo do arquivo:

```javascript
// Lever exemplo
const LEVER_API_BASE = 'https://api.lever.co/v0/postings';
const COMPANY_SLUG = 'fanatee';        // ⬅️ Altere para outra empresa
const COMPANY_NAME = 'Fanatee';        // ⬅️ Nome exibido
const COMPANY_LOGO = null;             // ⬅️ Path para logo (opcional)
```

### Como adicionar uma nova empresa:

1. **Encontre o slug da empresa** (geralmente na URL do job board)
2. **Edite o fetcher** correspondente
3. **Execute o script**
4. **Revise o output JSON**

---

## 📊 Estrutura do Output

Todos os fetchers geram JSON no mesmo formato:

```json
[
  {
    "id": "DEE-abc12345",
    "companyName": "Deel",
    "companyLogo": null,
    "jobTitle": "Senior Software Engineer",
    "description": "Full job description...",
    "shortDescription": "First 300 chars...",
    "applyLink": "https://jobs.ashbyhq.com/deel/...",
    "postedDate": "2025-01-15T10:00:00.000Z",
    "category": "Game Dev",
    "tags": ["Engineering", "Backend", "Remote"],
    "location": {
      "scope": "remote-latam",
      "text": "Remote - Latin America"
    },
    "contractType": "CLT",
    "salary": null
  }
]
```

---

## 🎯 Mapeamento de Categorias

Todos os fetchers usam o mesmo sistema de categorização:

### Categorias Suportadas:
- **VFX** - Efeitos visuais, partículas
- **3D** - Modelagem 3D, texturização, lighting
- **2D Art** - Arte 2D, concept art, ilustração
- **Animation** - Animação, rigging, motion graphics
- **Design** - UI/UX, product design, visual design
- **Game Dev** - Engenharia, programação, QA, data

### Prioridade de Detecção:
1. **3D explícito no título** (ex: "3D Artist")
2. **VFX** (palavras-chave específicas)
3. **Animation** (animação, rigging)
4. **2D Art** (arte 2D, concept)
5. **Design** (UI/UX, designer)
6. **Game Dev** (catch-all para tech roles)

---

## 🚫 Filtros Implementados

### Jobs Excluídos Automaticamente:
- Finance, Accounting, FP&A
- HR, Recruiting
- Sales, Business Development
- Legal, Lawyers
- Executive Marketing (Head of Marketing, Marketing Manager)

### Jobs Incluídos:
- Todos os roles técnicos (Game Dev)
- Todos os roles criativos (3D, 2D, Animation, VFX)
- Design roles (UI/UX, Product Design)

---

## 🌍 Location Scopes

Os fetchers detectam e categorizam localizações:

- **`remote-brazil`** - Remote específico para Brasil
- **`remote-latam`** - Remote para América Latina
- **`remote-worldwide`** - Remote sem restrição geográfica
- **`hybrid`** - Modelo híbrido
- **`onsite`** - Presencial em localização específica

### Palavras-chave detectadas:
- Remote + Brazil/Brasil → `remote-brazil`
- Remote + Latin America/LATAM/Americas → `remote-latam`
- Remote (genérico) → `remote-worldwide`
- Hybrid → `hybrid`
- Localização física → `onsite`

---

## 🏷️ Extração de Tags

Os fetchers tentam usar extração inteligente de tags:

1. **Primeira tentativa:** AI-powered extraction (`extract-tags.mjs`)
2. **Fallback:** Extração por keywords
3. **Default:** Usa a categoria como tag

**Tags comuns extraídas:**
- Tecnologias: Unity, Unreal, Blender, Maya
- Skills: 3D Modeling, Texturing, Rigging, Animation
- Seniority: Junior, Mid, Senior, Lead
- Tipo: Remote, Full-time, Contract

---

## 🔄 Próximos Passos

### 1. Testar os Fetchers
```bash
# Teste Lever (Fanatee)
node scripts/fetch-lever-jobs.mjs

# Teste Ashby (Deel)
node scripts/fetch-ashby-jobs.mjs
```

### 2. Revisar Outputs
- Abrir `scripts/lever-jobs-output.json`
- Abrir `scripts/ashby-jobs-output.json`
- Verificar se categorias estão corretas
- Verificar se location scopes estão corretos

### 3. Ajustar Mapeamentos
Se necessário, ajustar:
- `titleCategoryMap` - Adicionar keywords
- `departmentCategoryMap` - Mapear novos departments
- `excludedKeywords` - Filtrar mais jobs

### 4. Adicionar Mais Empresas
- Editar `COMPANY_SLUG` e `COMPANY_NAME`
- Executar script
- Adicionar logo da empresa se disponível

### 5. Integrar com Supabase
```bash
# Futuro: Script para sync com Supabase
node scripts/sync-all-ats-to-supabase.mjs
```

---

## 🐛 Troubleshooting

### Problema: "Failed to fetch"
**Causa:** API indisponível ou slug incorreto

**Solução:**
1. Verificar se o company slug está correto
2. Testar URL no navegador
3. Verificar se a empresa usa o ATS especificado

### Problema: "No jobs found"
**Causa:** Empresa não tem vagas públicas ou slug incorreto

**Solução:**
1. Verificar se há vagas no job board público
2. Confirmar slug correto
3. Verificar se a API está acessível

### Problema: Todas as vagas filtradas
**Causa:** Keywords de exclusão muito amplos

**Solução:**
1. Revisar `excludedKeywords`
2. Ajustar filtros no `shouldFilterJob()`
3. Revisar categorization logic

### Problema: Categorias incorretas
**Causa:** Keywords insuficientes ou ordem de prioridade

**Solução:**
1. Adicionar keywords em `titleCategoryMap`
2. Ajustar ordem de prioridade no `mapCategory()`
3. Melhorar detecção de 3D vs 2D vs Animation

---

## 📚 Referências

- [Greenhouse Board API](https://developers.greenhouse.io/job-board.html)
- [Lever Postings API](https://hire.lever.co/developer/documentation)
- [Ashby API](https://developers.ashbyhq.com/) (GraphQL)

---

## ✅ Checklist de Teste

- [ ] Lever (Fanatee) - Executar e revisar output
- [ ] Ashby (Deel) - Executar e revisar output
- [ ] Greenhouse (outra empresa) - Testar com Automattic ou GitLab
- [ ] Verificar categorização de vagas
- [ ] Verificar location scopes
- [ ] Verificar filtros funcionando
- [ ] Comparar com site original das vagas
- [ ] Validar links de aplicação

---

## 🎯 Metas Próximas

1. ✅ Criar fetcher Lever
2. ✅ Criar fetcher Ashby
3. ⏳ Testar Lever com Fanatee
4. ⏳ Testar Ashby com Deel
5. ⏳ Criar orquestrador multi-fonte
6. ⏳ Integrar com Supabase
7. ⏳ Automatizar com GitHub Actions

