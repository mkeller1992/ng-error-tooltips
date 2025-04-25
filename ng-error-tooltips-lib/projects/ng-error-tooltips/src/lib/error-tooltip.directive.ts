import { ApplicationRef, ComponentRef, Directive, ElementRef, Injector, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ControlContainer, FormGroupDirective, NgControl } from '@angular/forms';

import { Subject, filter, fromEvent, interval, merge, race, takeUntil, tap } from 'rxjs';
import { defaultOptions } from './default-options.const';
import { ErrorTooltipOptions } from './error-tooltip-options.interface';
import { Placement } from './placement.type';
import { NgErrorTooltipComponent } from './ng-error-tooltip.component';


@Directive({
	selector: '[ngErrorTooltip]'
})

export class ErrorTooltipDirective implements OnInit, OnDestroy {

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


	private ngControl: NgControl;
	private formControlPosition: DOMRect | undefined;
	private refToTooltipComponent: ComponentRef<NgErrorTooltipComponent> | undefined;
	private tooltipComponent: NgErrorTooltipComponent | undefined;

	private isTooltipCreated = false;

	private tooltipDestroyed$ = new Subject<void>();
	private destroyAll$ = new Subject<void>();

	constructor(private formControlRef: ElementRef,
				private viewContainerRef: ViewContainerRef,
				private appRef: ApplicationRef,
				private injector: Injector,
				private controlContainer: ControlContainer) {

    	this.ngControl = this.injector.get(NgControl);
	}

	ngOnInit(): void {

		// Map tooltip-options:
    	this.mergedOptions = this.getMergedTooltipOptions();

		// Update tooltip 'on submit':
		this.handleTooltipVisibilityOnFormSubmission();

		/*
		// Subscribes to the changes of the form-element:
		this.ngControl.control?.valueChanges?.pipe(
			tap(() => {
				console.log('Form Element changed');
			}),
			takeUntil(this.destroy$)
		).subscribe();
		*/
	}

	/** Public User-Methods **/

	public showErrorTooltip() {
		if (this.getErrorMessages().length > 0) {
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
						const formHasErrors = !!this.ngControl.errors;
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
    	this.refToTooltipComponent = this.viewContainerRef.createComponent(NgErrorTooltipComponent, { injector: this.injector });
    	this.tooltipComponent = this.refToTooltipComponent.instance;

		// Set the data property of the component instance.
		this.tooltipComponent.errors = this.getErrorMessages();
		this.tooltipComponent.options = this.mergedOptions;
		this.tooltipComponent.formControl = this.formControlRef.nativeElement;

		this.attachListeners(this.tooltipComponent, this.formControlRef);

    	// Get the DOM element from the component's view.
    	const domElemTooltip = (this.refToTooltipComponent.location.nativeElement as HTMLElement);

    	// Append the DOM element to the document body.
    	document.body.appendChild(domElemTooltip);
	}

	private destroyTooltip(): void {
		this.tooltipDestroyed$?.next();

		if(this.refToTooltipComponent) {
			this.appRef.detachView(this.refToTooltipComponent.hostView);
			this.refToTooltipComponent.destroy();
		}
		this.isTooltipCreated = false;
		this.tooltipComponent = undefined;
		this.refToTooltipComponent = undefined;
	}

	private getFormControlPosition(): DOMRect {
		return this.formControlRef.nativeElement.getBoundingClientRect();
	}

	private getErrorMessages(): string[] {
		const errors = Object.entries(this.ngControl.errors ?? {}).flatMap(([, err]) =>
		  Array.isArray(err) ? err.map((e: any) => e.text) : (typeof err === 'string' ? [err] : [])
		);

		return this.mergedOptions.showFirstErrorOnly && errors.length > 1 ? [errors[0]] : errors;
	  }

	ngOnDestroy(): void {
		this.destroyTooltip();
		this.destroyAll$.next();
		this.destroyAll$.unsubscribe();
		this.tooltipDestroyed$.unsubscribe();
	}
}
