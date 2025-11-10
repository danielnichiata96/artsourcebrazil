import { parseURLParams, validateFilterUpdate, type FilterState } from '../validation/filter-schema';

/**
 * FilterOrchestratorController
 * 
 * Global filter orchestrator - single source of truth for all filter state.
 * Coordinates filter changes across all UI components and applies them to job listings.
 * 
 * Responsibilities:
 * - Parse and validate URL parameters
 * - Listen for filter change events from components
 * - Apply filters to job listings (show/hide based on criteria)
 * - Sync filter state with URL
 * - Notify components of filter state changes
 * 
 * Filter Logic:
 * - Category: Exact match on data-category attribute
 * - Search: Text includes search term (job title or company name)
 * - Level/Tools: All selected tags must be present in job's tags
 * 
 * @example
 * ```ts
 * // Initialize in page script
 * const orchestrator = new FilterOrchestratorController();
 * 
 * // Components dispatch changes
 * window.dispatchEvent(new CustomEvent('jobfilters:change', {
 *   detail: { search: 'developer', category: 'Game Dev' }
 * }));
 * 
 * // Orchestrator applies and syncs
 * // - Filters jobs on page
 * // - Updates URL: ?q=developer&category=Game+Dev
 * // - Notifies components via 'jobfilters:applied' event
 * ```
 */
export class FilterOrchestratorController {
  private state: FilterState;
  private jobsContainer: Element | null;
  private cleanup: Array<() => void> = [];
  private loadingIndicator: HTMLElement | null;
  private emptyState: HTMLElement | null;
  private errorBanner: HTMLElement | null;
  private isDestroyed = false;

  constructor() {
    // Parse and validate URL params safely
    const params = new URLSearchParams(location.search);
    this.state = parseURLParams(params);
    
    this.jobsContainer = document.querySelector('[data-jobs]');
    if (!this.jobsContainer) {
      console.warn('[FilterOrchestrator] Jobs container not found');
    }

    this.loadingIndicator = document.querySelector('[data-filter-loading]');
    this.emptyState = document.querySelector('[data-filter-empty]');
    this.errorBanner = document.querySelector('[data-filter-error]');

    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.applyFilters();
    this.registerGlobalCleanup();
  }

  private setupEventListeners(): void {
    // Listen for filter changes from components
    const filterChangeHandler = ((ev: CustomEvent<Partial<FilterState>>) => {
      this.handleFilterChange(ev);
    }) as EventListener;
    window.addEventListener('jobfilters:change', filterChangeHandler);
    this.cleanup.push(() => window.removeEventListener('jobfilters:change', filterChangeHandler));

    // Initial apply after DOM is ready
    if (document.readyState === 'loading') {
      const domReadyHandler = () => this.applyFilters();
      document.addEventListener('DOMContentLoaded', domReadyHandler);
      this.cleanup.push(() => document.removeEventListener('DOMContentLoaded', domReadyHandler));
    }
  }

  private handleFilterChange(ev: CustomEvent<Partial<FilterState>>): void {
    try {
      const detail = ev.detail || {};
      
      // Validate the incoming data
      const validatedData = validateFilterUpdate(detail);
      if (!validatedData) {
        console.warn('[FilterOrchestrator] Invalid filter data received');
        return;
      }
      
      Object.assign(this.state, validatedData);
      this.applyFilters();
    } catch (error) {
      console.error('[FilterOrchestrator] Error handling filter change:', error);
    }
  }

  private getJobItems(): HTMLElement[] {
    try {
      if (!this.jobsContainer) {
        console.warn('[FilterOrchestrator] Jobs container not found');
        return [];
      }
      return Array.from(this.jobsContainer.children) as HTMLElement[];
    } catch (error) {
      console.error('[FilterOrchestrator] Error getting items:', error);
      return [];
    }
  }

  private includesAll(tagString: string, arr: string[]): boolean {
    if (!arr || arr.length === 0) return true;
    const normalizedTags = (tagString || '').toLowerCase();
    const set = new Set(normalizedTags.split(/\s+/).filter(Boolean));
    return arr.every((v) => set.has(String(v).toLowerCase()));
  }

  private applyFilters(): void {
    try {
      this.setError(false);
      this.setLoading(true);

      const items = this.getJobItems();
      if (items.length === 0) {
        console.warn('[FilterOrchestrator] No items to filter');
        this.updateEmptyState(items);
        this.setLoading(false);
        return;
      }

      const qLower = (this.state.search || '').toLowerCase();

      items.forEach((el: HTMLElement) => {
        if (!el) return;

        const tagsStr = (el.getAttribute('data-tags') || '').toLowerCase();
        const text = (el.getAttribute('data-text') || '').toLowerCase();
        const jobCategory = el.getAttribute('data-category') || '';

        let show = true;
        
        // Category filter
        if (this.state.category && this.state.category !== 'all') {
          show = jobCategory === this.state.category;
        }
        
        // Search filter
        if (show && qLower) {
          show = text.includes(qLower) || tagsStr.includes(qLower);
        }

        // Advanced filters: match by tags
        if (show && !this.includesAll(tagsStr, this.state.level)) show = false;
        if (show && !this.includesAll(tagsStr, this.state.tools)) show = false;
        // Contract/Location could be supported later when data is available

        el.classList.toggle('hidden', !show);
      });

      this.syncURL();
      this.updateEmptyState(items);
    } catch (error) {
      console.error('[FilterOrchestrator] Error applying filters:', error);
      this.setError(true);
    } finally {
      this.setLoading(false);
      this.notifyListeners();
    }
  }

  private syncURL(): void {
    const next = new URLSearchParams();
    
    if (this.state.search) next.set('q', this.state.search);
    if (this.state.category && this.state.category !== 'all') next.set('category', this.state.category);
    if (this.state.level?.length) next.set('level', this.state.level.join(','));
    if (this.state.tools?.length) next.set('tools', this.state.tools.join(','));
    if (this.state.contract?.length) next.set('contract', this.state.contract.join(','));
    if (this.state.location?.length) next.set('location', this.state.location.join(','));
    
    const url = `${location.pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    history.replaceState({}, '', url);
  }

  private notifyListeners(): void {
    if (this.isDestroyed) return;
    window.dispatchEvent(new CustomEvent('jobfilters:applied', { detail: { ...this.state } }));
  }

  // Public method to get current state (useful for testing)
  public getState(): FilterState {
    return { ...this.state };
  }

  private setLoading(isLoading: boolean): void {
    if (!this.loadingIndicator) return;
    this.loadingIndicator.classList.toggle('hidden', !isLoading);
  }

  private setError(hasError: boolean): void {
    if (!this.errorBanner) return;
    this.errorBanner.classList.toggle('hidden', !hasError);
  }

  private updateEmptyState(items: HTMLElement[]): void {
    if (!this.emptyState) return;
    const hasVisibleItems = items.some((item) => !item.classList.contains('hidden'));
    this.emptyState.classList.toggle('hidden', hasVisibleItems);
  }

  private registerGlobalCleanup(): void {
    const destroyHandler = () => this.destroy();
    window.addEventListener('beforeunload', destroyHandler);
    this.cleanup.push(() => window.removeEventListener('beforeunload', destroyHandler));

    const astroSwapHandler = () => this.destroy();
    window.addEventListener('astro:before-swap', astroSwapHandler as EventListener);
    this.cleanup.push(() => window.removeEventListener('astro:before-swap', astroSwapHandler as EventListener));
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.cleanup.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error('[FilterOrchestrator] Error during cleanup:', error);
      }
    });
    this.cleanup = [];

    this.jobsContainer = null;
    this.loadingIndicator = null;
    this.emptyState = null;
    this.errorBanner = null;
  }
}
