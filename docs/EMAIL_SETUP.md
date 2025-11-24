# Sistema de Emails - Configuração

## Opções de Serviço de Email

### 1. **Resend** ⭐ (Recomendado)
**Prós:**
- API moderna e simples
- 100 emails/dia gratuitos (3.000/mês)
- Excelente DX (Developer Experience)
- Suporte a templates React
- Domínio verificado fácil

**Contras:**
- Relativamente novo

**Preço:** Gratuito até 3.000 emails/mês

**Setup:**
```bash
npm install resend
```

---

### 2. **SendGrid**
**Prós:**
- Estabelecido e confiável
- 100 emails/dia gratuitos
- UI robusta de templates

**Contras:**
- API mais complexa
- Setup de domínio mais burocrático

**Preço:** Gratuito até 100 emails/dia

---

### 3. **Supabase Edge Functions + Resend**
**Prós:**
- Serverless (não precisa servidor Astro rodando)
- Isolado do código principal
- Pode ser chamado via webhook

**Contras:**
- Mais complexo de configurar
- Requer deploy separado

---

## Recomendação: Resend

Vamos usar **Resend** por ser mais simples e ter melhor integração com Astro.

## Setup do Resend

### 1. Criar conta

1. Acesse: https://resend.com
2. Faça cadastro (gratuito)
3. Acesse o Dashboard

### 2. Obter API Key

1. Dashboard → API Keys
2. Clique em "Create API Key"
3. Nome: "RemoteJobsBR Production"
4. Copie a chave (começa com `re_`)

### 3. Adicionar ao `.env`

```bash
# Resend (Email Service)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Configurar domínio (Opcional, mas recomendado)

**Sem domínio:** Emails são enviados de `onboarding@resend.dev`

**Com domínio:** Emails são enviados de `noreply@remotejobsbr.com`

**Como configurar:**
1. Dashboard → Domains
2. Add Domain → Digite seu domínio
3. Adicione os registros DNS (TXT, MX) no seu provedor
4. Aguarde verificação (alguns minutos)

---

## Templates de Email

### Email 1: Confirmação de Pagamento

**Quando:** Logo após pagamento (webhook do Stripe)

**Assunto:** ✅ Pagamento confirmado - Sua vaga está em análise

**Conteúdo:**
```
Olá,

Recebemos seu pagamento com sucesso! 🎉

Sua vaga "{título}" está agora em análise pela nossa equipe.

O que acontece agora:
1. ⏳ Revisão manual (até 24 horas)
2. ✅ Aprovação e publicação
3. 📧 Você receberá um email quando for publicada

Detalhes da vaga:
- Título: {título}
- Empresa: {empresa}
- Pago em: {data/hora}

Alguma dúvida? Responda este email.

Obrigado,
Equipe RemoteJobsBR
```

---

### Email 2: Vaga Aprovada

**Quando:** Admin aprova a vaga

**Assunto:** 🎉 Sua vaga foi aprovada e publicada!

**Conteúdo:**
```
Olá,

Ótimas notícias! Sua vaga foi aprovada e já está online. 🚀

🔗 Ver vaga publicada: {link}

Sua vaga ficará ativa por 30 dias e será vista por centenas de profissionais brasileiros.

Estatísticas (em breve):
- Visualizações: {número}
- Cliques: {número}

Alguma dúvida? Responda este email.

Obrigado por usar RemoteJobsBR,
Equipe RemoteJobsBR
```

---

### Email 3: Vaga Rejeitada

**Quando:** Admin rejeita a vaga

**Assunto:** ⚠️ Sua vaga precisa de ajustes

**Assunto:** ⚠️ Sua vaga precisa de ajustes

**Conteúdo:**
```
Olá,

Infelizmente não pudemos aprovar sua vaga no momento.

Motivo:
{motivo fornecido pelo admin}

O que fazer agora:
1. Faça os ajustes necessários
2. Reenvie a vaga através do formulário
3. Não será cobrado novamente

Precisa de ajuda? Responda este email.

Obrigado pela compreensão,
Equipe RemoteJobsBR
```

---

## Implementação

### Estrutura de arquivos

```
src/lib/
  email.ts           # Cliente Resend e funções helper
  email-templates/
    payment-confirmed.ts
    job-approved.ts
    job-rejected.ts
```

### Exemplo: `src/lib/email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail(
  to: string,
  jobTitle: string,
  companyName: string,
  paidAt: Date
) {
  const { data, error } = await resend.emails.send({
    from: 'RemoteJobsBR <noreply@remotejobsbr.com>',
    to: [to],
    subject: '✅ Pagamento confirmado - Sua vaga está em análise',
    html: `
      <h1>Pagamento confirmado!</h1>
      <p>Recebemos seu pagamento com sucesso! 🎉</p>
      <p>Sua vaga "${jobTitle}" está agora em análise.</p>
      <!-- ... -->
    `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }

  return data;
}
```

---

## Integração nos Endpoints

### 1. Webhook do Stripe

```typescript
// src/pages/api/stripe-webhook.ts

import { sendPaymentConfirmationEmail } from '../../lib/email';

// Após atualizar status para 'paid':
await sendPaymentConfirmationEmail(
  draft.email,
  draft.draft_data.title,
  draft.draft_data.company_name,
  new Date()
);
```

### 2. Aprovação

```typescript
// src/pages/api/admin/approve-draft.ts

import { sendJobApprovedEmail } from '../../lib/email';

// Após publicar job:
await sendJobApprovedEmail(
  draft.email,
  data.title,
  `https://remotejobsbr.com/jobs/${jobId}`
);
```

### 3. Rejeição

```typescript
// src/pages/api/admin/reject-draft.ts

import { sendJobRejectedEmail } from '../../lib/email';

// Após rejeitar:
await sendJobRejectedEmail(
  draft.email,
  data.title,
  reason
);
```

---

## Testes

### Testar localmente

1. Adicione `RESEND_API_KEY` ao `.env`
2. Crie função de teste:

```typescript
// scripts/test-email.mjs
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: ['seu-email@gmail.com'],
  subject: 'Teste RemoteJobsBR',
  html: '<strong>Funcionou!</strong>',
});

console.log('Email enviado!');
```

3. Rodar: `node scripts/test-email.mjs`

---

## Monitoramento

### Dashboard do Resend

- Ver emails enviados
- Taxa de entrega
- Bounces e rejeições
- Logs de erro

### Logs no código

Sempre faça log de envios:

```typescript
console.log(`📧 Email sent: ${type} to ${to}`);
```

---

## Troubleshooting

### Email não chega

1. Verifique spam/lixo eletrônico
2. Confirme API Key no `.env`
3. Veja logs no Dashboard do Resend
4. Verifique se domínio está verificado (se usando custom domain)

### Erro "Invalid API Key"

- API Key está correta no `.env`?
- Servidor foi reiniciado após adicionar a chave?

### Emails marcados como spam

- Use domínio verificado
- Adicione SPF, DKIM no DNS
- Evite palavras "spam" no assunto

---

## Próximos Passos

1. [ ] Instalar pacote `resend`
2. [ ] Configurar API Key
3. [ ] Criar `src/lib/email.ts`
4. [ ] Criar templates de email
5. [ ] Integrar no webhook
6. [ ] Integrar nas APIs admin
7. [ ] Testar fluxo completo
8. [ ] (Opcional) Configurar domínio custom

