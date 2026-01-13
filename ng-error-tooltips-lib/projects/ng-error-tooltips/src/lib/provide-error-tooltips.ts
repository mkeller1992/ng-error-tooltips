import { makeEnvironmentProviders, Signal } from '@angular/core';
import { ERROR_TOOLTIP_LANG } from './error-tooltip-lang.token';
import { SupportedLanguage } from './validators/supported-language.type';


export function provideErrorTooltips(opts: { lang: Signal<SupportedLanguage> }) {
	return makeEnvironmentProviders([
		{ provide: ERROR_TOOLTIP_LANG, useValue: opts.lang }
	]);
}
