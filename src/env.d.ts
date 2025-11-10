/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    locale: import('./lib/i18n').Locale;
    messages: import('./lib/i18n').Messages;
  }
}
