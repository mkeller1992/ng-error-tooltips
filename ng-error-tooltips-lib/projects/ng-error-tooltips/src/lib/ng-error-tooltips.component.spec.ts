import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgErrorTooltipComponent } from './ng-error-tooltip.component';
import { defaultOptions } from './default-options.const';
import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';

describe('NgErrorTooltipComponent', () => {
  let component: NgErrorTooltipComponent;
  let fixture: ComponentFixture<NgErrorTooltipComponent>;

  // Add missing jsdom API so Jest can spy on it and override it
  beforeAll(() => {
    Object.defineProperty(document, 'elementFromPoint', {
      value: () => null,
      writable: true
    });
  });

  beforeEach(async () => {
    jest.useFakeTimers(); // needed for async re-positioning

    await TestBed.configureTestingModule({
      imports: [NgErrorTooltipComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(NgErrorTooltipComponent);
    component = fixture.componentInstance;

    component.options = defaultOptions;
    component.errors = ['Required'];

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
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
        ...rect
      }) as DOMRect;

    // offsetHeight/offsetWidth are required in some code paths
    Object.defineProperty(el, 'offsetHeight', { value: rect.height ?? 30 });
    Object.defineProperty(el, 'offsetWidth', { value: rect.width ?? 200 });

    return new ElementRef(el);
  }

  // ---------------------------------------------------------
  // BASIC CREATION
  // ---------------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------------
  // applyOptions()
  // ---------------------------------------------------------

	it('should apply all default options on init', () => {
		// Trigger initial lifecycle
		fixture.detectChanges();

		// --- z-index ---
		expect(component.hostStyleZIndex).toBe(defaultOptions.zIndex);

		// --- maxWidth ---
		expect(component.hostStyleMaxWidth).toBe(defaultOptions.maxWidth);

		// --- pointer-events ---
		expect(component.hostStylePointerEvents).toBe(defaultOptions.pointerEvents);

		// --- shadow class ---
		expect(component.hostClasses).toContain('tooltip-shadow');

		// --- placement class ---
		expect(component.hostClasses).toContain(`tooltip-${defaultOptions.placement}`);

		// --- offset ---
		// offset influences positioning, not host-bound values, 
		// so we validate it by checking that component.options uses correct default
		expect(component.options.offset).toBe(defaultOptions.offset);

		// --- showFirstErrorOnly ---
		expect(component.options.showFirstErrorOnly).toBe(defaultOptions.showFirstErrorOnly);

		// --- id ---
		expect(component.options.id).toBe(defaultOptions.id);

		// --- width default (should be empty string) ---
		expect(component.hostStyleWidth).toBe('');

		// --- initial top/left (off-screen defaults from constructor) ---
		expect(component.hostStyleTop).toBe('-9999px');
		expect(component.hostStyleLeft).toBe('-9999px');
	});

  it('should apply custom tooltipClass', () => {
		component.options = { ...defaultOptions, tooltipClass: 'my-custom' };
		component.ngOnChanges({});
		fixture.detectChanges();

		expect(component.hostClasses).toContain('my-custom');
  });

	it('should remove tooltipClass when changed from a value to empty', () => {
		// Step 1: Apply 'my-custom'
		component.options = { ...defaultOptions, tooltipClass: 'my-custom' };
		component.ngOnChanges({});
		fixture.detectChanges();
		expect(component.hostClasses).toContain('my-custom');

		// Step 2: Remove it
		component.options = { ...defaultOptions, tooltipClass: '' };
		component.ngOnChanges({});
		fixture.detectChanges();

		expect(component.hostClasses).not.toContain('my-custom');
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

		// Both references must be the same element
		component.formControl = control.nativeElement;

		// Make tooltip think the control is not covered
		(document.elementFromPoint as any) = () => control.nativeElement;

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		expect(component.hostClasses).toContain('tooltip-show');
		expect(component.hostClasses).not.toContain('tooltip-display-none');
	});

	it('should hide tooltip when element is covered', () => {
		const control = mockFormControl();
		component.formControl = control.nativeElement;

		// Fake: Something else covers the control
		(document.elementFromPoint as any) = () => document.createElement('div');

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		expect(component.hostClasses).toContain('tooltip-hide');
		expect(component.hostClasses).toContain('tooltip-display-none');
	});

	// ---------------------------------------------------------
	// POSITIONING (PLACEMENT)
	// ---------------------------------------------------------

	it('should calculate correct top/left for "bottom" placement', () => {
		const control = mockFormControl();
		component.formControl = control.nativeElement;

		// Control is visible / not covered
		(document.elementFromPoint as any) = () => control.nativeElement;

		component.options = { ...defaultOptions, placement: 'bottom' };

		// Provide tooltip size
		Object.defineProperty(fixture.nativeElement, 'clientHeight', { value: 40 });
		Object.defineProperty(fixture.nativeElement, 'clientWidth', { value: 120 });

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		const expectedTop = 100 + 30 + defaultOptions.offset!;
		const expectedLeft = 50 + 200 / 2 - 120 / 2;

		expect(component.hostStyleTop).toBe(`${expectedTop}px`);
		expect(component.hostStyleLeft).toBe(`${expectedLeft}px`);
	});

	it('should position correctly for "left" placement', () => {
		const control = mockFormControl();
		component.formControl = control.nativeElement;

		(document.elementFromPoint as any) = () => control.nativeElement;

		component.options = { ...defaultOptions, placement: 'left' };

		Object.defineProperty(fixture.nativeElement, 'clientWidth', { value: 80 });
		Object.defineProperty(fixture.nativeElement, 'clientHeight', { value: 40 });

		component.showTooltip(control);
		jest.runOnlyPendingTimers();
		fixture.detectChanges();

		const expectedLeft = 50 - 80 - defaultOptions.offset!;

		expect(component.hostStyleLeft).toBe(`${expectedLeft}px`);
	});

	// ---------------------------------------------------------
	// STYLE SIGNALS
	// ---------------------------------------------------------

	it('should update z-index when changed in options', () => {
		component.options = { ...defaultOptions, zIndex: 888 };
		component.ngOnChanges({});
		fixture.detectChanges();

		expect(component.hostStyleZIndex).toBe(888);
	});

	it('should update width from options', () => {
		component.options = { ...defaultOptions, width: '300px' };
		component.ngOnChanges({});
		fixture.detectChanges();

		expect(component.hostStyleWidth).toBe('300px');
	});
});
