import { Component, computed, ElementRef, HostBinding, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ERROR_TOOLTIP_LANG } from '../error-tooltip-lang.token';
import { defaultOptions } from '../options/default-options.const';
import { ErrorTooltipOptions } from '../options/error-tooltip-options.interface';
import { ErrorPayload } from '../error-payload.type';
import { Placement } from './placement.type';

@Component({
	selector: 'lib-ng-error-tooltip',
	templateUrl: './ng-error-tooltip.component.html',
	styleUrls: ['./ng-error-tooltip.component.scss']
})
export class NgErrorTooltipComponent implements OnInit, OnChanges {
  	private readonly langSig = inject(ERROR_TOOLTIP_LANG);
	private readonly elementRef = inject(ElementRef);

  	/* Inputs will be passed by error-tooltip-directive */

	@Input({ required: true })
	errors: ErrorPayload[] = [];

	@Input({ required: true })
	options!: ErrorTooltipOptions;

	@Input({ required: true })
	formControl!: any;


	readonly translatedErrors = computed(() => {
		const lang = this.langSig();
		return this.errors.map(e => typeof e === 'string' ? e : e[lang]);
	});

  
	// Informs error-tooltip-directive when user clicked on tooltip:
	private userClickOnTooltipSubject = new Subject<void>();
	userClickOnTooltip$ = this.userClickOnTooltipSubject.asObservable();

	
	// --- State as signals ---	

	// Initialize all host styles
	private _top          = signal<number>(-9999);  // start off-screen
	private _left         = signal<number>(-9999);  // start off-screen
	private _zIndex       = signal<number>(defaultOptions.zIndex ?? 0);
	private _width        = signal<string>('');
	private _maxWidth     = signal<string>(defaultOptions.maxWidth ?? '');
	private _pointerEvents= signal<string>(defaultOptions.pointerEvents ?? 'auto');

	// Initialize all host classes
	private _isShown     = signal(false); // visibility state → classes 'tooltip-show' / 'tooltip-hide'
	private _displayNone = signal(true); // display toggle → class 'tooltip-display-none'  
	private _placement   = signal<Placement>(defaultOptions.placement!); // placement → class 'tooltip-{placement}'
	private _placementClass = computed(() => `tooltip-${this._placement()}`); // shadow toggle → class 'tooltip-shadow'  
	private _hasShadow   = signal<boolean>(defaultOptions.shadow ?? true);
	private _shadowClass = computed(() => this._hasShadow() ? 'tooltip-shadow' : '');
	private _customClass = signal<string>(''); // custom classes coming from options.tooltipClass

	private _classList = computed(() => {
		const parts = [
		'tooltip',            // base
		'tooltip-error',      // static error skin
		this._isShown() ? 'tooltip-show' : 'tooltip-hide',
		this._displayNone() ? 'tooltip-display-none' : '',
		this._placementClass(),
		this._shadowClass(),
		this._customClass().trim(),
		];
		return parts.filter(Boolean).join(' ');
	});

	// --- Host-classes reading the signals ---

	@HostBinding('class')
	get hostClasses() { return this._classList(); }

	// --- Host-styles reading the signals ---

	@HostBinding('style.top')
	get hostStyleTop() { return `${this._top()}px`; }

	@HostBinding('style.left')
	get hostStyleLeft() { return `${this._left()}px`; }

	@HostBinding('style.z-index')
	get hostStyleZIndex() { return this._zIndex(); }

	@HostBinding('style.width')
	get hostStyleWidth() { return this._width(); } // empty string removes inline style

	@HostBinding('style.max-width')
	get hostStyleMaxWidth() { return this._maxWidth(); } // empty string removes inline style

	@HostBinding('style.pointer-events')
	get hostStylePointerEvents() { return this._pointerEvents(); }

	ngOnInit() {
		if (this.options) {
			this.applyOptions(this.options);
		}    
	}

	ngOnChanges(_: SimpleChanges) {
		// Re-apply when inputs change (e.g., options updated)
		if (this.options) {
			this.applyOptions(this.options);
		}
	}

	showTooltip(formControlRef: ElementRef<any>) {
		// Set the placement class:
		const placement = this.options?.placement ?? defaultOptions.placement!;
		this._placement.set(placement);

		this.setVisibilityAndPosition(formControlRef);
	}

	handleTooltipClick() {
		this.userClickOnTooltipSubject.next();
	}

	setVisibilityAndPosition(formControlRef: ElementRef<any>): void {
		const wasVisible = this._isShown();
		// Initial position is off-screen, so that measurements can be taken and the tooltip doesn't flicker on the screen
		const isVisible = this.setVisibilityOfTooltip(formControlRef);

		if (wasVisible && isVisible) {
			const formControlPosition = formControlRef.nativeElement.getBoundingClientRect();
			this.setAbsolutePosition(formControlPosition);
		}
		else if (!wasVisible && isVisible) {
			// Apply timeout to ensure tooltip is rendered before calculating its height and width:
			setTimeout(() => {
				const formControlPosition = formControlRef.nativeElement.getBoundingClientRect();
				this.setAbsolutePosition(formControlPosition);
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
		const isFormCtrlSVG = this.formControl instanceof SVGElement;
		const tooltip = this.elementRef.nativeElement;
		const formCtr = this.formControl as HTMLElement;
		const options = this.options;

		const formControlHeight = isFormCtrlSVG ? formCtr.getBoundingClientRect().height : formCtr.offsetHeight;
		const formControlWidth = isFormCtrlSVG ? formCtr.getBoundingClientRect().width : formCtr.offsetWidth;
		const tooltipHeight = tooltip.clientHeight;
		const tooltipWidth = tooltip.clientWidth;
		const scrollY = window.scrollY;

		const placement = options?.placement ?? defaultOptions.placement;
		const tooltipOffset = options?.offset ?? defaultOptions.offset!;

		let topStyle;

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

		let leftStyle;

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
		
		if (topStyle === undefined || leftStyle === undefined) { return; }

		// round to 2 decimals to avoid needless DOM churn
		const roundedTop  = Math.round(topStyle * 100) / 100;
		const roundedLeft = Math.round(leftStyle * 100) / 100;

		if (this._top() !== roundedTop) { this._top.set(roundedTop); }
		if (this._left() !== roundedLeft) { this._left.set(roundedLeft); }
	}

	private isElementCovered(formControlRef: ElementRef<any>): boolean {
		const rect = formControlRef.nativeElement.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		const elementAtPoint = document.elementFromPoint(x, y);

		// If the element at the point is the same as the form control, it's not covered
		if (elementAtPoint && elementAtPoint.isSameNode(formControlRef.nativeElement)) {
		return false;
		}

		// If the covering element is another instance of app-error-tooltip, don't consider it covered
		if (elementAtPoint && (elementAtPoint.tagName === 'LIB-NG-ERROR-TOOLTIP' ||
			elementAtPoint.className === 'tooltip-label' ||
			elementAtPoint.className === 'tooltip-arrow' ||
			elementAtPoint.className === 'tooltip-error-list')) {
			return false;
		}

		// Traverse up the DOM tree to check if the element is inside the form control
		let currentElement = elementAtPoint;
		while (currentElement) {
			if (currentElement.isSameNode(formControlRef.nativeElement)) {
				return false;  // The form control is not covered if the point is inside it
			}
			currentElement = currentElement.parentElement;
		}

		// If we traverse up the DOM and don't find the form control, it's considered covered
		return true;
	}

	private applyOptions(options: ErrorTooltipOptions) {
		// Guarded number
		const zIndex = typeof options.zIndex === 'number' ? options.zIndex : (defaultOptions.zIndex ?? 0);
		this._zIndex.set(zIndex);

		// Custom classes (empty string removes the inline class list entry)
		this._customClass.set(options.tooltipClass?.trim() ?? '');

		// pointer-events: fall back to default when not provided
		this._pointerEvents.set(options.pointerEvents ?? defaultOptions.pointerEvents!);

		// shadow (boolean): keep explicit false; fall back only if undefined/null
		this._hasShadow.set(options.shadow ?? defaultOptions.shadow!);

		// width: empty string removes the inline style
		this._width.set(options.width ?? '');

		// max-width: fall back to default when not provided
		this._maxWidth.set(options.maxWidth ?? defaultOptions.maxWidth!);
	}
}
