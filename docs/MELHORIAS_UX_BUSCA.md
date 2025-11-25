# Melhorias de UX - Sistema de Busca e Filtros

## 📋 Resumo das Melhorias Implementadas

### ✅ 1. Debounce na Busca (300ms)
**Problema:** O contador de vagas atualizava a cada letra digitada, causando atualizações excessivas.

**Solução:** Adicionado debounce de 300ms na busca. Agora o filtro só é aplicado 300ms após o usuário parar de digitar.

**Arquivos modificados:**
- `src/pages/index.astro` - Linha 271-277
- `src/pages/vagas.astro` - Linha 243-249

**Código:**
```javascript
// Search with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => { 
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        state.search = e.target.value.toLowerCase(); 
        runFilter();
    }, 300); // Wait 300ms after user stops typing
});
```

---

### ✅ 2. Badge de Categoria Colorida

**Melhoria:** A primeira "tag" agora mostra a categoria da vaga (Game Dev, Design, VFX, 3D, 2D Art, Animation) com a cor correspondente à área.

**Cores por Categoria:**
- 🎮 **Game Dev** → `accent-teal`
- 🎨 **3D** → `accent-purple`
- 🖼️ **2D Art** → `accent-pink`
- 🎬 **Animation** → `accent-orange`
- 💎 **Design** → `accent-lime`
- ✨ **VFX** → `accent-teal`

**Arquivo modificado:**
- `src/components/JobCard.astro` - Linha 77-84

**Antes:**
```astro
<div class="mt-6 flex flex-wrap gap-2">
    {job.tags.map(tag => <span>...{tag}</span>)}
</div>
```

**Depois:**
```astro
<div class="mt-6 flex flex-wrap gap-2">
    {/* Category badge as first tag with color */}
    <span class:list={["border-2 border-ink", accentColor, "text-ink"]}>
        {job.category}
    </span>
    {/* Regular tags */}
    {job.tags.map(tag => <span>...{tag}</span>)}
</div>
```

---

### ✅ 3. Removido Hover das Tags

**Melhoria:** Tags não são clicáveis, então o efeito hover foi removido para evitar confusão.

**Antes:**
```astro
hover:bg-ink hover:text-white transition-colors
```

**Depois:**
```astro
<!-- Sem efeito hover -->
```

---

### ✅ 4. Categorização Melhorada

**Problema:** Vagas como "Design Engineer" estavam sendo categorizadas como "Game Dev" porque a palavra "engineer" era detectada primeiro.

**Solução:** Reordenada a prioridade de verificação para que "Design" seja verificado ANTES de "Game Dev" (que contém a palavra genérica "engineer").

**Arquivos modificados:**
- `scripts/fetch-greenhouse-jobs.mjs`
- `scripts/fetch-lever-jobs.mjs`
- `scripts/fetch-ashby-jobs.mjs`

**Nova Prioridade de Categorização:**

1. **🎯 Priority 1:** Explicit "3D" no título (ex: "3D Artist")
2. **🎯 Priority 2:** VFX (muito específico)
3. **🎯 Priority 3:** Animation (rigging, animator, etc)
4. **🎯 Priority 4:** **Design** (ANTES de Game Dev!)
   - Inclui agora: "design engineer", "ux", "ui", "designer"
5. **🎯 Priority 5:** 2D Art
6. **🎯 Priority 6:** Game Dev (catch-all, por último porque "engineer" é muito genérico)

**Palavras-chave adicionadas para Design:**
- ✅ "design engineer" (mais específico)
- ✅ "ux designer"
- ✅ "ui designer"
- ✅ "ux/ui"

**Exemplo:**
- ❌ **Antes:** "Design Engineer" → Game Dev (porque "engineer" era detectado primeiro)
- ✅ **Agora:** "Design Engineer" → Design (porque "design engineer" é verificado antes de "engineer")

---

## 🔄 Como Aplicar as Mudanças

### Para atualizar as vagas existentes com a nova categorização:

```bash
# 1. Re-fetch jobs from APIs (isso vai aplicar a nova lógica de categorização)
npm run fetch:ashby
npm run fetch:greenhouse
npm run fetch:lever

# 2. Sync to Supabase (se estiver usando)
npm run sync:supabase

# 3. Build the site
npm run build
```

---

## 📊 Impacto Esperado

### Antes:
- 36 vagas como "Game Dev" (72%)
- 10 vagas como "Design" (20%)
- Poucos em outras categorias

### Depois (estimado):
- ~25-30 vagas como "Game Dev" (engenharia real)
- ~15-18 vagas como "Design" (incluindo Design Engineers)
- Distribuição mais equilibrada

---

## 🎯 Benefícios UX

1. **⚡ Performance:** Menos re-renders desnecessários com debounce
2. **👁️ Visual:** Badge de categoria facilita identificação rápida
3. **🎨 Clareza:** Cores ajudam a distinguir áreas visualmente
4. **🎯 Precisão:** Categorização mais precisa reflete melhor a realidade das vagas
5. **✨ Clean:** Sem efeitos hover desnecessários em elementos não-interativos

---

## 🧪 Como Testar

### 1. Teste de Debounce
1. Abra a página inicial ou /vagas
2. Digite "des" rapidamente na busca
3. **Esperado:** Contador deve atualizar apenas após parar de digitar por 300ms

### 2. Teste de Badge de Categoria
1. Visualize qualquer vaga
2. **Esperado:** Primeira tag mostra a categoria com cor específica
3. Tags seguintes são brancas com borda preta

### 3. Teste de Hover
1. Passe o mouse sobre as tags
2. **Esperado:** Sem mudança de cor/estilo (hover removido)

### 4. Teste de Categorização
1. Re-fetch jobs: `npm run fetch:ashby`
2. Verifique vagas como "Design Engineer"
3. **Esperado:** Devem aparecer na categoria "Design"

---

## 🚀 Próximas Melhorias Sugeridas

1. **Busca por salário:** Filtrar vagas por faixa salarial
2. **Salvar busca:** LocalStorage para salvar filtros favoritos
3. **Modo escuro:** Toggle para dark mode
4. **Exportar resultados:** Download de vagas filtradas em CSV
5. **Notificações:** Sistema de alerta para novas vagas em categorias favoritas

---

## 📝 Notas Técnicas

- O debounce usa `setTimeout` nativo do JavaScript
- As cores das categorias são definidas em `tailwind.config.mjs`
- A categorização acontece no momento do fetch, não em runtime
- A busca é case-insensitive (converte tudo para lowercase)
- Tags são separadas por vírgula e trimmed antes da comparação

---

**Documentação atualizada em:** 25 de Novembro de 2025

