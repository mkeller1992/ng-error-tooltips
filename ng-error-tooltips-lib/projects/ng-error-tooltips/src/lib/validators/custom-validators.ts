import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ERROR_MESSAGES, tri } from './error-messages.const';
import { TriLangText } from './tri-lang-text.type';

export class CustomValidators {

	/* VALIDATORS (returning error-messages as well) */

	static required(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.required.de();
			const isEmpty = control.value === null || control.value === undefined || control.value === ''
							|| (Array.isArray(control.value) && control.value.length === 0);
			// object-property-name must be unique among validators:
			return isEmpty ? { required: errorMsg } : null;
		};
	}

	static trueRequired(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const msg = errorMessage ?? ERROR_MESSAGES.trueRequired.de();
			return control.value === true ? null : { trueRequired: msg };
		};
	}

	static minLength(minLength: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.minLength.de(minLength);
			// object-property-name must be unique among validators:
			return !!control.value && control.value.length < minLength ? { minLength: errorMsg } : null;
		};
	}

	static maxLength(maxLength: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.maxLength.de(maxLength);
			// object-property-name must be unique among validators:
			return !!control.value && control.value.length > maxLength ? { maxLength: errorMsg } : null;
		};
	}

	static smallerThan(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);

			// If it's not a number, do not validate
			if (isNaN(numericValue)) {
				return null;
			}

			const errorMsg = errorMessage ?? ERROR_MESSAGES.smallerThan.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue >= referenceValue ? { smallerThan: errorMsg } : null;
		};
	}

	static formattedSmallerThan(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);

			// If it's not a number, do not validate
			if (isNaN(numericValue)) {
				return null;
			}

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedSmallerThan.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue >= referenceValue ? { smallerThan: errorMsg } : null;
		};
	}

	static greaterThan(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);
			// If it's not a number, do not validate:
			if (isNaN(numericValue)) {
				return null;
			}
			const errorMsg = errorMessage ?? ERROR_MESSAGES.greaterThan.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue <= referenceValue ? { greaterThan: errorMsg } : null;
		};
	}

	static formattedGreaterThan(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);
			// If it's not a number, do not validate:
			if (isNaN(numericValue)) {
				return null;
			}
			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedGreaterThan.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue <= referenceValue ? { greaterThan: errorMsg } : null;
		};
	}

	static minValue(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);
			// If it's not a number, do not validate:
			if (isNaN(numericValue)) {
				return null;
			}
			const errorMsg = errorMessage ?? ERROR_MESSAGES.minValue.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue < referenceValue ? { greaterThan: errorMsg } : null;
		};
	}

	static formattedMinValue(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);
			// If it's not a number, do not validate:
			if (isNaN(numericValue)) {
				return null;
			}
			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedMinValue.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue < referenceValue ? { greaterThan: errorMsg } : null;
		};
	}

	static maxValue(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);

			// If it's not a number, do not validate
			if (isNaN(numericValue)) {
				return null;
			}

			const errorMsg = errorMessage ?? ERROR_MESSAGES.maxValue.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue > referenceValue ? { smallerThan: errorMsg } : null;
		};
	}

	static formattedMaxValue(referenceValue: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === "") {
				return null;
			}
			const numericValue = Number(value);

			// If it's not a number, do not validate
			if (isNaN(numericValue)) {
				return null;
			}

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedMaxValue.de(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue > referenceValue ? { smallerThan: errorMsg } : null;
		};
	}

	static lettersOnly(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.lettersOnly.de();
			const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
			  const isValid = regex.test(control.value);
			  // object-property-name must be unique among validators:
			  return isValid ? null : { lettersOnly : errorMsg };
		};
	}

	static email(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
		  const value = control.value;

		  // Skip validation for null, undefined, or empty string
		  if (value === null || value === undefined || value === "") {
				return null;
		  }

		  // Simple regex for email validation
		  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		  // If the value does not match the regex, return the error
		  if (!emailRegex.test(value)) {
				const errorMsg = errorMessage ?? ERROR_MESSAGES.invalidEmail.de();
				return { invalidEmail: errorMsg };
		  }

		  // If validation passes, return null (no error)
		  return null;
		};
	}

	/* Can show *MULTIPLE* errors at once: */

	static passwordErrors(minLength: number, minDigits: number, minCapitalLetters: number): ValidatorFn {
		return (control:AbstractControl)=> {
			const isEmpty = !control.value.length;
			const violatesMinLength =  isEmpty || control.value.length < minLength;
			const violatesMinDigits = isEmpty || control.value.split('').filter((c: any) => !isNaN(c)).length < minDigits;
			const violatesMinCapitalLetters = isEmpty|| control.value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitalLetters;

			const errors = [{
				error: violatesMinLength,
				text: ERROR_MESSAGES.minLength.de(minLength)
			},
			{
				error: violatesMinDigits,
				text: ERROR_MESSAGES.minNumberOfDigits.de(minDigits)
			},
			{
				error: violatesMinCapitalLetters,
				text: ERROR_MESSAGES.minNumberOfCapitalLetters.de(minCapitalLetters)
			}];

			const errorsInFormControl = errors.filter(e => e.error === true);
			return errorsInFormControl.length ? { passwordErrors: errorsInFormControl } : null;
		}
	}

	static regexPattern(pattern: RegExp, errorMessage: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;

			// Skip validation if the value is empty (null = valid):
			if (value === null || value === undefined || value === '') {
				return null;
			}

			const isValid = pattern.test(value);

			// The object property name must be unique among validators:
			return isValid ? null : { regexPattern: errorMessage };
		};
	}


	/*** i18 variants of custom validators ***/

	/* VALIDATORS (returning tri-language error messages) */

	static requiredI18n(errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const isEmpty = this.isEmptyValue(control.value);
			const msg = errorMessage ?? tri('required');
			return isEmpty ? { required: msg } : null;
		};
	}

	static trueRequiredI18n(errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const msg = errorMessage ?? tri('trueRequired');
			return control.value === true ? null : { trueRequired: msg };
		};
	}

	static minLengthI18n(minLength: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) return null; // keep legacy behaviour: only validate when there is a value
			const msg = errorMessage ?? tri('minLength', minLength);
			return value.length < minLength ? { minLength: msg } : null;
		};
	}

	static maxLengthI18n(maxLength: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) return null; // keep legacy behaviour: only validate when there is a value
			const msg = errorMessage ?? tri('maxLength', maxLength);
			return value.length > maxLength ? { maxLength: msg } : null;
		};
	}

	static smallerThanI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('smallerThan', referenceValue);
			return numericValue >= referenceValue ? { smallerThan: msg } : null;
		};
	}

	static formattedSmallerThanI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('formattedSmallerThan', referenceValue);
			return numericValue >= referenceValue ? { smallerThan: msg } : null;
		};
	}

	static greaterThanI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('greaterThan', referenceValue);
			return numericValue <= referenceValue ? { greaterThan: msg } : null;
		};
	}

	static formattedGreaterThanI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('formattedGreaterThan', referenceValue);
			return numericValue <= referenceValue ? { greaterThan: msg } : null;
		};
	}

	static minValueI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('minValue', referenceValue);
			// keep your legacy keying (even if it looks odd): { greaterThan: ... }
			return numericValue < referenceValue ? { greaterThan: msg } : null;
		};
	}

	static formattedMinValueI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('formattedMinValue', referenceValue);
			// keep your legacy keying (even if it looks odd): { greaterThan: ... }
			return numericValue < referenceValue ? { greaterThan: msg } : null;
		};
	}

	static maxValueI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('maxValue', referenceValue);
			// keep your legacy keying (even if it looks odd): { smallerThan: ... }
			return numericValue > referenceValue ? { smallerThan: msg } : null;
		};
	}

	static formattedMaxValueI18n(referenceValue: number, errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const numericValue = this.toNumberOrNull(control.value);
			if (numericValue === null) return null;

			const msg = errorMessage ?? tri('formattedMaxValue', referenceValue);
			// keep your legacy keying (even if it looks odd): { smallerThan: ... }
			return numericValue > referenceValue ? { smallerThan: msg } : null;
		};
	}

	static lettersOnlyI18n(errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const msg = errorMessage ?? tri('lettersOnly');
			const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
			const isValid = regex.test(control.value);
			return isValid ? null : { lettersOnly: msg };
		};
	}

	static emailI18n(errorMessage?: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;

			if (value === null || value === undefined || value === '') {
				return null;
			}

			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailRegex.test(value)) {
				const msg = errorMessage ?? tri('invalidEmail');
				return { invalidEmail: msg };
			}

			return null;
		};
	}

	/* Can show MULTIPLE errors at once (i18n variant): */

	static passwordErrorsI18n(minLength: number, minDigits: number, minCapitalLetters: number): ValidatorFn {
		return (control: AbstractControl) => {
			const isEmpty = !control.value?.length;

			const violatesMinLength = isEmpty || control.value.length < minLength;
			const violatesMinDigits = isEmpty || control.value.split('').filter((c: any) => !isNaN(c)).length < minDigits;
			const violatesMinCapitalLetters =
				isEmpty || control.value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitalLetters;

			// keep legacy structure: array of objects with a `text` property
			const errors = [
				{ error: violatesMinLength, text: tri('minLength', minLength) },
				{ error: violatesMinDigits, text: tri('minNumberOfDigits', minDigits) },
				{ error: violatesMinCapitalLetters, text: tri('minNumberOfCapitalLetters', minCapitalLetters) }
			];

			const errorsInFormControl = errors.filter(e => e.error === true);
			return errorsInFormControl.length ? { passwordErrors: errorsInFormControl } : null;
		};
	}

	/**
	 * i18n regexPattern:
	 * Here it's mandatory that the caller provides all three translations (app-specific text).
	 */
	static regexPatternI18n(pattern: RegExp, errorMessage: TriLangText): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;

			if (value === null || value === undefined || value === '') {
				return null;
			}

			const isValid = pattern.test(value);
			return isValid ? null : { regexPattern: errorMessage };
		};
	}


	/*** Helpers ***/

	private static isEmptyValue(value: unknown): boolean {
		return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
	}

	private static toNumberOrNull(value: unknown): number | null {
		if (value === null || value === undefined || value === '') return null;
		const n = Number(value);
		return Number.isNaN(n) ? null : n;
	}

}
