export const supportedLocales = ['pt-BR', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'pt-BR';

const translations = {
  'pt-BR': {
    seo: {
      home: {
        title: 'Art Source Brazil — Vagas remotas criativas',
        description:
          'Curadoria semanal de vagas remotas em Game Dev, 3D & Animation e UI/UX para talentos brasileiros. Trabalhe para estúdios internacionais sem sair do país.',
      },
    },
    nav: {
      items: [
        { label: 'Vagas', href: '/vagas' },
        { label: 'Blog', href: '/blog' },
        { label: 'Sobre', href: '/about' },
      ],
      cta: 'Anunciar Vaga',
      tagline: 'Remote Creative Jobs',
      languageToggle: {
        shortLabel: 'EN',
        ariaLabel: 'Ver site em inglês',
      },
    },
    hero: {
      badge: 'Live Beta v3.0',
      badgeLabel: 'Curadoria humana para talentos criativos do Brasil',
      titleLine1: 'CRIADO NO',
      titleLine2: 'BRASIL.',
      titleLine3: 'DEPLOYADO GLOBAL.',
      title: 'Art Source Brazil',
      description:
        'O hub definitivo para <span class="font-bold text-ink">Artistas 3D</span>, <span class="font-bold text-ink">Mestres de VFX</span> e <span class="font-bold text-ink">Game Devs</span> no Brasil procurando trabalho remoto internacional.',
      primaryCta: 'Ver vagas selecionadas',
      secondaryCta: 'Postar uma vaga',
      sectionTitle: 'Vagas Recentes',
      emptyStateTitle: 'Fim da linha.',
      emptyStateReset: 'Resetar',
      stats: {
        jobs: { label: 'Vagas abertas', unitSingular: 'posição', unitPlural: 'posições' },
        companies: { label: 'Estúdios parceiros', unitSingular: 'empresa', unitPlural: 'empresas' },
        categories: { label: 'Categorias criativas', unitSingular: 'categoria', unitPlural: 'categorias' },
        skills: { label: 'Skills em destaque', unitSingular: 'skill', unitPlural: 'skills' },
      },
      timeAgo: {
        today: 'HOJE',
        yesterday: 'ONTEM',
        daysAgo: '{days}D ATRÁS',
      },
      location: {
        brazilOnly: 'SOMENTE BRASIL',
        latamRemote: 'REMOTO LATAM',
        global: 'GLOBAL',
        hybrid: 'HÍBRIDO',
        onsite: 'PRESENCIAL',
        remote: 'REMOTO',
      },
    },
    results: {
      countSingular: 'vaga',
      countPlural: 'vagas',
      contextAll: 'vagas abertas',
      contextFiltered: 'de {total} vagas',
      ariaTemplate: 'Mostrando {count} {countWord} de {total} {totalWord} disponíveis.',
      none: 'Nenhum filtro ativo no momento.',
      noneSidebar: 'Nenhum filtro ativo.',
      clear: 'Limpar filtros',
      clearShort: 'Limpar',
      emptyList:
        'Nenhuma vaga encontrada com esses filtros. Tenta ajustar a busca ou limpar os filtros pra ver todas as vagas.',
      removeTemplate: 'Remover filtro {label}',
      chips: {
        search: 'Busca',
        category: 'Categoria',
        level: 'Nível',
        tools: 'Ferramenta',
        contract: 'Contrato',
        location: 'Local',
      },
    },
    filters: {
      toggle: 'Filtros',
      toggleAria: 'Abrir filtros',
      closeAria: 'Fechar filtros',
      searchLabel: 'Buscar vagas',
      searchPlaceholder: 'Busque por título, empresa, skill...',
      area: 'Área',
      allAreas: 'Todas as Áreas',
      category: 'Categoria',
      discipline: 'Área', // Legacy compatibility
      allCategories: 'Todas as Áreas',
      level: 'Nível',
      tools: 'Ferramentas',
      contract: 'Contrato',
      tags: 'Skills em Destaque',
      location: 'Localização',
      locationAll: 'Todas',
      locationRemoteBrazil: 'Remoto (Brasil)',
      locationRemoteLatam: 'Remoto (LATAM)',
      locationRemoteWorldwide: 'Remoto (Global)',
      locationHybrid: 'Híbrido',
      locationOnsite: 'Presencial',
      apply: 'Aplicar filtros',
      clear: 'Limpar tudo',
      sidebarTitle: 'Resultados',
      sidebarEmpty: 'Nenhum filtro ativo.',
      sidebarClear: 'Limpar',
      loadingMessage: 'Buscando vagas...',
      errorMessage: 'Ops, algo deu errado. Tenta de novo?',
      hiringTitle: 'Contratando?',
      hiringSubtitle: 'Alcance 5.000+ criativos brasileiros.',
      postNow: 'Postar Agora',
      activeFilters: {
        title: 'Filtros ativos',
        clearAll: 'Limpar tudo',
        remove: 'Remover',
        search: 'Busca',
        category: 'Área',
        tag: 'Skill',
      },
    },
    categories: {
      'Engineering & Code': 'Engenharia & Código',
      'Art & Animation': 'Arte & Animação',
      'Design & Product': 'Design & Produto',
      'Production': 'Produção',
      descriptions: {
        'Engineering & Code': 'Game dev, Unity, Unreal, Pipeline TD, QA, Creative Coders',
        'Art & Animation': '3D, 2D, VFX, Motion Graphics, Rigging, Concept Art',
        'Design & Product': 'Game Design, Level Design, UI/UX, Product Design',
        'Production': 'Producers, Project Managers, Product Owners, Scrum Masters',
      },
    },
    job: {
      new: 'Nova',
      remote: 'Remoto • Brasil',
      button: 'Ver detalhes',
      share: {
        label: 'Compartilhe esta vaga:',
        twitter: 'Compartilhar no X',
        linkedin: 'Compartilhar no LinkedIn',
        whatsapp: 'Compartilhar no WhatsApp',
        copyLink: 'Copiar link',
        copied: 'Link copiado!',
      },
    },
    newsletter: {
      heading: 'Fique por dentro',
      description: 'Receba as vagas mais recentes diretamente no seu e-mail.',
      placeholder: 'seu-email@exemplo.com',
      button: 'Assinar',
      disclaimer: 'Respeitamos sua privacidade. Sem spam.',
      poweredBy: 'Powered by',
      provider: 'Buttondown',
    },
    newsletterCta: {
      badge: 'Newsletter Semanal',
      title: 'Não perca a vaga dos sonhos',
      subtitle: 'Receba a curadoria semanal de vagas em Game Dev, 3D, VFX e Animation direto no seu e-mail. Toda segunda-feira, antes de todo mundo.',
      placeholder: 'seu-email@exemplo.com',
      button: 'Quero receber',
      benefits: [
        '✓ Vagas exclusivas antes de serem públicas',
        '✓ Curadoria humana (sem spam)',
        '✓ Dicas de carreira e portfólio',
      ],
    },
    footer: {
      ctaTitle: 'Quer contratar talento brasileiro?',
      ctaSubtitle: 'Poste sua vaga e alcance nossa comunidade curada de artistas, devs e storytellers.',
      ctaButton: 'Anunciar Vaga',
      columns: {
        jobs: {
          title: 'Explorar Vagas',
          links: [
            { label: 'Engenharia & Código', href: '/category/engineering-code' },
            { label: 'Arte & Animação', href: '/category/art-animation' },
            { label: 'Design & Produto', href: '/category/design-product' },
            { label: 'Produção', href: '/category/production' },
          ],
          viewAll: { label: 'Ver todas as categorias', href: '/' },
        },
        community: {
          title: 'Comunidade & Recursos',
          links: [
            { label: 'Diretório de Empresas', href: '/companies' },
            { label: 'Blog & Notícias', href: '/blog' },
            { label: 'Newsletter', href: '#newsletter' },
          ],
        },
        about: {
          title: 'Sobre o Art Source',
          links: [
            { label: 'Sobre Nós', href: '/about' },
            { label: 'Contato', href: '/contact' },
            { label: 'Termos de Uso', href: '/terms' },
            { label: 'Política de Privacidade', href: '/privacy' },
          ],
        },
        social: {
          title: 'Social',
          links: [
            { label: 'LinkedIn', href: 'https://linkedin.com/company/artsourcebrazil' },
            { label: 'Instagram', href: 'https://instagram.com/artsourcebrazil' },
            { label: 'Twitter', href: 'https://twitter.com/artsourcebr' },
          ],
        },
      },
      copyright: 'Todos os direitos reservados.',
      signature: 'Feito no Brasil',
    },
  },
  en: {
    seo: {
      home: {
        title: 'Art Source Brazil — Remote Creative Jobs',
        description:
          'Weekly hand-picked remote roles in Game Dev, 3D & Animation, and UI/UX tailored for Brazilian creative talent. Work with global studios from anywhere in Brazil.',
      },
    },
    nav: {
      items: [
        { label: 'Jobs', href: '/vagas' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' },
      ],
      cta: 'Post a Job',
      tagline: 'Remote Creative Jobs',
      languageToggle: {
        shortLabel: 'PT',
        ariaLabel: 'View website in Portuguese',
      },
    },
    hero: {
      badge: 'Live Beta v3.0',
      badgeLabel: 'Human-curated for Brazilian creative talent',
      titleLine1: 'CRAFTED IN',
      titleLine2: 'BRAZIL.',
      titleLine3: 'DEPLOYED GLOBAL.',
      title: 'Art Source Brazil',
      description:
        'The definitive hub for <span class="font-bold text-ink">3D Artists</span>, <span class="font-bold text-ink">VFX Wizards</span>, and <span class="font-bold text-ink">Game Devs</span> in Brazil looking for international remote work.',
      primaryCta: 'Explore handpicked jobs',
      secondaryCta: 'Post a job',
      sectionTitle: 'Fresh Roles',
      emptyStateTitle: 'Dead End.',
      emptyStateReset: 'Reset',
      stats: {
        jobs: { label: 'Open roles', unitSingular: 'role', unitPlural: 'roles' },
        companies: { label: 'Hiring studios', unitSingular: 'studio', unitPlural: 'studios' },
        categories: { label: 'Creative categories', unitSingular: 'category', unitPlural: 'categories' },
        skills: { label: 'Featured skills', unitSingular: 'skill', unitPlural: 'skills' },
      },
      timeAgo: {
        today: 'TODAY',
        yesterday: 'YESTERDAY',
        daysAgo: '{days}D AGO',
      },
      location: {
        brazilOnly: 'BRAZIL ONLY',
        latamRemote: 'LATAM REMOTE',
        global: 'GLOBAL',
        hybrid: 'HYBRID',
        onsite: 'ON-SITE',
        remote: 'REMOTE',
      },
    },
    results: {
      countSingular: 'job',
      countPlural: 'jobs',
      contextAll: 'open roles',
      contextFiltered: 'of {total} total roles',
      ariaTemplate: 'Showing {count} {countWord} out of {total} {totalWord}.',
      none: 'No filters applied yet.',
      noneSidebar: 'No filters active.',
      clear: 'Clear filters',
      clearShort: 'Clear',
      emptyList:
        'No jobs match your filters. Try adjusting your search or clear everything to see all open roles.',
      removeTemplate: 'Remove filter {label}',
      chips: {
        search: 'Search',
        category: 'Category',
        level: 'Level',
        tools: 'Tool',
        contract: 'Contract',
        location: 'Location',
      },
    },
    filters: {
      toggle: 'Filters',
      toggleAria: 'Open filters',
      closeAria: 'Close filters',
      searchLabel: 'Job search',
      searchPlaceholder: 'Search by title, company, skill...',
      area: 'Area',
      allAreas: 'All Areas',
      category: 'Category',
      discipline: 'Area', // Legacy compatibility
      allCategories: 'All Areas',
      level: 'Level',
      tools: 'Tools',
      contract: 'Contract',
      tags: 'Featured Skills',
      location: 'Location',
      locationAll: 'All',
      locationRemoteBrazil: 'Remote (Brazil)',
      locationRemoteLatam: 'Remote (LATAM)',
      locationRemoteWorldwide: 'Remote (Worldwide)',
      locationHybrid: 'Hybrid',
      locationOnsite: 'On-site',
      apply: 'Apply filters',
      clear: 'Clear all',
      sidebarTitle: 'Results',
      sidebarEmpty: 'No filters active.',
      sidebarClear: 'Clear',
      loadingMessage: 'Searching...',
      errorMessage: 'Oops, something went wrong. Try again?',
      hiringTitle: 'Hiring?',
      hiringSubtitle: 'Reach 5,000+ Brazilian creatives.',
      postNow: 'Post Now',
      activeFilters: {
        title: 'Active filters',
        clearAll: 'Clear all',
        remove: 'Remove',
        search: 'Search',
        category: 'Category',
        tag: 'Skill',
      },
    },
    categories: {
      'Engineering & Code': 'Engineering & Code',
      'Art & Animation': 'Art & Animation',
      'Design & Product': 'Design & Product',
      'Production': 'Production',
      descriptions: {
        'Engineering & Code': 'Game dev, Unity, Unreal, Pipeline TD, QA, Creative Coders',
        'Art & Animation': '3D, 2D, VFX, Motion Graphics, Rigging, Concept Art',
        'Design & Product': 'Game Design, Level Design, UI/UX, Product Design',
        'Production': 'Producers, Project Managers, Product Owners, Scrum Masters',
      },
    },
    job: {
      new: 'New',
      remote: 'Remote • Brazil',
      button: 'View details',
      share: {
        label: 'Share this job:',
        twitter: 'Share on X',
        linkedin: 'Share on LinkedIn',
        whatsapp: 'Share on WhatsApp',
        copyLink: 'Copy link',
        copied: 'Link copied!',
      },
    },
    newsletter: {
      heading: 'Stay updated',
      description: 'Get the latest remote opportunities delivered straight to your inbox.',
      placeholder: 'your-email@example.com',
      button: 'Subscribe',
      disclaimer: 'We respect your privacy. No spam.',
      poweredBy: 'Powered by',
      provider: 'Buttondown',
    },
    newsletterCta: {
      badge: 'Weekly Newsletter',
      title: "Don't miss your dream job",
      subtitle: 'Get our weekly curated list of Game Dev, 3D, VFX, and Animation jobs delivered to your inbox. Every Monday, before everyone else.',
      placeholder: 'your-email@example.com',
      button: 'Sign me up',
      benefits: [
        '✓ Exclusive jobs before they go public',
        '✓ Human-curated (no spam)',
        '✓ Career and portfolio tips',
      ],
    },
    footer: {
      ctaTitle: 'Hiring Brazilian creative talent?',
      ctaSubtitle: 'Share your role and reach our curated community of artists, developers, and storytellers.',
      ctaButton: 'Post a Job',
      columns: {
        jobs: {
          title: 'Browse Jobs',
          links: [
            { label: 'Engineering & Code', href: '/category/engineering-code' },
            { label: 'Art & Animation', href: '/category/art-animation' },
            { label: 'Design & Product', href: '/category/design-product' },
            { label: 'Production', href: '/category/production' },
            { label: '3D Art Jobs', href: '/category/3d' },
            { label: '2D Art Jobs', href: '/category/2d-art' },
            { label: 'Animation Jobs', href: '/category/animation' },
            { label: 'VFX Jobs', href: '/category/vfx' },
            { label: 'Design Jobs', href: '/category/design' },
          ],
          viewAll: { label: 'View all categories', href: '/' },
        },
        community: {
          title: 'Community & Resources',
          links: [
            { label: 'Company Directory', href: '/companies' },
            { label: 'Blog & News', href: '/blog' },
            { label: 'Newsletter', href: '#newsletter' },
          ],
        },
        about: {
          title: 'About Art Source',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
          ],
        },
        social: {
          title: 'Social',
          links: [
            { label: 'LinkedIn', href: 'https://linkedin.com/company/artsourcebrazil' },
            { label: 'Instagram', href: 'https://instagram.com/artsourcebrazil' },
            { label: 'Twitter', href: 'https://twitter.com/artsourcebr' },
          ],
        },
      },
      copyright: 'All rights reserved.',
      signature: 'Made in Brazil',
    },
  },
};

export type Messages = (typeof translations)['pt-BR'];

export function getMessages(locale: Locale): Messages {
  return translations[locale] as Messages;
}

export function resolveLocale(url: URL): Locale {
  // 1. Check if we are in a subpath (e.g. /en/...)
  const [, firstPath] = url.pathname.split('/');
  if (firstPath === 'en') return 'en';

  // 2. Check query param (legacy/fallback)
  const param = url.searchParams.get('lang');
  if (param) {
    const normalized = param.toLowerCase();
    if (normalized === 'pt-br') return 'pt-BR';
    if (normalized === 'en') return 'en';
  }

  // 3. Default to pt-BR
  return defaultLocale;
}

export function getAlternateLocale(current: Locale): Locale {
  return current === 'pt-BR' ? 'en' : 'pt-BR';
}

