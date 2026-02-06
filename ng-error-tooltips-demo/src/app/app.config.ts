import { ApplicationConfig, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import type { SupportedLanguage } from '@ng-error-tooltips';
import { provideErrorTooltips } from '@ng-error-tooltips';

import { routes } from './app.routes';
import { validate } from '@angular/forms/signals';

// Demo-language signal (in real apps: inject(LanguageService).currentLanguageCode)
export const demoLang = signal<SupportedLanguage>('de');

export const appConfig: ApplicationConfig = {
    providers: [
    	provideRouter(routes),
		provideZonelessChangeDetection(),
		provideErrorTooltips({ lang: demoLang, validate }), // providing the validate function for signal forms
	]
};
