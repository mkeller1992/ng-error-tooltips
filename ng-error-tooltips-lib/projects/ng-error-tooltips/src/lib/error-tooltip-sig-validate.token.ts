import { InjectionToken } from '@angular/core';
import type { validate as validateFn } from '@angular/forms/signals';

export type SignalValidateFn = typeof validateFn;

export const ERROR_TOOLTIP_SIG_VALIDATE =
  	new InjectionToken<SignalValidateFn>('ERROR_TOOLTIP_SIG_VALIDATE');