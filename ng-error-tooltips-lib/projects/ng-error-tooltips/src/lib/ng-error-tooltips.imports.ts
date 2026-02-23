import { FormField } from '@angular/forms/signals';
import { ErrorTooltipSigDirective } from './error-tooltip-sig.directive';
import { ErrorTooltipSigFormDirective } from './error-tooltip-sig-form.directive';

export const NG_ERROR_TOOLTIPS_SIGNAL_IMPORTS = [
  FormField,
  ErrorTooltipSigDirective,
  ErrorTooltipSigFormDirective,
] as const;
