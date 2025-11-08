/**
 * DOM Helper Utilities
 * 
 * Reusable functions for common DOM operations with type safety and error handling
 */

/**
 * Safely query a single element with type checking
 * @param selector - CSS selector
 * @param context - Parent element (defaults to document)
 * @returns Element or null if not found
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T | null {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    console.error(`[DOM] Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely query multiple elements with type checking
 * @param selector - CSS selector
 * @param context - Parent element (defaults to document)
 * @returns Array of elements
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T[] {
  try {
    return Array.from(context.querySelectorAll<T>(selector));
  } catch (error) {
    console.error(`[DOM] Error querying selector "${selector}":`, error);
    return [];
  }
}

/**
 * Safely get element by ID with type checking
 * @param id - Element ID
 * @returns Element or null if not found
 */
export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  try {
    return document.getElementById(id) as T | null;
  } catch (error) {
    console.error(`[DOM] Error getting element by ID "${id}":`, error);
    return null;
  }
}

/**
 * Safely add CSS classes to an element
 * @param element - Target element
 * @param classes - Class names to add
 */
export function addClass(element: Element | null, ...classes: string[]): void {
  if (!element) return;
  try {
    element.classList.add(...classes);
  } catch (error) {
    console.error('[DOM] Error adding classes:', error);
  }
}

/**
 * Safely remove CSS classes from an element
 * @param element - Target element
 * @param classes - Class names to remove
 */
export function removeClass(element: Element | null, ...classes: string[]): void {
  if (!element) return;
  try {
    element.classList.remove(...classes);
  } catch (error) {
    console.error('[DOM] Error removing classes:', error);
  }
}

/**
 * Safely toggle CSS classes on an element
 * @param element - Target element
 * @param className - Class name to toggle
 * @param force - Optional force boolean (true = add, false = remove)
 */
export function toggleClass(
  element: Element | null,
  className: string,
  force?: boolean
): void {
  if (!element) return;
  try {
    element.classList.toggle(className, force);
  } catch (error) {
    console.error('[DOM] Error toggling class:', error);
  }
}

/**
 * Check if element has a CSS class
 * @param element - Target element
 * @param className - Class name to check
 * @returns True if element has the class
 */
export function hasClass(element: Element | null, className: string): boolean {
  if (!element) return false;
  try {
    return element.classList.contains(className);
  } catch (error) {
    console.error('[DOM] Error checking class:', error);
    return false;
  }
}

/**
 * Safely set element attribute
 * @param element - Target element
 * @param name - Attribute name
 * @param value - Attribute value
 */
export function setAttribute(
  element: Element | null,
  name: string,
  value: string
): void {
  if (!element) return;
  try {
    element.setAttribute(name, value);
  } catch (error) {
    console.error('[DOM] Error setting attribute:', error);
  }
}

/**
 * Safely get element attribute
 * @param element - Target element
 * @param name - Attribute name
 * @returns Attribute value or null
 */
export function getAttribute(element: Element | null, name: string): string | null {
  if (!element) return null;
  try {
    return element.getAttribute(name);
  } catch (error) {
    console.error('[DOM] Error getting attribute:', error);
    return null;
  }
}

/**
 * Safely dispatch a custom event
 * @param eventName - Event name
 * @param detail - Event detail data
 * @param target - Event target (defaults to window)
 */
export function dispatchCustomEvent<T = unknown>(
  eventName: string,
  detail?: T,
  target: EventTarget = window
): void {
  try {
    target.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch (error) {
    console.error(`[DOM] Error dispatching event "${eventName}":`, error);
  }
}

/**
 * Wait for DOM to be ready
 * @param callback - Function to execute when DOM is ready
 */
export function onDOMReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Debounce function execution
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
