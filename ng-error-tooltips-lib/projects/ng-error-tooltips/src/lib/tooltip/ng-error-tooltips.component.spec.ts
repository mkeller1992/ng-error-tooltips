import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, ElementRef } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';

import { NgErrorTooltipComponent } from './ng-error-tooltip.component';
import { defaultOptions } from '../options/default-options.const';

describe('NgErrorTooltipComponent (signal inputs + host:{})', () => {
	let component: NgErrorTooltipComponent;
	let fixture: ComponentFixture<NgErrorTooltipComponent>;

	// JSDOM sometimes lacks elementFromPoint. Provide a harmless polyfill.
	beforeAll(() => {
		Object.defineProperty(document, 'elementFromPoint', {
			value: () => null,
			writable: true,
			configurable: true,
		});
	});

	beforeEach(async () => {
		jest.useFakeTimers(); // needed for async re-positioning

		await TestBed.configureTestingModule({
			imports: [NgErrorTooltipComponent],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		fixture = TestBed.createComponent(NgErrorTooltipComponent);
		component = fixture.componentInstance;

		// IMPORTANT: signal inputs must be set via setInput (or fixture.componentRef.setInput)
		fixture.componentRef.setInput('options', defaultOptions);
		fixture.componentRef.setInput('errors', ['Required']);
		fixture.componentRef.setInput('formControl', document.createElement('input'));

		fixture.detectChanges();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	function hostEl(): HTMLElement {
		return fixture.nativeElement as HTMLElement;
	}

	function hostClasses(): string {
		return hostEl().className ?? '';
	}

	function hostStyle(prop: keyof CSSStyleDeclaration): string {
		return ((hostEl().style as any)[prop] ?? '') as string;
	}

	/** Creates a mock FormControl element with a predictable rect */
	function mockFormControl(rect: Partial<DOMRect> = {}): ElementRef {
		const el = document.createElement('input');

		el.getBoundingClientRect = () =>
			({
				top: 100,
				left: 50,
				width: 200,
				height: 30,
				...rect,
			}) as DOMRect;

		// offsetHeight/offsetWidth are required in some code paths
		Object.defineProperty(el, 'offsetHeight', { value: (rect as any).height ?? 30, configurable: true });
		Object.defineProperty(el, 'offsetWidth', { value: (rect as any).width ?? 200, configurable: true });

		return new ElementRef(el);
	}

	function setTooltipSize(width: number, height: number): void {
		Object.defineProperty(hostEl(), 'clientWidth', { value: width, configurable: true });
		Object.defineProperty(hostEl(), 'clientHeight', { value: height, configurable: true });
	}

	function setOptions(opts: any): void {
		fixture.componentRef.setInput('options', opts);
		fixture.detectChanges();
	}

	// ---------------------------------------------------------
	// BASIC CREATION
	// ---------------------------------------------------------

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// ---------------------------------------------------------
	// applyOptions() / host:{} binding outputs (via effect)
	// ---------------------------------------------------------

	it('should apply all default options on init', () => {
		// z-index (host: [style.zIndex])
		expect(hostStyle('zIndex')).toBe(String(defaultOptions.zIndex ?? ''));

		// maxWidth (host: [style.maxWidth])
		expect(hostStyle('maxWidth')).toBe(defaultOptions.maxWidth ?? '');

		// pointer-events (host: [style.pointerEvents])
		expect(hostStyle('pointerEvents')).toBe(defaultOptions.pointerEvents ?? '');

		// width default should be empty string (removes inline style)
		expect(hostStyle('width')).toBe('');

		// initial top/left (off-screen defaults)
		expect(hostStyle('top')).toBe('-9999px');
		expect(hostStyle('left')).toBe('-9999px');

		// classes (host: [class])
		const cls = hostClasses();
		expect(cls).toContain('tooltip');
		expect(cls).toContain('tooltip-error');

		// shadow class default
		if (defaultOptions.shadow !== false) {
			expect(cls).toContain('tooltip-shadow');
		}

		// placement class default
		expect(cls).toContain(`tooltip-${defaultOptions.placement}`);
	});

	it('should apply custom tooltipClass', () => {
		setOptions({ ...defaultOptions, tooltipClass: 'my-custom' });
		expect(hostClasses()).toContain('my-custom');
	});

	it('should remove tooltipClass when changed from a value to empty', () => {
		// Step 1: Apply 'my-custom'
		setOptions({ ...defaultOptions, tooltipClass: 'my-custom' });
		expect(hostClasses()).toContain('my-custom');

		// Step 2: Remove it
		setOptions({ ...defaultOptions, tooltipClass: '' });
		expect(hostClasses()).not.toContain('my-custom');
	});

	// ---------------------------------------------------------
	// CLICK HANDLING
	// ---------------------------------------------------------

	it('should emit userClickOnTooltip$ when clicked', async () => {
		const emission = firstValueFrom(component.userClickOnTooltip$.pipe(take(1)));
		component.handleTooltipClick();
		await expect(emission).resolves.toBeUndefined();
	});

	// ---------------------------------------------------------
	// VISIBILITY HANDLING
	// ---------------------------------------------------------

	it('should show tooltip when element is not covered', () => {
		const control = mockFormControl();

		// formControl is a signal-input now
		fixture.componentRef.setInput('formControl', control.nativeElement);
		fixture.detectChanges();

		// Not covered
		(document.elementFromPoint as any) = () => control.nativeElement;

		component.showTooltip(control);

		// showTooltip -> setVisibilityAndPosition -> may setTimeout(0)
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		expect(hostClasses()).toContain('tooltip-show');
		expect(hostClasses()).not.toContain('tooltip-display-none');
	});

	it('should hide tooltip when element is covered', () => {
		const control = mockFormControl();

		fixture.componentRef.setInput('formControl', control.nativeElement);
		fixture.detectChanges();

		// Covered by something else
		(document.elementFromPoint as any) = () => document.createElement('div');

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		expect(hostClasses()).toContain('tooltip-hide');
		expect(hostClasses()).toContain('tooltip-display-none');
	});

	// ---------------------------------------------------------
	// POSITIONING (PLACEMENT)
	// ---------------------------------------------------------

	it('should calculate correct top/left for "bottom" placement', () => {
		const control = mockFormControl();

		fixture.componentRef.setInput('formControl', control.nativeElement);
		fixture.detectChanges();

		(document.elementFromPoint as any) = () => control.nativeElement;

		setOptions({ ...defaultOptions, placement: 'bottom' });

		// tooltip size is read from the host element
		setTooltipSize(120, 40);

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		const expectedTop = 100 + 30 + (defaultOptions.offset ?? 0);
		const expectedLeft = 50 + 200 / 2 - 120 / 2;

		expect(hostStyle('top')).toBe(`${expectedTop}px`);
		expect(hostStyle('left')).toBe(`${expectedLeft}px`);
	});

	it('should position correctly for "left" placement', () => {
		const control = mockFormControl();

		fixture.componentRef.setInput('formControl', control.nativeElement);
		fixture.detectChanges();

		(document.elementFromPoint as any) = () => control.nativeElement;

		setOptions({ ...defaultOptions, placement: 'left' });

		setTooltipSize(80, 40);

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		const expectedLeft = 50 - 80 - (defaultOptions.offset ?? 0);
		expect(hostStyle('left')).toBe(`${expectedLeft}px`);
	});

	// ---------------------------------------------------------
	// STYLE SIGNALS (via host:{})
	// ---------------------------------------------------------

	it('should update z-index when changed in options', () => {
		setOptions({ ...defaultOptions, zIndex: 888 });
		expect(hostStyle('zIndex')).toBe('888');
	});

	it('should update width from options', () => {
		setOptions({ ...defaultOptions, width: '300px' });
		expect(hostStyle('width')).toBe('300px');
	});
});
