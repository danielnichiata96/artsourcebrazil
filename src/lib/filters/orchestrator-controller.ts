import { parseURLParams, validateFilterUpdate, type FilterState } from '../validation/filter-schema';

/**
 * FilterOrchestratorController
 * 
 * Global filter orchestrator - single source of truth for all filters
 * Coordinates filter state across all filter UI components
 */
export class FilterOrchestratorController {
  private state: FilterState;
  private jobsContainer: Element | null;

  constructor() {
    // Parse and validate URL params safely
    const params = new URLSearchParams(location.search);
    this.state = parseURLParams(params);
    
    this.jobsContainer = document.querySelector('[data-jobs]');
    if (!this.jobsContainer) {
      console.warn('[FilterOrchestrator] Jobs container not found');
    }

    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.applyFilters();
  }

  private setupEventListeners(): void {
    // Listen for filter changes from components
    window.addEventListener('jobfilters:change', ((ev: CustomEvent<Partial<FilterState>>) => {
      this.handleFilterChange(ev);
    }) as EventListener);

    // Initial apply after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyFilters());
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
      const items = this.getJobItems();
      if (items.length === 0) {
        console.warn('[FilterOrchestrator] No items to filter');
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
      this.notifyListeners();
    } catch (error) {
      console.error('[FilterOrchestrator] Error applying filters:', error);
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
    window.dispatchEvent(new CustomEvent('jobfilters:applied', { detail: { ...this.state } }));
  }

  // Public method to get current state (useful for testing)
  public getState(): FilterState {
    return { ...this.state };
  }
}
