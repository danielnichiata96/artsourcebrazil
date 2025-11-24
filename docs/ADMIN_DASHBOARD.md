# Admin Dashboard - Documentação

## Visão Geral

Dashboard administrativo para aprovar vagas pagas antes da publicação no site.

## Acesso

**URL:** `/admin/drafts`

**Autenticação:** Senha via cookie HTTP-only

## Configuração

### 1. Adicionar variável de ambiente

Adicione ao `.env`:

```bash
# Admin Dashboard
ADMIN_TOKEN=sua_senha_segura_aqui
```

⚠️ **Importante:** Use uma senha forte em produção!

### 2. Configurar no Vercel/Netlify

Adicione a variável de ambiente no dashboard do seu serviço de hospedagem:

- **Nome:** `ADMIN_TOKEN`
- **Valor:** Sua senha segura

## Como Usar

### 1. Fazer Login

1. Acesse `/admin/drafts`
2. Digite a senha configurada em `ADMIN_TOKEN`
3. Você será autenticado por 24 horas

### 2. Visualizar Vagas Pendentes

A página mostra todas as vagas com `status = 'paid'`:

- Título da vaga
- Nome da empresa
- Data/hora do pagamento
- Todas as informações submetidas
- Preview da descrição

### 3. Aprovar Vaga

1. Revise os detalhes da vaga
2. Clique em **"Aprovar & Publicar"**
3. Confirme a ação
4. A vaga será:
   - Criada na tabela `jobs`
   - Status do draft atualizado para `published`
   - Publicada no site imediatamente

### 4. Rejeitar Vaga

1. Revise os detalhes da vaga
2. Clique em **"Rejeitar"**
3. Digite o motivo da rejeição
4. O draft será:
   - Status atualizado para `rejected`
   - Motivo salvo no banco
   - Email enviado ao cliente (TODO)

### 5. Fazer Logout

Clique em **"Logout"** no canto superior direito.

## Workflow Completo

```
1. Cliente preenche formulário → status: 'draft'
2. Cliente clica em "Publicar" → API cria draft
3. Cliente paga no Stripe → webhook atualiza para 'paid'
4. Admin acessa /admin/drafts → vê vagas pendentes
5. Admin aprova → status: 'published', job criado
   OU
   Admin rejeita → status: 'rejected', cliente notificado
```

## Status dos Drafts

```
draft              → Preenchendo o formulário
pending_payment    → Clicou em "Publicar" mas não pagou (não usado atualmente)
paid              → Pagou, aguardando aprovação ⭐
approved          → Aprovado pelo admin (não usado, vai direto para published)
published         → Publicado no site ✅
rejected          → Rejeitado, precisa correções ❌
abandoned         → Abandonou (para email recovery - TODO)
```

## APIs Criadas

### POST `/api/admin/approve-draft`

Aprova um draft e cria um job.

**Body:**
```json
{
  "draft_id": "uuid-do-draft"
}
```

**Autenticação:** Cookie `admin_token`

**Resposta:**
```json
{
  "success": true,
  "job_id": "art-source-brazil-senior-3d-artist-1234567890",
  "message": "Draft approved and job published successfully"
}
```

### POST `/api/admin/reject-draft`

Rejeita um draft e salva o motivo.

**Body:**
```json
{
  "draft_id": "uuid-do-draft",
  "reason": "Descrição incompleta. Por favor, adicione mais detalhes sobre os requisitos."
}
```

**Autenticação:** Cookie `admin_token`

**Resposta:**
```json
{
  "success": true,
  "message": "Draft rejected successfully"
}
```

### POST `/api/admin/logout`

Remove o cookie de autenticação.

## Segurança

### Implementado:
- Autenticação via cookie HTTP-only
- Cookie com `sameSite: 'lax'` e `secure` em produção
- Validação de token em todas as APIs
- Expiração de sessão (24 horas)

### Melhorias Futuras:
- [ ] Múltiplos usuários admin (com banco de dados)
- [ ] Autenticação OAuth (Google, GitHub)
- [ ] Logs de auditoria (quem aprovou/rejeitou o quê)
- [ ] Permissões granulares (aprovar vs editar vs deletar)
- [ ] 2FA (autenticação de dois fatores)

## TODOs

- [ ] Enviar email de aprovação para o cliente
- [ ] Enviar email de rejeição com o motivo
- [ ] Adicionar campo de observações do admin
- [ ] Permitir editar draft antes de aprovar
- [ ] Dashboard com estatísticas (vagas aprovadas/rejeitadas)
- [ ] Filtros por data, empresa, categoria
- [ ] Busca de drafts
- [ ] Paginação (se muitas vagas)

## Troubleshooting

### Erro: "Unauthorized"
- Verifique se `ADMIN_TOKEN` está configurado no `.env`
- Faça login novamente
- Limpe os cookies do navegador

### Erro: "Draft not found or not paid"
- Verifique se o draft existe no Supabase
- Confirme se o `status` é `'paid'`
- Verifique se o pagamento foi processado

### Erro: "Failed to create job"
- Verifique os logs do servidor
- Confirme se a tabela `jobs` existe
- Verifique permissões RLS no Supabase

## Exemplos

### Fluxo de Aprovação Bem-Sucedido

```
1. Admin acessa /admin/drafts
2. Vê vaga: "Senior 3D Artist - Art Source Brazil"
3. Revisa descrição, categoria, salário
4. Clica em "Aprovar & Publicar"
5. Sistema cria job com ID: art-source-brazil-senior-3d-artist-1732456789
6. Draft atualizado: status = 'published', published_job_id preenchido
7. Vaga aparece no site em /jobs
8. Email de confirmação enviado (TODO)
```

### Fluxo de Rejeição

```
1. Admin acessa /admin/drafts
2. Vê vaga com descrição muito curta
3. Clica em "Rejeitar"
4. Digite motivo: "Descrição muito curta. Adicione requisitos técnicos e benefícios."
5. Draft atualizado: status = 'rejected', rejection_reason preenchido
6. Email enviado ao cliente com o motivo (TODO)
7. Cliente pode resubmeter após correções
```

## Integração com Stripe

O webhook do Stripe (`/api/stripe-webhook`) atualiza o status do draft para `'paid'` após o pagamento:

```typescript
if (event.type === 'checkout.session.completed') {
  await supabase
    .from('job_drafts')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', draftId);
}
```

Isso faz com que o draft apareça automaticamente no admin dashboard.

