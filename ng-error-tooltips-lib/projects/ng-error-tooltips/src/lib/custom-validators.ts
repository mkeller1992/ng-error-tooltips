import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

	// Format numbers without decimal places using the Swiss locale
	private static formatNumber(value: number): string {
		return new Intl.NumberFormat('de-CH', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	/* ERROR MESSAGES for VALIDATORS */

	private static ERROR_MESSAGES = {
		required: () => 'Eingabe erforderlich',
		minlength: (minLength: number) => `Min. Länge: ${CustomValidators.formatNumber(minLength)} Zeichen`,
		maxLength: (maxLength: number) => `Max. Länge: ${CustomValidators.formatNumber(maxLength)} Zeichen`,

		minValue: (minValue: number) => `Muss mindestens ${minValue} betragen`,
		formattedMinValue: (minValue: number) => `Muss mindestens ${CustomValidators.formatNumber(minValue)} betragen`,

		maxValue: (maxValue: number) => `Darf maximal ${maxValue} betragen`,
		formattedMaxValue: (maxValue: number) => `Darf maximal ${CustomValidators.formatNumber(maxValue)} betragen`,

		smallerThan: (referenceValue: number) => `Muss kleiner sein als ${referenceValue}`,
		formattedSmallerThan: (referenceValue: number) => `Muss kleiner sein als ${CustomValidators.formatNumber(referenceValue)}`,

		greaterThan: (referenceValue: number) => `Muss grösser sein als ${referenceValue}`,
		formattedGreaterThan: (referenceValue: number) => `Muss grösser sein als ${CustomValidators.formatNumber(referenceValue)}`,

		lettersOnly: () => 'Nur Buchstaben sind erlaubt',
		minNumberOfDigits: (minNumb: number) => `Muss mindestens ${CustomValidators.formatNumber(minNumb)} Nummern enthalten`,
		minNumberOfCapitalLetters: (minNumb: number) => `Muss mindestens ${CustomValidators.formatNumber(minNumb)} Grossbuchstaben enthalten`,

		invalidEmail: () => 'Ungültige E-Mail Adresse'
	};

	/* VALIDATORS (returning error-messages as well) */

	static required(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.required();
			const isEmpty = control.value === null || control.value === undefined || control.value === '';
			// object-property-name must be unique among validators:
			return isEmpty ? { required: errorMsg } : null;
		};
	}

	static minLength(minLength: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.minlength(minLength);
			// object-property-name must be unique among validators:
			return !!control.value && control.value.length < minLength ? { minLength: errorMsg } : null;
		};
	}

	static maxLength(maxLength: number, errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.maxLength(maxLength);
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

			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.smallerThan(referenceValue);
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

			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.formattedSmallerThan(referenceValue);
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
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.greaterThan(referenceValue);
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
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.formattedGreaterThan(referenceValue);
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
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.minValue(referenceValue);
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
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.formattedMinValue(referenceValue);
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

			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.maxValue(referenceValue);
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

			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.formattedMaxValue(referenceValue);
			// object-property-name must be unique among validators:
			return numericValue > referenceValue ? { smallerThan: errorMsg } : null;
		};
	}

	static lettersOnly(errorMessage?: string): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const errorMsg = errorMessage ?? this.ERROR_MESSAGES.lettersOnly();
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
				const errorMsg = errorMessage ?? this.ERROR_MESSAGES.invalidEmail();
				return { invalidEmail: errorMsg };
		  }

		  // If validation passes, return null (no error)
		  return null;
		};
	}

	/* Can show *MULTIPLE* errors at once: */

	static passwordErrors(minLength: number, minDigits: number, minCapitalLetters: number){
		return (control:AbstractControl)=> {
			const isEmpty = !control.value.length;
			const violatesMinLength =  isEmpty || control.value.length < minLength;
			const violatesMinDigits = isEmpty || control.value.split('').filter((c: any) => !isNaN(c)).length < minDigits;
			const violatesMinCapitalLetters = isEmpty|| control.value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitalLetters;

			const errors = [{
				error: violatesMinLength,
				text: this.ERROR_MESSAGES.minlength(minLength)
			},
			{
				error: violatesMinDigits,
				text: this.ERROR_MESSAGES.minNumberOfDigits(minDigits)
			},
			{
				error: violatesMinCapitalLetters,
				text: this.ERROR_MESSAGES.minNumberOfCapitalLetters(minCapitalLetters)
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

}
