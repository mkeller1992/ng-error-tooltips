import { ComponentRef, Directive, ElementRef, EnvironmentInjector, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { ControlContainer, FormGroupDirective, NgControl } from '@angular/forms';

import { Subject, filter, fromEvent, interval, merge, race, takeUntil, tap } from 'rxjs';
import { Placement } from './tooltip/placement.type';
import { ErrorPayload } from './error-payload.type';
import { isTriLangText } from './validators/error-messages.const';
import { defaultOptions } from './options/default-options.const';
import { ErrorTooltipOptions } from './options/error-tooltip-options.interface';
import { NgErrorTooltipComponent } from './tooltip/ng-error-tooltip.component';


@Directive({
	selector: '[ngErrorTooltip]'
})

export class ErrorTooltipDirective implements OnInit, OnDestroy, OnChanges {
	private readonly formControlRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly injector = inject(EnvironmentInjector);
	private readonly controlContainer = inject(ControlContainer);
	private readonly ngControl= inject(NgControl, { self: true, optional: true });

	// A merge of all options that were passed in various ways:
	private mergedOptions!: ErrorTooltipOptions;

	// Will contain all options collected from the @Inputs
	private collectedOptions: Partial<ErrorTooltipOptions> = {};

	// Pass options as a single object:
	@Input()
	options: ErrorTooltipOptions = {};


	@Input()
	set id(val: string | number) {
	  	this.collectedOptions.id = val;
	}

	@Input()
	set showFirstErrorOnly(val: boolean) {
	  	this.collectedOptions.showFirstErrorOnly = val;
	}

	@Input()
	set placement(val: Placement) {
	  	this.collectedOptions.placement = val;
	}

	@Input()
	set zIndex(val: number) {
	  	this.collectedOptions.zIndex = val;
	}

	@Input()
	set tooltipClass(val: string) {
	 	this.collectedOptions.tooltipClass = val;
	}

	@Input()
	set shadow(val: boolean) {
	 	this.collectedOptions.shadow = val;
	}

	@Input()
	set offset(val: number) {
		this.collectedOptions.offset = val;
	}

	@Input()
	set width(val: string) {
	  	this.collectedOptions.width = val;
	}

	@Input()
	set maxWidth(val: string) {
	 	this.collectedOptions.maxWidth = val;
	}

	@Input()
	set pointerEvents(val: 'auto' | 'none') {
	  	this.collectedOptions.pointerEvents = val;
	}


	private formControlPosition: DOMRect | undefined;
	private refToTooltipComponent: ComponentRef<NgErrorTooltipComponent> | undefined;
	private tooltipComponent: NgErrorTooltipComponent | undefined;

	private lastOptionsKey = '';

	private isTooltipCreated = false;

	private tooltipDestroyed$ = new Subject<void>();
	private destroyAll$ = new Subject<void>();


	ngOnInit(): void {

		// Map tooltip-options:
    	this.mergedOptions = this.getMergedTooltipOptions();
		this.lastOptionsKey = JSON.stringify(this.mergedOptions);

		// Update tooltip 'on submit':
		this.handleTooltipVisibilityOnFormSubmission();
	}

	ngOnChanges(_: SimpleChanges) {
    	// Map tooltip options:
    	const merged = this.getMergedTooltipOptions();
		const key = JSON.stringify(merged);

		if (key !== this.lastOptionsKey && this.refToTooltipComponent) {
			this.mergedOptions = merged;
			this.lastOptionsKey = key;
			this.refToTooltipComponent.setInput('options', this.mergedOptions);
		}	
    }

	/** Public User-Methods **/

	public showErrorTooltip() {
		if (this.getErrorPayloads().length > 0) {
			this.displayTooltip();
		}
	}

	public hideErrorTooltip() {
		this.destroyTooltip();
	}


	/** Private library-Methods **/

	private getMergedTooltipOptions(): ErrorTooltipOptions {
    	// Merge options: the priority order is as follows:
		// 1. Individual options passed via @Input
		// 2. The options-object passed via @Input
		// 3. The default options
    	return Object.assign({}, defaultOptions, this.options, this.collectedOptions);
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
				filter(() => this.isTooltipCreated && !!this.tooltipComponent),
				tap(() => this.destroyTooltip()),
				takeUntil(merge(this.tooltipDestroyed$, this.destroyAll$))
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
					const hasPosChanged = this.isTooltipCreated && !!this.tooltipComponent && !!this.formControlPosition &&
						(this.formControlPosition!.top !== newPos.top || this.formControlPosition!.left !== newPos.left);

					if (hasPosChanged && this.tooltipComponent) {
						this.formControlPosition = newPos;
						this.tooltipComponent.setVisibilityAndPosition(this.formControlRef);
					}
				}),
				takeUntil(merge(this.tooltipDestroyed$, this.destroyAll$))
			)
			.subscribe();
	}

	/* Needs to be active throughout the lifespan of this directive */
	private handleTooltipVisibilityOnFormSubmission() {
		// Check if parent Form is accessible:
		if (this.controlContainer?.control) {
			const parentDirective = this.controlContainer.formDirective as FormGroupDirective;

			// Reacts to 'on submit' of the parent-form:
			parentDirective.ngSubmit
				.pipe(
					tap(() => {
						const formHasErrors = !!this.ngControl?.errors;
						if (formHasErrors) {
							this.displayTooltip();
						}
					}),
					takeUntil(this.destroyAll$)
				)
				.subscribe();
		}
	}

	private displayTooltip(): void {
		// Make sure there is no existing tooltip before showing a new one:
		this.destroyTooltip();
		// Instantiate the tooltip, pass the options/error-message, attach listeners and add it to the DOM:
		this.setupTooltipComponent();

		// Wait for formControlRef.nativeElement to be visible and trigger the tooltip to show:
		requestAnimationFrame(() => {
			this.formControlPosition = this.getFormControlPosition();

			if (this.tooltipComponent) {
				this.tooltipComponent.showTooltip(this.formControlRef);
				this.isTooltipCreated = true;
			}
		});
	}

	private setupTooltipComponent(): void {
    	// Create the component using the ViewContainerRef.
    	// This way the component is automatically added to the change detection cycle of the Angular application
    	const ref = this.viewContainerRef.createComponent(NgErrorTooltipComponent, { injector: this.injector });
		this.refToTooltipComponent = ref;
    	this.tooltipComponent = ref.instance;

		// Set the data property of the component instance in a way that ngOnChanges is triggered:
		ref.setInput('errors', this.getErrorPayloads());
		ref.setInput('options', this.mergedOptions);
		ref.setInput('formControl', this.formControlRef.nativeElement);

		this.attachListeners(this.tooltipComponent, this.formControlRef);

    	// Get the DOM element from the component's view.
    	const domElemTooltip = (ref.location.nativeElement as HTMLElement);

    	// Append the DOM element to the document body.
    	document.body.appendChild(domElemTooltip);
	}

	private destroyTooltip(): void {
		this.tooltipDestroyed$?.next();
		this.refToTooltipComponent?.destroy();
		this.isTooltipCreated = false;
		this.tooltipComponent = undefined;
		this.refToTooltipComponent = undefined;
	}

	private getFormControlPosition(): DOMRect {
		return this.formControlRef.nativeElement.getBoundingClientRect();
	}

	private getErrorPayloads(): ErrorPayload[] {
		const entries = Object.entries(this.ngControl?.errors ?? {}) as Array<[string, unknown]>;

		const errors = entries.reduce<ErrorPayload[]>((acc, [, err]) => {
			
			// for passwordErrors: [{ text: string | TriLangText }]
			if (Array.isArray(err)) {
				for (const e of err as any[]) {
					const t = e?.text;
					if (typeof t === 'string' || isTriLangText(t)) {
						acc.push(t);
					}
				}
				return acc;
			}

			if (typeof err === 'string' || isTriLangText(err)) {
				acc.push(err as ErrorPayload);
			}

			return acc;
		}, []);

		return this.mergedOptions.showFirstErrorOnly && errors.length > 1 ? [errors[0]] : errors;
	}

	ngOnDestroy(): void {
		this.destroyTooltip();
		this.destroyAll$.next();
		this.destroyAll$.unsubscribe();
		this.tooltipDestroyed$.unsubscribe();
	}
}
