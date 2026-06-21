import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
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
		vi.useFakeTimers(); // needed for async re-positioning

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
		vi.useRealTimers();
	});

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

	function setFormControl(control: ElementRef): void {
		fixture.componentRef.setInput('formControl', control.nativeElement);
		fixture.detectChanges();
	}

	function hostEl(): HTMLElement {
		return fixture.nativeElement as HTMLElement;
	}

	function hostClasses(): string {
		return hostEl().className ?? '';
	}

	function hostStyle(prop: keyof CSSStyleDeclaration): string {
		if (String(prop).startsWith('--')) {
			return hostEl().style.getPropertyValue(String(prop));
		}

		return ((hostEl().style as any)[prop] ?? '') as string;
	}

	describe('creation', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});
	});

	describe('host bindings', () => {
		it('should apply all default options on init', () => {
			expect(hostStyle('zIndex')).toBe(String(defaultOptions.zIndex ?? ''));
			expect(hostStyle('maxWidth')).toBe(defaultOptions.maxWidth ?? '');
			expect(hostStyle('pointerEvents')).toBe(defaultOptions.pointerEvents ?? '');
			expect(hostStyle('width')).toBe('');
			expect(hostStyle('top')).toBe('-9999px');
			expect(hostStyle('left')).toBe('-9999px');

			const classes = hostClasses();
			expect(classes).toContain('tooltip');
			expect(classes).toContain('tooltip-error');
			expect(classes).toContain(`tooltip-${defaultOptions.placement}`);

			if (defaultOptions.shadow !== false) {
				expect(classes).toContain('tooltip-shadow');
			}
		});

		it('should apply custom tooltipClass', () => {
			setOptions({ ...defaultOptions, tooltipClass: 'my-custom' });
			expect(hostClasses()).toContain('my-custom');
		});

		it('should remove tooltipClass when changed from a value to empty', () => {
			setOptions({ ...defaultOptions, tooltipClass: 'my-custom' });
			expect(hostClasses()).toContain('my-custom');

			setOptions({ ...defaultOptions, tooltipClass: '' });
			expect(hostClasses()).not.toContain('my-custom');
		});

		it('should update z-index when changed in options', () => {
			setOptions({ ...defaultOptions, zIndex: 888 });
			expect(hostStyle('zIndex')).toBe('888');
		});

		it('should update width from options', () => {
			setOptions({ ...defaultOptions, width: '300px' });
			expect(hostStyle('width')).toBe('300px');
		});

		it('should update maxWidth, pointerEvents, shadow and position from options', () => {
			setOptions({
				...defaultOptions,
				appendTooltipToBody: false,
				maxWidth: '640px',
				pointerEvents: 'none',
				shadow: false,
			});

			expect(hostStyle('position')).toBe('fixed');
			expect(hostStyle('maxWidth')).toBe('640px');
			expect(hostStyle('pointerEvents')).toBe('none');
			expect(hostClasses()).not.toContain('tooltip-shadow');
		});

		it('should expose custom text, background and border colors as host CSS variables', () => {
			setOptions({
				...defaultOptions,
				textColor: '#7f1d1d',
				backgroundColor: '#fef3c7',
				borderColor: 'rgb(220, 38, 38)',
			});

			expect(hostStyle('--ng-error-tooltip-text-color' as any)).toBe('#7f1d1d');
			expect(hostStyle('--ng-error-tooltip-background-color' as any)).toBe('#fef3c7');
			expect(hostStyle('--ng-error-tooltip-border-color' as any)).toBe('rgb(220, 38, 38)');
		});
	});

	describe('translated errors', () => {
		it('should translate TriLangText payloads and filter empty messages', () => {
			fixture.componentRef.setInput('errors', [
				'Required',
				{ de: 'Deutsch', fr: 'Francais', en: 'English' },
				'   ',
				{ de: '', fr: '', en: '   ' },
			]);
			fixture.detectChanges();

			expect(component.translatedErrors()).toEqual(['Required', 'Deutsch']);
			expect(component.hasErrors()).toBe(true);
		});

		it('should report no errors when all translated messages are empty', () => {
			fixture.componentRef.setInput('errors', ['', '   ', { de: '', fr: '', en: '' }]);
			fixture.detectChanges();

			expect(component.translatedErrors()).toEqual([]);
			expect(component.hasErrors()).toBe(false);
		});
	});

	describe('user interaction', () => {
		it('should emit userClickOnTooltip$ when clicked', async () => {
			const emission = firstValueFrom(component.userClickOnTooltip$.pipe(take(1)));
			component.handleTooltipClick();
			await expect(emission).resolves.toBeUndefined();
		});
	});

	describe('visibility', () => {
		it('should show tooltip when element is not covered', () => {
			const control = mockFormControl();

			setFormControl(control);

			(document.elementFromPoint as any) = () => control.nativeElement;

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			expect(hostClasses()).toContain('tooltip-show');
			expect(hostClasses()).not.toContain('tooltip-display-none');
		});

		it('should hide tooltip when element is covered', () => {
			const control = mockFormControl();

			setFormControl(control);

			(document.elementFromPoint as any) = () => document.createElement('div');

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			expect(hostClasses()).toContain('tooltip-hide');
			expect(hostClasses()).toContain('tooltip-display-none');
		});

		it('should treat tooltip-owned elements as not covered', () => {
			const control = mockFormControl();
			const tooltipLabel = document.createElement('div');
			tooltipLabel.className = 'tooltip-label';

			setFormControl(control);
			(document.elementFromPoint as any) = () => tooltipLabel;

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			expect(hostClasses()).toContain('tooltip-show');
			expect(hostClasses()).not.toContain('tooltip-display-none');
		});

		it('should treat descendants of the form control as not covered', () => {
			const control = mockFormControl();
			const child = document.createElement('span');
			control.nativeElement.appendChild(child);

			setFormControl(control);
			(document.elementFromPoint as any) = () => child;

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			expect(hostClasses()).toContain('tooltip-show');
		});
	});

	describe('positioning', () => {
		it('should calculate correct top/left for "bottom" placement', () => {
			const control = mockFormControl();

			setFormControl(control);

			(document.elementFromPoint as any) = () => control.nativeElement;

			setOptions({ ...defaultOptions, placement: 'bottom' });
			setTooltipSize(120, 40);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			const expectedTop = 100 + 30 + (defaultOptions.offset ?? 0);
			const expectedLeft = 50 + 200 / 2 - 120 / 2;

			expect(hostStyle('top')).toBe(`${expectedTop}px`);
			expect(hostStyle('left')).toBe(`${expectedLeft}px`);
		});

		it('should position correctly for "left" placement', () => {
			const control = mockFormControl();

			setFormControl(control);

			(document.elementFromPoint as any) = () => control.nativeElement;

			setOptions({ ...defaultOptions, placement: 'left' });
			setTooltipSize(80, 40);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			const expectedLeft = 50 - 80 - (defaultOptions.offset ?? 0);
			expect(hostStyle('left')).toBe(`${expectedLeft}px`);
		});

		it('should position correctly for "top" placement', () => {
			const control = mockFormControl();

			setFormControl(control);
			(document.elementFromPoint as any) = () => control.nativeElement;

			setOptions({ ...defaultOptions, placement: 'top' });
			setTooltipSize(120, 40);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			const expectedTop = 100 - 40 - (defaultOptions.offset ?? 0);
			const expectedLeft = 50 + 200 / 2 - 120 / 2;

			expect(hostStyle('top')).toBe(`${expectedTop}px`);
			expect(hostStyle('left')).toBe(`${expectedLeft}px`);
		});

		it('should position correctly for "top-left" and "bottom-left" placements', () => {
			const control = mockFormControl();

			setFormControl(control);
			(document.elementFromPoint as any) = () => control.nativeElement;

			setOptions({ ...defaultOptions, placement: 'top-left' });
			setTooltipSize(120, 40);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			expect(hostStyle('top')).toBe(`${100 - 40 - (defaultOptions.offset ?? 0)}px`);
			expect(hostStyle('left')).toBe('50px');

			setOptions({ ...defaultOptions, placement: 'bottom-left' });
			component.showTooltip(control);
			fixture.detectChanges();

			expect(hostStyle('top')).toBe(`${100 + 30 + (defaultOptions.offset ?? 0)}px`);
			expect(hostStyle('left')).toBe('50px');
		});

		it('should position correctly for "right" placement', () => {
			const control = mockFormControl();

			setFormControl(control);
			(document.elementFromPoint as any) = () => control.nativeElement;

			setOptions({ ...defaultOptions, placement: 'right' });
			setTooltipSize(80, 40);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			const expectedTop = 100 + 30 / 2 - 40 / 2;
			const expectedLeft = 50 + 200 + (defaultOptions.offset ?? 0);

			expect(hostStyle('top')).toBe(`${expectedTop}px`);
			expect(hostStyle('left')).toBe(`${expectedLeft}px`);
		});

		it('should use SVG bounding box dimensions for SVG form controls', () => {
			const svgControl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			const control = new ElementRef(svgControl);

			svgControl.getBoundingClientRect = () => ({
				top: 20,
				left: 10,
				width: 40,
				height: 12,
			}) as DOMRect;

			setFormControl(control);
			(document.elementFromPoint as any) = () => svgControl;

			setOptions({ ...defaultOptions, placement: 'right' });
			setTooltipSize(20, 10);

			component.showTooltip(control);
			vi.runOnlyPendingTimers();
			fixture.detectChanges();

			const expectedTop = 20 + 12 / 2 - 10 / 2;
			const expectedLeft = 10 + 40 + (defaultOptions.offset ?? 0);

			expect(hostStyle('top')).toBe(`${expectedTop}px`);
			expect(hostStyle('left')).toBe(`${expectedLeft}px`);
		});
	});
});
