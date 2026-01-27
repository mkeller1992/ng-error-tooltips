import { TriLangText } from "./tri-lang-text.type";

type MsgFn0 = () => string;
type MsgFn1 = (n: number) => string;

/**
 * Format numbers without decimal places using the Swiss locale.
 * Note: I keep de-CH formatting here intentionally (Swiss thousands separator),
 * regardless of UI language, because these are mostly "numeric hints".
 */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat('de-CH', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(value);
}

/**
 * Central error message catalog (DE/FR/EN).
 * Keys should match the error-keys used in validators.
 */
export const ERROR_MESSAGES = {
	required: {
		de: (() => 'Eingabe erforderlich') satisfies MsgFn0,
		fr: (() => 'Saisie requise') satisfies MsgFn0,
		en: (() => 'Input required') satisfies MsgFn0
	},

	trueRequired: {
		de: () => 'Bitte bestätigen.',
		en: () => 'Please confirm.',
		fr: () => 'Veuillez confirmer.',
	},

	minLength: {
		de: ((min: number) => `Min. Länge: ${formatNumber(min)} Zeichen`) satisfies MsgFn1,
		fr: ((min: number) => `Longueur min. : ${formatNumber(min)} caractères`) satisfies MsgFn1,
		en: ((min: number) => `Min. length: ${formatNumber(min)} characters`) satisfies MsgFn1
	},

	maxLength: {
		de: ((max: number) => `Max. Länge: ${formatNumber(max)} Zeichen`) satisfies MsgFn1,
		fr: ((max: number) => `Longueur max. : ${formatNumber(max)} caractères`) satisfies MsgFn1,
		en: ((max: number) => `Max. length: ${formatNumber(max)} characters`) satisfies MsgFn1
	},

	minValue: {
		de: ((min: number) => `Muss mindestens ${min} betragen`) satisfies MsgFn1,
		fr: ((min: number) => `Doit être au moins ${min}`) satisfies MsgFn1,
		en: ((min: number) => `Must be at least ${min}`) satisfies MsgFn1
	},

	formattedMinValue: {
		de: ((min: number) => `Muss mindestens ${formatNumber(min)} betragen`) satisfies MsgFn1,
		fr: ((min: number) => `Doit être au moins ${formatNumber(min)}`) satisfies MsgFn1,
		en: ((min: number) => `Must be at least ${formatNumber(min)}`) satisfies MsgFn1
	},

	maxValue: {
		de: ((max: number) => `Darf maximal ${max} betragen`) satisfies MsgFn1,
		fr: ((max: number) => `Ne doit pas dépasser ${max}`) satisfies MsgFn1,
		en: ((max: number) => `Must not exceed ${max}`) satisfies MsgFn1
	},

	formattedMaxValue: {
		de: ((max: number) => `Darf maximal ${formatNumber(max)} betragen`) satisfies MsgFn1,
		fr: ((max: number) => `Ne doit pas dépasser ${formatNumber(max)}`) satisfies MsgFn1,
		en: ((max: number) => `Must not exceed ${formatNumber(max)}`) satisfies MsgFn1
	},

	smallerThan: {
		de: ((ref: number) => `Muss kleiner sein als ${ref}`) satisfies MsgFn1,
		fr: ((ref: number) => `Doit être inférieur à ${ref}`) satisfies MsgFn1,
		en: ((ref: number) => `Must be less than ${ref}`) satisfies MsgFn1
	},

	formattedSmallerThan: {
		de: ((ref: number) => `Muss kleiner sein als ${formatNumber(ref)}`) satisfies MsgFn1,
		fr: ((ref: number) => `Doit être inférieur à ${formatNumber(ref)}`) satisfies MsgFn1,
		en: ((ref: number) => `Must be less than ${formatNumber(ref)}`) satisfies MsgFn1
	},

	greaterThan: {
		de: ((ref: number) => `Muss grösser sein als ${ref}`) satisfies MsgFn1,
		fr: ((ref: number) => `Doit être supérieur à ${ref}`) satisfies MsgFn1,
		en: ((ref: number) => `Must be greater than ${ref}`) satisfies MsgFn1
	},

	formattedGreaterThan: {
		de: ((ref: number) => `Muss grösser sein als ${formatNumber(ref)}`) satisfies MsgFn1,
		fr: ((ref: number) => `Doit être supérieur à ${formatNumber(ref)}`) satisfies MsgFn1,
		en: ((ref: number) => `Must be greater than ${formatNumber(ref)}`) satisfies MsgFn1
	},

	lettersOnly: {
		de: (() => 'Nur Buchstaben sind erlaubt') satisfies MsgFn0,
		fr: (() => 'Seules les lettres sont autorisées') satisfies MsgFn0,
		en: (() => 'Only letters are allowed') satisfies MsgFn0
	},

	minNumberOfDigits: {
		de: ((min: number) => `Muss mindestens ${formatNumber(min)} Nummern enthalten`) satisfies MsgFn1,
		fr: ((min: number) => `Doit contenir au moins ${formatNumber(min)} chiffres`) satisfies MsgFn1,
		en: ((min: number) => `Must contain at least ${formatNumber(min)} digits`) satisfies MsgFn1
	},

	minNumberOfCapitalLetters: {
		de: ((min: number) => `Muss mindestens ${formatNumber(min)} Grossbuchstaben enthalten`) satisfies MsgFn1,
		fr: ((min: number) => `Doit contenir au moins ${formatNumber(min)} majuscules`) satisfies MsgFn1,
		en: ((min: number) => `Must contain at least ${formatNumber(min)} capital letters`) satisfies MsgFn1
	},

	invalidEmail: {
		de: (() => 'Ungültige E-Mail-Adresse') satisfies MsgFn0,
		fr: (() => 'Adresse e-mail invalide') satisfies MsgFn0,
		en: (() => 'Invalid email address') satisfies MsgFn0
	}
} as const;

/**
 * Helper: returns all three translations for a given key.
 * Args must match the function signature of the DE variant for that key.
 */
export function tri<K extends keyof typeof ERROR_MESSAGES>
	(key: K, ...args: Parameters<(typeof ERROR_MESSAGES)[K]['de']>): TriLangText {
	return {
		de: (ERROR_MESSAGES[key].de as any)(...args),
		fr: (ERROR_MESSAGES[key].fr as any)(...args),
		en: (ERROR_MESSAGES[key].en as any)(...args)
	};
}

export function isTriLangText(v: unknown): v is TriLangText {
	return !!v && typeof v === 'object' && 'de' in (v as any) && 'fr' in (v as any) && 'en' in (v as any);
}
