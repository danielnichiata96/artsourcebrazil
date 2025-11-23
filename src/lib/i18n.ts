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
        { label: 'Empresas', href: '/companies' },
        { label: 'Blog', href: '/blog' },
        { label: 'Sobre', href: '/about' },
      ],
      cta: 'Postar vaga',
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
    footer: {
      about: 'Sobre',
      contact: 'Contato',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Uso',
      blog: 'Blog',
      ctaTitle: 'Quer contratar talento brasileiro?',
      ctaSubtitle: 'Poste sua vaga e alcance nossa comunidade curada de artistas, devs e storytellers.',
      navigationLabel: 'Navegação',
      feedsLabel: 'Feeds:',
      jobsRss: 'Jobs RSS',
      jobsJson: 'Jobs JSON',
      blogRss: 'Blog RSS',
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
        { label: 'Companies', href: '/companies' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' },
      ],
      cta: 'Post a job',
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
    footer: {
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      blog: 'Blog',
      ctaTitle: 'Hiring Brazilian creative talent?',
      ctaSubtitle: 'Share your role and reach our curated community of artists, developers, and storytellers.',
      navigationLabel: 'Navigation',
      feedsLabel: 'Feeds:',
      jobsRss: 'Jobs RSS',
      jobsJson: 'Jobs JSON',
      blogRss: 'Blog RSS',
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

