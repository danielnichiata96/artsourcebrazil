# Canvas Design System – Core Tokens

Este documento resume os tokens obrigatórios do novo visual "Brazil Tech" e como aplicá‑los de forma consistente em todo o site.

## Paleta Oficial

| Token | Hex | Uso recomendado |
| --- | --- | --- |
| `primary` | `#F7DD00` | Botões principais, badges “Hiring?”, destaques de CTA. |
| `primary-hover` | `#D1B000` | Hover/active do botão primário (não alternar para azul). |
| `primary-light` | `#FFF3A6` | Fundos suaves, chips e caixas de status. |
| `primary-lightest` | `#FFFADE` | Highlights, backgrounds em cards. |
| `brazil-blue` | `#33C7FF` | Gradientes, links de ênfase e CTA secundário. |
| `brazil-blue-dark` | `#1FA0D4` | Hover para elementos azuis. |
| `brazil-green` | `#009F4D` | Selos “New”, estados positivos, detalhes de formulário. |
| `brazil-green-dark` | `#0B7A3A` | Hover de botões verdes. |
| `brazil-purple` | `#9A7BFF` | Ponto inicial do gradiente hero. |

> Os tokens estão expostos no `tailwind.config.mjs` e disponíveis como utilitários (`bg-primary`, `bg-primary-hover`, `text-brazil-blue`, etc.).

## Estilo Visual "Canvas"

O design system "Canvas" é definido por:
- **Bordas**: Grossas e pretas (`border-2 border-ink` ou `border-thick`).
- **Cantos**: Quadrados ou levemente arredondados (`rounded-none` ou `rounded-sm` para inputs), evitando arredondamentos excessivos (`rounded-xl`, `rounded-full`) exceto em badges específicos.
- **Sombras**: Duras e deslocadas (`shadow-hard`, `shadow-hard-sm`), sem blur.
- **Tipografia**: `Space Grotesk` para títulos (Display) e `Public Sans` para corpo.

## Gradiente “BRAZIL.”

Use `bg-brazil-hero` para o preenchimento do texto hero (`BRAZIL.`) e acentos em cards/CTA especiais. O gradiente vai de `#9A7BFF` → `#33C7FF` → `#17E0FF`.

## Hovers e Interações

- **Botão primário**: `bg-primary` → `bg-primary-hover`. Nunca troque diretamente para azul para evitar perda da identidade amarela.
- **CTA secundário**: use `bg-brazil-blue` com `hover:bg-brazil-blue-dark`.
- **Links**: `text-brazil-blue` + `hover:text-brazil-blue-dark`.
- **Chips/Badges**: fundo `primary-light` + texto `ink`; ao hover, usar `border-primary` para reforçar o destaque.
- **Cards**: `hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none` para efeito de "press".

## Aplicação em Páginas

1. **Hero**: Títulos com `bg-brazil-hero text-transparent bg-clip-text`, botões amarelos e ícones verdes/azuis.
2. **Job Cards**: Borda preta, sombra dura, fundo branco. Faixa lateral pode alternar entre cores por categoria.
3. **Job Detail/Modal**: Cabeçalho quadrado, fundo branco, sombra dura.
4. **Newsletter**: Caixa com borda preta, sombra dura, fundo branco ou pastel. Input e botão quadrados.
5. **Footer/Nav**: bordas `border-ink`, fundos `paper`, botões sempre dentro da paleta acima.

## Ícones (Phosphor Icons)

Use **Phosphor Icons** no estilo **line** (não fill, duotone ou bold) para manter consistência com o design Canvas.

**Configuração**:
- **Stroke-width**: `24px` (mais grosso, mais visível)
- **Tamanho**: `20px` para botões, `24px` para headers
- **Cor**: `currentColor` (herda do texto)

**Exemplos**:
```html
<!-- Envelope (email) -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 256 256">
  <polyline points="224 56 128 144 32 56" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/>
  <path d="M32,56H224a0,0,0,0,1,0,0V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56A0,0,0,0,1,32,56Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/>
</svg>

<!-- Arrow Right (next/submit) -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 256 256">
  <line x1="40" y1="128" x2="216" y2="128" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/>
  <polyline points="144 56 216 128 144 200" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/>
</svg>
```

**Onde usar**:
- Botões (CTA, navigation)
- Headers de seções
- Status indicators
- Form labels (opcional)

**Onde NÃO usar**:
- Não use emojis (❌ 💾 📧)
- Não use ícones filled/solid
- Não use Font Awesome ou outros icon sets

Mantenha este arquivo atualizado sempre que novos tokens forem adicionados para garantir que todas as páginas sigam o mesmo sistema.
