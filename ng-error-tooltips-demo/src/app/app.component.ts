import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorTooltipDirective, ErrorTooltipOptions, ValidatorService } from '@ng-error-tooltips';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, ErrorTooltipDirective],
})
export class AppComponent {

	formGroup: FormGroup;

  tooltipOptions: ErrorTooltipOptions = {
    placement: 'right',
  }

	constructor(private formBuilder: FormBuilder,
              private validatorsSvc: ValidatorService) {
    
    this.formGroup = this.formBuilder.group({
      nameInput: new FormControl<string>('', { validators: [ this.validatorsSvc.required(), 
                                                             this.validatorsSvc.minLength(3) ] }),
      ageInput: new FormControl<string>('', { validators: [ this.validatorsSvc.required(), 
                                                            this.validatorsSvc.minValue(10),
                                                            this.validatorsSvc.maxValue(100) ] }),
    });
  }

  submit() {
		// This will trigger the error-tooltips to show:
		this.formGroup.markAllAsTouched();

    if (!this.formGroup.valid) {
			return;
		}
  }

}
