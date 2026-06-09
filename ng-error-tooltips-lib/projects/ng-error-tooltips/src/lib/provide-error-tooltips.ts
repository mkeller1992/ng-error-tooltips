import { isSignal, makeEnvironmentProviders, Signal, signal } from '@angular/core';

import { ERROR_TOOLTIP_LANG } from './error-tooltip-lang.token';
import { ERROR_TOOLTIP_SIG_VALIDATE, SignalValidateFn } from './error-tooltip-sig-validate.token';
import { SupportedLanguage } from './validators/supported-language.type';

export interface ErrorTooltipProviderOptions {
	lang?: SupportedLanguage | Signal<SupportedLanguage>;
	validate?: SignalValidateFn;
}

export function provideErrorTooltips(options: ErrorTooltipProviderOptions = {}) {
	const langSig: Signal<SupportedLanguage> = isSignal(options.lang)
		? options.lang
		: signal(options.lang ?? 'de');

	return makeEnvironmentProviders([
		{
			provide: ERROR_TOOLTIP_LANG,
			useValue: langSig,
		},
		...(options.validate
			? [{
				provide: ERROR_TOOLTIP_SIG_VALIDATE,
				useValue: options.validate,
			}]
			: []),
	]);
}