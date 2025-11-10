# 🌍 Internacionalização (i18n) - Status Atual

## ✅ O Que Foi Implementado

### Infraestrutura Completa
- **`src/lib/i18n.ts`**: Sistema centralizado de traduções com suporte a PT-BR e EN
  - Todas as strings da UI estão traduzidas (nav, hero, filtros, resultados, footer, newsletter, SEO)
  - Funções auxiliares: `resolveLocale()`, `getMessages()`, `getAlternateLocale()`
  
- **Componentes Preparados**: Todos os componentes principais já consomem as mensagens traduzidas:
  - `Layout.astro`, `Navbar.astro`, `FiltersSidebar.astro`, `JobCard.astro`, `index.astro`
  - Botão de troca de idioma no navbar (EN/PT-BR)
  - Links preservam o parâmetro `?lang=` ao navegar

### Traduções Disponíveis
- **PT-BR** (padrão): Texto completo em português brasileiro
- **EN**: Texto completo em inglês americano
- Todos os textos estáticos: títulos, labels, botões, placeholders, mensagens de erro, SEO metadata

## ⚠️ Limitação Atual: SSG (Static Site Generation)

### O Problema
O site usa **Astro em modo SSG** (`output: 'static'`), que:
- Gera HTML estático em tempo de **build**, não em runtime
- Não tem servidor para processar query parameters (`?lang=en`) dinamicamente
- Por isso, o botão de idioma no navbar **não funciona** atualmente

### Por Que Não Funciona
```astro
// Este código roda apenas durante o BUILD, não quando o usuário acessa
const locale = resolveLocale(Astro.url); // Sempre retorna 'pt-BR' no build
```

Durante o `npm run build`, todas as páginas são geradas uma única vez com o locale padrão (PT-BR).

## 🔧 Soluções Possíveis

### Opção 1: Páginas Separadas por Idioma (Recomendado para SEO)
**Como funciona:**
- Gerar rotas separadas: `/` (pt-BR) e `/en/` (inglês)
- URLs amigáveis para SEO e compartilhamento
- Sem JavaScript necessário

**Implementação:**
```astro
---
// src/pages/index.astro (PT-BR)
export const prerender = true;
const locale = 'pt-BR';
---

---
// src/pages/en/index.astro (EN)
export const prerender = true;
const locale = 'en';
---
```

**Prós:**
- ✅ Melhor SEO (URLs únicas por idioma)
- ✅ Funciona sem JavaScript
- ✅ Cached efficiently (CDN-friendly)

**Contras:**
- ❌ Duplicação de código (mitigável com components)
- ❌ Precisa gerar todas páginas 2x (build time)

### Opção 2: Client-Side Switching (JavaScript)
**Como funciona:**
- Detectar `?lang=` ou `localStorage` via JavaScript
- Trocar textos dinamicamente no navegador
- Única build, switching dinâmico

**Implementação:**
```html
<script>
  const lang = new URLSearchParams(window.location.search).get('lang') || 
               localStorage.getItem('lang') || 'pt-BR';
  
  // Trocar textos via data attributes ou re-render
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = translations[lang][el.dataset.i18n];
  });
</script>
```

**Prós:**
- ✅ Single build
- ✅ Instant switching
- ✅ Preserva idioma via localStorage

**Contras:**
- ❌ SEO limitado (Google vê sempre o idioma padrão)
- ❌ Flash of Untranslated Content (FOUC)
- ❌ Requer JavaScript habilitado

### Opção 3: Hybrid Rendering (Server-Side)
**Como funciona:**
- Mudar para `output: 'hybrid'` ou `output: 'server'`
- Usar Vercel/Netlify Edge Functions ou Node.js adapter
- Processar `?lang=` em runtime

**Implementação:**
```mjs
// astro.config.mjs
export default defineConfig({
  output: 'server', // ou 'hybrid'
  adapter: vercel(), // ou netlify(), node()
});
```

**Prós:**
- ✅ Query params funcionam nativamente
- ✅ Código atual funcionaria sem mudanças
- ✅ Bom SEO (server-side rendering)

**Contras:**
- ❌ Requer servidor ou edge functions
- ❌ Custo adicional (compute time)
- ❌ Mais lento que SSG puro

## 📋 Próximos Passos

### Para Ativar i18n (Escolha 1 opção):

#### A) Opção 1 - Páginas Separadas
```bash
# 1. Criar estrutura de pastas
mkdir -p src/pages/en

# 2. Duplicar index.astro para /en/
cp src/pages/index.astro src/pages/en/index.astro

# 3. Ajustar locale em cada arquivo
# src/pages/index.astro: const locale = 'pt-BR';
# src/pages/en/index.astro: const locale = 'en';

# 4. Atualizar links no Navbar
# PT-BR: href="/"
# EN: href="/en/"
```

#### B) Opção 2 - Client-Side
```bash
# 1. Criar src/scripts/i18n-client.ts
# 2. Implementar lógica de detecção + switching
# 3. Importar script em Layout.astro
# 4. Adicionar data-i18n attributes nos componentes
```

#### C) Opção 3 - Hybrid
```bash
# 1. Instalar adapter
npm install @astrojs/vercel

# 2. Configurar astro.config.mjs
# 3. Deploy para Vercel (ou outro com edge functions)
```

## 🎯 Recomendação

Para este projeto (job board público), recomendo **Opção 1 (Páginas Separadas)**:
- Melhor SEO para vagas internacionais
- Sem custo adicional de servidor
- Performance máxima (static HTML)
- Fácil de implementar com a infraestrutura atual

## 📚 Referências

- [Astro i18n Guide](https://docs.astro.build/en/guides/internationalization/)
- [Astro SSR vs SSG](https://docs.astro.build/en/guides/server-side-rendering/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

---

**Status:** Infraestrutura pronta, aguardando decisão de implementação.  
**Data:** 10/11/2025

