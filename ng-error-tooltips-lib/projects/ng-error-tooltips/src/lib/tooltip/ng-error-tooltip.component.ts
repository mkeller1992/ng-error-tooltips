import { Component, computed, effect, ElementRef, inject, input, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { ERROR_TOOLTIP_LANG } from '../error-tooltip-lang.token';
import { defaultOptions } from '../options/default-options.const';
import { ErrorTooltipOptions } from '../options/error-tooltip-options.interface';
import { ErrorPayload } from '../error-payload.type';
import { Placement } from './placement.type';

@Component({
	selector: 'lib-ng-error-tooltip',
	templateUrl: './ng-error-tooltip.component.html',
	styleUrls: ['./ng-error-tooltip.component.scss'],
	host: {
		'[class]': '_classList()',

		'[style.top]': '_hostTop()',
		'[style.left]': '_hostLeft()',
		'[style.zIndex]': '_zIndex()',

		'[style.width]': '_width()',
		'[style.maxWidth]': '_maxWidth()',
		'[style.pointerEvents]': '_pointerEvents()',
	},
})
export class NgErrorTooltipComponent {
	private readonly langSig = inject(ERROR_TOOLTIP_LANG);
	private readonly elementRef = inject(ElementRef);

	/* Inputs passed by error-tooltip-directive (signals) */

	readonly errors = input.required<ErrorPayload[]>();
	readonly options = input.required<ErrorTooltipOptions>();
	readonly formControl = input.required<any>();

	readonly translatedErrors = computed(() => {
		const lang = this.langSig();

		return this.errors()
			.map(e => (typeof e === 'string' ? e : e[lang]))
			// Remove empty, null, or whitespace-only error messages:
			.filter((e): e is string => !!e && e.trim().length > 0);
	});

	// Informs error-tooltip-directive when user clicked on tooltip:
	private readonly userClickOnTooltipSubject = new Subject<void>();
	readonly userClickOnTooltip$ = this.userClickOnTooltipSubject.asObservable();

	// --- State as signals ---

	private readonly _top = signal<number>(-9999);
	private readonly _left = signal<number>(-9999);

	protected readonly _zIndex = signal<number>(defaultOptions.zIndex ?? 0);
	protected readonly _width = signal<string>('');
	protected readonly _maxWidth = signal<string>(defaultOptions.maxWidth ?? '');
	protected readonly _pointerEvents = signal<string>(defaultOptions.pointerEvents ?? 'auto');

	private readonly _isShown = signal(false);
	private readonly _displayNone = signal(true);

	private readonly _placement = signal<Placement>(defaultOptions.placement!);
	private readonly _placementClass = computed(() => `tooltip-${this._placement()}`);

	private readonly _hasShadow = signal<boolean>(defaultOptions.shadow ?? true);
	private readonly _shadowClass = computed(() => (this._hasShadow() ? 'tooltip-shadow' : ''));

	private readonly _customClass = signal<string>('');

	protected readonly _classList = computed(() => {
		const parts = [
			'tooltip',
			'tooltip-error',
			this._isShown() ? 'tooltip-show' : 'tooltip-hide',
			this._displayNone() ? 'tooltip-display-none' : '',
			this._placementClass(),
			this._shadowClass(),
			this._customClass().trim(),
		];
		return parts.filter(Boolean).join(' ');
	});

	protected readonly _hostTop = computed(() => `${this._top()}px`);
	protected readonly _hostLeft = computed(() => `${this._left()}px`);

	constructor() {
		// Re-apply whenever options input changes
		effect(() => {
			const opts = this.options(); // track dependency
			this.applyOptions(opts);
		});
	}

	showTooltip(formControlRef: ElementRef<any>) {
		const placement = this.options()?.placement ?? defaultOptions.placement!;
		this._placement.set(placement);

		this.setVisibilityAndPosition(formControlRef);
	}

	handleTooltipClick() {
		this.userClickOnTooltipSubject.next();
	}

	setVisibilityAndPosition(formControlRef: ElementRef<any>): void {
		const wasVisible = this._isShown();
		const isVisible = this.setVisibilityOfTooltip(formControlRef);

		if (wasVisible && isVisible) {
			const pos = formControlRef.nativeElement.getBoundingClientRect();
			this.setAbsolutePosition(pos);
		} 
		else if (!wasVisible && isVisible) {
			setTimeout(() => {
				const pos = formControlRef.nativeElement.getBoundingClientRect();
				this.setAbsolutePosition(pos);
			}, 0);
		}
	}

	private setVisibilityOfTooltip(formControlRef: ElementRef<any>): boolean {
		const visible = !this.isElementCovered(formControlRef);

		this._displayNone.set(!visible);
		this._isShown.set(visible);

		return visible;
	}

	private setAbsolutePosition(formControlPosition: DOMRect): void {
		const fc = this.formControl();
		const isFormCtrlSVG = fc instanceof SVGElement;

		const tooltip = this.elementRef.nativeElement as HTMLElement;
		const formCtr = fc as HTMLElement;
		const options = this.options();

		const formControlHeight = isFormCtrlSVG ? formCtr.getBoundingClientRect().height : formCtr.offsetHeight;
		const formControlWidth = isFormCtrlSVG ? formCtr.getBoundingClientRect().width : formCtr.offsetWidth;

		const tooltipHeight = tooltip.clientHeight;
		const tooltipWidth = tooltip.clientWidth;
		const scrollY = window.scrollY;

		const placement = options?.placement ?? defaultOptions.placement!;
		const tooltipOffset = options?.offset ?? defaultOptions.offset!;

		let topStyle: number | undefined;

		switch (placement) {
			case 'top':
			case 'top-left':
				topStyle = (formControlPosition.top + scrollY) - (tooltipHeight + tooltipOffset);
				break;
			case 'bottom':
			case 'bottom-left':
				topStyle = (formControlPosition.top + scrollY) + formControlHeight + tooltipOffset;
				break;
			case 'left':
			case 'right':
				topStyle = (formControlPosition.top + scrollY) + formControlHeight / 2 - tooltipHeight / 2;
				break;
		}

		let leftStyle: number | undefined;

		switch (placement) {
			case 'top':
			case 'bottom':
				leftStyle = (formControlPosition.left + formControlWidth / 2) - tooltipWidth / 2;
				break;
			case 'bottom-left':
			case 'top-left':
				leftStyle = formControlPosition.left;
				break;
			case 'left':
				leftStyle = formControlPosition.left - tooltipWidth - tooltipOffset;
				break;
			case 'right':
				leftStyle = formControlPosition.left + formControlWidth + tooltipOffset;
				break;
		}

		if (topStyle === undefined || leftStyle === undefined) return;

		const roundedTop = Math.round(topStyle * 100) / 100;
		const roundedLeft = Math.round(leftStyle * 100) / 100;

		if (this._top() !== roundedTop) this._top.set(roundedTop);
		if (this._left() !== roundedLeft) this._left.set(roundedLeft);
	}

	private isElementCovered(formControlRef: ElementRef<any>): boolean {
		const rect = formControlRef.nativeElement.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		const elementAtPoint = document.elementFromPoint(x, y);

		if (elementAtPoint && elementAtPoint.isSameNode(formControlRef.nativeElement)) return false;

		if (
			elementAtPoint &&
			(elementAtPoint.tagName === 'LIB-NG-ERROR-TOOLTIP' ||
				elementAtPoint.className === 'tooltip-label' ||
				elementAtPoint.className === 'tooltip-arrow' ||
				elementAtPoint.className === 'tooltip-error-list')
		) {
			return false;
		}

		let currentElement = elementAtPoint as HTMLElement | null;
		while (currentElement) {
			if (currentElement.isSameNode(formControlRef.nativeElement)) return false;
			currentElement = currentElement.parentElement;
		}

		return true;
	}

	private applyOptions(options: ErrorTooltipOptions) {
		const zIndex = typeof options.zIndex === 'number' ? options.zIndex : (defaultOptions.zIndex ?? 0);
		this._zIndex.set(zIndex);

		this._customClass.set(options.tooltipClass?.trim() ?? '');
		this._pointerEvents.set(options.pointerEvents ?? defaultOptions.pointerEvents!);
		this._hasShadow.set(options.shadow ?? defaultOptions.shadow!);

		this._width.set(options.width ?? '');
		this._maxWidth.set(options.maxWidth ?? defaultOptions.maxWidth!);
	}
}
