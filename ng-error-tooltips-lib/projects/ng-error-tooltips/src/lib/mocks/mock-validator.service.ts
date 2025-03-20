import { AbstractControl, ValidatorFn } from '@angular/forms';

export class MockValidatorService {
  required(errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  minLength(minLength: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  maxLength(maxLength: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  smallerThan(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  formattedSmallerThan(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  greaterThan(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  formattedGreaterThan(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  minValue(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  formattedMinValue(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  maxValue(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  formattedMaxValue(referenceValue: number, errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }

  lettersOnly(errorMessage?: string): ValidatorFn {
    return (_: AbstractControl) => null;
  }
}
