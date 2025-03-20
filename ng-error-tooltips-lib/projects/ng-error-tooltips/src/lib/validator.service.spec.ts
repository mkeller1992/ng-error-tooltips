import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
    let service: ValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ValidatorService],
        });
        service = TestBed.inject(ValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate required correctly', () => {
        const control = new FormControl('abc');
        const result = service.required()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('');
        const result2 = service.required()(control2);
        expect(result2).toEqual({ required: service.ERROR_MESSAGES.required() });
    });

    it('should validate minLength correctly', () => {
        const control = new FormControl('abcdef');
        const result = service.minLength(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abc');
        const result2 = service.minLength(5)(control2);
        expect(result2).toEqual({ minLength: service.ERROR_MESSAGES.minlength(5) });
    });

    it('should validate maxLength correctly', () => {
        const control = new FormControl('abc');
        const result = service.maxLength(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abcdef');
        const result2 = service.maxLength(5)(control2);
        expect(result2).toEqual({ maxLength: service.ERROR_MESSAGES.maxLength(5) });
    });

    it('should validate smallerThan correctly', () => {
        const control = new FormControl(2);
        const result = service.smallerThan(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(6);
        const result2 = service.smallerThan(5)(control2);
        expect(result2).toEqual({ smallerThan: service.ERROR_MESSAGES.smallerThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.smallerThan(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.smallerThan(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedSmallerThan correctly', () => {
        const control = new FormControl(2);
        const result = service.formattedSmallerThan(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(6);
        const result2 = service.formattedSmallerThan(5)(control2);
        expect(result2).toEqual({ smallerThan: service.ERROR_MESSAGES.formattedSmallerThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.formattedSmallerThan(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.formattedSmallerThan(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate greaterThan correctly', () => {
        const control = new FormControl(5);
        const result = service.greaterThan(3)(control);
        expect(result).toBeNull();

        const result2 = service.greaterThan(5)(control);
        expect(result2).toEqual({ greaterThan: service.ERROR_MESSAGES.greaterThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.greaterThan(3)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.greaterThan(3)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedGreaterThan correctly', () => {
        const control = new FormControl(5);
        const result = service.formattedGreaterThan(3)(control);
        expect(result).toBeNull();

        const result2 = service.formattedGreaterThan(5)(control);
        expect(result2).toEqual({ greaterThan: service.ERROR_MESSAGES.formattedGreaterThan(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.formattedGreaterThan(3)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.formattedGreaterThan(3)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate minValue correctly', () => {
        const control = new FormControl(10);
        const result = service.minValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(3);
        const result2 = service.minValue(5)(control2);
        expect(result2).toEqual({ greaterThan: service.ERROR_MESSAGES.minValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.minValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.minValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedMinValue correctly', () => {
        const control = new FormControl(10);
        const result = service.formattedMinValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(3);
        const result2 = service.formattedMinValue(5)(control2);
        expect(result2).toEqual({ greaterThan: service.ERROR_MESSAGES.formattedMinValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.formattedMinValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.formattedMinValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate maxValue correctly', () => {
        const control = new FormControl(3);
        const result = service.maxValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(10);
        const result2 = service.maxValue(5)(control2);
        expect(result2).toEqual({ smallerThan: service.ERROR_MESSAGES.maxValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.maxValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.maxValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate formattedMaxValue correctly', () => {
        const control = new FormControl(3);
        const result = service.formattedMaxValue(5)(control);
        expect(result).toBeNull();

        const control2 = new FormControl(10);
        const result2 = service.formattedMaxValue(5)(control2);
        expect(result2).toEqual({ smallerThan: service.ERROR_MESSAGES.formattedMaxValue(5) });

        const controlToIgnore = new FormControl('');
        const result3 = service.formattedMaxValue(5)(controlToIgnore);
        expect(result3).toBeNull();

        const controlToIgnore2 = new FormControl('abc');
        const result4 = service.formattedMaxValue(5)(controlToIgnore2);
        expect(result4).toBeNull();
    });

    it('should validate lettersOnly correctly', () => {
        const control = new FormControl('abc');
        const result = service.lettersOnly()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('123');
        const result2 = service.lettersOnly()(control2);
        expect(result2).toEqual({ lettersOnly: service.ERROR_MESSAGES.lettersOnly() });
    });

    it('should validate email correctly', () => {
        const control = new FormControl('test@example.com');
        const result = service.email()(control);
        expect(result).toBeNull();

        const control2 = new FormControl('invalid-email');
        const result2 = service.email()(control2);
        expect(result2).toEqual({ invalidEmail: service.ERROR_MESSAGES.invalidEmail() });

        const control3 = new FormControl(undefined);
        const result3 = service.email()(control3);
        expect(result3).toBeNull();
    });

    it('should validate passwordErrors correctly', () => {
        const control = new FormControl('Abc123');
        const result = service.passwordErrors(6, 1, 1)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('abc');
        const result2 = service.passwordErrors(6, 1, 1)(control2);
        expect(result2).toEqual({ passwordErrors: expect.any(Array) });
    });

    it('should validate regexPattern correctly', () => {
        const pattern = /^[a-zA-Z]+$/;
        const errorMessage = 'Invalid pattern';

        const control = new FormControl('abc');
        const result = service.regexPattern(pattern, errorMessage)(control);
        expect(result).toBeNull();

        const control2 = new FormControl('123');
        const result2 = service.regexPattern(pattern, errorMessage)(control2);
        expect(result2).toEqual({ regexPattern: errorMessage });

        const control3 = new FormControl(undefined);
        const result3 = service.regexPattern(pattern, errorMessage)(control3);
        expect(result3).toBeNull();
    });
});