/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestBed } from '@angular/core/testing';
import { SchemaPath } from '@angular/forms/signals';

import { CustomSigValidators } from './custom-sig-validators';
import { ERROR_TOOLTIP_SIG_VALIDATE } from '../error-tooltip-sig-validate.token';

// Make error messages deterministic
jest.mock('./error-messages.const', () => ({
	ERROR_MESSAGES: {
		required: { de: () => 'required-msg' },
		trueRequired: { de: () => 'trueRequired-msg' },

		minLength: { de: (n: number) => `minLength-${n}` },
		maxLength: { de: (n: number) => `maxLength-${n}` },

		smallerThan: { de: (n: number) => `smallerThan-${n}` },
		formattedSmallerThan: { de: (n: number) => `formattedSmallerThan-${n}` },

		greaterThan: { de: (n: number) => `greaterThan-${n}` },
		formattedGreaterThan: { de: (n: number) => `formattedGreaterThan-${n}` },

		minValue: { de: (n: number) => `minValue-${n}` },
		formattedMinValue: { de: (n: number) => `formattedMinValue-${n}` },

		maxValue: { de: (n: number) => `maxValue-${n}` },
		formattedMaxValue: { de: (n: number) => `formattedMaxValue-${n}` },

		lettersOnly: { de: () => 'lettersOnly-msg' },
		invalidEmail: { de: () => 'invalidEmail-msg' },

		minNumberOfDigits: { de: (n: number) => `minDigits-${n}` },
		minNumberOfCapitalLetters: { de: (n: number) => `minCaps-${n}` },
	},
	tri: (key: string, arg?: number) => ({
		de: `${key}-de${arg != null ? `-${arg}` : ''}`,
		fr: `${key}-fr${arg != null ? `-${arg}` : ''}`,
		en: `${key}-en${arg != null ? `-${arg}` : ''}`,
	}),
}));

type ValidateFn = (path: any, validator: (ctx: { value: () => any }) => any) => void;

describe('CustomSigValidators', () => {
	let svc: CustomSigValidators;

	// Captures the last validator function registered via ERROR_TOOLTIP_SIG_VALIDATE
	let capturedValidator: ((ctx: { value: () => any }) => any) | null = null;

	const validateMock = jest.fn<ReturnType<ValidateFn>, Parameters<ValidateFn>>((_path, fn) => {
		capturedValidator = fn;
	});

	const dummyPath = {} as SchemaPath<any>;

	function runWithValue<T>(value: T): any {
		if (!capturedValidator) {
			throw new Error('No validator captured. Did you call a CustomSigValidators method first?');
		}
		return capturedValidator({ value: () => value });
	}

	beforeEach(() => {
		jest.restoreAllMocks();
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
		expect(runWithValue('')).toEqual({ kind: 'required', message: 'required-msg' });

		svc.required(dummyPath);
		expect(runWithValue(null)).toEqual({ kind: 'required', message: 'required-msg' });

		svc.required(dummyPath);
		expect(runWithValue([])).toEqual({ kind: 'required', message: 'required-msg' });
	});

	it('should validate trueRequired correctly', () => {
		svc.trueRequired(dummyPath as any);
		expect(runWithValue(true)).toBeUndefined();

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(false)).toEqual({ kind: 'trueRequired', message: 'trueRequired-msg' });

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(null)).toEqual({ kind: 'trueRequired', message: 'trueRequired-msg' });

		svc.trueRequired(dummyPath as any);
		expect(runWithValue(undefined)).toEqual({ kind: 'trueRequired', message: 'trueRequired-msg' });
	});

	it('should validate minLength correctly', () => {
		svc.minLength(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toBeUndefined();

		svc.minLength(dummyPath as any, 5);
		expect(runWithValue('abc')).toEqual({ kind: 'minLength', message: 'minLength-5' });
	});

	it('should validate maxLength correctly', () => {
		svc.maxLength(dummyPath as any, 5);
		expect(runWithValue('abc')).toBeUndefined();

		svc.maxLength(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toEqual({ kind: 'maxLength', message: 'maxLength-5' });
	});

	it('should validate smallerThan correctly', () => {
		svc.smallerThan(dummyPath, 5);
		expect(runWithValue(2)).toBeUndefined();

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue(6)).toEqual({ kind: 'smallerThan', message: 'smallerThan-5' });

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.smallerThan(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedSmallerThan correctly', () => {
		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue(2)).toBeUndefined();

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue(6)).toEqual({ kind: 'smallerThan', message: 'formattedSmallerThan-5' });

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedSmallerThan(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate greaterThan correctly', () => {
		svc.greaterThan(dummyPath, 3);
		expect(runWithValue(5)).toBeUndefined();

		svc.greaterThan(dummyPath, 5);
		expect(runWithValue(5)).toEqual({ kind: 'greaterThan', message: 'greaterThan-5' });

		svc.greaterThan(dummyPath, 3);
		expect(runWithValue('')).toBeUndefined();

		svc.greaterThan(dummyPath, 3);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedGreaterThan correctly', () => {
		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue(5)).toBeUndefined();

		svc.formattedGreaterThan(dummyPath, 5);
		expect(runWithValue(5)).toEqual({ kind: 'greaterThan', message: 'formattedGreaterThan-5' });

		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedGreaterThan(dummyPath, 3);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate minValue correctly (legacy keying => kind "greaterThan")', () => {
		svc.minValue(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.minValue(dummyPath, 5);
		expect(runWithValue(3)).toEqual({ kind: 'greaterThan', message: 'minValue-5' });

		svc.minValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.minValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedMinValue correctly (legacy keying => kind "greaterThan")', () => {
		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue(3)).toEqual({ kind: 'greaterThan', message: 'formattedMinValue-5' });

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedMinValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate maxValue correctly', () => {
		svc.maxValue(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.maxValue(dummyPath, 5);
		expect(runWithValue(10)).toEqual({ kind: 'smallerThan', message: 'maxValue-5' });

		svc.maxValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.maxValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate formattedMaxValue correctly', () => {
		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue(10)).toEqual({ kind: 'smallerThan', message: 'formattedMaxValue-5' });

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.formattedMaxValue(dummyPath, 5);
		expect(runWithValue('abc')).toBeUndefined();
	});

	it('should validate lettersOnly correctly', () => {
		svc.lettersOnly(dummyPath as any);
		expect(runWithValue('abc')).toBeUndefined();

		svc.lettersOnly(dummyPath as any);
		expect(runWithValue('123')).toEqual({ kind: 'lettersOnly', message: 'lettersOnly-msg' });
	});

	it('should validate email correctly', () => {
		svc.email(dummyPath as any);
		expect(runWithValue('test@example.com')).toBeUndefined();

		svc.email(dummyPath as any);
		expect(runWithValue('invalid-email')).toEqual({ kind: 'invalidEmail', message: 'invalidEmail-msg' });

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
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

		svc.requiredI18n(dummyPath);
		expect(runWithValue('abc')).toBeUndefined();

		svc.requiredI18n(dummyPath);
		const res = runWithValue('');
		expect(res).toEqual({
			kind: 'required',
			message: 'i18n',
			i18n: { de: 'required-de', fr: 'required-fr', en: 'required-en' },
		});

		warnSpy.mockRestore();
	});

	it('should validate trueRequiredI18n correctly', () => {
		svc.trueRequiredI18n(dummyPath as any);
		expect(runWithValue(true)).toBeUndefined();

		svc.trueRequiredI18n(dummyPath as any);
		expect(runWithValue(false)).toEqual({
			kind: 'trueRequired',
			message: 'i18n',
			i18n: { de: 'trueRequired-de', fr: 'trueRequired-fr', en: 'trueRequired-en' },
		});
	});

	it('should validate minLengthI18n correctly (keeps legacy: skip empty)', () => {
		svc.minLengthI18n(dummyPath as any, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.minLengthI18n(dummyPath as any, 5);
		expect(runWithValue('abc')).toEqual({
			kind: 'minLength',
			message: 'i18n',
			i18n: { de: 'minLength-de-5', fr: 'minLength-fr-5', en: 'minLength-en-5' },
		});
	});

	it('should validate maxLengthI18n correctly (keeps legacy: skip empty)', () => {
		svc.maxLengthI18n(dummyPath as any, 5);
		expect(runWithValue('')).toBeUndefined();

		svc.maxLengthI18n(dummyPath as any, 5);
		expect(runWithValue('abcdef')).toEqual({
			kind: 'maxLength',
			message: 'i18n',
			i18n: { de: 'maxLength-de-5', fr: 'maxLength-fr-5', en: 'maxLength-en-5' },
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
			i18n: { de: 'smallerThan-de-5', fr: 'smallerThan-fr-5', en: 'smallerThan-en-5' },
		});
	});

	it('should validate minValueI18n correctly (legacy keying => kind "greaterThan")', () => {
		svc.minValueI18n(dummyPath, 5);
		expect(runWithValue(10)).toBeUndefined();

		svc.minValueI18n(dummyPath, 5);
		expect(runWithValue(3)).toEqual({
			kind: 'greaterThan',
			message: 'i18n',
			i18n: { de: 'minValue-de-5', fr: 'minValue-fr-5', en: 'minValue-en-5' },
		});
	});

	it('should validate maxValueI18n correctly (legacy keying => kind "smallerThan")', () => {
		svc.maxValueI18n(dummyPath, 5);
		expect(runWithValue(3)).toBeUndefined();

		svc.maxValueI18n(dummyPath, 5);
		expect(runWithValue(10)).toEqual({
			kind: 'smallerThan',
			message: 'i18n',
			i18n: { de: 'maxValue-de-5', fr: 'maxValue-fr-5', en: 'maxValue-en-5' },
		});
	});

	it('should validate emailI18n correctly', () => {
		svc.emailI18n(dummyPath as any);
		expect(runWithValue('')).toBeUndefined();

		svc.emailI18n(dummyPath as any);
		expect(runWithValue('invalid-email')).toEqual({
			kind: 'invalidEmail',
			message: 'i18n',
			i18n: { de: 'invalidEmail-de', fr: 'invalidEmail-fr', en: 'invalidEmail-en' },
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
		const tri = { de: 'DE', fr: 'FR', en: 'EN' };

		svc.regexPatternI18n(dummyPath as any, pattern, tri as any);
		expect(runWithValue('abc')).toBeUndefined();

		svc.regexPatternI18n(dummyPath as any, pattern, tri as any);
		expect(runWithValue('123')).toEqual({
			kind: 'regexPattern',
			message: 'i18n',
			i18n: tri,
		});

		svc.regexPatternI18n(dummyPath as any, pattern, tri as any);
		expect(runWithValue(undefined)).toBeUndefined();
	});
});
