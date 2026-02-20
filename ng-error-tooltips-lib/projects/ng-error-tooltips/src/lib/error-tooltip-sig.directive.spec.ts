/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { ErrorTooltipSigDirective } from './error-tooltip-sig.directive';
import { defaultOptions } from './options/default-options.const';
import { ErrorTooltipOptions } from './options/error-tooltip-options.interface';

/**
 * Minimal shape expected by the directive.
 * (Matches: type SignalFormField = { errors(): ValidationError.WithField[]; })
 */
type SignalFormFieldLike = {
	errors(): any[];
};

/**
 * Host A: binds BOTH [options] and [placement] (explicit placement wins)
 */
@Component({
	standalone: false,
	template: `
		<input
			type="text"
			ngErrorTooltipSig
			[formField]="formField"
			[options]="options()"
			[placement]="placement">
	`
})
class HostSigWithExplicitPlacementComponent {
	// Options are signals (just like your real app usage)
	options = signal<ErrorTooltipOptions>({ placement: 'top', zIndex: 2000 });

	// Must be set BEFORE first detectChanges to avoid NG0100
	placement: any = null;

	// Errors backing signal
	private readonly _errors = signal<any[]>([]);

	// Must be a function returning a SignalFormField-like object.
	// Directive expects: input.required<() => SignalFormField>()
	formField = () =>
		({
			errors: () => this._errors(),
		} as SignalFormFieldLike);

	setErrors(errors: any[] | null) {
		this._errors.set(errors ?? []);
	}

	noop() {}
}

/**
 * Host B: binds ONLY [options] (options.placement may change tooltip placement)
 */
@Component({
	standalone: false,
	template: `
		<input
			type="text"
			ngErrorTooltipSig
			[formField]="formField"
			[options]="options()">
	`
})
class HostSigOptionsOnlyComponent {
	options = signal<ErrorTooltipOptions>({ placement: 'top', zIndex: 2000 });
	private readonly _errors = signal<any[]>([]);

	formField = () =>
		({
			errors: () => this._errors(),
		} as SignalFormFieldLike);

	setErrors(errors: any[] | null) {
		this._errors.set(errors ?? []);
	}

	noop() {}
}

/**
 * JSDOM sometimes lacks elementFromPoint. Your real tooltip uses it.
 * Provide a harmless polyfill so tests never crash (even if a real component slips through).
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

	const j: any = jest;

	// Jest fake timers path
	if (typeof j.getTimerCount === 'function') {
		j.runOnlyPendingTimers();
		await Promise.resolve();

		if (typeof j.runAllTicks === 'function') {
			j.runAllTicks();
		}

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
	const spy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(((cb: FrameRequestCallback): number => {
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
	const setInputMock = jest.fn();

	const fakeComponentRef = {
		instance: {
			showTooltip: jest.fn(),
			setVisibilityAndPosition: jest.fn(),
			userClickOnTooltip$: new Subject<void>(),
			hasErrors: jest.fn(() => true),
		},
		setInput: setInputMock,
		destroy: jest.fn(),
		location: { nativeElement: document.createElement('div') },
	};

	return { fakeComponentRef, setInputMock };
}

beforeAll(() => {
	ensureElementFromPointExists();
});

beforeEach(() => {
	jest.restoreAllMocks();
	jest.useFakeTimers();
});

afterEach(() => {
	jest.useRealTimers();
});

async function setupHarness<THost extends { setErrors: (e: any[] | null) => void }>(
	hostType: new (...args: any[]) => THost
): Promise<{
	fixture: ComponentFixture<THost>;
	component: THost;
	inputDebugElement: DebugElement;
	directive: ErrorTooltipSigDirective;
	setErrors: (errors: any[] | null) => Promise<void>;
	installFakeTooltipLifecycle: () => {
		setInputMock: jest.Mock;
		fakeComponentRef: any;
		appendSpy: jest.SpyInstance;
		raf: { restore: () => void };
	};
}> {
	await TestBed.configureTestingModule({
		declarations: [hostType],
		imports: [ErrorTooltipSigDirective],
		providers: [provideZonelessChangeDetection()],
	}).compileComponents();

	const fixture = TestBed.createComponent(hostType);
	const component = fixture.componentInstance;
	fixture.detectChanges();

	const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipSigDirective));
	const directive = inputDebugElement.injector.get(ErrorTooltipSigDirective);

	const setErrors = async (errors: any[] | null) => {
		component.setErrors(errors);
		fixture.detectChanges();
		await flush2();
	};

	const installFakeTooltipLifecycle = () => {
		const raf = mockAsyncRaf();
		const { fakeComponentRef, setInputMock } = makeFakeTooltipRef();
		const appendSpy = jest.spyOn(document.body, 'appendChild');

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

	return { fixture, component, inputDebugElement, directive, setErrors, installFakeTooltipLifecycle };
}

/* ======================================================================================
   SUITE A: explicit [placement] exists => placement must NOT change via options
====================================================================================== */
describe('ErrorTooltipSigDirective (signals forms, zoneless) — host WITH explicit placement binding', () => {
	it('should merge options correctly on initialization', async () => {
		const { directive } = await setupHarness(HostSigWithExplicitPlacementComponent);
		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.placement).toBe('top');
		expect(merged.zIndex).toBe(2000);

		expect(merged.maxWidth).toBe(defaultOptions.maxWidth);
		expect(merged.pointerEvents).toBe(defaultOptions.pointerEvents);
		expect(merged.shadow).toBe(defaultOptions.shadow);
		expect(merged.offset).toBe(defaultOptions.offset);
	});

	it('should prefer explicit input bindings over options object and defaults', async () => {
		await TestBed.configureTestingModule({
			declarations: [HostSigWithExplicitPlacementComponent],
			imports: [ErrorTooltipSigDirective],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostSigWithExplicitPlacementComponent);
		const component = fixture.componentInstance;

		component.placement = 'left' as any;
		component.options.set({ placement: 'top', zIndex: 1234 });

		fixture.detectChanges();
		await flush2();

		const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipSigDirective));
		const directive = inputDebugElement.injector.get(ErrorTooltipSigDirective);

		const merged = (directive as any).mergedOptions() as ErrorTooltipOptions;

		expect(merged.placement).toBe('left');
		expect(merged.zIndex).toBe(1234);
		expect(merged.offset).toBe(defaultOptions.offset);
	});

	it('should create and attach tooltip component when showErrorTooltip is called and errors exist', async () => {
		const { directive, setErrors, installFakeTooltipLifecycle } =
			await setupHarness(HostSigWithExplicitPlacementComponent);

		await setErrors([{ message: 'E1' }]);

		const { setInputMock, fakeComponentRef, appendSpy, raf } = installFakeTooltipLifecycle();

		directive.showErrorTooltip();
		await flush2(); // let setup + RAF callback + effects run

		const optionCalls = setInputMock.mock.calls.filter(c => c[0] === 'options');
		const errorsCalls = setInputMock.mock.calls.filter(c => c[0] === 'errors');
		const fcCalls = setInputMock.mock.calls.filter(c => c[0] === 'formControl');

		expect(optionCalls.length).toBeGreaterThan(0);
		expect(errorsCalls.length).toBeGreaterThan(0);
		expect(fcCalls.length).toBeGreaterThan(0);

		expect(appendSpy).toHaveBeenCalled();
		expect(fakeComponentRef.instance.showTooltip).toHaveBeenCalled();

		appendSpy.mockRestore();
		raf.restore();
	});

	it('should call displayTooltip when errors exist', async () => {
		const { directive, setErrors } = await setupHarness(HostSigWithExplicitPlacementComponent);

		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors([{ message: 'E1' }]);

		directive.showErrorTooltip();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should NOT call displayTooltip when no errors exist', async () => {
		const { directive, setErrors } = await setupHarness(HostSigWithExplicitPlacementComponent);

		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		await setErrors([]);

		directive.showErrorTooltip();
		expect(spy).not.toHaveBeenCalled();
	});

	it('should return only first error when showFirstErrorOnly = true', async () => {
		const { directive, fixture, component, setErrors } =
			await setupHarness(HostSigWithExplicitPlacementComponent);

		component.options.set({ ...defaultOptions, showFirstErrorOnly: true } as any);
		fixture.detectChanges();
		await flush2();

		await setErrors([{ message: 'E1' }, { message: 'E2' }]);

		const payloads = (directive as any).errorPayloads() as any[];
		expect(payloads).toEqual(['E1']);
	});

	it('should include TriLangText errors (i18n) and keep them as objects', async () => {
		const { directive, fixture, component, setErrors } =
			await setupHarness(HostSigWithExplicitPlacementComponent);

		component.options.set({ ...defaultOptions, showFirstErrorOnly: false } as any);
		fixture.detectChanges();
		await flush2();

		const tri = { de: 'DE', fr: 'FR', en: 'EN' };

		await setErrors([
			{ message: 'i18n', i18n: tri },
			{ message: 'E1' },
			{ message: 'i18n', i18n: tri },
		]);

		const payloads = (directive as any).errorPayloads() as any[];
		expect(payloads).toEqual([tri, 'E1', tri]);
	});

	it('should update tooltip options when options change but keep placement from explicit input', async () => {
		// Avoid NG0100: set placement before first detectChanges
		await TestBed.configureTestingModule({
			declarations: [HostSigWithExplicitPlacementComponent],
			imports: [ErrorTooltipSigDirective],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostSigWithExplicitPlacementComponent);
		const component = fixture.componentInstance;

		component.placement = 'right';
		component.options.set({ placement: 'top', zIndex: 2000 });

		fixture.detectChanges();
		await flush2();

		const inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipSigDirective));
		const directive = inputDebugElement.injector.get(ErrorTooltipSigDirective);

		component.setErrors([{ message: 'E1' }]);
		fixture.detectChanges();
		await flush2();

		const raf = mockAsyncRaf();
		const { fakeComponentRef, setInputMock } = makeFakeTooltipRef();
		const appendSpy = jest.spyOn(document.body, 'appendChild');

		(directive as any).setupTooltipComponent = () => {
			(directive as any).refToTooltip.set(fakeComponentRef);
			document.body.appendChild(fakeComponentRef.location.nativeElement);
		};

		directive.showErrorTooltip();
		await flush2();

		// Update options: placement in options must NOT win
		component.options.set({ placement: 'bottom', zIndex: 1 });
		fixture.detectChanges();
		await flush2();

		const optionCalls = setInputMock.mock.calls
			.filter(c => c[0] === 'options')
			.map(c => c[1] as ErrorTooltipOptions);

		const last = optionCalls[optionCalls.length - 1];
		expect(last.placement).toBe('right');
		expect(last.zIndex).toBe(1);

		appendSpy.mockRestore();
		raf.restore();
	});

	it('should destroy tooltip component correctly', async () => {
		const { directive } = await setupHarness(HostSigWithExplicitPlacementComponent);

		const destroyMock = jest.fn();

		(directive as any).refToTooltip.set({
			instance: {},
			setInput: jest.fn(),
			destroy: destroyMock,
			location: { nativeElement: document.createElement('div') },
		});
		(directive as any).isTooltipVisible.set(true);
		(directive as any).formControlPosition.set({ top: 1, left: 1 } as any);

		(directive as any).destroyTooltip();

		expect(destroyMock).toHaveBeenCalled();
		expect((directive as any).refToTooltip()).toBeNull();
		expect((directive as any).isTooltipVisible()).toBe(false);
		expect((directive as any).formControlPosition()).toBeNull();
	});

	it('should safely handle destroyTooltip when no tooltip exists', async () => {
		const { directive } = await setupHarness(HostSigWithExplicitPlacementComponent);

		(directive as any).refToTooltip.set(null);
		expect(() => (directive as any).destroyTooltip()).not.toThrow();
	});
});

/* ======================================================================================
   SUITE B: NO explicit [placement] => placement must change via options
====================================================================================== */
describe('ErrorTooltipSigDirective (signals forms, zoneless) — host OPTIONS ONLY (no explicit placement binding)', () => {
	it('should update tooltip placement when options change (no explicit placement binding)', async () => {
		const { fixture, component, directive, setErrors, installFakeTooltipLifecycle } =
			await setupHarness(HostSigOptionsOnlyComponent);

		await setErrors([{ message: 'E1' }]);

		const { setInputMock, raf } = installFakeTooltipLifecycle();

		// Create tooltip
		directive.showErrorTooltip();
		await flush2();

		// Change options: placement should now update because there's no explicit placement input
		component.options.set({ placement: 'bottom', zIndex: 1 });
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
