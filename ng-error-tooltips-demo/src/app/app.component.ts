import { Component, OnInit, WritableSignal, inject, signal, viewChild, viewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomSigValidators, CustomValidators, ErrorTooltipDirective, ErrorTooltipSigDirective, ErrorTooltipOptions, type SupportedLanguage, type TriLangText, ErrorTooltipSigFormDirective } from '@ng-error-tooltips';
import { demoLang } from './app.config';
import { form, FormField, submit } from '@angular/forms/signals';

interface Employee {
	nameInput: string;
	ageInput: number;
	employeeIdInput: string;
	superior: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, FormField, ErrorTooltipDirective, ErrorTooltipSigDirective,
	ErrorTooltipSigFormDirective
  ],
})
export class AppComponent implements OnInit {
  	private readonly formBuilder = inject(FormBuilder);
	private readonly v = inject(CustomSigValidators);

	readonly ttForm = viewChild(ErrorTooltipSigFormDirective);

	readonly signalTooltips = viewChildren(ErrorTooltipSigDirective);

  	formGroup!: FormGroup;

  	// demo language dropdown (Signal)
  	readonly lang: WritableSignal<SupportedLanguage> = demoLang; // Signal<SupportedLanguage>

  	readonly languages: { code: SupportedLanguage; label: string }[] = [
		{ code: 'de', label: 'Deutsch' },
		{ code: 'fr', label: 'Français' },
		{ code: 'en', label: 'English' },
	];

	tooltipOptions: ErrorTooltipOptions = {
		placement: 'right',
	};

  	// Regex example: employee id like "EMP-1234"
  	private readonly employeeIdRegex = /^EMP-\d{4}$/;

  	// This is the "exception case": app provides all 3 translations itself.
	private readonly employeeIdRegexMsg: TriLangText = {
		de: 'Ungültige Personalnummer. Erwartet: «EMP-1234».',
		fr: 'Numéro du personnel invalide. Attendu : «EMP-1234».',
		en: 'Invalid employee ID. Expected: “EMP-1234”.',
	};

	readonly employee = signal<Employee>({
		nameInput: '',
		ageInput: 0,
		employeeIdInput: '',
		superior: '',
	});

	signalForm = form(this.employee, path => {
		this.v.requiredI18n(path.nameInput),
		this.v.minLengthI18n(path.nameInput, 3),
		this.v.lettersOnlyI18n(path.nameInput),
		this.v.maxLengthI18n(path.nameInput, 10),

		this.v.requiredI18n(path.ageInput),
		this.v.minValueI18n(path.ageInput, 10),
		this.v.maxValueI18n(path.ageInput, 100),

		this.v.requiredI18n(path.employeeIdInput),
		this.v.regexPatternI18n(path.employeeIdInput, this.employeeIdRegex, this.employeeIdRegexMsg),

		this.v.required(path.superior),     // legacy (string)
		this.v.minLength(path.superior, 3)  // legacy (string)
	});

	ngOnInit(): void {
		this.formGroup = this.formBuilder.group({
			nameInput: new FormControl<string>('', {
				validators: [
					CustomValidators.requiredI18n(),
					CustomValidators.minLengthI18n(3),
					CustomValidators.lettersOnlyI18n(),
					CustomValidators.maxLengthI18n(10),
				],
			}),

			ageInput: new FormControl<string>('', {
				validators: [
					CustomValidators.requiredI18n(),
					CustomValidators.minValueI18n(10),
					CustomValidators.maxValueI18n(100),
				],
			}),

			// Regex field: app-provided i18n message
			employeeIdInput: new FormControl<string>('', {
				validators: [
					CustomValidators.requiredI18n(),
					CustomValidators.regexPatternI18n(this.employeeIdRegex, this.employeeIdRegexMsg),
				],
			}),

			// ✅ Legacy validators: still work, but stay in German (or default)
			legacyNameInput: new FormControl<string>('', {
				validators: [
					CustomValidators.required(),     // legacy (string)
					CustomValidators.minLength(3),   // legacy (string)
				],
			}),
		});
	}

	onLangChange(lang: SupportedLanguage) {
		this.lang.set(lang);
	}

	submitReactiveForm() {
		this.formGroup.markAllAsTouched();
		if (!this.formGroup.valid) { 
			return;
		}
	}

	async submitSignalForm() {
		await this.markSignalFormTouched(this.signalForm);

		if (!this.signalForm().valid()) {
			this.ttForm()?.showAll();
			return;
		}

		console.warn('Signal form submitted successfully with values:', this.signalForm().value());
	}

	private	async markSignalFormTouched(formSig: typeof this.signalForm) {
		await submit(formSig, async () => undefined);
	}
}
