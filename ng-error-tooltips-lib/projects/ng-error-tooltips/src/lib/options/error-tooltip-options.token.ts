import { InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { ErrorTooltipOptions } from './error-tooltip-options.interface';

export const ERROR_TOOLTIP_OPTIONS = new InjectionToken<ErrorTooltipOptions>(
	'ERROR_TOOLTIP_OPTIONS',
	{
		providedIn: 'root',
		factory: () => ({}),
	}
);

export function provideErrorTooltipOptions(options: ErrorTooltipOptions) {
	return makeEnvironmentProviders([
		{
			provide: ERROR_TOOLTIP_OPTIONS,
			useValue: options,
		},
	]);
}
