import { Directive, Input } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';
import { Placement } from '../tooltip/placement.type';
import { ErrorTooltipOptions } from '../options/error-tooltip-options.interface';

type SignalFormFieldLike = {
  errors(): ValidationError.WithField[];
};

@Directive({
  selector: '[ngErrorTooltipSig]',
  exportAs: 'ngErrorTooltipSig',
  standalone: true,
})
export class MockErrorTooltipSigDirective {
  // Optional: keep what the test passed in (useful for assertions/debugging)
  private collectedOptions: Partial<ErrorTooltipOptions> = {};

  // Matches your real directive API (signal-inputs replaced with @Input)
  @Input()
  options: ErrorTooltipOptions = {};

  @Input({ required: true })
  formField!: () => SignalFormFieldLike;

  @Input()
  set id(val: string | number | null) {
    if (val != null) this.collectedOptions.id = val;
  }

  @Input()
  set showFirstErrorOnly(val: boolean | null) {
    if (val != null) this.collectedOptions.showFirstErrorOnly = val;
  }

  @Input()
  set placement(val: Placement | null) {
    if (val != null) this.collectedOptions.placement = val;
  }

  @Input()
  set zIndex(val: number | null) {
    if (val != null) this.collectedOptions.zIndex = val;
  }

  @Input()
  set tooltipClass(val: string | null) {
    if (val != null) this.collectedOptions.tooltipClass = val;
  }

  @Input()
  set shadow(val: boolean | null) {
    if (val != null) this.collectedOptions.shadow = val;
  }

  @Input()
  set offset(val: number | null) {
    if (val != null) this.collectedOptions.offset = val;
  }

  @Input()
  set width(val: string | null) {
    if (val != null) this.collectedOptions.width = val;
  }

  @Input()
  set maxWidth(val: string | null) {
    if (val != null) this.collectedOptions.maxWidth = val;
  }

  @Input()
  set pointerEvents(val: 'auto' | 'none' | null) {
    if (val != null) this.collectedOptions.pointerEvents = val;
  }

  // Public API in the real directive – keep it so component code can call it in tests
  showErrorTooltip(): void {
    // noop
  }

  hideErrorTooltip(): void {
    // noop
  }
}
