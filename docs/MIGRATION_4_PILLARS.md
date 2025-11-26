# 🏗️ Migração para 4 Pilares - Estrutura de Categorias

**Data**: 26 de Novembro de 2025  
**Status**: ✅ Implementação Completa  
**Breaking Change**: Sim - Requer re-sync de todas as vagas

---

## 📋 Sumário Executivo

Implementamos uma nova arquitetura de categorias baseada em **4 pilares da indústria criativa**, substituindo as 6 categorias anteriores que estavam causando miscategorização (ex: "Unity Software Engineer" sendo marcado como "Design").

### Categorias Antigas (6) → Novas (4)

| ❌ Antiga | ✅ Nova | Motivo |
|----------|---------|--------|
| Game Dev | Engineering & Code | Mais inclusivo (Pipeline TD, Creative Coders, QA) |
| 3D | Art & Animation | Consolidado com 2D/VFX/Motion |
| 2D Art | Art & Animation | Consolidado |
| Animation | Art & Animation | Consolidado |
| VFX | Art & Animation | Consolidado |
| Design | Design & Product | Clarificado (Game Design, Level Design, UI/UX) |
| *(nova)* | Production | Produtores, PMs, Product Owners |

---

## 🎯 As 4 Novas Categorias

### 💻 Engineering & Code
**Descrição**: Game dev, Unity, Unreal, Pipeline TD, QA, Creative Coders  
**Slug**: `engineering-code`  
**Cor**: Purple (`bg-accent-purple`)  
**Exemplos**: Unity Developer, Unreal Engineer, Pipeline TD, QA Engineer, Graphics Engineer

### 🎨 Art & Animation
**Descrição**: 3D, 2D, VFX, Motion Graphics, Rigging, Concept Art  
**Slug**: `art-animation`  
**Cor**: Pink (`bg-accent-pink`)  
**Exemplos**: 3D Artist, Character Artist, Animator, VFX Artist, Motion Designer, Rigger

### 🎯 Design & Product
**Descrição**: Game Design, Level Design, UI/UX, Product Design  
**Slug**: `design-product`  
**Cor**: Teal (`bg-accent-teal`)  
**Exemplos**: Game Designer, Level Designer, UI/UX Designer, Product Designer, System Designer

### 📊 Production
**Descrição**: Producers, Project Managers, Product Owners, Scrum Masters  
**Slug**: `production`  
**Cor**: Lime (`bg-accent-lime`)  
**Exemplos**: Producer, Project Manager, Product Owner, Scrum Master, Production Coordinator

---

## 🤖 Categorização Inteligente

### Nova Função: `categorizeJob()`

**Localização**: `src/lib/categories.ts`

```typescript
categorizeJob(title: string, description: string): Category | null
```

**Funcionalidades**:
1. **Rejeita primeiro**: Filtra vagas que não são da indústria criativa (HR, Finance, Legal)
2. **Detecção por keywords**: Analisa título e descrição
3. **Logs de incerteza**: Alerta quando não consegue categorizar com certeza
4. **Retorna `null`**: Para vagas rejeitadas (não serão importadas)

**Exemplo de Uso**:
```javascript
const category = categorizeJob(
  'Unity Software Engineer',
  'Develop gameplay systems for mobile games...'
);
// Retorna: 'Engineering & Code' ✅ (antes era "Design" ❌)
```

---

## 🔧 Arquivos Modificados

### ✅ Core System
- [x] `src/lib/categories.ts` - Definições, tipos, mapeamento, função `categorizeJob()`
- [x] `docs/CATEGORIES_GUIDE.md` - Documentação completa da nova estrutura

### ✅ Scripts de Importação
- [x] `scripts/fetch-greenhouse-jobs.mjs` - Agora usa `categorizeJob()`
- [x] `scripts/fetch-ashby-jobs.mjs` - Agora usa `categorizeJob()`
- [x] `scripts/fetch-lever-jobs.mjs` - Agora usa `categorizeJob()`

### ✅ UI Components
- [x] `src/components/CategoryButtons.astro` - Removeu emojis, atualizado para 4 categorias
- [x] `src/components/JobCard.astro` - Cores atualizadas para 4 categorias
- [x] `src/components/JobHeader.astro` - Cores atualizadas para 4 categorias
- [x] `src/pages/404.astro` - Links de categorias atualizados

### ✅ Internacionalização
- [x] `src/lib/i18n.ts` - Traduções PT-BR e EN para novas categorias
- [x] Footer links atualizados para novos slugs

### ✅ Páginas
- [x] `src/pages/index.astro` - Renderiza categorias dinamicamente (já funciona automaticamente)

---

## 🚨 Regras de Curadoria

### ✅ ACEITAR - Core da Indústria Criativa

**Engineering & Code**:
- ✅ Game Engineers (Unity, Unreal, Godot)
- ✅ Graphics/Rendering Engineers
- ✅ Pipeline Technical Directors
- ✅ QA Engineers (games/creative apps)
- ✅ Creative Coders (WebGL, Three.js)

**Art & Animation**:
- ✅ ALL 2D/3D/VFX Artists
- ✅ Animators (games, film, advertising)
- ✅ Motion Designers, Riggers, Concept Artists

**Design & Product**:
- ✅ Game Designers, Level Designers
- ✅ UI/UX Designers (creative products)
- ✅ System/Narrative Designers

**Production**:
- ✅ Game/VFX Producers
- ✅ Project Managers (creative projects)
- ✅ Product Owners/Scrum Masters (creative teams)

---

### ⚠️ CURAR - Caso a Caso

**Marketing**:
- ✅ Growth Designer (visual) → Aceitar
- ✅ Brand Designer → Aceitar
- ❌ Marketing Performance Analyst → Rejeitar
- ❌ Content Marketing → Rejeitar

**Regra**: Se requer **portfolio visual** ou **habilidade criativa**, aceitar. Se é só planilhas/métricas, rejeitar.

---

### ❌ REJEITAR - Dilui a Marca

Mesmo se for Epic/Ubisoft/Wildlife:
- ❌ HR / Recruitment (exceto "Creative Recruiter")
- ❌ Accounting / Finance
- ❌ Legal / Lawyers
- ❌ Facilities / Operations
- ❌ Customer Support (genérico)
- ❌ Pure Sales / Business Development

---

## 📦 Próximos Passos (Ação Requerida)

### 1. Re-sync de Vagas (OBRIGATÓRIO)

Como você mencionou que pode dropar/atualizar sem problemas:

```bash
# Opção 1: Limpar banco e re-importar
# No Supabase SQL Editor:
DELETE FROM jobs;

# Depois rodar os fetchers:
node scripts/fetch-greenhouse-jobs.mjs
node scripts/fetch-ashby-jobs.mjs
node scripts/fetch-lever-jobs.mjs
```

```bash
# Opção 2: Update in-place (migração SQL)
# Ver SQL de migração no CATEGORIES_GUIDE.md
UPDATE jobs
SET category = CASE
  WHEN category = 'Game Dev' THEN 'Engineering & Code'
  WHEN category IN ('3D', '2D Art', 'Animation', 'VFX') THEN 'Art & Animation'
  WHEN category = 'Design' THEN 'Design & Product'
  ELSE category
END
WHERE category IN ('Game Dev', '3D', '2D Art', 'Animation', 'Design', 'VFX');
```

### 2. Testar Localmente

```bash
# Rodar servidor
npm run dev

# Verificar:
# 1. Homepage - categorias aparecem corretamente
# 2. Filtros - seleção de categoria funciona
# 3. Job cards - badges de categoria corretos
# 4. /category/engineering-code - páginas de categoria funcionam
```

### 3. Validar Jobs

```bash
# Rodar validação
npm run validate:jobs

# Verificar se todas as vagas têm categorias válidas
```

---

## 🧪 Testing Checklist

- [ ] **Homepage**: Categorias renderizam dinamicamente
- [ ] **Filtros**: Seleção de categoria filtra corretamente
- [ ] **Job Cards**: Badges de categoria mostram nomes corretos e cores certas
- [ ] **404 Page**: Links de categorias levam para páginas corretas
- [ ] **Footer**: Links de categorias atualizados
- [ ] **i18n**: Traduções PT-BR e EN funcionam
- [ ] **Scripts**: Fetchers importam com novas categorias
- [ ] **Categorização**: `categorizeJob()` aceita/rejeita corretamente

---

## 📊 Impacto Esperado

### Antes (Problema)
```
❌ "Unity Software Engineer" → Categoria: Design
❌ "Marketing Performance Analyst" → Aceito (dilui marca)
❌ 6 categorias confusas e granulares demais
```

### Depois (Solução)
```
✅ "Unity Software Engineer" → Categoria: Engineering & Code
✅ "Marketing Performance Analyst" → Rejeitado (não é criativo)
✅ 4 categorias claras baseadas em função, não ferramenta
```

---

## 🔗 Referências

- **Documentação Completa**: `docs/CATEGORIES_GUIDE.md`
- **Estratégia de Categorias**: `docs/CATEGORIES_STRATEGY.md`
- **Código Core**: `src/lib/categories.ts`

---

## ✅ Status Final

**Implementação**: 100% Completa  
**Testes Necessários**: Re-sync de vagas + validação no browser  
**Breaking Changes**: Sim (URLs de categorias mudaram)  
**Migration Script**: Disponível no CATEGORIES_GUIDE.md

---

**Próximo Passo Recomendado**: Rodar `node scripts/fetch-greenhouse-jobs.mjs` e testar no browser! 🚀

