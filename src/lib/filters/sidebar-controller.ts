import { validateFilterUpdate, validateCategory, sanitizeStringArray, type PartialFilterState } from '../validation/filter-schema';
import { FILTER_CONFIG } from '../constants';

const FALLBACK_NAVBAR_HEIGHT = 64;

export interface FiltersSidebarElements {
  sidebar: HTMLElement;
  overlay: HTMLElement;
  toggleBtn: HTMLButtonElement;
  closeBtn: HTMLButtonElement;
  searchInput: HTMLInputElement;
  categoryButtons: HTMLButtonElement[];
  clearBtn: HTMLButtonElement;
  checkboxGroups: {
    level: HTMLInputElement[];
    tools: HTMLInputElement[];
    contract: HTMLInputElement[];
    location: HTMLInputElement[];
  };
}

export class FiltersSidebarController {
  private elements: FiltersSidebarElements;
  private selectedCategory: string = 'all';
  private searchDebounceTimer: number | null = null;

  constructor(elements: FiltersSidebarElements) {
    this.elements = elements;
    this.validateElements();
    this.init();
  }

  private validateElements(): void {
    const { sidebar, overlay, toggleBtn, closeBtn, searchInput, clearBtn } = this.elements;
    if (!sidebar || !overlay || !toggleBtn || !closeBtn || !searchInput || !clearBtn) {
      console.error('[FiltersSidebar] Required elements not found');
    }
  }

  private init(): void {
    this.setupSidebarPosition();
    this.setupEventListeners();
    this.listenToGlobalFilters();
  }

  private setupSidebarPosition(): void {
    this.setSidebarPosition();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setSidebarPosition());
    }
    window.addEventListener('resize', () => this.setSidebarPosition());
  }

  private setSidebarPosition(): void {
    try {
      const navbar = document.querySelector('header');
      if (!navbar) {
        console.warn('[FiltersSidebar] Navbar not found, using default height');
        return;
      }

      const { sidebar } = this.elements;
      if (!sidebar) {
        console.error('[FiltersSidebar] Sidebar not found');
        return;
      }

      const navbarHeight = navbar.offsetHeight;
      if (isNaN(navbarHeight) || navbarHeight <= 0) {
        console.warn('[FiltersSidebar] Invalid navbar height, using default');
        return;
      }

      const isDesktop = window.innerWidth >= FILTER_CONFIG.BREAKPOINTS.DESKTOP;
      
      if (isDesktop) {
        sidebar.style.paddingTop = `${navbarHeight}px`;
        sidebar.style.height = `calc(100vh - ${navbarHeight}px)`;
      } else {
        sidebar.style.paddingTop = '0';
        sidebar.style.height = '100vh';
      }
      
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
    } catch (error) {
      console.error('[FiltersSidebar] Error setting sidebar position:', error);
      this.fallbackSidebarPosition();
    }
  }

  private fallbackSidebarPosition(): void {
    const { sidebar } = this.elements;
    if (sidebar) {
      sidebar.style.paddingTop = `${FALLBACK_NAVBAR_HEIGHT}px`;
      sidebar.style.height = `calc(100vh - ${FALLBACK_NAVBAR_HEIGHT}px)`;
    }
  }

  private setupEventListeners(): void {
    this.setupToggleListeners();
    this.setupSearchListener();
    this.setupCategoryListeners();
    this.setupCheckboxListeners();
    this.setupClearListener();
  }

  private setupToggleListeners(): void {
    const { toggleBtn, closeBtn, overlay } = this.elements;

    toggleBtn?.addEventListener('click', () => {
      const { sidebar } = this.elements;
      if (!sidebar) return;
      const isOpen = !sidebar.classList.contains('-translate-x-full');
      isOpen ? this.closeSidebar() : this.openSidebar();
    });

    closeBtn?.addEventListener('click', () => this.closeSidebar());
    overlay?.addEventListener('click', () => this.closeSidebar());
  }

  private setupSearchListener(): void {
    const { searchInput } = this.elements;
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      if (this.searchDebounceTimer !== null) {
        clearTimeout(this.searchDebounceTimer);
      }

      this.searchDebounceTimer = window.setTimeout(() => {
        const searchValue = searchInput.value.trim();
        this.dispatchChange({ search: searchValue });
      }, FILTER_CONFIG.DEBOUNCE_MS);
    });
  }

  private setupCategoryListeners(): void {
    const { categoryButtons } = this.elements;
    
    categoryButtons.forEach((btn) => {
      if (!btn) return;
      
      btn.addEventListener('click', () => {
        const cat = validateCategory(btn.dataset.category);
        this.selectedCategory = cat;
        this.updateCategoryUI();
        this.dispatchChange({ category: this.selectedCategory });
      });
    });
  }

  private setupCheckboxListeners(): void {
    const { level, tools, contract, location } = this.elements.checkboxGroups;

    level.forEach((checkbox: HTMLInputElement) => {
      checkbox?.addEventListener('change', () => this.applyFilters());
    });

    tools.forEach((checkbox: HTMLInputElement) => {
      checkbox?.addEventListener('change', () => this.applyFilters());
    });

    contract.forEach((checkbox: HTMLInputElement) => {
      checkbox?.addEventListener('change', () => this.applyFilters());
    });

    location.forEach((checkbox: HTMLInputElement) => {
      checkbox?.addEventListener('change', () => this.applyFilters());
    });
  }

  private setupClearListener(): void {
    const { clearBtn } = this.elements;
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
      this.clearAllFilters();
    });
  }

  private listenToGlobalFilters(): void {
    window.addEventListener('jobfilters:change', ((e: CustomEvent<PartialFilterState>) => {
      this.syncWithGlobalState(e.detail);
    }) as EventListener);
  }

  private updateCategoryUI(): void {
    const { categoryButtons } = this.elements;
    
    categoryButtons.forEach((btn) => {
      if (!btn) return;
      
      const cat = btn.dataset.category || '';
      const isActive = cat === this.selectedCategory;

      if (isActive) {
        btn.classList.add('category-btn-active', 'bg-primary', 'text-white', 'border-primary');
        btn.classList.remove('bg-background-paper', 'text-neutral-700', 'border-neutral-200');
      } else {
        btn.classList.remove('category-btn-active', 'bg-primary', 'text-white', 'border-primary');
        btn.classList.add('bg-background-paper', 'text-neutral-700', 'border-neutral-200');
      }
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  private applyFilters(): void {
    try {
      const { level, tools, contract, location } = this.elements.checkboxGroups;

      const selectedLevel = level
        .filter((cb: HTMLInputElement) => cb?.checked)
        .map((cb: HTMLInputElement) => cb?.value || '')
        .filter((v: string) => v);

      const selectedTools = tools
        .filter((cb: HTMLInputElement) => cb?.checked)
        .map((cb: HTMLInputElement) => cb?.value || '')
        .filter((v: string) => v);

      const selectedContract = contract
        .filter((cb: HTMLInputElement) => cb?.checked)
        .map((cb: HTMLInputElement) => cb?.value || '')
        .filter((v: string) => v);

      const selectedLocation = location
        .filter((cb: HTMLInputElement) => cb?.checked)
        .map((cb: HTMLInputElement) => cb?.value || '')
        .filter((v: string) => v);

      this.dispatchChange({
        level: sanitizeStringArray(selectedLevel),
        tools: sanitizeStringArray(selectedTools),
        contract: sanitizeStringArray(selectedContract),
        location: sanitizeStringArray(selectedLocation),
      });
    } catch (error) {
      console.error('[FiltersSidebar] Error applying filters:', error);
    }
  }

  private clearAllFilters(): void {
    const { searchInput } = this.elements;
    const { level, tools, contract, location } = this.elements.checkboxGroups;

    // Clear search
    if (searchInput) searchInput.value = '';

    // Clear checkboxes
    level.forEach((cb: HTMLInputElement) => {
      if (cb) cb.checked = false;
    });
    tools.forEach((cb: HTMLInputElement) => {
      if (cb) cb.checked = false;
    });
    contract.forEach((cb: HTMLInputElement) => {
      if (cb) cb.checked = false;
    });
    location.forEach((cb: HTMLInputElement) => {
      if (cb) cb.checked = false;
    });

    // Reset category
    this.selectedCategory = 'all';
    this.updateCategoryUI();

    // Dispatch reset
    this.dispatchChange({
      category: 'all',
      search: '',
      level: [],
      tools: [],
      contract: [],
      location: [],
    });
  }

  private syncWithGlobalState(filters: PartialFilterState): void {
    const { searchInput } = this.elements;
    const { level, tools, contract, location } = this.elements.checkboxGroups;

    // Sync search
    if (filters.search !== undefined && searchInput) {
      searchInput.value = filters.search;
    }

    // Sync category
    if (filters.category !== undefined) {
      this.selectedCategory = filters.category;
      this.updateCategoryUI();
    }

    // Sync level
    if (filters.level !== undefined) {
      level.forEach((cb: HTMLInputElement) => {
        if (cb) {
          cb.checked = filters.level?.includes(cb.value) ?? false;
        }
      });
    }

    // Sync tools
    if (filters.tools !== undefined) {
      tools.forEach((cb: HTMLInputElement) => {
        if (cb) {
          cb.checked = filters.tools?.includes(cb.value) ?? false;
        }
      });
    }

    // Sync contract types
    if (filters.contract !== undefined) {
      contract.forEach((cb: HTMLInputElement) => {
        if (cb) {
          cb.checked = filters.contract?.includes(cb.value) ?? false;
        }
      });
    }

    // Sync locations
    if (filters.location !== undefined) {
      location.forEach((cb: HTMLInputElement) => {
        if (cb) {
          cb.checked = filters.location?.includes(cb.value) ?? false;
        }
      });
    }
  }

  private dispatchChange(partial: PartialFilterState): void {
    try {
      const validatedData = validateFilterUpdate(partial);
      if (!validatedData) {
        console.warn('[FiltersSidebar] Invalid filter data, skipping dispatch');
        return;
      }
      
      window.dispatchEvent(new CustomEvent('jobfilters:change', { detail: validatedData }));
    } catch (error) {
      console.error('[FiltersSidebar] Error dispatching filter change:', error);
    }
  }

  private openSidebar(): void {
    const { sidebar, overlay, toggleBtn } = this.elements;
    if (!sidebar || !overlay || !toggleBtn) return;
    
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  private closeSidebar(): void {
    const { sidebar, overlay, toggleBtn } = this.elements;
    if (!sidebar || !overlay || !toggleBtn) return;
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Public method for cleanup if needed
  public destroy(): void {
    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
    }
  }
}
