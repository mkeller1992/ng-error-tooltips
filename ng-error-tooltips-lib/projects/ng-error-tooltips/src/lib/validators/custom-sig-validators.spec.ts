/* eslint-disable @typescript-eslint/no-unused-vars */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SchemaPath } from '@angular/forms/signals';
import { signal } from '@angular/core';

import { CustomSigValidators } from './custom-sig-validators';
import { ERROR_MESSAGES, tri } from './error-messages.const';
import { ERROR_TOOLTIP_SIG_VALIDATE } from '../error-tooltip-sig-validate.token';

type ValidateFn = (path: any, validator: (ctx: { value: () => any }) => any) => void;

describe('CustomSigValidators', () => {
	let svc: CustomSigValidators;

	// Captures the last validator function registered via ERROR_TOOLTIP_SIG_VALIDATE
	let capturedValidator: ((ctx: { value: () => any }) => any) | null = null;

	const validateMock = vi.fn<ValidateFn>((_path, fn) => { capturedValidator = fn; });
	const dummyPath = {} as SchemaPath<any>;

	function runWithValue<T>(value: T): any {
		if (!capturedValidator) {
			throw new Error('No validator captured. Did you call a CustomSigValidators method first?');
		}
		return capturedValidator({ value: () => value });
	}

	beforeEach(() => {
		vi.clearAllMocks();
		capturedValidator = null;

		TestBed.configureTestingModule({
			providers: [
				CustomSigValidators,
				{ provide: ERROR_TOOLTIP_SIG_VALIDATE, useValue: validateMock },
			],
		});

		svc = TestBed.inject(CustomSigValidators);
	});

	it('should be created', () => {
		expect(svc).toBeTruthy();
	});

	it('should validate required correctly', () => {
		svc.required(dummyPath);
		expect(runWithValue('abc')).toBeUndefined();

		svc.required(dummyPath);
		expect(runWithValue('')).toEqual({ kind: 'required', message: ERROR_MESSAGES.required.de() });

		svc.required(dummyPath);
		expect(runWithValue(null)).toEqual({ kind: 'required', message: ERROR_MESSAGES.required.de() });

		svc.required(dummyPath);
		expect(runWithValue([])).toEqual({ kind: 'required', message: ERROR_MESSAGES.required.de() });
	});

	it('should validate trueRequired correctly', () => {
		svc.trueRequired(dummyPath as any);
		expect(runWithValue(true)).toBeUndefined();

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(false)).toEqual({ kind: 'trueRequired', message: ERROR_MESSAGES.trueRequired.de() });

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(null)).toEqual({ kind: 'trueRequired', message: ERROR_MESSAGES.trueRequired.de() });

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(undefined)).toEqual({ kind: 'trueRequired', message: ERROR_MESSAGES.trueRequired.de() });
	});

	it('should validate minLength correctly', () => {
		svc.minLength(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toBeUndefined();

		svc.minLength(dummyPath as any, 5);
		expect(runWithValue('abc')).toEqual({ kind: 'minLength', message: ERROR_MESSAGES.minLength.de(5) });
	});

	it('should validate maxLength correctly', () => {
		svc.maxLength(dummyPath as any, 5);
		expect(runWithValue('abc')).toBeUndefined();

		svc.maxLength(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toEqual({ kind: 'maxLength', message: ERROR_MESSAGES.maxLength.de(5) });
	});

	it('should validate smallerThan correctly', () => {
		svc.smallerThan(dummyPath, 5);
		expect(runWithValue(2)).toBeUndefined();

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue(6)).toEqual({ kind: 'smallerThan', message: ERROR_MESSAGES.smallerThan.de(5) });

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedSmallerThan correctly', () => {
		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue(2)).toBeUndefined();

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue(6)).toEqual({
			kind: 'smallerThan',
			message: ERROR_MESSAGES.formattedSmallerThan.de(5),
		});

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate greaterThan correctly', () => {
		svc.greaterThan(dummyPath, 3);
		expect(runWithValue(5)).toBeUndefined();

		svc.greaterThan(dummyPath, 5);
		expect(runWithValue(5)).toEqual({ kind: 'greaterThan', message: ERROR_MESSAGES.greaterThan.de(5) });

		svc.greaterThan(dummyPath, 3);
		expect(runWithValue('')).toBeUndefined();

		svc.greaterThan(dummyPath, 3);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedGreaterThan correctly', () => {
		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue(5)).toBeUndefined();

		svc.formattedGreaterThan(dummyPath, 5);
		expect(runWithValue(5)).toEqual({
			kind: 'greaterThan',
			message: ERROR_MESSAGES.formattedGreaterThan.de(5),
		});

		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate minValue correctly (legacy keying => kind "greaterThan")', () => {
		svc.minValue(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.minValue(dummyPath, 5);
		expect(runWithValue(3)).toEqual({ kind: 'greaterThan', message: ERROR_MESSAGES.minValue.de(5) });

		svc.minValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.minValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedMinValue correctly (legacy keying => kind "greaterThan")', () => {
		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue(3)).toEqual({
			kind: 'greaterThan',
			message: ERROR_MESSAGES.formattedMinValue.de(5),
		});

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate maxValue correctly', () => {
		svc.maxValue(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.maxValue(dummyPath, 5);
		expect(runWithValue(10)).toEqual({ kind: 'smallerThan', message: ERROR_MESSAGES.maxValue.de(5) });

		svc.maxValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.maxValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedMaxValue correctly', () => {
		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue(10)).toEqual({
			kind: 'smallerThan',
			message: ERROR_MESSAGES.formattedMaxValue.de(5),
		});

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate lettersOnly correctly', () => {
		svc.lettersOnly(dummyPath as any);
		expect(runWithValue('abc')).toBeUndefined();

		svc.lettersOnly(dummyPath as any);
		expect(runWithValue('123')).toEqual({ kind: 'lettersOnly', message: ERROR_MESSAGES.lettersOnly.de() });
	});

	it('should validate email correctly', () => {
		svc.email(dummyPath as any);
		expect(runWithValue('test@example.com')).toBeUndefined();

		svc.email(dummyPath as any);
		expect(runWithValue('invalid-email')).toEqual({
			kind: 'invalidEmail',
			message: ERROR_MESSAGES.invalidEmail.de(),
		});

		svc.email(dummyPath as any);
		expect(runWithValue(undefined)).toBeUndefined();

		svc.email(dummyPath as any);
		expect(runWithValue('')).toBeUndefined();
	});

	it('should validate passwordErrors correctly (multiple errors possible)', () => {
		svc.passwordErrors(dummyPath as any, 6, 1, 1);

		const ok = runWithValue('Abc123');
		expect(ok).toBeUndefined();

		svc.passwordErrors(dummyPath as any, 6, 1, 1);
		const bad = runWithValue('abc');
		expect(Array.isArray(bad)).toBe(true);
		expect(bad.length).toBeGreaterThan(0);
		expect(bad[0]).toEqual({ kind: 'passwordErrors', message: expect.any(String) });
	});

	it('should validate regexPattern correctly', () => {
		const pattern = /^[a-zA-Z]+$/;
		const errorMessage = 'Invalid pattern';

		svc.regexPattern(dummyPath as any, pattern, errorMessage);
		expect(runWithValue('abc')).toBeUndefined();

		svc.regexPattern(dummyPath as any, pattern, errorMessage);
		expect(runWithValue('123')).toEqual({ kind: 'regexPattern', message: errorMessage });

		svc.regexPattern(dummyPath as any, pattern, errorMessage);
		expect(runWithValue(undefined)).toBeUndefined();
	});

	/* -----------------------------
	   i18n variants
	----------------------------- */

	it('should validate requiredI18n correctly (message="i18n" + i18n object)', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			svc.requiredI18n(dummyPath);
			expect(runWithValue('abc')).toBeUndefined();

			svc.requiredI18n(dummyPath);
			const res = runWithValue('');
			expect(res).toEqual({
				kind: 'required',
				message: 'i18n',
				i18n: tri('required'),
			});
		}
		finally {
			warnSpy.mockRestore();
		}
	});

	it('should validate trueRequiredI18n correctly', () => {
		svc.trueRequiredI18n(dummyPath as any);
		expect(runWithValue(true)).toBeUndefined();

		svc.trueRequiredI18n(dummyPath as any);
		expect(runWithValue(false)).toEqual({
			kind: 'trueRequired',
			message: 'i18n',
			i18n: tri('trueRequired'),
		});
	});

	it('should validate minLengthI18n correctly (keeps legacy: skip empty)', () => {
		svc.minLengthI18n(dummyPath as any, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.minLengthI18n(dummyPath as any, 5);
		expect(runWithValue('abc')).toEqual({
			kind: 'minLength',
			message: 'i18n',
			i18n: tri('minLength', 5),
		});
	});

	it('should validate maxLengthI18n correctly (keeps legacy: skip empty)', () => {
		svc.maxLengthI18n(dummyPath as any, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.maxLengthI18n(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toEqual({
			kind: 'maxLength',
			message: 'i18n',
			i18n: tri('maxLength', 5),
		});
	});

	it('should validate smallerThanI18n correctly (ignores empty/non-numeric)', () => {
		svc.smallerThanI18n(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.smallerThanI18n(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();

		svc.smallerThanI18n(dummyPath, 5);
		expect(runWithValue(6)).toEqual({
			kind: 'smallerThan',
			message: 'i18n',
			i18n: tri('smallerThan', 5),
		});
	});

	it('should validate minValueI18n correctly (legacy keying => kind "greaterThan")', () => {
		svc.minValueI18n(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.minValueI18n(dummyPath, 5);
		expect(runWithValue(3)).toEqual({
			kind: 'greaterThan',
			message: 'i18n',
			i18n: tri('minValue', 5),
		});
	});

	it('should validate maxValueI18n correctly (legacy keying => kind "smallerThan")', () => {
		svc.maxValueI18n(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.maxValueI18n(dummyPath, 5);
		expect(runWithValue(10)).toEqual({
			kind: 'smallerThan',
			message: 'i18n',
			i18n: tri('maxValue', 5),
		});
	});

	it('should validate emailI18n correctly', () => {
		svc.emailI18n(dummyPath as any);
		expect(runWithValue('')).toBeUndefined();

		svc.emailI18n(dummyPath as any);
		expect(runWithValue('invalid-email')).toEqual({
			kind: 'invalidEmail',
			message: 'i18n',
			i18n: tri('invalidEmail'),
		});
	});

	it('should validate passwordErrorsI18n correctly (multiple i18n errors possible)', () => {
		svc.passwordErrorsI18n(dummyPath as any, 6, 1, 1);
		expect(runWithValue('Abc123')).toBeUndefined();

		svc.passwordErrorsI18n(dummyPath as any, 6, 1, 1);
		const bad = runWithValue('abc');

		expect(Array.isArray(bad)).toBe(true);
		expect(bad.length).toBeGreaterThan(0);

		// Example shape: { kind: 'passwordErrors', message: 'i18n', i18n: TriLangText }
		expect(bad[0]).toEqual({
			kind: 'passwordErrors',
			message: 'i18n',
			i18n: expect.any(Object),
		});
	});

	it('should validate regexPatternI18n correctly', () => {
		const pattern = /^[a-zA-Z]+$/;
		const triMsg = { de: 'DE', fr: 'FR', en: 'EN' };

		svc.regexPatternI18n(dummyPath as any, pattern, triMsg as any);
		expect(runWithValue('abc')).toBeUndefined();

		svc.regexPatternI18n(dummyPath as any, pattern, triMsg as any);
		expect(runWithValue('123')).toEqual({
			kind: 'regexPattern',
			message: 'i18n',
			i18n: triMsg,
		});

		svc.regexPatternI18n(dummyPath as any, pattern, triMsg as any);
		expect(runWithValue(undefined)).toBeUndefined();
	});

	describe('additional coverage for dynamic values and remaining i18n validators', () => {
		const customTri = { de: 'DE custom', fr: 'FR custom', en: 'EN custom' };

		it('should pass the provided path and resolve dynamic string and number values', () => {
			const path = { custom: 'path' } as unknown as SchemaPath<any>;
			const minLength = vi.fn(() => 5);
			const errorMessage = vi.fn(() => 'Dynamic min length message');

			svc.minLength(path as any, minLength, errorMessage);

			expect(validateMock).toHaveBeenLastCalledWith(path, expect.any(Function));
			expect(runWithValue('abc')).toEqual({
				kind: 'minLength',
				message: 'Dynamic min length message',
			});
			expect(minLength).toHaveBeenCalled();
			expect(errorMessage).toHaveBeenCalled();
		});

		it('should resolve signal-like values for non-i18n validators', () => {
			const max = signal(3);
			const msg = signal('Too long from signal');

			svc.maxLength(dummyPath as any, max, msg);

			expect(runWithValue('abcd')).toEqual({
				kind: 'maxLength',
				message: 'Too long from signal',
			});
		});

		it('should skip optional lettersOnly values and use a custom message for invalid input', () => {
			svc.lettersOnly(dummyPath as any, 'Only letters please');
			expect(runWithValue(null)).toBeUndefined();

			svc.lettersOnly(dummyPath as any, 'Only letters please');
			expect(runWithValue(undefined)).toBeUndefined();

			svc.lettersOnly(dummyPath as any, 'Only letters please');
			expect(runWithValue('')).toBeUndefined();

			svc.lettersOnly(dummyPath as any, 'Only letters please');
			expect(runWithValue('Äpfel und Öl')).toBeUndefined();

			svc.lettersOnly(dummyPath as any, 'Only letters please');
			expect(runWithValue('abc123')).toEqual({
				kind: 'lettersOnly',
				message: 'Only letters please',
			});
		});

		it('should use dynamic thresholds for passwordErrors', () => {
			svc.passwordErrors(dummyPath as any, () => 6, () => 2, () => 2);

			const result = runWithValue('Abc1');

			expect(result).toEqual([
				{ kind: 'passwordErrors', message: ERROR_MESSAGES.minLength.de(6) },
				{ kind: 'passwordErrors', message: ERROR_MESSAGES.minNumberOfDigits.de(2) },
				{ kind: 'passwordErrors', message: ERROR_MESSAGES.minNumberOfCapitalLetters.de(2) },
			]);
		});

		it('should treat whitespace, NaN and empty arrays as empty in requiredI18n', () => {
			svc.requiredI18n(dummyPath);
			expect(runWithValue('   ')).toEqual({
				kind: 'required',
				message: 'i18n',
				i18n: tri('required'),
			});

			svc.requiredI18n(dummyPath);
			expect(runWithValue(Number.NaN)).toEqual({
				kind: 'required',
				message: 'i18n',
				i18n: tri('required'),
			});

			svc.requiredI18n(dummyPath);
			expect(runWithValue([])).toEqual({
				kind: 'required',
				message: 'i18n',
				i18n: tri('required'),
			});

			svc.requiredI18n(dummyPath);
			expect(runWithValue(0)).toBeUndefined();
		});

		it('should resolve custom i18n messages from plain objects, functions and signals', () => {
			svc.trueRequiredI18n(dummyPath as any, customTri);
			expect(runWithValue(false)).toEqual({
				kind: 'trueRequired',
				message: 'i18n',
				i18n: customTri,
			});

			svc.requiredI18n(dummyPath, () => customTri);
			expect(runWithValue('')).toEqual({
				kind: 'required',
				message: 'i18n',
				i18n: customTri,
			});

			svc.minLengthI18n(dummyPath as any, 5, signal(customTri));
			expect(runWithValue('abc')).toEqual({
				kind: 'minLength',
				message: 'i18n',
				i18n: customTri,
			});
		});

		it('should validate formattedSmallerThanI18n correctly', () => {
			svc.formattedSmallerThanI18n(dummyPath, 5);
			expect(runWithValue(2)).toBeUndefined();

			svc.formattedSmallerThanI18n(dummyPath, 5);
			expect(runWithValue('abc')).toBeUndefined();

			svc.formattedSmallerThanI18n(dummyPath, 5);
			expect(runWithValue(5)).toEqual({
				kind: 'smallerThan',
				message: 'i18n',
				i18n: tri('formattedSmallerThan', 5),
			});
		});

		it('should validate greaterThanI18n correctly', () => {
			svc.greaterThanI18n(dummyPath, 5);
			expect(runWithValue(6)).toBeUndefined();

			svc.greaterThanI18n(dummyPath, 5);
			expect(runWithValue('')).toBeUndefined();

			svc.greaterThanI18n(dummyPath, 5);
			expect(runWithValue(5)).toEqual({
				kind: 'greaterThan',
				message: 'i18n',
				i18n: tri('greaterThan', 5),
			});
		});

		it('should validate formattedGreaterThanI18n correctly', () => {
			svc.formattedGreaterThanI18n(dummyPath, 5);
			expect(runWithValue(6)).toBeUndefined();

			svc.formattedGreaterThanI18n(dummyPath, 5);
			expect(runWithValue('abc')).toBeUndefined();

			svc.formattedGreaterThanI18n(dummyPath, 5);
			expect(runWithValue(4)).toEqual({
				kind: 'greaterThan',
				message: 'i18n',
				i18n: tri('formattedGreaterThan', 5),
			});
		});

		it('should validate formattedMinValueI18n correctly', () => {
			svc.formattedMinValueI18n(dummyPath, 5);
			expect(runWithValue(5)).toBeUndefined();

			svc.formattedMinValueI18n(dummyPath, 5);
			expect(runWithValue('abc')).toBeUndefined();

			svc.formattedMinValueI18n(dummyPath, 5);
			expect(runWithValue(4)).toEqual({
				kind: 'greaterThan',
				message: 'i18n',
				i18n: tri('formattedMinValue', 5),
			});
		});

		it('should validate formattedMaxValueI18n correctly', () => {
			svc.formattedMaxValueI18n(dummyPath, 5);
			expect(runWithValue(5)).toBeUndefined();

			svc.formattedMaxValueI18n(dummyPath, 5);
			expect(runWithValue('abc')).toBeUndefined();

			svc.formattedMaxValueI18n(dummyPath, 5);
			expect(runWithValue(6)).toEqual({
				kind: 'smallerThan',
				message: 'i18n',
				i18n: tri('formattedMaxValue', 5),
			});
		});

		it('should validate lettersOnlyI18n correctly', () => {
			svc.lettersOnlyI18n(dummyPath as any);
			expect(runWithValue(null)).toBeUndefined();

			svc.lettersOnlyI18n(dummyPath as any);
			expect(runWithValue('Äpfel und Öl')).toBeUndefined();

			svc.lettersOnlyI18n(dummyPath as any);
			expect(runWithValue('abc123')).toEqual({
				kind: 'lettersOnly',
				message: 'i18n',
				i18n: tri('lettersOnly'),
			});

			svc.lettersOnlyI18n(dummyPath as any, () => customTri);
			expect(runWithValue('123')).toEqual({
				kind: 'lettersOnly',
				message: 'i18n',
				i18n: customTri,
			});
		});

		it('should use signal thresholds for i18n passwordErrors', () => {
			svc.passwordErrorsI18n(dummyPath as any, signal(6), signal(2), signal(2));

			const result = runWithValue('Abc1');

			expect(result).toEqual([
				{ kind: 'passwordErrors', message: 'i18n', i18n: tri('minLength', 6) },
				{ kind: 'passwordErrors', message: 'i18n', i18n: tri('minNumberOfDigits', 2) },
				{ kind: 'passwordErrors', message: 'i18n', i18n: tri('minNumberOfCapitalLetters', 2) },
			]);
		});
	});
});
