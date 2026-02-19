import { SchemaPath } from '@angular/forms/signals';
import { ERROR_MESSAGES, tri } from './error-messages.const';
import { TriLangText } from './tri-lang-text.type';
import { inject, Injectable, Signal } from '@angular/core';
import { ERROR_TOOLTIP_SIG_VALIDATE } from '../error-tooltip-sig-validate.token';

type TriLangTextLike =
	| TriLangText
	| Signal<TriLangText | null | undefined>
	| (() => TriLangText | null | undefined);

type ValueLike<T> = T | Signal<T> | (() => T);

@Injectable({ providedIn: 'root' })
export class CustomSigValidators {
	private readonly validate = inject(ERROR_TOOLTIP_SIG_VALIDATE);

	private resolve<T>(v: ValueLike<T>): T {
		// Signal<T> is a function at runtime
		return typeof v === 'function' ? (v as any)() : v;
	}

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

	required(path: SchemaPath<any>, errorMessage?: ValueLike<string>): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.required.de();
			const value = ctx.value();
			const isEmpty =
				value === null || value === undefined || value === '' ||
				(Array.isArray(value) && value.length === 0);

			return isEmpty ? { kind: 'required', message: errorMsg } : undefined;
		});
	}

	trueRequired(path: SchemaPath<boolean | null | undefined>, errorMessage?: ValueLike<string>): void {
		this.validate(path, (ctx) => {
			const msg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.trueRequired.de();
			return ctx.value() === true ? undefined : { kind: 'trueRequired', message: msg };
		});
	}

	minLength(
		path: SchemaPath<string | number | null | undefined>,
		minLength: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const min = this.resolve(minLength);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.minLength.de(min);
			const value = ctx.value();
			const str = value === null || value === undefined ? '' : String(value);
			return !!str && str.length < min
				? { kind: 'minLength', message: errorMsg }
				: undefined;
		});
	}

	maxLength(
		path: SchemaPath<string | number | null | undefined>,
		maxLength: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const max = this.resolve(maxLength);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.maxLength.de(max);
			const value = ctx.value();
			const str = value === null || value === undefined ? '' : String(value);
			return !!str && str.length > max
				? { kind: 'maxLength', message: errorMsg }
				: undefined;
		});
	}

	smallerThan(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			// If it's not a number, do not this.validate
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.smallerThan.de(ref);
			return numericValue >= ref
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	formattedSmallerThan(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.formattedSmallerThan.de(ref);
			return numericValue >= ref
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	greaterThan(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.greaterThan.de(ref);
			return numericValue <= ref
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	formattedGreaterThan(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.formattedGreaterThan.de(ref);
			return numericValue <= ref
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	minValue(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.minValue.de(ref);

			// NOTE: replicate exactly your legacy keying: { greaterThan: msg }
			return numericValue < ref
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	formattedMinValue(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.formattedMinValue.de(ref);

			// replicate legacy keying
			return numericValue < ref
				? { kind: 'greaterThan', message: errorMsg }
				: undefined;
		});
	}

	maxValue(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.maxValue.de(ref);
			return numericValue > ref
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	formattedMaxValue(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (value === null || value === undefined || value === '') return undefined;

			const numericValue = Number(value);
			if (isNaN(numericValue)) return undefined;

			const ref = this.resolve(referenceValue);
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.formattedMaxValue.de(ref);
			return numericValue > ref
				? { kind: 'smallerThan', message: errorMsg }
				: undefined;
		});
	}

	lettersOnly(path: SchemaPath<string | null | undefined>, errorMessage?: ValueLike<string>): void {
		this.validate(path, (ctx) => {
			const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.lettersOnly.de();
			const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string (keep behaviour consistent with other optional validators)
			if (value === null || value === undefined || value === '') return undefined;

			const isValid = regex.test(value);
			return isValid ? undefined : { kind: 'lettersOnly', message: errorMsg };
		});
	}

	email(path: SchemaPath<string | null | undefined>, errorMessage?: ValueLike<string>): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation for null, undefined, or empty string
			if (value === null || value === undefined || value === '') return undefined;

			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailRegex.test(value)) {
				const errorMsg = errorMessage ? this.resolve(errorMessage) : ERROR_MESSAGES.invalidEmail.de();
				return { kind: 'invalidEmail', message: errorMsg };
			}

			return undefined;
		});
	}

	/* Can show *MULTIPLE* errors at once: */

	passwordErrors(
		path: SchemaPath<string | null | undefined>,
		minLength: ValueLike<number>,
		minDigits: ValueLike<number>,
		minCapitalLetters: ValueLike<number>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value() ?? '';

			const minLen = this.resolve(minLength);
			const digits = this.resolve(minDigits);
			const capitals = this.resolve(minCapitalLetters);

			const isEmpty = !value.length;
			const violatesMinLength = isEmpty || value.length < minLen;
			const violatesMinDigits = isEmpty || value.split('').filter((c: any) => !isNaN(c)).length < digits;
			const violatesMinCapitalLetters =
				isEmpty || value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < capitals;

			const errors = [
				{ error: violatesMinLength, text: ERROR_MESSAGES.minLength.de(minLen) },
				{ error: violatesMinDigits, text: ERROR_MESSAGES.minNumberOfDigits.de(digits) },
				{ error: violatesMinCapitalLetters, text: ERROR_MESSAGES.minNumberOfCapitalLetters.de(capitals) },
			];

			const errorsInFormControl = errors.filter(e => e.error === true);

			return errorsInFormControl.length
				? errorsInFormControl.map(e => ({ kind: 'passwordErrors', message: e.text }))
				: undefined;
		});
	}

	regexPattern(
		path: SchemaPath<string | null | undefined>,
		pattern: RegExp,
		errorMessage: ValueLike<string>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();

			// Skip validation if the value is empty (null = valid):
			if (value === null || value === undefined || value === '') return undefined;

			const isValid = pattern.test(value);
			return isValid ? undefined : { kind: 'regexPattern', message: this.resolve(errorMessage) };
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

	minLengthI18n(
		path: SchemaPath<string | number | null | undefined>,
		minLength: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (!value) return undefined; // keep legacy behaviour (0 stays "empty", as before)

			const min = this.resolve(minLength);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('minLength', min);

			const str = String(value);
			return str.length < min ? { kind: 'minLength', message: 'i18n', i18n: msg } : undefined;
		});
	}

	maxLengthI18n(
		path: SchemaPath<string | number | null | undefined>,
		maxLength: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value();
			if (!value) return undefined; // keep legacy behaviour (0 stays "empty", as before)

			const max = this.resolve(maxLength);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('maxLength', max);

			const str = String(value);
			return str.length > max ? { kind: 'maxLength', message: 'i18n', i18n: msg } : undefined;
		});
	}

	smallerThanI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('smallerThan', ref);
			return numericValue >= ref ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedSmallerThanI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedSmallerThan', ref);
			return numericValue >= ref ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	greaterThanI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('greaterThan', ref);
			return numericValue <= ref ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedGreaterThanI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedGreaterThan', ref);
			return numericValue <= ref ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	minValueI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('minValue', ref);
			// keep legacy keying: { greaterThan: ... }
			return numericValue < ref ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedMinValueI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedMinValue', ref);
			// keep legacy keying
			return numericValue < ref ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	maxValueI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('maxValue', ref);
			// keep legacy keying: { smallerThan: ... }
			return numericValue > ref ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
		});
	}

	formattedMaxValueI18n(
		path: SchemaPath<any>,
		referenceValue: ValueLike<number>,
		errorMessage?: TriLangTextLike
	): void {
		this.validate(path, (ctx) => {
			const numericValue = this.toNumberOrNull(ctx.value());
			if (numericValue === null) return undefined;

			const ref = this.resolve(referenceValue);
			const msg = this.resolveTriLangText(errorMessage) ?? tri('formattedMaxValue', ref);
			// keep legacy keying
			return numericValue > ref ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
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
		minLength: ValueLike<number>,
		minDigits: ValueLike<number>,
		minCapitalLetters: ValueLike<number>
	): void {
		this.validate(path, (ctx) => {
			const value = ctx.value() ?? '';
			const isEmpty = !value.length;

			const minLen = this.resolve(minLength);
			const minDigit = this.resolve(minDigits);
			const minCapitals = this.resolve(minCapitalLetters);

			const violatesMinLength = isEmpty || value.length < minLen;
			const violatesMinDigits = isEmpty || value.split('').filter((c: any) => !isNaN(c)).length < minDigit;
			const violatesMinCapitalLetters =
				isEmpty || value.split('').filter((c: any) => /^[A-Za-zÀ-ÖØ-öø-ÿ]*$/.test(c) && c === c.toUpperCase()).length < minCapitals;

			const errors = [
				{ error: violatesMinLength, text: tri('minLength', minLen) },
				{ error: violatesMinDigits, text: tri('minNumberOfDigits', minDigit) },
				{ error: violatesMinCapitalLetters, text: tri('minNumberOfCapitalLetters', minCapitals) },
			];

			const errorsInFormControl = errors.filter(e => e.error === true);

			return errorsInFormControl.length
				? errorsInFormControl.map(e => ({ kind: 'passwordErrors', message: 'i18n', i18n: e.text }))
				: undefined;
		});
	}

	regexPatternI18n(
		path: SchemaPath<string | null | undefined>,
		pattern: RegExp,
		errorMessage: TriLangTextLike
	): void {
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
