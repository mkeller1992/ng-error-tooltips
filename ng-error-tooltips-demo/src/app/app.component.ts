import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators, ErrorTooltipDirective, ErrorTooltipOptions } from '@ng-error-tooltips';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, ErrorTooltipDirective],
})
export class AppComponent implements OnInit {

	formGroup: FormGroup | undefined;

  tooltipOptions: ErrorTooltipOptions = {
    placement: 'right',
  }

	constructor(private formBuilder: FormBuilder) { }
            
  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nameInput: new FormControl<string>('', { validators: [ CustomValidators.required(),
                                                             CustomValidators.minLength(3),
                                                             CustomValidators.lettersOnly(),
                                                             CustomValidators.maxLength(10)]}),
      ageInput: new FormControl<string>('', { validators: [ CustomValidators.required(),
                                                            CustomValidators.minValue(10),
                                                            CustomValidators.maxValue(100)] }),
    });
  }

  submit() {
		// This will trigger the error-tooltips to show:
		this.formGroup?.markAllAsTouched();

    if (!this.formGroup?.valid) {
			return;
		}
  }

}
