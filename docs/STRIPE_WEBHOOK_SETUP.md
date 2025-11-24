# Configuração do Stripe Webhook para Desenvolvimento Local

Este guia explica como configurar e testar webhooks do Stripe localmente durante o desenvolvimento.

## 📋 Pré-requisitos

1. **Stripe CLI instalado**
   ```bash
   # macOS (Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Ou baixe de: https://stripe.com/docs/stripe-cli
   ```

2. **Conta Stripe** (modo teste ou produção)

## 🚀 Configuração Inicial

### 1. Login no Stripe CLI

```bash
stripe login
```

Isso abrirá seu navegador para autenticar. Após o login, você estará conectado.

### 2. Verificar Instalação

```bash
stripe --version
# Deve mostrar: stripe version X.X.X
```

## 🔌 Usando o Script de Webhook

### Opção 1: Script NPM (Recomendado)

```bash
# Usar URL padrão (http://localhost:4321)
npm run stripe:webhook

# Ou especificar URL customizada
npm run stripe:webhook:custom http://localhost:3000
```

### Opção 2: Script Direto

```bash
# URL padrão
./scripts/stripe-webhook-dev.sh

# URL customizada
./scripts/stripe-webhook-dev.sh http://localhost:3000
```

### Opção 3: Comando Direto do Stripe CLI

```bash
stripe listen --forward-to http://localhost:4321/api/stripe-webhook
```

## 📝 O Que Acontece

Quando você executa o script:

1. **Stripe CLI cria um webhook endpoint temporário** no Stripe Dashboard
2. **Todos os eventos do Stripe são encaminhados** para seu servidor local
3. **Você recebe um webhook signing secret** (ex: `whsec_...`)

### ⚠️ Importante: Webhook Secret

Quando você iniciar o `stripe listen`, ele mostrará algo como:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Você precisa adicionar isso ao seu `.env`:**

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

⚠️ **Nota**: Este secret é diferente para cada sessão do `stripe listen`. Se você reiniciar o comando, precisará atualizar o `.env`.

## 🧪 Testando Webhooks

### Teste Manual com Stripe CLI

```bash
# Simular evento checkout.session.completed
stripe trigger checkout.session.completed

# Ou simular evento específico com dados customizados
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.draft_id=seu-draft-id-aqui
```

### Teste via Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com/test/payments
2. Encontre um pagamento de teste
3. Clique em "Send test webhook"
4. Selecione o evento `checkout.session.completed`
5. O webhook será enviado para seu endpoint local

## 🔍 Verificando se Funcionou

### 1. Logs do Stripe CLI

O terminal onde você está rodando `stripe listen` mostrará:

```
2025-01-XX XX:XX:XX   --> checkout.session.completed [evt_xxxxx]
2025-01-XX XX:XX:XX  <--  [200] POST http://localhost:4321/api/stripe-webhook [evt_xxxxx]
```

### 2. Logs do Servidor

Seu servidor Astro deve mostrar logs como:

```
✅ Payment successful for draft <draft-id>
```

### 3. Verificar no Supabase

1. Acesse Supabase Dashboard → Table Editor → `job_drafts`
2. Encontre o draft que você pagou
3. Verifique se:
   - `status` mudou para `paid`
   - `stripe_session_id` está preenchido
   - `stripe_payment_intent` está preenchido
   - `paid_at` tem uma data/hora

## 🐛 Troubleshooting

### Erro: "Missing stripe-signature header"

**Causa**: O webhook secret não está configurado ou está incorreto.

**Solução**:
1. Verifique se `STRIPE_WEBHOOK_SECRET` está no `.env`
2. Certifique-se de usar o secret da sessão atual do `stripe listen`
3. Reinicie o servidor após atualizar o `.env`

### Erro: "Invalid signature"

**Causa**: O webhook secret não corresponde ao usado pelo Stripe CLI.

**Solução**:
1. Pare o `stripe listen`
2. Inicie novamente e copie o novo secret
3. Atualize `STRIPE_WEBHOOK_SECRET` no `.env`
4. Reinicie o servidor

### Webhook não está sendo recebido

**Verificações**:
1. ✅ Servidor local está rodando? (`npm run dev`)
2. ✅ `stripe listen` está rodando em outro terminal?
3. ✅ URL no `stripe listen` está correta?
4. ✅ Porta não está bloqueada por firewall?

### Draft não está sendo atualizado

**Verificações**:
1. ✅ Webhook está sendo recebido? (veja logs do Stripe CLI)
2. ✅ `draft_id` está no metadata da sessão?
3. ✅ Verifique logs do servidor para erros
4. ✅ Verifique se há erros no Supabase (permissões RLS)

## 📚 Recursos Adicionais

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Webhooks Locally](https://stripe.com/docs/stripe-cli/webhooks)

## 🔄 Fluxo Completo de Teste

1. **Iniciar servidor local:**
   ```bash
   npm run dev
   ```

2. **Em outro terminal, iniciar webhook forwarding:**
   ```bash
   npm run stripe:webhook
   ```
   
   Copie o `webhook signing secret` mostrado

3. **Adicionar secret ao `.env`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

4. **Reiniciar servidor** (para carregar nova variável)

5. **Fazer um pagamento de teste** no checkout

6. **Verificar logs** em ambos os terminais

7. **Verificar no Supabase** se o draft foi atualizado

## ✅ Checklist de Configuração

- [ ] Stripe CLI instalado
- [ ] Logado no Stripe CLI (`stripe login`)
- [ ] Script de webhook funcionando
- [ ] `STRIPE_WEBHOOK_SECRET` configurado no `.env`
- [ ] Servidor local rodando
- [ ] Webhook forwarding ativo
- [ ] Teste de pagamento realizado
- [ ] Draft atualizado no Supabase

