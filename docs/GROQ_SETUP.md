# Como Configurar Groq API (Fallback Gratuito)

## Por que Groq?

- ✅ **100% Gratuito** (tier generoso: 7,400 req/min)
- ✅ **Muito Rápido** (GPU-accelerated, ~5x mais rápido que CPU)
- ✅ **Sem Cartão de Crédito** necessário
- ✅ **Fácil de Integrar** (API similar à OpenAI)
- ✅ **Modelos Modernos** (Llama 3.1, Mistral, Mixtral)

## Setup Rápido

### 1. Criar Conta Groq

1. Acesse [Groq Console](https://console.groq.com)
2. Clique em "Sign Up" (ou "Sign In" se já tiver conta)
3. Use Google, GitHub ou email
4. **Não precisa de cartão de crédito** 🎉

### 2. Gerar API Key

1. Após login, vá em [API Keys](https://console.groq.com/keys)
2. Clique em "Create API Key"
3. Dê um nome (ex: "remotejobsbr-enhancement")
4. Copie a chave (ela só aparece uma vez!)

### 3. Adicionar ao .env

Adicione ao seu `.env`:

```bash
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Modelos Disponíveis

Por padrão, o sistema usa `llama-3.1-70b-versatile`. Você pode mudar via `.env`:

```bash
# Modelo padrão (recomendado)
GROQ_MODEL="llama-3.1-70b-versatile"

# Outras opções gratuitas:
GROQ_MODEL="llama-3.3-70b-versatile"     # Mais recente
GROQ_MODEL="mixtral-8x7b-32768"          # Muito rápido
GROQ_MODEL="gemma2-9b-it"                # Leve e rápido
```

### 5. Testar

```bash
node scripts/test-enhancement.mjs
```

Se configurado, você verá:
```
🤖 Trying Groq (FREE, GPU-accelerated)...
✅ Enhanced using: Groq (FREE)
```

## Limites Gratuitos

- **Rate Limit**: 7,400 requests/minuto
- **Tokens**: Sem limite conhecido no tier gratuito
- **Modelos**: Acesso a todos os modelos disponíveis
- **Sem expiração**: Não há trial expirando

## Integração no Fallback Chain

O Groq é usado automaticamente como fallback:

1. **Gemini** (primário, gratuito)
2. **Groq** (fallback, gratuito) ⭐
3. **Gemini 2** (fallback, segunda chave)
4. **HTML Cleaning** (fallback local, sempre funciona)

## Comparação: Groq vs Gemini

| Característica | Groq | Gemini |
|----------------|------|--------|
| **Custo** | ✅ Gratuito | ✅ Gratuito |
| **Velocidade** | ⚡⚡⚡ Ultra rápido (GPU) | ⚡ Rápido |
| **Rate Limit** | 7,400/min | 60/min |
| **Stabilidade** | ✅ Boa | ✅ Boa |
| **Qualidade** | ✅✅ Boa | ✅✅ Boa |
| **Setup** | Sem cartão | Sem cartão |

## Recomendação

Para o seu caso (enhancement de descrições de vagas):

**Configuração Recomendada:**
```bash
GEMINI_API_KEY="sua-chave"      # Primário
GROQ_API_KEY="sua-chave"        # Fallback gratuito ⭐
```

Com isso, você tem:
- ✅ 2 APIs gratuitas
- ✅ Alta disponibilidade (se uma falhar, usa a outra)
- ✅ Sem custos
- ✅ Boa qualidade de enhancement

## Troubleshooting

### "Groq API error: 401"
- Verifique se a API key está correta no `.env`
- Certifique-se de que copiou a chave completa

### "Groq API error: 429"
- Rate limit atingido (improvável com 7,400/min)
- Aguarde alguns segundos e tente novamente

### "Groq API error: 400"
- Modelo não encontrado
- Verifique se `GROQ_MODEL` está correto

## Links Úteis

- [Groq Console](https://console.groq.com)
- [Groq API Docs](https://console.groq.com/docs)
- [Groq Models](https://console.groq.com/docs/models)
- [Groq Discord](https://discord.gg/groq) (suporte da comunidade)

