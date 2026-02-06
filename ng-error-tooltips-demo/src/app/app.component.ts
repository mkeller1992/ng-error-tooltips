import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators, ErrorTooltipDirective, ErrorTooltipOptions, type SupportedLanguage, type TriLangText } from '@ng-error-tooltips';
import { demoLang } from './app.config';

interface SignalFormSchema {
	nameInput: string;
	ageInput: number;
	employeeIdInput: string;
	legacyNameInput: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, ErrorTooltipDirective],
})
export class AppComponent implements OnInit {
  	private readonly formBuilder = inject(FormBuilder);

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

	readonly signalFormSchema = signal<SignalFormSchema>({
		nameInput: '',
		ageInput: 0,
		employeeIdInput: '',
		legacyNameInput: '',
	});

	signalForm: any;

	ngOnInit(): void {

		/*
		this.signalForm  = form(this.signalFormSchema, path => {
		// CustomValidatorsSignal.maxLength(path.nameInput, 10);
	});
	*/

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

	submit() {
		this.formGroup.markAllAsTouched();
		if (!this.formGroup.valid) { 
			return;
		}
	}
}
