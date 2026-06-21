/* eslint-disable @typescript-eslint/no-unused-vars */
import { beforeAll, beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock, MockInstance } from 'vitest';
import { Component, DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { ErrorTooltipDirective } from './error-tooltip.directive';
import { defaultOptions } from './options/default-options.const';
import { ErrorTooltipOptions } from './options/error-tooltip-options.interface';
import { provideErrorTooltipOptions } from './options/error-tooltip-options.token';

/**
 * Host A: binds BOTH [options] and [placement] (explicit placement wins)
 */
@Component({
	standalone: true,
	imports: [ReactiveFormsModule, ErrorTooltipDirective],
	template: `
		<form [formGroup]="form" (ngSubmit)="noop()">
			<input
				type="text"
				formControlName="name"
				ngErrorTooltip
				[options]="options()"
				[placement]="placement">
		</form>
	`
})
class HostWithExplicitPlacementComponent {
	readonly form: FormGroup;

	options = signal<ErrorTooltipOptions>({ placement: 'top', zIndex: 2000 });

	// Must be set BEFORE first detectChanges to avoid NG0100
	placement: any = null;

	constructor(fb: FormBuilder) {
		this.form = fb.group({ name: [''] });
	}

	noop() {}
}

/**
 * Host B: binds ONLY [options] (options.placement may change tooltip placement)
 */
@Component({
	standalone: true,
	imports: [ReactiveFormsModule, ErrorTooltipDirective],
	template: `
		<form [formGroup]="form" (ngSubmit)="noop()">
			<input
				type="text"
				formControlName="name"
				ngErrorTooltip
				[options]="options()">
		</form>
	`
})
class HostOptionsOnlyComponent {
	readonly form: FormGroup;

	options = signal<ErrorTooltipOptions>({ placement: 'top', zIndex: 2000 });

	constructor(fb: FormBuilder) {
		this.form = fb.group({ name: [''] });
	}

	noop() {}
}

/**
 * JSDOM sometimes lacks elementFromPoint. Your real tooltip uses it.
 * Provide a harmless polyfill so tests never crash.
 */
function ensureElementFromPointExists(): void {
	const docAny = document as any;
	if (typeof docAny.elementFromPoint === 'function') return;
	docAny.elementFromPoint = (_x: number, _y: number) => document.body;
}

/**
 * Zoneless-safe flush (no zone.js/testing).
 * With fake timers enabled, we must explicitly advance timers + ticks.
 */
async function flush(): Promise<void> {
	// Let already-queued microtasks run
	await Promise.resolve();

	const j: any = vi;

	// Vitest fake timers path
	if (typeof j.getTimerCount === 'function') {
		// Run timers scheduled so far (setTimeout/RAF mocks)
		j.runOnlyPendingTimers();

		// Run microtasks that might have been queued by timers
		await Promise.resolve();

		// Some Angular schedulers queue "ticks"
		if (typeof j.runAllTicks === 'function') {
			j.runAllTicks();
		}

		// One more microtask pass after ticks
		await Promise.resolve();
		return;
	}

	// Real timers fallback (should not be used in this suite)
	await new Promise<void>(r => setTimeout(r, 0));
}

/**
 * Often needed for signals+effects+RAF race: run 2 cycles.
 */
async function flush2(): Promise<void> {
	await flush();
	await flush();
}

function mockAsyncRaf(): { restore: () => void } {
	const original = global.requestAnimationFrame;
	const spy = vi.spyOn(global, 'requestAnimationFrame').mockImplementation(((cb: FrameRequestCallback): number => {
		setTimeout(() => cb(0), 0);
		return 0;
	}) as any);

	return {
		restore: () => {
			spy.mockRestore();
			global.requestAnimationFrame = original;
		}
	};
}

function makeFakeTooltipRef() {
	const setInputMock = vi.fn();

	const fakeComponentRef = {
		instance: {
			showTooltip: vi.fn(),
			setVisibilityAndPosition: vi.fn(),
			userClickOnTooltip$: new Subject<void>(),
		},
		setInput: setInputMock,
		destroy: vi.fn(),
		location: { nativeElement: document.createElement('div') },
	};

	return { fakeComponentRef, setInputMock };
}

beforeAll(() => {
	ensureElementFromPointExists();
});

beforeEach(() => {
	vi.restoreAllMocks();
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

async function setupHarness<THost>(
	hostType: new (...args: any[]) => THost
): Promise<{
	fixture: ComponentFixture<THost>;
	component: THost;
	inputDebugElement: DebugElement;
	directive: ErrorTooltipDirective;
	setErrors: (errors: any) => Promise<void>;
	getFormDir: () => FormGroupDirective;
	installFakeTooltipLifecycle: () => {
		setInputMock: Mock;
		fakeComponentRef: any;
		appendSpy: MockInstance;
		raf: { restore: () => void };
	};
}> {
	await TestBed.configureTestingModule({
		imports: [hostType],
		providers: [provideZonelessChangeDetection(), FormBuilder],
	}).compileComponents();

	const fixture = TestBed.createComponent(hostType);
	const component = fixture.componentInstance;
	fixture.detectChanges();

	const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
	const directive = inputDebugElement.injector.get(ErrorTooltipDirective);

	const setErrors = async (errors: any) => {
		const anyHost: any = component as any;
		anyHost.form.get('name')!.setErrors(errors);
		fixture.detectChanges();
		await flush2();
	};

	const getFormDir = () =>
		fixture.debugElement.query(By.directive(FormGroupDirective)).injector.get(FormGroupDirective);

	const installFakeTooltipLifecycle = () => {
		const raf = mockAsyncRaf();
		const { fakeComponentRef, setInputMock } = makeFakeTooltipRef();
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		/**
		 * Patch setupTooltipComponent() so no real component is created.
		 * The directive effect will push inputs via ref.setInput(...).
		 */
		(directive as any).setupTooltipComponent = () => {
			(directive as any).refToTooltip.set(fakeComponentRef);
			document.body.appendChild(fakeComponentRef.location.nativeElement);
		};

		return { setInputMock, fakeComponentRef, appendSpy, raf };
	};

	return { fixture, component, inputDebugElement, directive, setErrors, getFormDir, installFakeTooltipLifecycle };
}

/* ======================================================================================
   SUITE A: explicit [placement] exists => placement must NOT change via options
====================================================================================== */
describe('ErrorTooltipDirective (signals-based inputs, zoneless) — host WITH explicit placement binding', () => {
	it('should merge options correctly on initialization', async () => {
		const { directive } = await setupHarness(HostWithExplicitPlacementComponent);
		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.placement).toBe('top');
		expect(merged.zIndex).toBe(2000);

		expect(merged.maxWidth).toBe(defaultOptions.maxWidth);
		expect(merged.pointerEvents).toBe(defaultOptions.pointerEvents);
		expect(merged.shadow).toBe(defaultOptions.shadow);
		expect(merged.offset).toBe(defaultOptions.offset);
		expect(merged.textColor).toBe(defaultOptions.textColor);
		expect(merged.backgroundColor).toBe(defaultOptions.backgroundColor);
		expect(merged.borderColor).toBe(defaultOptions.borderColor);
	});

	it('should prefer explicit input bindings over options object and defaults', async () => {
		await TestBed.configureTestingModule({
			imports: [HostWithExplicitPlacementComponent],
			providers: [provideZonelessChangeDetection(), FormBuilder],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostWithExplicitPlacementComponent);
		const component = fixture.componentInstance;

		(component as any).options.set({ placement: 'top', zIndex: 1234 });
		component.placement = 'left' as any; // set before first detectChanges

		fixture.detectChanges();

		const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
		const directive = inputDebugElement.injector.get(ErrorTooltipDirective);

		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.placement).toBe('left');
		expect(merged.zIndex).toBe(1234);
		expect(merged.offset).toBe(defaultOptions.offset);
	});

	it('should merge custom text, background and border colors from options', async () => {
		const { directive, fixture, component } = await setupHarness(HostWithExplicitPlacementComponent);

		(component as any).options.set({
			textColor: '#7f1d1d',
			backgroundColor: '#fef3c7',
			borderColor: '#dc2626',
		});
		fixture.detectChanges();
		await flush2();

		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.textColor).toBe('#7f1d1d');
		expect(merged.backgroundColor).toBe('#fef3c7');
		expect(merged.borderColor).toBe('#dc2626');
	});

	it('should merge global tooltip options between defaults and local options', async () => {
		await TestBed.configureTestingModule({
			imports: [HostWithExplicitPlacementComponent],
			providers: [
				provideZonelessChangeDetection(),
				FormBuilder,
				provideErrorTooltipOptions({
					textColor: '#111827',
					backgroundColor: '#fef3c7',
					borderColor: '#f97316',
					maxWidth: '480px',
					zIndex: 9999,
				}),
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostWithExplicitPlacementComponent);
		fixture.detectChanges();

		const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
		const directive = inputDebugElement.injector.get(ErrorTooltipDirective);
		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.textColor).toBe('#111827');
		expect(merged.backgroundColor).toBe('#fef3c7');
		expect(merged.borderColor).toBe('#f97316');
		expect(merged.maxWidth).toBe('480px');
		expect(merged.zIndex).toBe(2000); // local [options] wins over global options
	});

	it('should create and attach tooltip component when showErrorTooltip is called and errors exist', async () => {
		const { directive, setErrors, installFakeTooltipLifecycle } = await setupHarness(HostWithExplicitPlacementComponent);

		await setErrors({ required: 'E1' });

		const { setInputMock, fakeComponentRef, appendSpy, raf } = installFakeTooltipLifecycle();

		directive.showErrorTooltip();
		await flush2(); // let setup + RAF callback + effects run

		const optionCalls = setInputMock.mock.calls.filter((c: string[]) => c[0] === 'options');
		const errorsCalls = setInputMock.mock.calls.filter((c: string[]) => c[0] === 'errors');
		const fcCalls = setInputMock.mock.calls.filter((c: string[]) => c[0] === 'formControl');

		expect(optionCalls.length).toBeGreaterThan(0);
		expect(errorsCalls.length).toBeGreaterThan(0);
		expect(fcCalls.length).toBeGreaterThan(0);

		expect(appendSpy).toHaveBeenCalled();
		expect(fakeComponentRef.instance.showTooltip).toHaveBeenCalled();

		appendSpy.mockRestore();
		raf.restore();
	});

	it('should call displayTooltip when errors exist', async () => {
		const { directive, setErrors } = await setupHarness(HostWithExplicitPlacementComponent);

		const spy = vi.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors({ required: 'Error' });

		directive.showErrorTooltip();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should NOT call displayTooltip when no errors exist', async () => {
		const { directive, setErrors } = await setupHarness(HostWithExplicitPlacementComponent);

		const spy = vi.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors(null);

		directive.showErrorTooltip();
		expect(spy).not.toHaveBeenCalled();
	});

	it('should flatten all errors when showFirstErrorOnly = false', async () => {
		const { directive, fixture, component, setErrors } = await setupHarness(HostWithExplicitPlacementComponent);

		(component as any).options.set({ ...defaultOptions, showFirstErrorOnly: false });
		fixture.detectChanges();
		await flush2();

		await setErrors({
			arr: [{ text: 'E1' }, { text: 'E2' }],
			str: 'E3',
			num: 123,
		});

		const payloads = (directive as any).errorPayloads() as any[];
		expect(payloads).toEqual(['E1', 'E2', 'E3']);
	});

	it('should return only first error when showFirstErrorOnly = true', async () => {
		const { directive, fixture, component, setErrors } = await setupHarness(HostWithExplicitPlacementComponent);

		(component as any).options.set({ ...defaultOptions, showFirstErrorOnly: true });
		fixture.detectChanges();
		await flush2();

		await setErrors({
			arr: [{ text: 'E1' }, { text: 'E2' }],
			str: 'E3',
		});

		const payloads = (directive as any).errorPayloads() as any[];
		expect(payloads).toEqual(['E1']);
	});

	it('should include TriLangText errors (and not filter them out)', async () => {
		const { directive, fixture, component, setErrors } = await setupHarness(HostWithExplicitPlacementComponent);

		(component as any).options.set({ ...defaultOptions, showFirstErrorOnly: false });
		fixture.detectChanges();
		await flush2();

		const tri = { de: 'DE', fr: 'FR', en: 'EN' };

		await setErrors({
			required: tri,
			passwordErrors: [{ text: tri }],
			foo: 'E1',
			num: 123,
			obj: { any: 'thing' },
		});

		const payloads = (directive as any).errorPayloads() as any[];
		expect(payloads).toEqual([tri, tri, 'E1']);
	});

	it('should update tooltip options when options change but keep placement from explicit input', async () => {
		// Avoid NG0100: set placement before first detectChanges
		await TestBed.configureTestingModule({
			imports: [HostWithExplicitPlacementComponent],
			providers: [provideZonelessChangeDetection(), FormBuilder],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostWithExplicitPlacementComponent);
		const component = fixture.componentInstance;

		component.placement = 'right';
		(component as any).options.set({ placement: 'top', zIndex: 2000 });

		fixture.detectChanges();
		await flush2();

		const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
		const directive = inputDebugElement.injector.get(ErrorTooltipDirective);

		(component as any).form.get('name')!.setErrors({ required: 'E1' });
		fixture.detectChanges();
		await flush2();

		const raf = mockAsyncRaf();
		const { fakeComponentRef, setInputMock } = makeFakeTooltipRef();
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		(directive as any).setupTooltipComponent = () => {
			(directive as any).refToTooltip.set(fakeComponentRef);
			document.body.appendChild(fakeComponentRef.location.nativeElement);
		};

		directive.showErrorTooltip();
		await flush2();

		(component as any).options.set({ placement: 'bottom', zIndex: 1 });
		fixture.detectChanges();
		await flush2();

		const optionCalls = setInputMock.mock.calls
			.filter(c => c[0] === 'options')
			.map(c => c[1] as ErrorTooltipOptions);

		const last = optionCalls[optionCalls.length - 1];
		expect(last.placement).toBe('right'); // explicit placement wins
		expect(last.zIndex).toBe(1);

		appendSpy.mockRestore();
		raf.restore();
	});

	it('should display tooltip on form submit if errors exist', async () => {
		const { directive, setErrors, getFormDir } = await setupHarness(HostWithExplicitPlacementComponent);

		const spy = vi.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors({ required: 'Required' });

		getFormDir().ngSubmit.emit();
		await flush2();

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should NOT show tooltip on form submit when control has no errors', async () => {
		const { directive, setErrors, getFormDir } = await setupHarness(HostWithExplicitPlacementComponent);

		const spy = vi.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors(null);

		getFormDir().ngSubmit.emit();
		await flush2();

		expect(spy).not.toHaveBeenCalled();
	});

	it('should destroy tooltip component correctly', async () => {
		const { directive } = await setupHarness(HostWithExplicitPlacementComponent);

		const destroyMock = vi.fn();
		const nextSpy = vi.spyOn((directive as any).tooltipDestroyed$, 'next');

		(directive as any).refToTooltip.set({
			instance: {},
			setInput: vi.fn(),
			destroy: destroyMock,
			location: { nativeElement: document.createElement('div') },
		});
		(directive as any).isTooltipVisible.set(true);
		(directive as any).formControlPosition.set({ top: 1, left: 1 } as any);

		(directive as any).destroyTooltip();

		expect(nextSpy).toHaveBeenCalled();
		expect(destroyMock).toHaveBeenCalled();
		expect((directive as any).refToTooltip()).toBeNull();
		expect((directive as any).isTooltipVisible()).toBe(false);
		expect((directive as any).formControlPosition()).toBeNull();
	});

	it('should safely handle destroyTooltip when no tooltip exists', async () => {
		const { directive } = await setupHarness(HostWithExplicitPlacementComponent);

		(directive as any).refToTooltip.set(null);
		expect(() => (directive as any).destroyTooltip()).not.toThrow();
	});

	it('should append tooltip to host parent when appendTooltipToBody is false', async () => {
		const { directive, fixture, component, inputDebugElement } = await setupHarness(HostWithExplicitPlacementComponent);

		(component as any).options.set({ appendTooltipToBody: false });
		fixture.detectChanges();
		await flush2();

		const tooltipElement = document.createElement('div');
		const fakeComponentRef = {
			instance: {
				showTooltip: vi.fn(),
				setVisibilityAndPosition: vi.fn(),
				userClickOnTooltip$: new Subject<void>(),
			},
			setInput: vi.fn(),
			destroy: vi.fn(),
			location: { nativeElement: tooltipElement },
		};

		vi.spyOn((directive as any).viewContainerRef, 'createComponent').mockReturnValue(fakeComponentRef as any);

		(directive as any).setupTooltipComponent();

		expect(inputDebugElement.nativeElement.parentElement.contains(tooltipElement)).toBe(true);
	});

	it('should hide the tooltip when the user clicks the tooltip', async () => {
		const { directive } = await setupHarness(HostWithExplicitPlacementComponent);
		const click$ = new Subject<void>();
		const destroySpy = vi.spyOn(directive as any, 'destroyTooltip');

		const fakeComponent = {
			showTooltip: vi.fn(),
			setVisibilityAndPosition: vi.fn(),
			userClickOnTooltip$: click$,
		};

		(directive as any).refToTooltip.set({
			instance: fakeComponent,
			setInput: vi.fn(),
			destroy: vi.fn(),
			location: { nativeElement: document.createElement('div') },
		});
		(directive as any).isTooltipVisible.set(true);

		(directive as any).attachListeners(fakeComponent);
		click$.next();

		expect(destroySpy).toHaveBeenCalled();
	});

	it('should update tooltip position when the host position changes', async () => {
		const { directive } = await setupHarness(HostWithExplicitPlacementComponent);
		const fakeComponent = {
			showTooltip: vi.fn(),
			setVisibilityAndPosition: vi.fn(),
			userClickOnTooltip$: new Subject<void>(),
		};

		(directive as any).refToTooltip.set({
			instance: fakeComponent,
			setInput: vi.fn(),
			destroy: vi.fn(),
			location: { nativeElement: document.createElement('div') },
		});
		(directive as any).isTooltipVisible.set(true);
		(directive as any).formControlPosition.set({ top: 1, left: 1 } as DOMRect);

		vi.spyOn(directive as any, 'getFormControlPosition').mockReturnValue({ top: 2, left: 3 } as DOMRect);

		(directive as any).attachListeners(fakeComponent);
		vi.advanceTimersByTime(300);

		expect(fakeComponent.setVisibilityAndPosition).toHaveBeenCalled();
		expect((directive as any).formControlPosition()).toEqual({ top: 2, left: 3 });
	});
});

/* ======================================================================================
   SUITE B: NO explicit [placement] => placement must change via options
====================================================================================== */
describe('ErrorTooltipDirective (signals-based inputs, zoneless) — host OPTIONS ONLY (no explicit placement binding)', () => {
	it('should update tooltip placement when options change (no explicit placement binding)', async () => {
		const { fixture, component, directive, setErrors } = await setupHarness(HostOptionsOnlyComponent);

		await setErrors({ required: 'E1' });

		const raf = mockAsyncRaf();
		const { fakeComponentRef, setInputMock } = makeFakeTooltipRef();
		vi.spyOn(document.body, 'appendChild');

		(directive as any).setupTooltipComponent = () => {
			(directive as any).refToTooltip.set(fakeComponentRef);
			document.body.appendChild(fakeComponentRef.location.nativeElement);
		};

		directive.showErrorTooltip();
		await flush2();

		(component as any).options.set({ placement: 'bottom', zIndex: 1 });
		fixture.detectChanges();
		await flush2();

		const optionCalls = setInputMock.mock.calls
			.filter(c => c[0] === 'options')
			.map(c => c[1] as ErrorTooltipOptions);

		const last = optionCalls[optionCalls.length - 1];
		expect(last.placement).toBe('bottom');
		expect(last.zIndex).toBe(1);

		raf.restore();
	});
});
