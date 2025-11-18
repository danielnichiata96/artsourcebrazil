# Schema Otimizado para Tabela Jobs no Airtable

Este documento define a estrutura ideal da tabela **Jobs** no Airtable para suportar múltiplas fontes de dados (Greenhouse, Ashby, Lever, etc.) de forma eficiente e automatizada.

## 📊 Análise dos Campos Atuais vs. Necessários

### Campos Identificados no Código Atual

Baseado em `scripts/sync-airtable.mjs` (LEITURA) e `scripts/sync-greenhouse-to-airtable.mjs` (ESCRITA):

| Campo no Código | Tipo Atual | Necessário para Fetch? | Observações |
|-----------------|------------|------------------------|-------------|
| `ID` | Text | ✅ Obrigatório | Identificador único (ex: WIL-998002) |
| `Job Title` | Text | ✅ Obrigatório | Título da vaga |
| `Company Name` | Linked Record | ✅ Obrigatório | Nome da empresa (linked para tabela Companies) |
| `Apply Link` | URL | ✅ Obrigatório | Link direto para aplicação |
| `Date Posted` | Date | ✅ Obrigatório | Data de publicação (ISO 8601) |
| `Category` | Linked Record | ✅ Obrigatório | Categoria (linked para tabela Categories) |
| `Tags` | Linked Records | ✅ Obrigatório | Tags (linked para tabela Tags) |
| `Location Scope` | Single Select | ✅ Obrigatório | Escopo de localização |
| `Description (PT)` | Long Text | ✅ Obrigatório | Descrição completa em português |
| `Description_Short_PT` | Text (300 chars) | ✅ Recomendado | Descrição curta para cards |
| `Company_Logo_URL` | URL | ✅ Opcional | URL do logo da empresa |
| `Status` | Single Select | ✅ Obrigatório | Status (Ativa/Inativa) |
| `Contrato` | Single Select | ✅ Opcional | Tipo de contrato |
| `Location_Detail` | Text | ⚠️ Opcional | Detalhes adicionais de localização |
| `Location_Country_Code` | Text (2 chars) | ⚠️ Opcional | Código ISO do país |
| `Salario_Min` | Number | ⚠️ Opcional | Salário mínimo |
| `Salario_Max` | Number | ⚠️ Opcional | Salário máximo |
| `Moeda` | Single Select | ⚠️ Opcional | Moeda (BRL/USD/EUR) |

## 🎯 Estrutura Otimizada Recomendada

### Tabela: **Jobs**

#### Campos Obrigatórios (Auto-preenchidos pelos Scripts)

| Nome do Campo | Tipo | Opções/Formato | Fonte Automática |
|---------------|------|----------------|------------------|
| **ID** | Single line text | Unique, Required | ✅ Greenhouse, Ashby, Lever |
| **Job Title** | Single line text | Required | ✅ Greenhouse, Ashby, Lever |
| **Company Name** | Linked to "Companies" | Required | ✅ Greenhouse, Ashby, Lever |
| **Apply Link** | URL | Required | ✅ Greenhouse (direto), Ashby (direto), Lever (direto) |
| **Date Posted** | Date | Format: ISO 8601 | ✅ Greenhouse (first_published) |
| **Category** | Linked to "Categories" | Required | ✅ Greenhouse (mapeado) |
| **Tags** | Linked to "Tags" | Multiple, Required | ✅ Greenhouse (extraído) |
| **Location Scope** | Single select | Required | ✅ Greenhouse (metadata) |
| **Description (PT)** | Long text | Required | ✅ Greenhouse (content decodificado) |
| **Status** | Single select | Required | ✅ Auto: "Ativa" |

#### Campos Recomendados (Auto-preenchidos quando disponíveis)

| Nome do Campo | Tipo | Opções/Formato | Fonte Automática |
|---------------|------|----------------|------------------|
| **Description_Short_PT** | Single line text | Max 300 chars | ✅ Auto-gerado de Description |
| **Company_Logo_URL** | URL | Optional | ✅ Greenhouse (local ou Clearbit) |
| **Contrato** | Single select | CLT, PJ, B2B, Freelance, Estágio, Internship | ✅ Greenhouse (detectado) |
| **Location_Detail** | Single line text | Optional | ⚠️ Manual ou extraído |
| **Location_Country_Code** | Single line text | 2 chars (BR, US, etc.) | ⚠️ Manual ou extraído |
| **Salario_Min** | Number | Optional | ⚠️ Extraído quando disponível |
| **Salario_Max** | Number | Optional | ⚠️ Extraído quando disponível |
| **Moeda** | Single select | BRL, USD, EUR | ⚠️ Extraído quando disponível |

#### Campos de Gestão (Auto-gerados pelo Airtable)

| Nome do Campo | Tipo | Propósito |
|---------------|------|-----------|
| **Source** | Single select | greenhouse, ashby, lever, manual | ✅ Identifica origem |
| **Last Synced** | Date | Última sincronização automática | ✅ Quando foi atualizado |
| **Created At** | Created time | Auto-gerado | Airtable |
| **Last Modified** | Last modified time | Auto-gerado | Airtable |

### Tabela: **Companies**

| Nome do Campo | Tipo | Opções |
|---------------|------|--------|
| **Name** | Single line text | Unique, Required |
| **Logo URL** | URL | Optional |
| **Website** | URL | Optional |
| **Slug** | Single line text | Unique (para URLs) |

**Valores iniciais sugeridos:**
- Wildlife Studios
- Automattic
- Beffio
- Circle.so
- Fortis Games
- (Outros conforme necessário)

### Tabela: **Categories**

| Nome do Campo | Tipo | Opções |
|---------------|------|--------|
| **Name** | Single line text | Unique, Required |
| **Slug** | Single line text | Unique |
| **Icon** | Single line text | Emoji (🎮, 🎨, etc.) |

**Valores obrigatórios:**
- Game Dev (🎮)
- 3D (🎨)
- Animation (🎬)
- Design (🎯)
- VFX (✨)

### Tabela: **Tags**

| Nome do Campo | Tipo | Opções |
|---------------|------|--------|
| **Name** | Single line text | Unique, Required |
| **Slug** | Single line text | Unique |

**Valores comuns (auto-criados):**
- Unity, Unreal, Python, JavaScript, TypeScript, C#, Go, React, Node.js
- AWS, Docker, Kubernetes, Git, CI/CD
- 3D, 2D, Animation, VFX, Design, Artist
- AI, Mobile, Senior, Lead
- (Criadas automaticamente conforme necessário)

## ⚙️ Configurações de Campos Críticos

### Location Scope (Single Select)

**Opções obrigatórias:**
- `Remoto - Brazil`
- `Remoto - LATAM`
- `Remoto - Global`
- `Híbrido`
- `Presencial`

**Mapping do código:**
```javascript
'remote-brazil' → 'Remoto - Brazil'
'remote-latam' → 'Remoto - LATAM'
'remote-worldwide' → 'Remoto - Global'
'hybrid' → 'Híbrido'
'onsite' → 'Presencial'
```

### Status (Single Select)

**Opções:**
- `Ativa` (padrão para novos jobs)
- `Inativa` (para jobs fechados/expirados)
- `Rascunho` (opcional, para jobs em revisão)

### Contrato (Single Select)

**Opções:**
- `CLT`
- `PJ`
- `B2B`
- `Freelance`
- `Estágio`
- `Internship`

**Nota:** Internship e Estágio podem ser unificados se preferir usar apenas "Estágio".

### Moeda (Single Select)

**Opções:**
- `BRL`
- `USD`
- `EUR`

### Source (Single Select) - NOVO

**Opções:**
- `greenhouse`
- `ashby`
- `lever`
- `manual` (para jobs criados manualmente)

## 🔄 Fluxo de Sincronização Otimizado

### 1. Greenhouse → Airtable

```javascript
// Script: sync-greenhouse-to-airtable.mjs
{
  'ID': 'WIL-998002',                    // ✅ Único por vaga
  'Job Title': '3D Game Artist',          // ✅ Título completo
  'Company Name': ['Wildlife Studios'],   // ✅ Linked record (criar se não existir)
  'Apply Link': 'https://...',            // ✅ Link direto
  'Date Posted': '2025-11-10T13:03:22Z', // ✅ ISO 8601
  'Category': ['3D'],                     // ✅ Linked record (criar se não existir)
  'Tags': ['Unity', '3D', 'Artist'],      // ✅ Linked records (criar se não existirem)
  'Location Scope': 'Híbrido',            // ✅ String (não objeto!)
  'Description (PT)': '...',              // ✅ HTML entities decodificadas
  'Description_Short_PT': '...',          // ✅ Auto-gerado (300 chars)
  'Company_Logo_URL': '/images/...',      // ✅ URL
  'Contrato': 'Internship',               // ✅ Detectado ou null
  'Status': 'Ativa',                      // ✅ Auto
  'Source': 'greenhouse',                 // ✅ Identificação
  'Last Synced': '2025-01-XX...'          // ✅ Timestamp
}
```

### 2. Processo de Sincronização

1. **Buscar IDs existentes** no Airtable
2. **Criar/atualizar tabelas auxiliares:**
   - Companies (se não existir)
   - Categories (se não existir)
   - Tags (criar dinamicamente)
3. **Para cada job:**
   - Verificar se Company existe → criar se necessário
   - Verificar se Category existe → criar se necessário
   - Verificar se Tags existem → criar se necessário
   - Criar/atualizar registro em Jobs
4. **Deduplicação:** Comparar por ID único

## 📝 Checklist de Configuração no Airtable

### Antes de Executar os Scripts

- [ ] Tabela **Jobs** criada
- [ ] Tabela **Companies** criada (ou campo Company Name como Text)
- [ ] Tabela **Categories** criada (ou campo Category como Single Select)
- [ ] Tabela **Tags** criada (ou campo Tags como Multiple Selects)
- [ ] Campo **Location Scope** configurado como Single Select com opções corretas
- [ ] Campo **Status** configurado como Single Select
- [ ] Campo **Contrato** configurado como Single Select (opcional)
- [ ] Campo **Source** configurado como Single Select (novo)
- [ ] Campo **Moeda** configurado como Single Select (se usar salário)
- [ ] Links configurados entre tabelas (se usar Linked Records)
- [ ] Campo **ID** configurado como Unique

### Teste Inicial

1. Executar `npm run fetch:greenhouse` para gerar JSON
2. Revisar `scripts/greenhouse-jobs-output.json`
3. Executar `npm run sync:greenhouse` (modo seco primeiro, se possível)
4. Verificar se campos foram preenchidos corretamente
5. Ajustar mapeamentos conforme necessário

## 🚀 Próximos Passos

1. **Criar função para gerenciar tabelas auxiliares** (Companies, Categories, Tags)
2. **Implementar busca/criação dinâmica** de registros linked
3. **Adicionar modo "dry-run"** para testar sem criar registros
4. **Implementar atualização** de jobs existentes (opcional)
5. **Adicionar logs detalhados** de criação/atualização

## 🔍 Campos Adicionais para Análise Futura

### Para Dashboards no Airtable

- **Views per Category:** Filtrar por categoria
- **Views per Company:** Agrupar por empresa
- **Views per Source:** Ver origem das vagas
- **Views per Date:** Vagas recentes
- **Views per Status:** Vagas ativas/inativas

### Para Expansão Futura

- **Description (EN):** Versão em inglês
- **Experience Level:** Junior, Mid, Senior, Lead
- **Remote Type:** Fully Remote, Hybrid, On-site
- **Application Count:** Número de candidaturas (se integrar com ATS)
- **Expiration Date:** Data de expiração da vaga

