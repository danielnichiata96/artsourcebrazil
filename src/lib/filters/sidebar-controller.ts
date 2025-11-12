import { validateFilterUpdate, validateCategory, sanitizeStringArray, type PartialFilterState } from '../validation/filter-schema';
import { FILTER_CONFIG } from '../constants';

const FALLBACK_NAVBAR_HEIGHT = 64;

/**
 * DOM elements required for FiltersSidebar functionality
 */
export interface FiltersSidebarElements {
  sidebar: HTMLElement;
  overlay: HTMLElement;
  toggleBtn: HTMLButtonElement;
  closeBtn: HTMLButtonElement;
  searchInput: HTMLInputElement;
  categoryButtons: HTMLButtonElement[];
  applyBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  checkboxGroups: {
    level: HTMLInputElement[];
    tools: HTMLInputElement[];
    contract: HTMLInputElement[];
    location: HTMLInputElement[];
  };
}

/**
 * FiltersSidebarController
 * 
 * Manages the mobile filter sidebar UI and interactions.
 * 
 * Features:
 * - Mobile/desktop responsive positioning
 * - Category filter buttons
 * - Search input with debouncing
 * - Checkbox filters (level, tools, contract, location)
 * - Clear all filters functionality
 * - Syncs with global filter state
 * 
 * @example
 * ```ts
 * const controller = new FiltersSidebarController({
 *   sidebar: document.getElementById('filters-sidebar'),
 *   overlay: document.getElementById('filters-overlay'),
 *   // ... other elements
 * });
 * ```
 */
export class FiltersSidebarController {
  private elements: FiltersSidebarElements;
  private selectedCategory: string = 'all';
  private searchDebounceTimer: number | null = null;
  private autoApplyTimer: number | null = null;
  private pendingFilters: boolean = false;
  private cleanup: Array<() => void> = [];
  private isDestroyed = false;

  constructor(elements: FiltersSidebarElements) {
    this.elements = elements;
    this.validateElements();
    this.init();
  }

  private validateElements(): void {
    const { sidebar, overlay, toggleBtn, closeBtn, searchInput, applyBtn, clearBtn } = this.elements;
    if (!sidebar || !overlay || !toggleBtn || !closeBtn || !searchInput || !applyBtn || !clearBtn) {
      console.error('[FiltersSidebar] Required elements not found');
    }
  }

  private init(): void {
    this.setupSidebarPosition();
    this.setupEventListeners();
    this.listenToGlobalFilters();
    this.updateApplyButtonState();
    this.registerGlobalCleanup();
  }

  private setupSidebarPosition(): void {
    this.setSidebarPosition();
    
    if (document.readyState === 'loading') {
      const domReadyHandler = () => this.setSidebarPosition();
      document.addEventListener('DOMContentLoaded', domReadyHandler);
      this.cleanup.push(() => document.removeEventListener('DOMContentLoaded', domReadyHandler));
    }

    const resizeHandler = () => this.setSidebarPosition();
    window.addEventListener('resize', resizeHandler);
    this.cleanup.push(() => window.removeEventListener('resize', resizeHandler));
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

      // Don't apply padding-top or height to sidebar - it's handled by CSS
      // The sidebar is positioned statically in the layout and doesn't need dynamic positioning
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
    } catch (error) {
      console.error('[FiltersSidebar] Error setting sidebar position:', error);
      this.fallbackSidebarPosition();
    }
  }

  private fallbackSidebarPosition(): void {
    // Fallback is no longer needed since we don't manipulate sidebar positioning via JS
    // The sidebar uses CSS-only positioning
    document.documentElement.style.setProperty('--navbar-height', `${FALLBACK_NAVBAR_HEIGHT}px`);
  }

  private setupEventListeners(): void {
    this.setupToggleListeners();
    this.setupSearchListener();
    this.setupCategoryListeners();
    this.setupCheckboxListeners();
    this.setupApplyListener();
    this.setupClearListener();
  }

  private setupToggleListeners(): void {
    const { toggleBtn, closeBtn, overlay } = this.elements;

    if (toggleBtn) {
      const toggleHandler = () => {
        const { sidebar } = this.elements;
        if (!sidebar) return;
        const isOpen = !sidebar.classList.contains('-translate-x-full');
        isOpen ? this.closeSidebar() : this.openSidebar();
      };
      toggleBtn.addEventListener('click', toggleHandler);
      this.cleanup.push(() => toggleBtn.removeEventListener('click', toggleHandler));
    }

    if (closeBtn) {
      const closeHandler = () => this.closeSidebar();
      closeBtn.addEventListener('click', closeHandler);
      this.cleanup.push(() => closeBtn.removeEventListener('click', closeHandler));
    }

    if (overlay) {
      const overlayHandler = () => this.closeSidebar();
      overlay.addEventListener('click', overlayHandler);
      this.cleanup.push(() => overlay.removeEventListener('click', overlayHandler));
    }
  }

  private setupSearchListener(): void {
    const { searchInput } = this.elements;
    if (!searchInput) return;

    const inputHandler = () => {
      if (this.searchDebounceTimer !== null) {
        clearTimeout(this.searchDebounceTimer);
      }

      this.searchDebounceTimer = window.setTimeout(() => {
        const rawValue = searchInput.value;
        // Simple sanitization: remove HTML tags and trim
        const sanitizedValue = rawValue.replace(/<[^>]*>/g, '').trim();
        this.dispatchChange({ search: sanitizedValue });
      }, FILTER_CONFIG.DEBOUNCE_MS);
    };

    searchInput.addEventListener('input', inputHandler);
    this.cleanup.push(() => searchInput.removeEventListener('input', inputHandler));
  }

  private setupCategoryListeners(): void {
    const { categoryButtons } = this.elements;
    
    categoryButtons.forEach((btn) => {
      if (!btn) return;

      const clickHandler = () => {
        const cat = validateCategory(btn.dataset.category);
        this.selectedCategory = cat;
        this.updateCategoryUI();
        // Category changes apply immediately
        this.dispatchChange({ category: this.selectedCategory });
      };

      btn.addEventListener('click', clickHandler);
      this.cleanup.push(() => btn.removeEventListener('click', clickHandler));
    });
  }

  private setupCheckboxListeners(): void {
    const { level, tools, contract, location } = this.elements.checkboxGroups;

    const registerCheckboxListener = (checkbox: HTMLInputElement | null | undefined) => {
      if (!checkbox) return;
      const changeHandler = () => this.markFiltersPending();
      checkbox.addEventListener('change', changeHandler);
      this.cleanup.push(() => checkbox.removeEventListener('change', changeHandler));
    };

    // Mark filters as pending when checkboxes change
    level.forEach(registerCheckboxListener);
    tools.forEach(registerCheckboxListener);
    contract.forEach(registerCheckboxListener);
    location.forEach(registerCheckboxListener);
  }

  private setupApplyListener(): void {
    const { applyBtn } = this.elements;
    if (!applyBtn) return;

    const applyHandler = async () => {
      if (this.autoApplyTimer !== null) {
        clearTimeout(this.autoApplyTimer);
        this.autoApplyTimer = null;
      }

      // Show loading state
      const originalText = applyBtn.textContent || '';
      applyBtn.disabled = true;
      applyBtn.textContent = 'Aplicando...';
      applyBtn.classList.add('opacity-70', 'cursor-wait');

      // Small delay to show feedback
      await new Promise((resolve) => setTimeout(resolve, 200));

      this.applyFilters();
      this.pendingFilters = false;
      this.updateApplyButtonState();

      // Restore button state
      applyBtn.disabled = false;
      applyBtn.textContent = originalText;
      applyBtn.classList.remove('opacity-70', 'cursor-wait');
    };

    applyBtn.addEventListener('click', applyHandler);
    this.cleanup.push(() => applyBtn.removeEventListener('click', applyHandler));
  }

  private setupClearListener(): void {
    const { clearBtn } = this.elements;
    if (!clearBtn) return;

    const clearHandler = async () => {
      // Show loading state
      const originalText = clearBtn.textContent || '';
      clearBtn.disabled = true;
      clearBtn.textContent = 'Limpando...';
      clearBtn.classList.add('opacity-70', 'cursor-wait');

      // Small delay to show feedback
      await new Promise((resolve) => setTimeout(resolve, 150));

      this.clearAllFilters();

      // Restore button state
      clearBtn.disabled = false;
      clearBtn.textContent = originalText;
      clearBtn.classList.remove('opacity-70', 'cursor-wait');
    };

    clearBtn.addEventListener('click', clearHandler);
    this.cleanup.push(() => clearBtn.removeEventListener('click', clearHandler));
  }

  private markFiltersPending(): void {
    this.pendingFilters = true;
    this.updateApplyButtonState();
    this.scheduleAutoApply();
  }

  private scheduleAutoApply(): void {
    if (this.autoApplyTimer !== null) {
      clearTimeout(this.autoApplyTimer);
    }

    this.autoApplyTimer = window.setTimeout(() => {
      this.autoApplyTimer = null;
      this.applyFilters();
      this.pendingFilters = false;
      this.updateApplyButtonState();
    }, FILTER_CONFIG.AUTO_APPLY_DELAY_MS);
  }

  private updateApplyButtonState(): void {
    const { applyBtn } = this.elements;
    if (!applyBtn) return;

    if (this.pendingFilters) {
      applyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      applyBtn.disabled = false;
    } else {
      applyBtn.classList.add('opacity-50', 'cursor-not-allowed');
      applyBtn.disabled = true;
    }
  }

  private listenToGlobalFilters(): void {
    const handler = ((e: CustomEvent<PartialFilterState>) => {
      this.syncWithGlobalState(e.detail);
    }) as EventListener;

    window.addEventListener('jobfilters:change', handler);
    this.cleanup.push(() => window.removeEventListener('jobfilters:change', handler));
  }

  private updateCategoryUI(): void {
    const { categoryButtons } = this.elements;
    
    categoryButtons.forEach((btn) => {
      if (!btn) return;
      
      const cat = btn.dataset.category || '';
      const isActive = cat === this.selectedCategory;

      if (isActive) {
        // Add active state classes
        btn.classList.add('category-btn-active', 'bg-primary', 'text-white', 'border-primary');
        // Remove inactive state classes
        btn.classList.remove('bg-white', 'bg-background-paper', 'text-neutral-700', 'border-neutral-200');
        // Add hover for active state (darker green)
        btn.classList.add('hover:bg-primary-hover');
        // Remove hover for inactive state
        btn.classList.remove('hover:border-neutral-300', 'hover:bg-neutral-50');
      } else {
        // Remove active state classes
        btn.classList.remove('category-btn-active', 'bg-primary', 'text-white', 'border-primary');
        // Add inactive state classes
        btn.classList.add('bg-white', 'text-neutral-700', 'border-neutral-200');
        // Remove hover for active state
        btn.classList.remove('hover:bg-primary-hover');
        // Add hover for inactive state (subtle gray)
        btn.classList.add('hover:border-neutral-300', 'hover:bg-neutral-50');
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

    // Cancel any pending debounce timers
    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    if (this.autoApplyTimer !== null) {
      clearTimeout(this.autoApplyTimer);
      this.autoApplyTimer = null;
    }

    // Clear search
    if (searchInput) searchInput.value = '';

    // Clear checkboxes and trigger change events to update dropdown counts
    level.forEach((cb: HTMLInputElement) => {
      if (cb) {
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    tools.forEach((cb: HTMLInputElement) => {
      if (cb) {
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    contract.forEach((cb: HTMLInputElement) => {
      if (cb) {
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    location.forEach((cb: HTMLInputElement) => {
      if (cb) {
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Reset category
    this.selectedCategory = 'all';
    this.updateCategoryUI();

    // Reset pending state and update button
    this.pendingFilters = false;
    this.updateApplyButtonState();

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

  private registerGlobalCleanup(): void {
    const destroyHandler = () => this.destroy();
    window.addEventListener('beforeunload', destroyHandler);
    this.cleanup.push(() => window.removeEventListener('beforeunload', destroyHandler));

    const astroSwapHandler = () => this.destroy();
    window.addEventListener('astro:before-swap', astroSwapHandler as EventListener);
    this.cleanup.push(() => window.removeEventListener('astro:before-swap', astroSwapHandler as EventListener));
  }

  // Public method for cleanup if needed
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
    }

    if (this.autoApplyTimer !== null) {
      clearTimeout(this.autoApplyTimer);
    }

    this.cleanup.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error('[FiltersSidebar] Error during cleanup:', error);
      }
    });
    this.cleanup = [];
  }
}
