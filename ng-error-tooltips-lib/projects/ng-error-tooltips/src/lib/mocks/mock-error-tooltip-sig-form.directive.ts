import { Directive } from '@angular/core';

/**
 * Mock for ErrorTooltipSigFormDirective (Signal Forms).
 * Keeps tests lightweight: no contentChildren/querying, just spyable methods.
 */
@Directive({
  selector: '[ngErrorTooltipSigForm]',
  standalone: true,
  exportAs: 'ngErrorTooltipSigForm',
})
export class MockErrorTooltipSigFormDirective {
  // Spy-friendly, no-op implementations
  showErrorTooltips(): void {
    // Intentionally empty
  }

  hideErrorTooltips(): void {
    // Intentionally empty
  }
}
