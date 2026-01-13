# ng-error-tooltips

[![npm version](https://badge.fury.io/js/ng-error-tooltips.svg?icon=si%3Anpm)](https://badge.fury.io/js/ng-error-tooltips)
![build status](https://github.com/mkeller1992/ng-error-tooltips/actions/workflows/npm-publish.yml/badge.svg)
[![codecov](https://codecov.io/gh/mkeller1992/ng-error-tooltips/graph/badge.svg?token=FDYFIOR4LQ)](https://codecov.io/gh/mkeller1992/ng-error-tooltips)

An Angular library for reactive forms that displays tooltips on form inputs with errors, providing a user-friendly way to visualize validation messages.

The latest library version is compatible with **Angular 21**.  
Starting with version **20.1.0**, `ng-error-tooltips` is fully **zoneless-compatible**.

---

## Demo

https://mkeller1992.github.io/ng-error-tooltips/

---

## Install

To install the library, enter the following command in your console:

```bash
npm i ng-error-tooltips
```

---

## Setup

### For apps based on standalone components

Import `ErrorTooltipDirective` directly in your component:

```ts
import { ErrorTooltipDirective } from '@ng-error-tooltips';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ErrorTooltipDirective]
})
export class AppComponent {}
```

---

## Usage

Define a reactive form with validators in your TypeScript component.  
You can use validators from the `CustomValidators` class, which is part of this library.  
For applications with language switching support, use the `CustomValidatorsI18n` variants instead.

```ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorTooltipDirective, CustomValidators } from '@ng-error-tooltips';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [FormsModule, ReactiveFormsModule, ErrorTooltipDirective],
})
export class AppComponent {

  private readonly formBuilder = inject(FormBuilder);

  formGroup: FormGroup = this.formBuilder.group({
    nameInput: new FormControl<string>('', {
      validators: [
        CustomValidators.required(),
        CustomValidators.minLength(3),
      ],
    }),
  });
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

---

### Two ways to pass additional properties

You can pass separate properties, such as `placement`, as shown in the example below:

```html
<input
  ngErrorTooltip
  [placement]="'right'"
  formControlName="nameInput"
  placeholder="Enter your name*"
  type="text">
```

Alternatively, you can pass one or more properties via an `ErrorTooltipOptions` object:

```ts
import { ErrorTooltipOptions } from '@ng-error-tooltips';

tooltipOptions: ErrorTooltipOptions = {
  placement: 'right',
};
```

```html
<input
  formControlName="ageInput"
  ngErrorTooltip
  [options]="tooltipOptions"
  class="form-control"
  placeholder="Enter your age*"
  type="number">
```

---

## Internationalisation (i18n)

Starting with version **21.1.0**, `ng-error-tooltips` supports **reactive multi-language error messages**.

The library itself is intentionally lightweight regarding translations:

- No dependency on `ngx-translate` or similar libraries
- No internal language management
- Fully signal-based and zoneless-friendly

Your application remains the single source of truth for the active language.



### Default behaviour (no configuration)

If you do nothing, the tooltip falls back to **German (`de`)** error messages.

This guarantees **backwards compatibility** for existing applications.



### Providing the active language

To enable language switching, provide the current language as a  
`Signal<'de' | 'fr' | 'en'>` using `provideErrorTooltips`.

Example (standalone bootstrap):

```ts
import { bootstrapApplication, inject } from '@angular/core';
import { provideErrorTooltips } from '@ng-error-tooltips';
import { LanguageService } from './language.service';

export const currentLanguageCode = signal<SupportedLanguage>(defaultLanguage);

bootstrapApplication(AppComponent, {
  providers: [
    provideErrorTooltips({ lang: currentLanguageCode })
  ]
});
```

Whenever the language signal changes, all visible error tooltips update automatically.



### Using i18n-aware validators

For applications with language switching, use the `CustomValidatorsI18n` variants.

```ts
import { CustomValidatorsI18n } from '@ng-error-tooltips';

formGroup = this.fb.group({
  name: ['', [
    CustomValidatorsI18n.requiredI18n(),
    CustomValidatorsI18n.minLengthI18n(3)
  ]]
});
```

Internally, these validators return tri-language payloads:

```ts
{
  de: 'Eingabe erforderlich',
  fr: 'Saisie requise',
  en: 'Input required'
}
```

The tooltip resolves the correct language automatically.



### App-specific messages (regexPattern)

For domain-specific validation rules, all translations must be provided explicitly:

```ts
CustomValidatorsI18n.regexPatternI18n(
  /^[A-Z]{3}\d{4}$/,
  {
    de: 'Ungültiges Format',
    fr: 'Format invalide',
    en: 'Invalid format'
  }
);
```

This is intentional, as such messages are application-specific and cannot be provided by the library.



### Mixing legacy and i18n validators

You can freely mix:

- legacy validators (`CustomValidators.required()`)
- i18n validators (`CustomValidatorsI18n.requiredI18n()`)

The tooltip handles both transparently.

---

## Properties

| name | type | default | description |
|-----|------|---------|-------------|
| id | string \| number | 0 | A custom id that can be assigned to the tooltip |
| showFirstErrorOnly | boolean | false | Whether the tooltip should only display the first error if multiple errors exist |
| placement | Placement | 'bottom-left' | The position of the tooltip |
| zIndex | number | 1101 | The z-index of the tooltip |
| tooltipClass | string | '' | Additional CSS classes applied to the tooltip (`::ng-deep`) |
| shadow | boolean | true | Whether the tooltip has a shadow |
| offset | number | 8 | Offset of the tooltip relative to the element |
| width | string | '' | Fixed width of the tooltip |
| maxWidth | string | '350px' | Maximum width of the tooltip |
| pointerEvents | "auto" \| "none" | 'auto' | Whether the tooltip reacts to pointer events |

---

## Angular Jest unit tests

### Mocking `ErrorTooltipDirective`

In unit tests, you may want to replace the real directive with the mock directive provided by the library.

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
      providers: [FormBuilder]
    })
    .overrideComponent(AppComponent, {
      remove: {
        imports: [ErrorTooltipDirective]
      },
      add: {
        imports: [MockErrorTooltipDirective]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
```
