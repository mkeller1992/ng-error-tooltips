import { Directive, contentChildren } from '@angular/core';
import { ErrorTooltipSigDirective } from './error-tooltip-sig.directive';

@Directive({
  selector: '[ngErrorTooltipSigForm]',
  standalone: true,
  exportAs: 'ngErrorTooltipSigForm'
})
export class ErrorTooltipSigFormDirective {
	private readonly tooltips = contentChildren(ErrorTooltipSigDirective, { descendants: true });

	showAll(): void {
		this.tooltips().forEach(t => t.showErrorTooltip());
	}

	hideAll(): void {
		this.tooltips().forEach(t => t.hideErrorTooltip());
	}
}