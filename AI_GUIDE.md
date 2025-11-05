# AI Project Guide: [ArtSource Brazil]

## 1. 📜 Project Overview

**Project Name:** `[ArtSource Brazil]`

**Concept:** Um job board de nicho, 100% em **Inglês**, focado em vagas remotas de empresas estrangeiras (Outsourcings, Estúdios) que procuram contratar talentos criativos do Brasil.

**Nicho (Diferencial):** Focamos em áreas criativas e artísticas, **não** em tech geral.

- Game Dev (Unreal, Unity, etc.)
- 3D & Animation (Blender, Maya, Cinema 4D)
- Design (UI/UX, Figma, Web Design)
- Technical Art

## 2. 🎯 Core Strategy & Principles (MVP)

A IA deve seguir estes princípios ao gerar código:

1.  **Speed First:** A prioridade é lançar rápido. Evitar complexidade desnecessária.
2.  **Static-First (Astro):** O site deve ser gerado estaticamente (SSG) com **Astro**. Isso garante performance máxima, SEO excelente e custo zero de hospedagem (Vercel/Netlify).
3.  **Zero-JS by Default:** Aderir à filosofia do Astro. O site deve ser HTML/CSS puro por padrão. Usar "Astro Islands" (`client:load`) **apenas** para interatividade essencial (ex: filtros de categoria).
4.  **Data as Content:** A fonte de dados única para as vagas é o arquivo local `src/data/jobs.json`. **NÃO** usar banco de dados, API externa ou CMS para o MVP.
5.  **Monetization (Simple):** A monetização será validada por uma página estática (`/post-a-job`) com um link de pagamento externo (ex: Stripe Payment Link, Gumroad). **NÃO** criar sistemas de login, contas de usuário ou formulários de backend.

## 3. 🛠 Tech Stack

- **Framework:** Astro
- **Estilização:** Tailwind CSS
- **Dados:** `src/data/jobs.json` (local)
- **Deployment:** Vercel ou Netlify (para CI/CD via Git)

## 4. 🗂 Data Structure: `src/data/jobs.json`

O schema para cada objeto de vaga **deve** ser:

```json
{
  "id": "string", // UUID ou ID único
  "companyName": "string",
  "companyLogo": "string", // URL para o logo
  "jobTitle": "string",
  "applyLink": "string", // Link EXTERNO direto para a vaga
  "postedDate": "string", // Formato ISO 8601 (ex: "2025-11-04T09:00:00Z")
  "category": "string", // Um de: "Game Dev", "3D & Animation", "Design (UI/UX)"
  "tags": ["string", "string"] // ex: ["Unreal", "Figma", "Senior", "Blender"]
}
```
