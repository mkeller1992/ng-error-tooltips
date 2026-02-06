import { SchemaPath, validate } from '@angular/forms/signals';
import { ERROR_MESSAGES, tri } from './error-messages.const';
import { TriLangText } from './tri-lang-text.type';

export class CustomValidatorsSignal {
  /* VALIDATORS (returning error-messages as well) */

  static required(path: SchemaPath<any>, errorMessage?: string): void {
    validate(path, (ctx) => {
      const errorMsg = errorMessage ?? ERROR_MESSAGES.required.de();
      const value = ctx.value();
      const isEmpty =
        value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0);

      return isEmpty ? { kind: 'required', message: errorMsg } : undefined;
    });
  }

  static trueRequired(path: SchemaPath<boolean>, errorMessage?: string): void {
    validate(path, (ctx) => {
      const msg = errorMessage ?? ERROR_MESSAGES.trueRequired.de();
      return ctx.value() === true ? undefined : { kind: 'trueRequired', message: msg };
    });
  }

  static minLength(path: SchemaPath<string>, minLength: number, errorMessage?: string): void {
    validate(path, (ctx) => {
      const errorMsg = errorMessage ?? ERROR_MESSAGES.minLength.de(minLength);
      const value = ctx.value();
      return !!value && value.length < minLength
        ? { kind: 'minLength', message: errorMsg }
        : undefined;
    });
  }

  static maxLength(path: SchemaPath<string>, maxLength: number, errorMessage?: string): void {
    validate(path, (ctx) => {
      const errorMsg = errorMessage ?? ERROR_MESSAGES.maxLength.de(maxLength);
      const value = ctx.value();
      return !!value && value.length > maxLength
        ? { kind: 'maxLength', message: errorMsg }
        : undefined;
    });
  }

  static smallerThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
      const value = ctx.value();

      // Skip validation for null, undefined, or empty string
      if (value === null || value === undefined || value === '') return undefined;

      const numericValue = Number(value);
      // If it's not a number, do not validate
      if (isNaN(numericValue)) return undefined;

      const errorMsg = errorMessage ?? ERROR_MESSAGES.smallerThan.de(referenceValue);
      return numericValue >= referenceValue
        ? { kind: 'smallerThan', message: errorMsg }
        : undefined;
    });
  }

  static formattedSmallerThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static greaterThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static formattedGreaterThan(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static minValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static formattedMinValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static maxValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static formattedMaxValue(path: SchemaPath<any>, referenceValue: number, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static lettersOnly(path: SchemaPath<string>, errorMessage?: string): void {
    validate(path, (ctx) => {
      const errorMsg = errorMessage ?? ERROR_MESSAGES.lettersOnly.de();
      const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
      const isValid = regex.test(ctx.value());
      return isValid ? undefined : { kind: 'lettersOnly', message: errorMsg };
    });
  }

  static email(path: SchemaPath<string>, errorMessage?: string): void {
    validate(path, (ctx) => {
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

  static passwordErrors(path: SchemaPath<string>, minLength: number, minDigits: number, minCapitalLetters: number): void {
    validate(path, (ctx) => {
      const value = ctx.value();

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

  static regexPattern(path: SchemaPath<string>, pattern: RegExp, errorMessage: string): void {
    validate(path, (ctx) => {
      const value = ctx.value();

      // Skip validation if the value is empty (null = valid):
      if (value === null || value === undefined || value === '') return undefined;

      const isValid = pattern.test(value);
      return isValid ? undefined : { kind: 'regexPattern', message: errorMessage };
    });
  }

  /*** i18 variants of custom validators ***/

  /* VALIDATORS (returning tri-language error messages) */

  static requiredI18n(path: SchemaPath<any>, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const isEmpty = this.isEmptyValue(ctx.value());
      const msg = errorMessage ?? tri('required');
      return isEmpty ? { kind: 'required', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static trueRequiredI18n(path: SchemaPath<boolean>, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const msg = errorMessage ?? tri('trueRequired');
      return ctx.value() === true ? undefined : { kind: 'trueRequired', message: 'i18n', i18n: msg };
    });
  }

  static minLengthI18n(path: SchemaPath<string>, minLength: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const value = ctx.value();
      if (!value) return undefined; // keep legacy behaviour
      const msg = errorMessage ?? tri('minLength', minLength);
      return value.length < minLength ? { kind: 'minLength', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static maxLengthI18n(path: SchemaPath<string>, maxLength: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const value = ctx.value();
      if (!value) return undefined; // keep legacy behaviour
      const msg = errorMessage ?? tri('maxLength', maxLength);
      return value.length > maxLength ? { kind: 'maxLength', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static smallerThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('smallerThan', referenceValue);
      return numericValue >= referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static formattedSmallerThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('formattedSmallerThan', referenceValue);
      return numericValue >= referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static greaterThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('greaterThan', referenceValue);
      return numericValue <= referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static formattedGreaterThanI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('formattedGreaterThan', referenceValue);
      return numericValue <= referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static minValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('minValue', referenceValue);
      // keep legacy keying: { greaterThan: ... }
      return numericValue < referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static formattedMinValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('formattedMinValue', referenceValue);
      // keep legacy keying
      return numericValue < referenceValue ? { kind: 'greaterThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static maxValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('maxValue', referenceValue);
      // keep legacy keying: { smallerThan: ... }
      return numericValue > referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static formattedMaxValueI18n(path: SchemaPath<any>, referenceValue: number, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const numericValue = this.toNumberOrNull(ctx.value());
      if (numericValue === null) return undefined;

      const msg = errorMessage ?? tri('formattedMaxValue', referenceValue);
      // keep legacy keying
      return numericValue > referenceValue ? { kind: 'smallerThan', message: 'i18n', i18n: msg } : undefined;
    });
  }

  static lettersOnlyI18n(path: SchemaPath<string>, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const msg = errorMessage ?? tri('lettersOnly');
      const regex = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ ]*$');
      const isValid = regex.test(ctx.value());
      return isValid ? undefined : { kind: 'lettersOnly', message: 'i18n', i18n: msg };
    });
  }

  static emailI18n(path: SchemaPath<string>, errorMessage?: TriLangText): void {
    validate(path, (ctx) => {
      const value = ctx.value();

      if (value === null || value === undefined || value === '') return undefined;

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(value)) {
        const msg = errorMessage ?? tri('invalidEmail');
        return { kind: 'invalidEmail', message: 'i18n', i18n: msg };
      }

      return undefined;
    });
  }

  /* Can show MULTIPLE errors at once (i18n variant): */

  static passwordErrorsI18n(
    path: SchemaPath<string>,
    minLength: number,
    minDigits: number,
    minCapitalLetters: number
  ): void {
    validate(path, (ctx) => {
      const value = ctx.value();
      const isEmpty = !value?.length;

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

  static regexPatternI18n(path: SchemaPath<string>, pattern: RegExp, errorMessage: TriLangText): void {
    validate(path, (ctx) => {
      const value = ctx.value();

      if (value === null || value === undefined || value === '') return undefined;

      const isValid = pattern.test(value);
      return isValid ? undefined : { kind: 'regexPattern', message: 'i18n', i18n: errorMessage };
    });
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

