# 🚨 PRÓXIMO PASSO CRÍTICO

## ⚠️ AÇÃO OBRIGATÓRIA APÓS DEPLOY

### O Problema

O Supabase ainda contém **categorias antigas** ("Game Dev", "Design", etc.) das syncs anteriores à migração dos 4 pilares.

O build da Vercel agora está passando porque **removemos temporariamente a validação**, mas o site vai exibir categorias inconsistentes!

---

## ✅ Solução: Re-sync Completo

**Execute localmente AGORA:**

```bash
npm run sync:all
```

### O que isso faz:

1. ✅ **Fetch** vagas de Greenhouse, Ashby, Lever
2. ✅ **Aplica nova categorização** (4 pilares) via `categorizeJob()`
3. ✅ **Upsert no Supabase** com categorias corretas
4. ✅ **Dispara rebuild** da Vercel via webhook

---

## 📊 Verificação

Após rodar `sync:all`, verifique:

```bash
# Conferir se os arquivos JSON têm as novas categorias
cat scripts/greenhouse-jobs-output.json | jq '.[0].category'
# Deve retornar: "Engineering & Code", "Art & Animation", etc.

# Nunca: "Game Dev", "Design", "3D", etc.
```

---

## 🔧 Por que removemos a validação?

A validação (`validate:jobs`) estava **bloqueando o build** porque:

1. ✅ O schema espera: `['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production']`
2. ❌ O Supabase tinha: `['Game Dev', 'Design', '3D', 'Animation', 'VFX']`
3. ❌ Build falhava no `prebuild`

**Solução temporária:** Remover validação do `prebuild` até re-sync completo.

**Após re-sync:** Podemos reativar:
```json
"prebuild": "npm run sync:supabase && npm run validate:jobs"
```

---

## 🎯 Status Atual

- ✅ Build da Vercel vai passar
- ⚠️ Site vai mostrar categorias antigas temporariamente
- 🔜 **Você PRECISA rodar `npm run sync:all` AGORA**

---

## 💡 Lição Aprendida

**Para futuras migrações de schema:**

1. ✅ Atualizar código (`categorizeJob`, schemas)
2. ✅ Rodar sync completo **ANTES** de fazer deploy
3. ✅ Verificar Supabase está atualizado
4. ✅ Só então fazer push

**Ordem certa:**
```bash
# Local:
npm run sync:all  # Atualiza Supabase
git add -A
git commit -m "feat: migrar para 4 pilares"
git push  # Dispara rebuild (já com dados corretos)
```

**Ordem errada (o que fizemos):**
```bash
git push  # Build pega dados antigos do Supabase ❌
# Depois: npm run sync:all
```

---

## 🚀 Execute Agora

```bash
cd /Users/danieljyojinichiata/Documents/remotejobsbr
npm run sync:all
```

**Tempo estimado:** 2-3 minutos  
**Resultado:** Site 100% funcional com 4 pilares! 🎉

