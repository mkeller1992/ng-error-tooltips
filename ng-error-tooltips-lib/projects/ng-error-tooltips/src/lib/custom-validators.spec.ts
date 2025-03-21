import { FormControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';


describe('CustomValidators', () => {
    
    it('should be created', () => {
        expect(CustomValidators).toBeTruthy();
    });

    it('should validate required correctly', () => {
        const control = new FormControl('abc');
        const result = CustomValidators.required()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('');
        const result2 = CustomValidators.required()(control2);
        expect(result2).toEqual({ required: CustomValidators['ERROR_MESSAGES'].required() });
    });

    it('should validate minLength correctly', () => {
        const control = new FormControl('abcdef');
        const result = CustomValidators.minLength(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abc');
        const result2 = CustomValidators.minLength(5)(control2);
        expect(result2).toEqual({ minLength: CustomValidators['ERROR_MESSAGES'].minlength(5) });
    });

    it('should validate maxLength correctly', () => {
        const control = new FormControl('abc');
        const result = CustomValidators.maxLength(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abcdef');
        const result2 = CustomValidators.maxLength(5)(control2);
        expect(result2).toEqual({ maxLength: CustomValidators['ERROR_MESSAGES'].maxLength(5) });
    });

    it('should validate smallerThan correctly', () => {
        const control = new FormControl(2);
        const result = CustomValidators.smallerThan(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(6);
        const result2 = CustomValidators.smallerThan(5)(control2);
        expect(result2).toEqual({ smallerThan: CustomValidators['ERROR_MESSAGES'].smallerThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.smallerThan(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.smallerThan(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedSmallerThan correctly', () => {
        const control = new FormControl(2);
        const result = CustomValidators.formattedSmallerThan(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(6);
        const result2 = CustomValidators.formattedSmallerThan(5)(control2);
        expect(result2).toEqual({ smallerThan: CustomValidators['ERROR_MESSAGES'].formattedSmallerThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.formattedSmallerThan(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.formattedSmallerThan(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate greaterThan correctly', () => {
        const control = new FormControl(5);
        const result = CustomValidators.greaterThan(3)(control);
        expect(result).toBeNull();

        const result2 = CustomValidators.greaterThan(5)(control);
        expect(result2).toEqual({ greaterThan: CustomValidators['ERROR_MESSAGES'].greaterThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.greaterThan(3)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.greaterThan(3)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedGreaterThan correctly', () => {
        const control = new FormControl(5);
        const result = CustomValidators.formattedGreaterThan(3)(control);
        expect(result).toBeNull();

        const result2 = CustomValidators.formattedGreaterThan(5)(control);
        expect(result2).toEqual({ greaterThan: CustomValidators['ERROR_MESSAGES'].formattedGreaterThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.formattedGreaterThan(3)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.formattedGreaterThan(3)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate minValue correctly', () => {
        const control = new FormControl(10);
        const result = CustomValidators.minValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(3);
        const result2 = CustomValidators.minValue(5)(control2);
        expect(result2).toEqual({ greaterThan: CustomValidators['ERROR_MESSAGES'].minValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.minValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.minValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedMinValue correctly', () => {
        const control = new FormControl(10);
        const result = CustomValidators.formattedMinValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(3);
        const result2 = CustomValidators.formattedMinValue(5)(control2);
        expect(result2).toEqual({ greaterThan: CustomValidators['ERROR_MESSAGES'].formattedMinValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.formattedMinValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.formattedMinValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate maxValue correctly', () => {
        const control = new FormControl(3);
        const result = CustomValidators.maxValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(10);
        const result2 = CustomValidators.maxValue(5)(control2);
        expect(result2).toEqual({ smallerThan: CustomValidators['ERROR_MESSAGES'].maxValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.maxValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.maxValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedMaxValue correctly', () => {
        const control = new FormControl(3);
        const result = CustomValidators.formattedMaxValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(10);
        const result2 = CustomValidators.formattedMaxValue(5)(control2);
        expect(result2).toEqual({ smallerThan: CustomValidators['ERROR_MESSAGES'].formattedMaxValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = CustomValidators.formattedMaxValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = CustomValidators.formattedMaxValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate lettersOnly correctly', () => {
        const control = new FormControl('abc');
        const result = CustomValidators.lettersOnly()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('123');
        const result2 = CustomValidators.lettersOnly()(control2);
        expect(result2).toEqual({ lettersOnly: CustomValidators['ERROR_MESSAGES'].lettersOnly() });
    });

    it('should validate email correctly', () => {
        const control = new FormControl('test@example.com');
        const result = CustomValidators.email()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('invalid-email');
        const result2 = CustomValidators.email()(control2);
        expect(result2).toEqual({ invalidEmail: CustomValidators['ERROR_MESSAGES'].invalidEmail() });

        const control3 = new FormControl(undefined);
        const result3 = CustomValidators.email()(control3);
        expect(result3).toBeNull();
    });

    it('should validate passwordErrors correctly', () => {
        const control = new FormControl('Abc123');
        const result = CustomValidators.passwordErrors(6, 1, 1)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abc');
        const result2 = CustomValidators.passwordErrors(6, 1, 1)(control2);
        expect(result2).toEqual({ passwordErrors: expect.any(Array) });
    });

    it('should validate regexPattern correctly', () => {
        const pattern = /^[a-zA-Z]+$/;
        const errorMessage = 'Invalid pattern';

        const control = new FormControl('abc');
        const result = CustomValidators.regexPattern(pattern, errorMessage)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('123');
        const result2 = CustomValidators.regexPattern(pattern, errorMessage)(control2);
        expect(result2).toEqual({ regexPattern: errorMessage });

        const control3 = new FormControl(undefined);
        const result3 = CustomValidators.regexPattern(pattern, errorMessage)(control3);
        expect(result3).toBeNull();
    });
});