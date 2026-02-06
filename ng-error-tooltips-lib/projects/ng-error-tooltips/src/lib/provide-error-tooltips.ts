import { makeEnvironmentProviders, Signal } from '@angular/core';
import { ERROR_TOOLTIP_LANG } from './error-tooltip-lang.token';
import { SupportedLanguage } from './validators/supported-language.type';
import { ERROR_TOOLTIP_SIGNAL_FORM_VALIDATE, SignalValidateFn } from './error-tooltip-signal-form-validate.token';

export function provideErrorTooltips(opts: { lang: Signal<SupportedLanguage>; validate?: SignalValidateFn;}) {
  return makeEnvironmentProviders([
    { provide: ERROR_TOOLTIP_LANG, useValue: opts.lang },

    // OPTIONAL: Only if signals validate was provided
    ...(opts.validate ? [{ provide: ERROR_TOOLTIP_SIGNAL_FORM_VALIDATE, useValue: opts.validate }] : []),
  ]);
}
