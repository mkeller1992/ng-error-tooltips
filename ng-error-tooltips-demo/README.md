# ng-error-tooltips

[![npm version](https://badge.fury.io/js/ng-error-tooltips.svg)](https://badge.fury.io/js/ng-error-tooltips)
![build status](https://github.com/mkeller1992/ng-error-tooltips/actions/workflows/npm_publish.yml/badge.svg)
[![codecov](https://codecov.io/gh/mkeller1992/ng-error-tooltips/graph/badge.svg?token=FDYFIOR4LQ)](https://codecov.io/gh/mkeller1992/ng-error-tooltips)

An Angular library for reactive forms that displays tooltips on form inputs with errors, providing a user-friendly way to visualize validation messages.

The latest library version is compatible with **Angular 19**.


## Demo
https://mkeller1992.github.io/ng-error-tooltips/

---

## Install

To install the library, enter the following command in your console:
```
npm i ng-error-tooltips
```

## Setup
### For apps based on `Standalone Components`
Import ErrorTooltipDirective directly in your component:
```ts
import { ErrorTooltipDirective } from '@ng-error-tooltips';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [ErrorTooltipDirective]
})
```

## Usage
Define a reactive form with validators in your TypeScript component. You can also use validators from the `CustomValidators` class, which is part of the current library:

```ts
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorTooltipDirective, CustomValidators } from '@ng-error-tooltips';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, ErrorTooltipDirective],
})
export class AppComponent {

  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    
    this.formGroup = this.formBuilder.group({
      nameInput: new FormControl<string>('', { validators: [ CustomValidators.required(), 
                                                             CustomValidators.minLength(3) ] }),
    });
  }
}
```

Create the corresponding form in your HTML file and add `ngErrorTooltip` to the form fields where error tooltips should be displayed.

```html
<form [formGroup]="formGroup" (ngSubmit)="submit()">

  <h4>Sample Form</h4>

  <input
      ngErrorTooltip
      formControlName="nameInput"        
      placeholder="Enter your name*"
      type="text">

  <button type="submit">Submit</button>

</form>
```

### Two ways to pass additional properties

You can pass separate properties, such as `placement`, as shown in the example below:

```html
<input
    ngErrorTooltip [placement]="'right'"
    formControlName="nameInput"        
    placeholder="Enter your name*"
    type="text">
```

Alternatively, you can pass one or more properties via an `ErrorTooltipOptions` object:

```ts
import { ErrorTooltipOptions } from '@ng-error-tooltips';

tooltipOptions: ErrorTooltipOptions = {
  placement: 'right',
}
```

```html
<input
    formControlName="ageInput"
    ngErrorTooltip [options]="tooltipOptions"
    class="form-control"
    placeholder="Enter your age*"
    type="number">
```


## Properties

| name                  | type                                  | default | description |
|-----------------------|---------------------------------------|---------|-------------|
| id                    | string \| number                      | 0       | A custom id that can be assigned to the tooltip. |
| showFirstErrorOnly    | boolean                               | false   | Whether the tooltip should only display the first error if the form-input contains multiple errors |
| placement             | Placement                             | 'bottom-left'   | The position of the tooltip. |
| zIndex                | number                                | 1101    | The z-index of the tooltip. |
| tooltipClass          | string                                | ''      | Any additional classes to be passed to the tooltip (target them with `::ng-deep`). |
| shadow                | boolean                               | true    | If true, the tooltip will have a shadow. |
| offset                | number                                | 8       | The offset of the tooltip relative to the item. |
| width                 | string                                | ''      | The width of the tooltip. |
| maxWidth              | string                                | '350px' | The maximum width of the tooltip. |
| pointerEvents         | "auto" \| "none"                      | 'auto'  | Defines whether or not the tooltip reacts to pointer events. |
---


### Angular Jest Unit-Tests: Mocking ErrorTooltipDirective and ValidatorService
In the test initialization, you might need to use `.overrideComponent` to override the actual directive with the mock directive provided by the library.

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ErrorTooltipDirective, MockErrorTooltipDirective } from '@ng-error-tooltips';
import { FormBuilder } from '@angular/forms';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        FormBuilder
      ]
    })
    .overrideComponent(AppComponent, {
      remove: {
        imports: [
          ErrorTooltipDirective
        ]
      },
      add: {
        imports: [
          MockErrorTooltipDirective
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });
})
```