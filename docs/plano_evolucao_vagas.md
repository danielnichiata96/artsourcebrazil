# Plano de Evolução para o Sistema de Vagas

Este documento descreve a proposta de evolução do sistema de listagem de vagas do site, migrando de um processo manual para um sistema automatizado que utiliza APIs de terceiros e web scrapers.

## 1. Objetivo

O objetivo principal é aumentar a quantidade, a qualidade e a atualidade das vagas de emprego listadas no site, ao mesmo tempo em que se reduz o esforço manual de curadoria e publicação.

## 2. Situação Atual

Atualmente, as vagas são gerenciadas de forma estática, provavelmente através da edição manual de um arquivo JSON (`src/data/jobs.json`). Este processo é trabalhoso, escalável de forma limitada e propenso a desatualização das vagas.

## 3. Arquitetura Proposta

**🎯 UPDATE: Migração para Supabase** (Substituindo Airtable)

A nova arquitetura será baseada em um serviço de agregação de vagas que funcionará da seguinte forma:

- **Fontes de Dados:**
    - **APIs Livres:** Conexão com APIs de plataformas de emprego que oferecem acesso gratuito aos seus dados.
    - **Web Scrapers:** Robôs que extraem informações de vagas diretamente de páginas de carreiras de empresas ou de outros sites de emprego que não possuem API.

- **Banco de Dados: Supabase (PostgreSQL)**
    - **Substitui Airtable** - Banco de dados robusto com interface visual (Table Editor)
    - **Performance superior** - Sem rate limits artificiais, queries SQL rápidas
    - **Deduplicação nativa** - Upsert do PostgreSQL garante unicidade
    - **Interface visual mantida** - Table Editor permite gestão manual de vagas
    - **Escalável** - Preparado para milhares de vagas sem degradação

- **Orquestrador:**
    - Um script central (orquestrador) será responsável por acionar os conectores de API e os scrapers.
    - Este script poderá ser executado periodicamente através de um agendador (como Cron Job, GitHub Actions ou um serviço serverless).

- **Processamento e Armazenamento:**
    - Os dados coletados serão normalizados para um formato padrão.
    - Um mecanismo de deduplicação será implementado usando upsert do Supabase.
    - As vagas validadas e processadas serão salvas no **Supabase (PostgreSQL)**.
    - **Geração estática:** As vagas do Supabase serão sincronizadas para `src/data/jobs.json`, mantendo a compatibilidade com o frontend existente.

## 4. Sugestão para o MVP (Produto Mínimo Viável)

Para validar a arquitetura proposta com o mínimo de esforço, o MVP se concentrará em:

- **Integração com ATS públicos:** Integrar APIs de Greenhouse, Ashby e Lever focando em empresas relevantes.
- **Criação de 1 Scraper complementar:** Desenvolver um scraper para Wildlife Studios como fonte adicional (empresa já presente no site).
- **Script de Orquestração Manual:** Criar o script que executa a coleta, transformação e salvamento dos dados, mas com acionamento manual.
- **Normalização e Deduplicação:** Implementar lógica básica para normalizar dados de diferentes fontes e evitar duplicatas.
- **Manter o Frontend:** Nenhuma alteração será feita na interface do usuário nesta fase. O foco é validar o backend e garantir que todos os links sejam diretos.

### 4.1. APIs Escolhidas para o MVP: Greenhouse, Ashby e Lever

Após uma análise detalhada, foram escolhidas **APIs de ATS públicos** como fonte de dados primária para o MVP. Estas plataformas oferecem endpoints JSON públicos que retornam links diretos para aplicação, evitando camadas intermediárias.

#### Por que ATS públicos (Greenhouse, Ashby, Lever)?

**Vantagens:**
- ✅ **Links diretos para aplicação** - Sem intermediários (candidato vai direto do seu site para a vaga)
- ✅ **Dados estruturados e completos** - Título, descrição, categoria, localização, tags, salário
- ✅ **Atualização em tempo real** - Vagas refletem o estado atual do board da empresa
- ✅ **Experiência do usuário superior** - Sem redirecionamentos desnecessários
- ✅ **Controle total** - Você controla a experiência do candidato
- ✅ **Ampla adoção** - Milhares de empresas usam essas plataformas

#### Greenhouse Board API
- **Endpoint:** `https://boards.greenhouse.io/{company}/jobs.json`
- **Exemplo de empresas:** Automattic, Stripe, Shopify, Reddit, e muitas outras
- **Estrutura:** JSON bem estruturado com todos os campos necessários
- **Documentação:** Formatos públicos bem documentados

#### Lever API
- **Endpoint:** `https://api.lever.co/v0/postings/{company}` ou endpoints públicos em páginas de carreiras
- **Exemplo de empresas:** Netflix, Reddit, e outras empresas de tecnologia
- **Estrutura:** Similar ao Greenhouse, formato consistente

#### Ashby
- **Estrutura:** Geralmente endpoints JSON embutidos em páginas de carreiras
- **Vantagens:** Dados estruturados, links diretos
- **Desafio:** Formato pode variar mais entre empresas

#### Por que NÃO Remotive (inicialmente)?
- ❌ **Cria camada extra** - Seu site → Remotive → Site da vaga
- ❌ **Redirecionamento desnecessário** - Piora a experiência do usuário
- ❌ **Menos controle** - Você não controla a jornada do candidato
- ❌ **Potencial perda de conversão** - Cada camada adicional pode reduzir candidaturas
- ✅ **Pode ser considerado depois** - Para vagas que não estão disponíveis em ATS públicos

### 4.2. Estratégia de Scraping para o MVP

- **Biblioteca:** Manteremos o uso do **Playwright**, que já está configurado no projeto para testes e é excelente para lidar com sites dinâmicos.
- **Alvo Inicial:** Para o primeiro scraper, sugerimos a página de carreiras da **Wildlife Studios** (`https://wildlifestudios.com/careers/`). A escolha se baseia no fato de ser uma empresa de tecnologia relevante no cenário brasileiro e já possuir recursos visuais no site.

## 5. Próximos Passos

1.  **Pesquisa de APIs:** **(Concluído)** Foco em ATS públicos (Greenhouse, Ashby, Lever) foi definido após análise comparativa.
2.  **Migração para Supabase:** **(PRIORIDADE)** Migrar completamente do Airtable para Supabase.
    - Setup do projeto Supabase
    - Criar schema do banco (jobs, companies, categories, tags, job_tags)
    - Migrar dados existentes do Airtable
    - Reescrever scripts de sincronização
    - Validar funcionamento completo
3.  **Identificação de Empresas:** Listar empresas relevantes que usam Greenhouse, Ashby ou Lever e que publicam vagas remotas para o mercado brasileiro.
4.  **Desenvolvimento do Orquestrador:** Implementar o script inicial para buscar e processar os dados de múltiplas fontes (ATS públicos) no Supabase.
5.  **Implementação dos Adaptadores:**
    - ✅ Criar adaptador para Greenhouse Board API (Concluído - Wildlife Studios, Automattic, GitLab)
    - ✅ Criar adaptador para Lever API (Concluído - Fanatee)
    - ✅ Criar adaptador para Ashby GraphQL (Concluído - Deel, Ashby)
    - ⏳ Testar adaptadores com empresas reais
    - ⏳ Criar adaptador/scraper para Wildlife Studios (complementar)
6.  **Normalização e Deduplicação:** Implementar lógica usando upsert do Supabase para normalizar dados de diferentes fontes e evitar duplicatas.
7.  **Testes:** Garantir que os dados são coletados, normalizados e salvos corretamente no Supabase e gerados no formato esperado (`src/data/jobs.json`).
8.  **Validação de Links Diretos:** Confirmar que todos os links de aplicação são diretos (sem intermediários).

---

## 6. Documentação Adicional

- **`docs/SUPABASE_MIGRATION.md`** - Plano completo de migração do Airtable para Supabase
- **`docs/FETCHERS_GUIDE.md`** - Guia completo dos fetchers de vagas (Greenhouse, Lever, Ashby)
- **`archive/AIRTABLE_SCHEMA_OPTIMIZED.md`** - Schema anterior (Airtable) - arquivado como referência histórica

## 7. Status Atual da Implementação

### ✅ Concluído:
- [x] Fetcher Greenhouse (Wildlife Studios, Automattic, GitLab, Monks, AE.Studio)
- [x] Fetcher Lever (Fanatee)
- [x] Fetcher Ashby (Deel, Ashby)
- [x] Sistema de categorização inteligente (VFX, 3D, 2D Art, Animation, Design, Game Dev)
- [x] Detecção de location scope (remote-brazil, remote-latam, remote-worldwide, hybrid, onsite)
- [x] Extração inteligente de tags (AI + fallback)
- [x] Filtros de vagas relevantes
- [x] Documentação completa dos fetchers

### ⏳ Em Andamento:
- [ ] Testar Lever com Fanatee (aguardando execução)
- [ ] Testar Ashby com Deel (aguardando execução)
- [ ] Validar outputs e ajustar mapeamentos se necessário

### 📋 Próximas Ações:
1. **Testar os fetchers criados:**
   ```bash
   node scripts/fetch-lever-jobs.mjs
   node scripts/fetch-ashby-jobs.mjs
   ```

2. **Revisar outputs:**
   - `scripts/lever-jobs-output.json`
   - `scripts/ashby-jobs-output.json`

3. **Ajustar mapeamentos** se necessário (categorias, location scopes)

4. **Adicionar mais empresas** usando os mesmos fetchers

5. **Criar orquestrador** para executar todos os fetchers

6. **Integrar com Supabase** para salvar vagas no banco

7. **Automatizar** com GitHub Actions (daily sync)
