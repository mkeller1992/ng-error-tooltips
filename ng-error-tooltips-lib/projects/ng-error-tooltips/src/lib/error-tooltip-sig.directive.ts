import { ComponentRef, computed, Directive, effect, ElementRef, EnvironmentInjector, inject, input, OnDestroy, signal, ViewContainerRef } from '@angular/core';

import { Subject, filter, fromEvent, interval, race, takeUntil, tap } from 'rxjs';
import { Placement } from './tooltip/placement.type';
import { ErrorPayload } from './error-payload.type';
import { defaultOptions } from './options/default-options.const';
import { ErrorTooltipOptions } from './options/error-tooltip-options.interface';
import { NgErrorTooltipComponent } from './tooltip/ng-error-tooltip.component';
import { ValidationError } from '@angular/forms/signals';
import { TriLangText } from './validators/tri-lang-text.type';

type SignalFormField = {
  	errors(): ValidationError.WithField[];
};

@Directive({
	selector: '[ngErrorTooltipSig]'
})

export class ErrorTooltipSigDirective implements OnDestroy {
	private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly injector = inject(EnvironmentInjector);

	// Pass options as a single object:
	readonly options = input<ErrorTooltipOptions>({});

	readonly formField = input.required<() => SignalFormField>();
	readonly id = input<string | number | null>(null);
	readonly showFirstErrorOnly = input<boolean | null>(null);
	readonly placement = input<Placement | null>(null);
	readonly zIndex = input<number | null>(null);
	readonly tooltipClass = input<string | null>(null);
	readonly shadow = input<boolean | null>(null);
	readonly offset = input<number | null>(null);
	readonly width = input<string | null>(null);
	readonly maxWidth = input<string | null>(null);
	readonly pointerEvents = input<'auto' | 'none' | null>(null);

	// A merge of all options that were passed in various ways:
	private readonly mergedOptions = computed<ErrorTooltipOptions>(() => ({
		...defaultOptions,
		...this.options(),
		...(this.id() != null ? { id: this.id()! } : {}),
		...(this.showFirstErrorOnly() != null ? { showFirstErrorOnly: this.showFirstErrorOnly()! } : {}),
		...(this.placement() != null ? { placement: this.placement()! } : {}),
		...(this.zIndex() != null ? { zIndex: this.zIndex()! } : {}),
		...(this.tooltipClass() != null ? { tooltipClass: this.tooltipClass()! } : {}),
		...(this.shadow() != null ? { shadow: this.shadow()! } : {}),
		...(this.offset() != null ? { offset: this.offset()! } : {}),
		...(this.width() != null ? { width: this.width()! } : {}),
		...(this.maxWidth() != null ? { maxWidth: this.maxWidth()! } : {}),
		...(this.pointerEvents() != null ? { pointerEvents: this.pointerEvents()! } : {}),
	}));

	// --- internal state ---
	private refToTooltip = signal<ComponentRef<NgErrorTooltipComponent> | null>(null);
	private tooltipComponent = computed(() => this.refToTooltip()?.instance ?? null);
	private formControlPosition = signal<DOMRect | null>(null);


	private readonly field = computed<SignalFormField>(() => this.formField()());


	private readonly errorPayloads = computed<ErrorPayload[]>(() => {
		const { showFirstErrorOnly } = this.mergedOptions();
		const errors = this.field().errors() ?? [];

		const payloads = errors.map(err =>
			err.message === 'i18n' && 'i18n' in err
			? err.i18n as TriLangText
			: err.message as string
		);

		return showFirstErrorOnly && payloads.length
			? [payloads[0]]
			: payloads;
	});


	private isTooltipVisible = signal<boolean>(false);

	private readonly destroy$ = new Subject<void>();

	constructor() {
		// Update tooltip inputs whenever options/errors change (if tooltip exists)
		effect(() => {
			
			// Always read these so the effect tracks them as dependencies
			const opts = this.mergedOptions();
			const errs = this.errorPayloads();
			const host = this.hostEl.nativeElement;

			const ref = this.refToTooltip();
			if (!ref) { return; }

			ref.setInput('options', opts);
			ref.setInput('errors', errs);
			ref.setInput('formControl', host);

			// Re-position if visible (placement/offset changes need it)
			const comp = this.tooltipComponent();
			if (this.isTooltipVisible() && comp) {
				comp.showTooltip(this.hostEl);
			}
		});
	}

	/** Public User-Methods **/

	public showErrorTooltip() {
		if (this.errorPayloads().length > 0) {
			this.displayTooltip();
		}
	}

	public hideErrorTooltip() {
		this.destroyTooltip();
	}

	/** Listeners **/

	private attachListeners(tooltipComponent: NgErrorTooltipComponent, formControlRef: ElementRef<any>) {
		// Listens to interactions with the tooltip or the form control:
		this.listenToUserInteraction(tooltipComponent, formControlRef);

		// Listens for changes in the position of the form control element to which the tooltip is attached:
		this.listenForPositionChangesOfFormControl();
	}


	/* Handles interactions to hide the tooltip */
	private listenToUserInteraction(tooltipComponent: NgErrorTooltipComponent, formControlRef: ElementRef<any>): void {
		const clickOnTooltip$ = tooltipComponent.userClickOnTooltip$;
		const focusOnFormControl$ = fromEvent(formControlRef.nativeElement, 'focusin'); // Handles tab navigation
		const pointerDownOnFormControl$ = fromEvent(formControlRef.nativeElement, 'pointerdown'); // Handles mouse and touch input

		race(clickOnTooltip$, pointerDownOnFormControl$, focusOnFormControl$)
			.pipe(
				filter(() => this.isTooltipVisible() && !!this.tooltipComponent()),
				tap(() => this.destroyTooltip()),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	/* Listens for changes in the position of the form control element by periodically checking its position every 300ms. */
	/* If the position changes, and the tooltip is visible, it updates the position of the tooltip accordingly. */
	/* Needs to be active while tooltip is visible */
	private listenForPositionChangesOfFormControl() {
		interval(300)
			.pipe(
				tap(() => {
					const newPos = this.getFormControlPosition();
					const hasPosChanged = this.isTooltipVisible() && !!this.tooltipComponent() && !!this.formControlPosition() &&
						(this.formControlPosition()!.top !== newPos.top || this.formControlPosition()!.left !== newPos.left);

					if (hasPosChanged && this.tooltipComponent()) {
						this.formControlPosition.set(newPos);
						this.tooltipComponent()?.setVisibilityAndPosition(this.hostEl);
					}
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private displayTooltip(): void {
		// Make sure there is no existing tooltip before showing a new one:
		this.destroyTooltip();
		// Instantiate the tooltip, pass the options/error-message, attach listeners and add it to the DOM:
		this.setupTooltipComponent();

		// Wait for hostEl.nativeElement to be visible and trigger the tooltip to show:
		requestAnimationFrame(() => {
			this.formControlPosition.set(this.getFormControlPosition());

			if (this.tooltipComponent()) {
				this.tooltipComponent()?.showTooltip(this.hostEl);
				this.isTooltipVisible.set(true);
			}
		});
	}

	private setupTooltipComponent(): void {
    	// Create the component using the ViewContainerRef.
    	// This way the component is automatically added to the change detection cycle of the Angular application
    	const ref = this.viewContainerRef.createComponent(NgErrorTooltipComponent, { injector: this.injector });
		
		this.refToTooltip.set(ref);

		const comp = this.tooltipComponent();
		if (!comp) { return; }

		this.attachListeners(comp, this.hostEl);

    	// append to body
    	document.body.appendChild(ref.location.nativeElement as HTMLElement);
	}

	private destroyTooltip(): void {
		this.destroy$.next();
		this.refToTooltip()?.destroy();
		this.refToTooltip.set(null);
		this.isTooltipVisible.set(false);
		this.formControlPosition.set(null);
	}

	private getFormControlPosition(): DOMRect {
		return this.hostEl.nativeElement.getBoundingClientRect();
	}

	ngOnDestroy(): void {
		this.destroyTooltip();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
