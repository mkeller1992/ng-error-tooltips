import { Directive, contentChildren } from '@angular/core';
import { ErrorTooltipSigDirective } from './error-tooltip-sig.directive';

@Directive({
  selector: '[ngErrorTooltipSigForm]',
  standalone: true,
  exportAs: 'ngErrorTooltipSigForm'
})
export class ErrorTooltipSigFormDirective {
	private readonly tooltips = contentChildren(ErrorTooltipSigDirective, { descendants: true });

	showErrorTooltips(): void {
		this.tooltips().forEach(t => t.showErrorTooltip());
	}

	hideErrorTooltips(): void {
		this.tooltips().forEach(t => t.hideErrorTooltip());
	}
}