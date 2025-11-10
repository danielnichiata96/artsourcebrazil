/**
 * HeroIntegrationController
 * 
 * Manages the integration between hero section UI elements and the filter system.
 * 
 * Features:
 * - Syncs hero search bar with sidebar search
 * - Handles category pill clicks and scrolling
 * - Coordinates with filter orchestrator
 * 
 * @example
 * ```ts
 * const controller = new HeroIntegrationController();
 * // Cleanup on page navigation
 * controller.destroy();
 * ```
 */
export class HeroIntegrationController {
  private cleanup: Array<() => void> = [];

  constructor() {
    this.setupHeroSearch();
    this.setupCategoryPills();
    this.setupLifecycleHandlers();
  }

  /**
   * Setup hero search input to sync with sidebar search
   */
  private setupHeroSearch(): void {
    const heroSearch = document.getElementById('hero-search') as HTMLInputElement;
    const sidebarSearch = document.getElementById('job-search-sidebar') as HTMLInputElement;

    if (!heroSearch || !sidebarSearch) {
      console.warn('[HeroIntegration] Hero or sidebar search input not found');
      return;
    }

    const inputHandler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      sidebarSearch.value = target.value;
      
      // Dispatch input event to trigger sidebar's debounced search
      const inputEvent = new Event('input', { bubbles: true });
      sidebarSearch.dispatchEvent(inputEvent);
    };

    heroSearch.addEventListener('input', inputHandler);
    this.cleanup.push(() => heroSearch.removeEventListener('input', inputHandler));
  }

  /**
   * Setup category pill buttons to trigger sidebar filters and scroll to results
   */
  private setupCategoryPills(): void {
    const categoryPills = document.querySelectorAll('[data-category-pill]');
    const categoryButtons = document.querySelectorAll('.category-btn-sidebar');

    if (categoryPills.length === 0) {
      console.warn('[HeroIntegration] No category pills found');
      return;
    }

    if (categoryButtons.length === 0) {
      console.warn('[HeroIntegration] No sidebar category buttons found');
      return;
    }

    categoryPills.forEach((pill) => {
      const clickHandler = () => {
        const category = pill.getAttribute('data-category-pill');
        if (!category) return;

        // Find and click the corresponding sidebar category button
        const targetButton = Array.from(categoryButtons).find((btn) =>
          btn.getAttribute('data-category') === category,
        ) as HTMLButtonElement;

        if (targetButton) {
          targetButton.click();
          
          // Smooth scroll to results section
          const resultsSection = document.getElementById('vagas');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          console.warn(`[HeroIntegration] No sidebar button found for category: ${category}`);
        }
      };

      pill.addEventListener('click', clickHandler);
      this.cleanup.push(() => pill.removeEventListener('click', clickHandler));
    });
  }

  /**
   * Setup lifecycle handlers for cleanup on navigation
   */
  private setupLifecycleHandlers(): void {
    const destroyHandler = () => this.destroy();
    window.addEventListener('beforeunload', destroyHandler);
    this.cleanup.push(() => window.removeEventListener('beforeunload', destroyHandler));

    const astroSwapHandler = () => this.destroy();
    window.addEventListener('astro:before-swap', astroSwapHandler as EventListener);
    this.cleanup.push(() => window.removeEventListener('astro:before-swap', astroSwapHandler as EventListener));
  }

  /**
   * Cleanup all event listeners and reset state
   */
  public destroy(): void {
    this.cleanup.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error('[HeroIntegration] Error during cleanup:', error);
      }
    });
    this.cleanup = [];
  }
}

