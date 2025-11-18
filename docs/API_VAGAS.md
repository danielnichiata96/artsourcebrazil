# API Endpoint: `/api/vagas.json`

## Visão Geral

Este endpoint retorna todas as vagas ativas do Supabase em formato JSON. É perfeito para componentes de busca React/Vue/Vanilla JS que precisam consumir dados de vagas.

## Endpoint

```
GET /api/vagas.json
```

## Resposta

### Sucesso (200 OK)

```json
{
  "jobs": [
    {
      "id": "WIL-998002",
      "companyName": "Wildlife Studios",
      "companyLogo": "/images/companies/wildlifestudios.png",
      "jobTitle": "Senior 3D Game Artist",
      "description": "...",
      "applyLink": "https://...",
      "postedDate": "2025-01-15T00:00:00Z",
      "category": "3D",
      "tags": ["Unity", "3D Modeling"],
      "location": {
        "scope": "remote-brazil"
      },
      "contractType": "PJ",
      "salary": null
    }
  ],
  "count": 42,
  "lastUpdated": "2025-01-15T10:30:00Z"
}
```

### Erro (500 Internal Server Error)

```json
{
  "error": "Failed to fetch jobs",
  "message": "Error details..."
}
```

## Características

- ✅ **Dados sempre atualizados**: Busca diretamente do Supabase em tempo real (SSR)
- ✅ **Cache inteligente**: CDN cache de 1 minuto com stale-while-revalidate
- ✅ **CORS habilitado**: Permite acesso de componentes externos
- ✅ **Ordenação**: Vagas ordenadas por data (mais recentes primeiro)
- ✅ **TypeScript**: Interface `JobsApiResponse` exportada para uso no frontend

## ⚠️ Importante: Modo Híbrido (Hybrid Mode)

Este endpoint roda em modo **SSR (Server-Side Rendering)** para buscar dados em tempo real do Supabase.

**Configuração necessária:**
- `output: 'hybrid'` no `astro.config.mjs`
- Adaptador Vercel instalado (`@astrojs/vercel`)
- `export const prerender = false;` no arquivo do endpoint

Isso garante que:
- Páginas estáticas continuam sendo SSG (build time)
- API endpoints rodam no servidor (runtime) e buscam dados frescos

## Uso em Componentes

### React

```tsx
import { useEffect, useState } from 'react';
import type { Job } from '../lib/jobs';

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vagas.json')
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <ul>
      {jobs.map(job => (
        <li key={job.id}>{job.jobTitle}</li>
      ))}
    </ul>
  );
}
```

### Vue

```vue
<template>
  <ul v-if="!loading">
    <li v-for="job in jobs" :key="job.id">{{ job.jobTitle }}</li>
  </ul>
  <div v-else>Carregando...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Job } from '../lib/jobs';

const jobs = ref<Job[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('/api/vagas.json');
    const data = await response.json();
    jobs.value = data.jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
  } finally {
    loading.value = false;
  }
});
</script>
```

### Vanilla JS

```javascript
async function loadJobs() {
  try {
    const response = await fetch('/api/vagas.json');
    const data = await response.json();
    
    console.log(`Total de vagas: ${data.count}`);
    console.log('Vagas:', data.jobs);
    
    // Render jobs
    data.jobs.forEach(job => {
      console.log(`${job.jobTitle} - ${job.companyName}`);
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
}

loadJobs();
```

### TypeScript (Recomendado)

```typescript
import type { Job } from '../lib/jobs';
import type { JobsApiResponse } from '../pages/api/vagas.json';

async function fetchJobs(): Promise<JobsApiResponse> {
  const response = await fetch('/api/vagas.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// Usage
const data = await fetchJobs();
console.log(`${data.count} vagas disponíveis`);
console.log(`Última atualização: ${data.lastUpdated}`);
```

**Nota:** A interface `JobsApiResponse` é exportada do endpoint e pode ser importada diretamente.

## Filtragem no Cliente

Você pode filtrar os dados no cliente após buscar:

```javascript
// Buscar vagas
const response = await fetch('/api/vagas.json');
const { jobs } = await response.json();

// Filtrar por categoria
const gameDevJobs = jobs.filter(job => job.category === 'Game Dev');

// Filtrar por tag
const unityJobs = jobs.filter(job => 
  job.tags.some(tag => tag.toLowerCase().includes('unity'))
);

// Buscar por texto
const searchTerm = 'senior';
const filtered = jobs.filter(job =>
  job.jobTitle.toLowerCase().includes(searchTerm) ||
  job.companyName.toLowerCase().includes(searchTerm)
);
```

## Cache

O endpoint usa cache HTTP de 1 minuto:

```
Cache-Control: public, max-age=60, s-maxage=60
```

Para dados mais frescos, você pode:
1. Invalidate o cache adicionando um query parameter: `/api/vagas.json?t=${Date.now()}`
2. Fazer uma requisição com `Cache-Control: no-cache`

## CORS

CORS está habilitado para permitir acesso de domínios externos:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

## Legado

O endpoint `/jobs.json` ainda está disponível para compatibilidade, mas recomendamos usar `/api/vagas.json` para novos componentes.

## Exemplo Completo: Componente de Busca

```typescript
class JobSearch {
  private jobs: Job[] = [];
  private filteredJobs: Job[] = [];

  async init() {
    const response = await fetch('/api/vagas.json');
    const data = await response.json();
    this.jobs = data.jobs;
    this.filteredJobs = this.jobs;
  }

  search(query: string) {
    const lowerQuery = query.toLowerCase();
    this.filteredJobs = this.jobs.filter(job =>
      job.jobTitle.toLowerCase().includes(lowerQuery) ||
      job.companyName.toLowerCase().includes(lowerQuery) ||
      job.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    return this.filteredJobs;
  }

  filterByCategory(category: string) {
    this.filteredJobs = this.jobs.filter(job => job.category === category);
    return this.filteredJobs;
  }
}

// Usage
const search = new JobSearch();
await search.init();
const results = search.search('senior');
```

