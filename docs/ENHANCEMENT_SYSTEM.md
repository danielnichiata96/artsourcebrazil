# Sistema de Enhancement de Descrições

## Visão Geral

Sistema automatizado para melhorar descrições de vagas usando IA, com fallback em cascata para garantir sempre uma descrição limpa e bem formatada.

## Arquitetura de Fallback

```
Tentativa 1: Gemini API (chave primária) - GRATUITO
    ↓ (se falhar)
Tentativa 2: Groq API (GPU-accelerated) - GRATUITO ⭐ RECOMENDADO
    ↓ (se falhar)
Tentativa 3: Gemini API (chave secundária) - GRATUITO
    ↓ (se falhar)
Tentativa 4: Limpeza HTML básica (fallback local)
    ↓ (sempre funciona)
Resultado: Descrição limpa e formatada
```

## Configuração

### Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# Opção 1: Apenas Gemini (gratuito)
GEMINI_API_KEY="sua-chave-gemini"

# Opção 2: Gemini + Groq (RECOMENDADO - ambos gratuitos) ⭐
GEMINI_API_KEY="sua-chave-gemini"
GROQ_API_KEY="sua-chave-groq"

# Opção 3: Gemini duplicado (para rate limiting)
GEMINI_API_KEY="chave-1"
GEMINI_API_KEY_2="chave-2"

# Opção 4: Sem IA (usa apenas limpeza HTML)
# Deixe todas vazias ou não configure
```

### Obter API Keys

**Gemini (Gratuito - Primário):**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Free tier: 60 requests/minuto

**Groq (Recomendado para Fallback - GRATUITO ⭐):**
1. Acesse [Groq Console](https://console.groq.com/keys)
2. Crie uma conta (gratuita, sem cartão de crédito)
3. Crie uma nova API key
4. Free tier: **7,400 requests/minuto** (muito generoso!)
5. Muito rápido (GPU-accelerated), ótimo para fallback

## Como Funciona

### 1. Tentativa 1: Gemini (Primária)

- Usa `GEMINI_API_KEY`
- Modelo: `gemini-2.0-flash` (padrão) ou configurável via `GEMINI_MODEL`
- Melhora organização, formatação e tradução
- Rate limit: 1 requisição/segundo
- Gratuito: 60 requests/minuto

### 2. Tentativa 2: Groq (Fallback Gratuito ⭐)

**Se Gemini falhar, tenta em ordem:**
1. **Groq** (se `GROQ_API_KEY` configurada) - **GRATUITO e muito rápido** ⭐
   - Modelo padrão: `llama-3.1-70b-versatile` (configurável via `GROQ_MODEL`)
   - Free tier: 7,400 requests/minuto
   - GPU-accelerated (ultra rápido)
   - Sem necessidade de cartão de crédito
2. Gemini chave secundária (se `GEMINI_API_KEY_2` configurada) - GRATUITO

### 3. Tentativa 3: Limpeza HTML

**Se todas as APIs falharem:**
- Remove tags HTML
- Decodifica entidades HTML (`&amp;` → `&`)
- Preserva estrutura básica (parágrafos, listas)
- Garante texto sempre limpo

## Melhorias Aplicadas

Quando usando IA, as descrições são melhoradas para:

1. ✅ **Organização clara** em seções (Sobre a vaga, Responsabilidades, Requisitos)
2. ✅ **Remoção** de informações legais redundantes
3. ✅ **Simplificação** de linguagem corporativa excessiva
4. ✅ **Formatação** profissional com parágrafos bem estruturados
5. ✅ **Preservação** de detalhes técnicos importantes
6. ✅ **Tradução** para português brasileiro quando necessário
7. ✅ **Consistência** de tom e estilo

## Uso

### Automático (Recomendado)

O enhancement é executado automaticamente durante o sync:

```bash
npm run sync:greenhouse:supabase:full
```

### Script de Teste

```bash
node -e "
import('./scripts/enhance-description.mjs').then(async ({ enhanceDescription }) => {
  const result = await enhanceDescription(
    'Raw HTML description here...',
    'Job Title',
    'Company Name'
  );
  console.log(result);
});
"
```

## Cache

O sistema mantém um cache em memória para evitar reprocessar as mesmas descrições:
- Cache key: `${jobTitle}-${description.substring(0, 100)}`
- Limite: 100 entradas (LRU)
- Apenas durante a mesma execução do script

## Rate Limiting

- **Delay entre requisições:** 1 segundo
- **Gemini Free Tier:** 60 requests/minuto
- **Groq Free Tier:** 7,400 requests/minuto (muito generoso!)

## Tratamento de Erros

- Todas as APIs têm try/catch robusto
- Se uma API falhar, tenta a próxima automaticamente
- Se todas falharem, usa limpeza HTML (sempre funciona)
- Nunca falha completamente - sempre retorna uma descrição válida

## Logs

O sistema exibe logs claros durante o processo:

```
✨ Enhancing description for WIL-155002...
  🤖 Trying Gemini (primary)...
  ✅ Enhanced using: Gemini (primary)
```

Ou em caso de fallback:

```
✨ Enhancing description for WIL-155002...
  🤖 Trying Gemini (primary)...
  ⚠️  Gemini failed: API error
  🤖 Trying Groq (FREE, GPU-accelerated)...
  ✅ Enhanced using: Groq (FREE)
```

## Custos Estimados

### Gemini (Free Tier) ⭐
- **Gratuito** até 60 requests/minuto
- Ideal para uso básico

### Groq (Free Tier) ⭐⭐ RECOMENDADO
- **Gratuito** até 7,400 requests/minuto
- **Sem cartão de crédito necessário**
- GPU-accelerated (muito rápido)
- Modelos: Llama 3.1, Mistral, Mixtral
- Ideal como fallback gratuito

## Exemplo de Melhoria

### Antes (Raw):
```html
<p>The Art Team at Wildlife is growing. With an audience of millions, our games are a gateway to unforgettable characters, vibrant worlds, and emotionally rich experiences. This is no small mission, but our secret weapon is our people.</p>
<p>We are a collective of versatile, curious, and passionate artists working in synergy with designers, engineers, and PMs to create iconic mobile games.</p>
```

### Depois (Enhanced):
```
## Sobre a vaga

A equipe de Arte da Wildlife está crescendo. Com uma audiência de milhões, nossos jogos são uma porta de entrada para personagens inesquecíveis, mundos vibrantes e experiências emocionalmente ricas. Nossa arma secreta são as pessoas.

Somos um coletivo de artistas versáteis, curiosos e apaixonados que trabalham em sinergia com designers, engenheiros e PMs para criar jogos mobile icônicos.
```

## Performance

- **Com IA:** ~1-2 segundos por descrição (incluindo rate limiting)
- **Fallback HTML:** ~0.01 segundos por descrição
- **Cache hit:** ~0.001 segundos (instantâneo)

Para 14 vagas:
- **Com IA:** ~14-28 segundos
- **Sem IA:** ~0.14 segundos

## Próximos Passos

- [ ] Adicionar métricas de qualidade (comparar antes/depois)
- [ ] Suporte para batch processing (otimizar rate limiting)
- [ ] Cache persistente (Redis/Supabase) para evitar reprocessar
- [ ] A/B testing para otimizar prompts
- [ ] Suporte para múltiplos idiomas

