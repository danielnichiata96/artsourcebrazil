export const supportedLocales = ['pt-BR', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'pt-BR';

const translations = {
  'pt-BR': {
    seo: {
      home: {
        title: 'ArtSource Brazil — Vagas remotas criativas',
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
      badge: 'Curadoria humana para talentos criativos do Brasil',
      title: 'ArtSource Brazil',
      description:
        'Selecionamos manualmente vagas remotas reais em Game Dev, 3D & Animation e UI/UX. Conectamos talentos brasileiros a estúdios que valorizam criatividade e cultura.',
      primaryCta: 'Ver vagas selecionadas',
      secondaryCta: 'Postar uma vaga',
      sectionTitle: 'Últimas oportunidades',
      stats: {
        jobs: { label: 'Vagas abertas', unitSingular: 'posição', unitPlural: 'posições' },
        companies: { label: 'Estúdios parceiros', unitSingular: 'empresa', unitPlural: 'empresas' },
        categories: { label: 'Categorias criativas', unitSingular: 'categoria', unitPlural: 'categorias' },
        skills: { label: 'Skills em destaque', unitSingular: 'skill', unitPlural: 'skills' },
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
        'Nenhuma vaga encontrada com os filtros selecionados. Ajuste sua busca ou limpe os filtros para ver todas as vagas disponíveis.',
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
      searchPlaceholder: 'Cargo, empresa ou skill...',
      category: 'Categoria',
      allCategories: 'Todas as vagas',
      level: 'Nível',
      tools: 'Ferramentas',
      contract: 'Contrato',
      location: 'Localização',
      apply: 'Aplicar filtros',
      clear: 'Limpar tudo',
      sidebarTitle: 'Resultados',
      sidebarEmpty: 'Nenhum filtro ativo.',
      sidebarClear: 'Limpar',
      loadingMessage: 'Filtrando vagas...',
      errorMessage: 'Não foi possível aplicar os filtros. Tente novamente.',
    },
    job: {
      new: 'Nova',
      remote: 'Remoto • Brasil',
      button: 'Ver detalhes',
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
      feedsLabel: 'Feeds:',
      jobsRss: 'Jobs RSS',
      jobsJson: 'Jobs JSON',
      blogRss: 'Blog RSS',
      copyright: 'Todos os direitos reservados.',
    },
  },
  en: {
    seo: {
      home: {
        title: 'ArtSource Brazil — Remote Creative Jobs',
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
      badge: 'Human-curated for Brazilian creative talent',
      title: 'ArtSource Brazil',
      description:
        'Remote roles in Game Dev, 3D & Animation, and UI/UX for Brazilian creative talent.',
      primaryCta: 'Explore handpicked jobs',
      secondaryCta: 'Post a job',
      sectionTitle: 'Latest opportunities',
      stats: {
        jobs: { label: 'Open roles', unitSingular: 'role', unitPlural: 'roles' },
        companies: { label: 'Hiring studios', unitSingular: 'studio', unitPlural: 'studios' },
        categories: { label: 'Creative categories', unitSingular: 'category', unitPlural: 'categories' },
        skills: { label: 'Featured skills', unitSingular: 'skill', unitPlural: 'skills' },
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
        'No jobs match your filters. Adjust your search or clear everything to see every open role.',
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
      searchPlaceholder: 'Role, company or skill...',
      category: 'Category',
      allCategories: 'All openings',
      level: 'Level',
      tools: 'Tools',
      contract: 'Contract',
      location: 'Location',
      apply: 'Apply filters',
      clear: 'Clear all',
      sidebarTitle: 'Results',
      sidebarEmpty: 'No filters active.',
      sidebarClear: 'Clear',
      loadingMessage: 'Filtering jobs...',
      errorMessage: 'We could not apply your filters. Please try again.',
    },
    job: {
      new: 'New',
      remote: 'Remote • Brazil',
      button: 'View details',
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
      feedsLabel: 'Feeds:',
      jobsRss: 'Jobs RSS',
      jobsJson: 'Jobs JSON',
      blogRss: 'Blog RSS',
      copyright: 'All rights reserved.',
    },
  },
} as const;

export type Messages = (typeof translations)['pt-BR'];

export function getMessages(locale: Locale): Messages {
  return translations[locale];
}

export function resolveLocale(url: URL): Locale {
  const param = url.searchParams.get('lang');
  if (param) {
    const normalized = param.toLowerCase();
    if (normalized === 'pt-br') return 'pt-BR';
    if (normalized === 'en') return 'en';
  }
  return defaultLocale;
}

export function getAlternateLocale(current: Locale): Locale {
  return current === 'pt-BR' ? 'en' : 'pt-BR';
}

