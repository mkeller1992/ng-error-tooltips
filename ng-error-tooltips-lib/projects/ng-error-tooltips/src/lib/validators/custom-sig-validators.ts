import { SchemaPath } from '@angular/forms/signals';
import { ERROR_MESSAGES, tri } from './error-messages.const';
import { TriLangText } from './tri-lang-text.type';
import { inject, Injectable, Signal } from '@angular/core';
import { ERROR_TOOLTIP_SIG_VALIDATE } from '../error-tooltip-sig-validate.token';

type TriLangTextLike = TriLangText | Signal<TriLangText | null | undefined> | (() => TriLangText | null | undefined);

@Injectable({ providedIn: 'root' })
export class CustomSigValidators {
	private readonly validate = inject(ERROR_TOOLTIP_SIG_VALIDATE);

	private resolveTriLangText(v?: TriLangTextLike): TriLangText | null {
		if (!v) return null;
		if (typeof v === 'function') return (v as () => TriLangText | null | undefined)() ?? null;
		if (typeof v === 'object') {
			// Signal is a function at runtime. But typing-wise it's an object here if it comes through Signal<T>.
			// In Angular signals, `Signal<T>` is callable, so we handle it via "as any".
			const maybeFn = v as any;
			return typeof maybeFn === 'function' ? (maybeFn() ?? null) : (v as TriLangText);
		}
		return null;
	}

	required(path: SchemaPath<any>, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.required.de();
			const value = ctx.value();
			const isEmpty =
				value === null || value === undefined || value === '' ||
				(Array.isArray(value) && value.length === 0);

			return isEmpty ? { kind: 'required', message: errorMsg } : undefined;
		});
	}

	trueRequired(path: SchemaPath<boolean | null | undefined>, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const msg = errorMessage ?? ERROR_MESSAGES.trueRequired.de();
			return ctx.value() === true ? undefined : { kind: 'trueRequired', message: msg };
		});
	}

	minLength(path: SchemaPath<string | number | null | undefined>, minLength: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.minLength.de(minLength);
			const value = ctx.value();
			const str = value === null || value === undefined ? '' : String(value);
			return !!str && str.length < minLength
				? { kind: 'minLength', message: errorMsg }
				: undefined;
		});
	}

	maxLength(path: SchemaPath<string | number | null | undefined>, maxLength: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.maxLength.de(maxLength);
			const value = ctx.value();
			const str = value === null || value === undefined ? '' : String(value);
			return !!str && str.length > maxLength
				? { kind: 'maxLength', message: errorMsg }
				: undefined;
		});
	}

	smallerThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			// If it's not a number, do not this.validate
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.smallerThan.de(referenceValue);
			return numericValue >= referenceValue
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	formattedSmallerThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedSmallerThan.de(referenceValue);
			return numericValue >= referenceValue
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	greaterThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.greaterThan.de(referenceValue);
			return numericValue <= referenceValue
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	formattedGreaterThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedGreaterThan.de(referenceValue);
			return numericValue <= referenceValue
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	minValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.minValue.de(referenceValue);

			// NOTE: replicate exactly your legacy keying: { greaterThan: msg }
			return numericValue < referenceValue
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	formattedMinValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedMinValue.de(referenceValue);

			// replicate legacy keying
			return numericValue < referenceValue
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	maxValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.maxValue.de(referenceValue);
			return numericValue > referenceValue
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	formattedMaxValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const errorMsg = errorMessage ?? ERROR_MESSAGES.formattedMaxValue.de(referenceValue);
			return numericValue > referenceValue
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	lettersOnly(path: SchemaPath<string | null | undefined>, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ?? ERROR_MESSAGES.lettersOnly.de();
			const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string (keep behaviour consistent with other optional validators)
			if (value === null || value === undefined || value === '') return undefined;

			const isValid = regex.test(value);
			return isValid ? undefined : { kind: 'lettersOnly', message: errorMsg };
		});
	}

	email(path: SchemaPath<string | null | undefined>, errorMessage?: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === '') return undefined;

			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailRegex.test(value)) {
				const errorMsg = errorMessage ?? ERROR_MESSAGES.invalidEmail.de();
				return { kind: 'invalidEmail', message: errorMsg };
			}

			return undefined;
		});
	}

	/* Can show *MULTIPLE* errors at once: */

	passwordErrors(
		path: SchemaPath<string | null | undefined>,
		minLength: number,
		minDigits: number,
		minCapitalLetters: number
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value() ?? '';

			const isEmpty = !value.length;
			const violatesMinLength = isEmpty || value.length < minLength;
			const violatesMinDigits = isEmpty || value.split('').filter((c: any) => !isNaN(c)).length < minDigits;
			const violatesMinCapitalLetters =
				isEmpty || value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitalLetters;

			const errors = [
				{ error: violatesMinLength, text: ERROR_MESSAGES.minLength.de(minLength) },
				{ error: violatesMinDigits, text: ERROR_MESSAGES.minNumberOfDigits.de(minDigits) },
				{ error: violatesMinCapitalLetters, text: ERROR_MESSAGES.minNumberOfCapitalLetters.de(minCapitalLetters) },
			];

			const errorsInFormControl = errors.filter(e => e.error === true);

			return errorsInFormControl.length
				? errorsInFormControl.map(e => ({ kind: 'passwordErrors', message: e.text }))
				: undefined;
		});
	}

	regexPattern(path: SchemaPath<string | null | undefined>, pattern: RegExp, errorMessage: string): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation if the value is empty (null = valid):
			if (value === null || value === undefined || value === '') return undefined;

			const isValid = pattern.test(value);
			return isValid ? undefined : { kind: 'regexPattern', message: errorMessage };
		});
	}

	/*** i18 variants of custom validators ***/

	/* VALIDATORS (returning tri-language error messages) */

	requiredI18n(path: SchemaPath<any>, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const isEmpty = this.isEmptyValue(ctx.value());
			const msg = this.resolveTriLangText(errorMessage) ?? tri('required');
			return isEmpty ? { kind: 'required', message: 'i18n', i18n: msg } : undefined;
		});
	}

	trueRequiredI18n(path: SchemaPath<boolean | null | undefined>, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const msg = this.resolveTriLangText(errorMessage) ?? tri('trueRequired');
			return ctx.value() === true ? undefined : { kind: 'trueRequired', message: 'i18n', i18n: msg };
		});
	}

	minLengthI18n(path: SchemaPath<string | number | null | undefined>, minLength: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (!value) return undefined; // keep legacy behaviour (0 stays "empty", as before)
			const msg = this.resolveTriLangText(errorMessage) ?? tri('minLength', minLength);
			const str = String(value);
			return str.length < minLength ? { kind: 'minLength', message: 'i18n', i18n: msg } : undefined;
		});
	}

	maxLengthI18n(path: SchemaPath<string | number | null | undefined>, maxLength: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (!value) return undefined; // keep legacy behaviour (0 stays "empty", as before)
			const msg = this.resolveTriLangText(errorMessage) ?? tri('maxLength', maxLength);
			const str = String(value);
			return str.length > maxLength ? { kind: 'maxLength', message: 'i18n', i18n: msg } : undefined;
		});
	}

	smallerThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('smallerThan', referenceValue);
			return numericValue >= referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedSmallerThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedSmallerThan', referenceValue);
			return numericValue >= referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	greaterThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('greaterThan', referenceValue);
			return numericValue <= referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedGreaterThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedGreaterThan', referenceValue);
			return numericValue <= referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	minValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('minValue', referenceValue);
			// keep legacy keying: { greaterThan: ... }
			return numericValue < referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedMinValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedMinValue', referenceValue);
			// keep legacy keying
			return numericValue < referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	maxValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('maxValue', referenceValue);
			// keep legacy keying: { smallerThan: ... }
			return numericValue > referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedMaxValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedMaxValue', referenceValue);
			// keep legacy keying
			return numericValue > referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	lettersOnlyI18n(path: SchemaPath<string | null | undefined>, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const msg = this.resolveTriLangText(errorMessage) ?? tri('lettersOnly');
			const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
			const value = ctx.value();

			if (value === null || value === undefined || value === '') return undefined;

			const isValid = regex.test(value);
			return isValid ? undefined : { kind: 'lettersOnly', message: 'i18n', i18n: msg };
		});
	}

	emailI18n(path: SchemaPath<string | null | undefined>, errorMessage?: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			if (value === null || value === undefined || value === '') return undefined;

			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailRegex.test(value)) {
				const msg = this.resolveTriLangText(errorMessage) ?? tri('invalidEmail');
				return { kind: 'invalidEmail', message: 'i18n', i18n: msg };
			}

			return undefined;
		});
	}

	/* Can show MULTIPLE errors at once (i18n variant): */

	passwordErrorsI18n(
		path: SchemaPath<string | null | undefined>,
		minLength: number,
		minDigits: number,
		minCapitalLetters: number
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value() ?? '';
			const isEmpty = !value.length;

			const violatesMinLength = isEmpty || value.length < minLength;
			const violatesMinDigits = isEmpty || value.split('').filter((c: any) => !isNaN(c)).length < minDigits;
			const violatesMinCapitalLetters =
				isEmpty || value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitalLetters;

			const errors = [
				{ error: violatesMinLength, text: tri('minLength', minLength) },
				{ error: violatesMinDigits, text: tri('minNumberOfDigits', minDigits) },
				{ error: violatesMinCapitalLetters, text: tri('minNumberOfCapitalLetters', minCapitalLetters) },
			];

			const errorsInFormControl = errors.filter(e => e.error === true);

			return errorsInFormControl.length
				? errorsInFormControl.map(e => ({ kind: 'passwordErrors', message: 'i18n', i18n: e.text }))
				: undefined;
		});
	}

	regexPatternI18n(path: SchemaPath<string | null | undefined>, pattern: RegExp, errorMessage: TriLangTextLike): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			if (value === null || value === undefined || value === '') return undefined;

			const msg = this.resolveTriLangText(errorMessage);
			const isValid = pattern.test(value);
			return isValid ? undefined : { kind: 'regexPattern', message: 'i18n', i18n: msg };
		});
	}

	/*** Helpers ***/

	private isEmptyValue(value: unknown): boolean {
		// null / undefined / empty string
		if (value == null) {
			return true;
		}

		if (typeof value === 'string') {
			return value.trim().length === 0;
		}

		// number: treat NaN as empty
		if (typeof value === 'number') {
			return Number.isNaN(value);
		}

		// arrays
		if (Array.isArray(value)) {
			return value.length === 0;
		}

		return false;
	}

	private toNumberOrNull(value: unknown): number | null {
		if (value === null || value === undefined || value === '') {
			return null;
		}

		const n = Number(value);
		return Number.isNaN(n) ? null : n;
	}
}
