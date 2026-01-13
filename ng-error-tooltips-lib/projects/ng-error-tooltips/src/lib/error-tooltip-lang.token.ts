import { InjectionToken, Signal, signal } from '@angular/core';
import { SupportedLanguage } from './validators/supported-language.type';

export const ERROR_TOOLTIP_LANG = new InjectionToken<Signal<SupportedLanguage>>(
	'ERROR_TOOLTIP_LANG',
	{
		// Default for apps that don't provide anything (backwards-compatible)
		factory: () => signal<SupportedLanguage>('de')
	}
);