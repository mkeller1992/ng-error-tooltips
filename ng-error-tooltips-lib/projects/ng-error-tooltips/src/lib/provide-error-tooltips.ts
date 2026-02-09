import { makeEnvironmentProviders, Signal, signal } from '@angular/core';
import { ERROR_TOOLTIP_LANG } from './error-tooltip-lang.token';
import { SupportedLanguage } from './validators/supported-language.type';
import { ERROR_TOOLTIP_SIG_VALIDATE, SignalValidateFn } from './error-tooltip-sig-validate.token';

export function provideErrorTooltips(opts: { lang?: Signal<SupportedLanguage>; validate?: SignalValidateFn }) {
  const langSig = opts.lang ?? signal<SupportedLanguage>('de');

  return makeEnvironmentProviders([
    { provide: ERROR_TOOLTIP_LANG, useValue: langSig },
    ...(opts.validate ? [{ provide: ERROR_TOOLTIP_SIG_VALIDATE, useValue: opts.validate }] : []),
  ]);
}