/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, NgControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ErrorTooltipDirective } from './error-tooltip.directive';
import { NgErrorTooltipComponent } from './ng-error-tooltip.component';
import { defaultOptions } from './default-options.const';
import type { ErrorTooltipOptions } from './error-tooltip-options.interface';

@Component({
	standalone: false,
	template: `<input type="text" ngErrorTooltip [options]="options">`
})
class TestHostComponent {
	options: Partial<ErrorTooltipOptions> = { placement: 'top', zIndex: 2000 } as any;
}

describe('ErrorTooltipDirective', () => {
	let component: TestHostComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let inputDebugElement: DebugElement;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TestHostComponent],
			imports: [ErrorTooltipDirective, NgErrorTooltipComponent, ReactiveFormsModule],
			providers: [
				provideZonelessChangeDetection(),
				{ provide: NgControl, useValue: { control: { errors: null, touched: false } } },
				{ provide: ControlContainer, useValue: { control: null, formDirective: null } }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		component = fixture.componentInstance;
		inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
		fixture.detectChanges();
	});

	function getDirectiveInstance(): ErrorTooltipDirective {
		return inputDebugElement.injector.get(ErrorTooltipDirective);
	}

	/* -------------------------------------------------------------------
		BASIC MERGING / INIT
	------------------------------------------------------------------- */

	it('should merge options correctly on initialization', () => {
		const directive = getDirectiveInstance();
		const merged = (directive as any).mergedOptions as ErrorTooltipOptions;

		expect(merged.placement).toBe('top');
		expect(merged.zIndex).toBe(2000);

		expect(merged.maxWidth).toBe(defaultOptions.maxWidth);
		expect(merged.pointerEvents).toBe(defaultOptions.pointerEvents);
		expect(merged.shadow).toBe(defaultOptions.shadow);
		expect(merged.offset).toBe(defaultOptions.offset);
	});

	it('should prefer @Input setters over options object and defaults', () => {
		const directive = getDirectiveInstance();

		directive.options = { placement: 'top', zIndex: 1234 } as any;
		directive.placement = 'left' as any;

		const merged = (directive as any).getMergedTooltipOptions() as ErrorTooltipOptions;

		expect(merged.placement).toBe('left');
		expect(merged.zIndex).toBe(1234);
		expect(merged.offset).toBe(defaultOptions.offset);
	});

	/* -------------------------------------------------------------------
    	CREATE / SHOW / HIDE TOOLTIP
  	------------------------------------------------------------------- */

	it('should create and attach tooltip component when displayTooltip is called', () => {
		const directive = getDirectiveInstance();

		// Disable destroy logic to avoid side effects during setup
		(directive as any).destroyTooltip = () => {};

		// Force requestAnimationFrame to run synchronously in Jest
		global.requestAnimationFrame = ((cb: FrameRequestCallback): number => {
			cb(0); // execute immediately
			return 0; // dummy frame ID
		}) as typeof global.requestAnimationFrame;

		// Mock mergedOptions
		(directive as any).mergedOptions = { ...defaultOptions };

		// Mock error messages so the tooltip is shown
		jest.spyOn(directive as any, 'getErrorMessages').mockReturnValue(['E1']);

		// Provide a fake host element
		(directive as any).formControlRef = { nativeElement: document.createElement('input') };

		// Prepare a fake component reference for createComponent()
		const setInputMock = jest.fn();
		const fakeComponentRef = {
			instance: { 
				showTooltip: jest.fn(), 
				userClickOnTooltip$: new Subject() 
			},
			setInput: setInputMock,
			destroy: jest.fn(),
			location: { nativeElement: document.createElement('div') }
		};

		// Replace ViewContainerRef logic
		(directive as any).viewContainerRef = {
			createComponent: () => fakeComponentRef
		};

		// Spy on appendChild but do not override its behavior
		jest.spyOn(document.body, 'appendChild');

		// --- ACT ---
		(directive as any).displayTooltip();

		// --- ASSERT ---
		expect(setInputMock).toHaveBeenCalledTimes(3);
		expect(document.body.appendChild).toHaveBeenCalled();
		expect(fakeComponentRef.instance.showTooltip).toHaveBeenCalled();
	});

	it('should call displayTooltip when errors exist', () => {
		const directive = getDirectiveInstance();
		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		jest.spyOn(directive as any, 'getErrorMessages').mockReturnValue(['Error']);
		directive.showErrorTooltip();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should NOT call displayTooltip when no errors exist', () => {
		const directive = getDirectiveInstance();
		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		jest.spyOn(directive as any, 'getErrorMessages').mockReturnValue([]);
		directive.showErrorTooltip();
		expect(spy).not.toHaveBeenCalled();
	});
	
	/* -------------------------------------------------------------------
		ERROR MESSAGE PARSING
	------------------------------------------------------------------- */

	it('should flatten all errors when showFirstErrorOnly = false', () => {
		const directive = getDirectiveInstance();
		(directive as any).mergedOptions = { ...defaultOptions, showFirstErrorOnly: false };
		(directive as any).ngControl = { errors: { arr: [{ text: 'E1' }, { text: 'E2' }], str: 'E3', num: 123 } };
		const messages = (directive as any).getErrorMessages();
		expect(messages).toEqual(['E1', 'E2', 'E3']);
	});

	it('should return only first error when showFirstErrorOnly = true', () => {
		const directive = getDirectiveInstance();
		(directive as any).mergedOptions = { ...defaultOptions, showFirstErrorOnly: true };
		(directive as any).ngControl = { errors: { arr: [{ text: 'E1' }, { text: 'E2' }], str: 'E3' } };
		const messages = (directive as any).getErrorMessages();
		expect(messages).toEqual(['E1']);
	});

	/* -------------------------------------------------------------------
		ngOnChanges
	------------------------------------------------------------------- */
	it('should update tooltip component options on change', () => {
		const directive = getDirectiveInstance();
		directive.options = { placement: 'top', zIndex: 1 } as any;
		(directive as any).mergedOptions = (directive as any).getMergedTooltipOptions();
		(directive as any).lastOptionsKey = JSON.stringify((directive as any).mergedOptions);

		const setInputMock = jest.fn();
		(directive as any).refToTooltipComponent = { setInput: setInputMock, destroy: jest.fn() };

		directive.options = { placement: 'bottom', zIndex: 1 } as any;
		directive.ngOnChanges({} as any);

		expect(setInputMock).toHaveBeenCalledTimes(1);
		const [inputName, newOptions] = setInputMock.mock.calls[0];
		expect(inputName).toBe('options');
		expect(newOptions).toEqual(expect.objectContaining({ placement: 'bottom', zIndex: 1 }));
	});

	it('should reposition tooltip when form control moves', () => {
		jest.useFakeTimers();

		const directive = getDirectiveInstance();
		const setPosSpy = jest.fn();

		(directive as any).tooltipComponent = { setVisibilityAndPosition: setPosSpy };
		(directive as any).isTooltipCreated = true;
		(directive as any).formControlPosition = { top: 10, left: 10 };
		(directive as any).getFormControlPosition = () => ({ top: 20, left: 20 });

		(directive as any).listenForPositionChangesOfFormControl();

		jest.advanceTimersByTime(300);
		expect(setPosSpy).toHaveBeenCalled();
	});

	/* -------------------------------------------------------------------
		Form Submission
	------------------------------------------------------------------- */
	it('should display tooltip on form submit if errors exist', () => {
		const directive = getDirectiveInstance();
		const submit$ = new Subject<void>();
		(directive as any).controlContainer = { control: {}, formDirective: { ngSubmit: submit$ } };
		(directive as any).ngControl = { errors: { required: 'Required' } };
		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		(directive as any).handleTooltipVisibilityOnFormSubmission();
		submit$.next();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should NOT show tooltip on submit when control has no errors', () => {
		const directive = getDirectiveInstance();
		const submit$ = new Subject<void>();
		(directive as any).controlContainer = { control: {}, formDirective: { ngSubmit: submit$ } };
		(directive as any).ngControl = { errors: null };
		const spy = jest.spyOn(directive as any, 'displayTooltip').mockImplementation(() => {});
		(directive as any).handleTooltipVisibilityOnFormSubmission();
		submit$.next();
		expect(spy).not.toHaveBeenCalled();
	});

	/* -------------------------------------------------------------------
     DestroyTooltip
  	------------------------------------------------------------------- */

	it('should destroy tooltip component correctly', () => {
		const directive = getDirectiveInstance();

		const destroyMock = jest.fn();
		const nextSpy = jest.spyOn((directive as any).tooltipDestroyed$, 'next');

		(directive as any).refToTooltipComponent = { destroy: destroyMock };
		(directive as any).isTooltipCreated = true;
		(directive as any).tooltipComponent = {};

		(directive as any).destroyTooltip();

		expect(nextSpy).toHaveBeenCalled();
		expect(destroyMock).toHaveBeenCalled();
		expect((directive as any).isTooltipCreated).toBe(false);
		expect((directive as any).tooltipComponent).toBeUndefined();
	});

	it('should safely handle destroyTooltip when no tooltip exists', () => {
		const directive = getDirectiveInstance();
		(directive as any).refToTooltipComponent = undefined;

		expect(() => (directive as any).destroyTooltip()).not.toThrow();
	});
});
