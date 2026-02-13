import { ComponentRef, computed, Directive, effect, ElementRef, EnvironmentInjector, inject, input, OnDestroy, signal, ViewContainerRef } from '@angular/core';
import { ControlContainer, FormGroupDirective, NgControl } from '@angular/forms';
import { Subject, filter, fromEvent, interval, merge, race, takeUntil, tap } from 'rxjs';

import { Placement } from './tooltip/placement.type';
import { ErrorPayload } from './error-payload.type';
import { isTriLangText } from './validators/error-messages.const';
import { defaultOptions } from './options/default-options.const';
import { ErrorTooltipOptions } from './options/error-tooltip-options.interface';
import { NgErrorTooltipComponent } from './tooltip/ng-error-tooltip.component';

@Directive({
  selector: '[ngErrorTooltip]',
  standalone: true
})
export class ErrorTooltipDirective implements OnDestroy {
	private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly envInjector = inject(EnvironmentInjector);
	private readonly controlContainer = inject(ControlContainer, { optional: true });
	private readonly ngControl = inject(NgControl, { self: true, optional: true });

	// ---- inputs (signals) ----
	readonly options = input<ErrorTooltipOptions>({});
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

	private readonly mergedOptions = computed<ErrorTooltipOptions>(() => (
		{
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

	// ---- internal state ----
	private refToTooltip = signal<ComponentRef<NgErrorTooltipComponent> | null>(null);
	private tooltipComponent = computed(() => this.refToTooltip()?.instance ?? null);
	private formControlPosition = signal<DOMRect | null>(null);
	private isTooltipVisible = signal<boolean>(false);

	// Bridge signal: triggers recomputation when reactive forms state changes
	private readonly controlTick = signal(0);

	private readonly destroyAll$ = new Subject<void>();
	private readonly tooltipDestroyed$ = new Subject<void>();

	private readonly errorPayloads = computed<ErrorPayload[]>(() => {
		// <-- the important part: depend on controlTick()
		this.controlTick();

		const entries = Object.entries(this.ngControl?.errors ?? {}) as Array<[string, unknown]>;

		const errors = entries.reduce<ErrorPayload[]>((acc, [, err]) => {
			if (Array.isArray(err)) {
				for (const e of err as any[]) {
				const t = e?.text;
				if (typeof t === 'string' || isTriLangText(t)) acc.push(t);
				}
				return acc;
			}

			if (typeof err === 'string' || isTriLangText(err)) {
				acc.push(err as ErrorPayload);
			}

			return acc;
		}, []);

		const { showFirstErrorOnly } = this.mergedOptions();
		return showFirstErrorOnly && errors.length > 1 ? [errors[0]] : errors;
	});

	constructor() {
		// Keep tooltip inputs in sync (only if tooltip exists)
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

	ngOnInit(): void {
		// Bridge Rx -> Signal
		const ctrl = this.ngControl?.control;
		if (ctrl) {
			merge(ctrl.statusChanges ?? [], ctrl.valueChanges ?? [])
				.pipe(
					tap(() => this.controlTick.update(x => x + 1)),
					takeUntil(this.destroyAll$)
				)
				.subscribe();
		}

		// One-time: listen to parent form submit (lifetime listener)
		this.handleTooltipVisibilityOnFormSubmission();
	}

	/** Public API **/
	public showErrorTooltip(): void {
		// Ensure we read fresh errors (in case submit just happened)
		if (this.errorPayloads().length > 0) { this.displayTooltip(); }
	}

	public hideErrorTooltip(): void {
		this.destroyTooltip();
	}

	/** Submit listener **/
	private handleTooltipVisibilityOnFormSubmission(): void {
		const parent = this.controlContainer?.control ? (this.controlContainer.formDirective as FormGroupDirective) : null;
		if (!parent) { return; }

		parent.ngSubmit
			.pipe(
				tap(() => {
					// bump tick to pick up touched/validation updates that happened during submit
					this.controlTick.update(x => x + 1);

					if (this.errorPayloads().length > 0) { this.displayTooltip(); }
				}),
				takeUntil(this.destroyAll$)
			)
			.subscribe();
	}

	/** Tooltip lifecycle **/
	private displayTooltip(): void {
		this.destroyTooltip();
		this.setupTooltipComponent();

		requestAnimationFrame(() => {
			this.formControlPosition.set(this.getFormControlPosition());
			this.tooltipComponent()?.showTooltip(this.hostEl);
			this.isTooltipVisible.set(true);
		});
	}

	private setupTooltipComponent(): void {
		const ref = this.viewContainerRef.createComponent(NgErrorTooltipComponent, {
			// EnvironmentInjector is the correct one for standalone components
			environmentInjector: this.envInjector });

		this.refToTooltip.set(ref);

		const comp = this.tooltipComponent();
		if (!comp) { return; }

		this.attachListeners(comp);
		document.body.appendChild(ref.location.nativeElement as HTMLElement);
	}

	private attachListeners(tooltipComponent: NgErrorTooltipComponent): void {
		const clickOnTooltip$ = tooltipComponent.userClickOnTooltip$;
		const focusOnHost$ = fromEvent(this.hostEl.nativeElement, 'focusin');
		const pointerDownOnHost$ = fromEvent(this.hostEl.nativeElement, 'pointerdown');

		race(clickOnTooltip$, pointerDownOnHost$, focusOnHost$)
			.pipe(
				filter(() => this.isTooltipVisible() && !!this.tooltipComponent()),
				tap(() => this.destroyTooltip()),
				takeUntil(merge(this.tooltipDestroyed$, this.destroyAll$))
			)
			.subscribe();

		interval(300)
			.pipe(
				tap(() => {
				const newPos = this.getFormControlPosition();
				const oldPos = this.formControlPosition();

				const hasPosChanged =
					this.isTooltipVisible() &&
					!!this.tooltipComponent() &&
					!!oldPos &&
					(oldPos.top !== newPos.top || oldPos.left !== newPos.left);

				if (hasPosChanged) {
					this.formControlPosition.set(newPos);
					this.tooltipComponent()?.setVisibilityAndPosition(this.hostEl);
				}
				}),
				takeUntil(merge(this.tooltipDestroyed$, this.destroyAll$))
			)
			.subscribe();
	}

	private destroyTooltip(): void {
		this.tooltipDestroyed$.next();
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
		this.destroyAll$.next();
		this.destroyAll$.complete();
		this.tooltipDestroyed$.complete();
	}
}
