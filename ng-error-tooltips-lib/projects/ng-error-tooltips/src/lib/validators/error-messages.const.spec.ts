import { ERROR_MESSAGES, formatNumber, isTriLangText, tri } from './error-messages.const';

describe('error-messages.const', () => {
	describe('isTriLangText', () => {
		it('should return true for objects containing de/fr/en keys', () => {
			expect(isTriLangText({ de: 'a', fr: 'b', en: 'c' })).toBe(true);
		});

		it('should return false for null/primitive/partial objects', () => {
			expect(isTriLangText(null)).toBe(false);
			expect(isTriLangText('x')).toBe(false);
			expect(isTriLangText({ de: 'a', fr: 'b' })).toBe(false);
		});
	});

	describe('formatNumber', () => {
		it('should format using Intl.NumberFormat (mocked) without decimals', () => {
			const nfSpy = jest.spyOn(Intl, 'NumberFormat').mockImplementation((() => {
				return { format: (n: number) => `FMT(${n})` } as any;
			}) as any);

			expect(formatNumber(1234)).toBe('FMT(1234)');

			nfSpy.mockRestore();
		});
	});

	describe('tri', () => {
		it('should return all three translations for MsgFn0 keys', () => {
			const t = tri('required');
			expect(t).toEqual({
				de: ERROR_MESSAGES.required.de(),
				fr: ERROR_MESSAGES.required.fr(),
				en: ERROR_MESSAGES.required.en(),
			});
		});

		it('should pass args to all languages for MsgFn1 keys', () => {
			const nfSpy = jest.spyOn(Intl, 'NumberFormat').mockImplementation((() => {
				return { format: (n: number) => `N(${n})` } as any;
			}) as any);

			const t = tri('minLength', 1000);
			expect(t.de).toContain('N(1000)');
			expect(t.fr).toContain('N(1000)');
			expect(t.en).toContain('N(1000)');

			nfSpy.mockRestore();
		});
	});
});
