import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorTooltipDirective, ErrorTooltipOptions, ValidatorService } from '@ng-error-tooltips';

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

	constructor(private formBuilder: FormBuilder,
              private validatorsSvc: Validators) { }
            
  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nameInput: new FormControl<string>('', { validators: [ Validators.required ] }),
      ageInput: new FormControl<string>('', { validators: [ Validators.required] }),
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
