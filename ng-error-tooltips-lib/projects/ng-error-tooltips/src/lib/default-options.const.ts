import { ErrorTooltipOptions } from "./error-tooltip-options.interface";

export const defaultOptions: ErrorTooltipOptions = {
	id: 0,
	placement: 'bottom-left',
	showFirstErrorOnly: false,
	zIndex: 1101,
	tooltipClass: '',
	shadow: true,
	offset: 8,
	maxWidth: '350px',
	pointerEvents: 'auto', // 'none' would mean that there is no reaction to clicks
}
