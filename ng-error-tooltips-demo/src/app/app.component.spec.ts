import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CustomSigValidators } from '@ng-error-tooltips';
import { FormBuilder } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {

	const signalValidatorsMock: Partial<CustomSigValidators> = {
		// i18n
		requiredI18n() {},
		minLengthI18n() {},
		maxLengthI18n() {},
		lettersOnlyI18n() {},
		minValueI18n() {},
		maxValueI18n() {},
		regexPatternI18n() {},

		// legacy
		required() {},
		minLength() {},
	};

await TestBed.configureTestingModule({
  imports: [AppComponent],
  providers: [
    FormBuilder,
    provideZonelessChangeDetection(),
    { provide: CustomSigValidators, useValue: signalValidatorsMock },
  ],
})
  .overrideComponent(AppComponent, {
    set: {
      // Minimal template: avoids instantiating FormField / tooltip directives
      template: `<div></div>`,
    },
  })
  .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize nameInput control with correct validators', () => {
    const nameInput = component?.formGroup?.get('nameInput');
    expect(nameInput).toBeTruthy();
    expect(nameInput?.validator).toBeTruthy();
  });

  it('should initialize ageInput control with correct validators', () => {
    const ageInput = component?.formGroup?.get('ageInput');
    expect(ageInput).toBeTruthy();
    expect(ageInput?.validator).toBeTruthy();
  });

  it('should mark all controls as touched when form is invalid on submit', () => {
    const nameInput = component?.formGroup?.get('nameInput');
    const ageInput = component?.formGroup?.get('ageInput');

    // Set form controls to invalid values
    nameInput?.setValue('');
    ageInput?.setValue('');

    component.submitReactiveForm();

    expect(nameInput?.touched).toBe(true);
    expect(ageInput?.touched).toBe(true);
  });

});
