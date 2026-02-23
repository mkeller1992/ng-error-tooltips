# ng-error-tooltips

[![npm version](https://badge.fury.io/js/ng-error-tooltips.svg?icon=si%3Anpm)](https://badge.fury.io/js/ng-error-tooltips)
![build status](https://github.com/mkeller1992/ng-error-tooltips/actions/workflows/npm-publish.yml/badge.svg)
[![codecov](https://codecov.io/gh/mkeller1992/ng-error-tooltips/graph/badge.svg?token=FDYFIOR4LQ)](https://codecov.io/gh/mkeller1992/ng-error-tooltips)

An Angular library for **Reactive Forms** and **Signal Forms** that displays tooltips on form inputs with errors.

The latest library version is compatible with **Angular 21**.  
Starting with version **20.1.0**, `ng-error-tooltips` is fully **zoneless-compatible**.

---

## Demo

https://mkeller1992.github.io/ng-error-tooltips/

---

## Install

```bash
npm i ng-error-tooltips
```

---

## Setup

### Standalone apps (ApplicationConfig / app.config.ts)

```ts
import { ApplicationConfig, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideErrorTooltips, type SupportedLanguage } from '@ng-error-tooltips';
import { validate } from '@angular/forms/signals';

import { routes } from './app.routes';

// Demo-language signal (in real apps: inject(LanguageService).currentLanguageCode)
export const demoLang = signal<SupportedLanguage>('de');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),

    // lang is optional (defaults to 'de')
    // validate is only required for Signal Forms / CustomSigValidators
    provideErrorTooltips({ lang: demoLang, validate }),
  ],
};
```

---

## Usage

### Reactive Forms

Define a reactive form with validators in your TypeScript component.  
For applications with language switching support, use the `CustomValidatorsI18n` variants.

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

```html
<form [formGroup]="formGroup" (ngSubmit)="submit()">
  <input
    ngErrorTooltip
    formControlName="nameInput"
    placeholder="Enter your name*"
    type="text">

  <button type="submit">Submit</button>
</form>
```

### Signal Forms
When using Angular Signal Forms, you should import the bundled constant
`NG_ERROR_TOOLTIPS_SIGNAL_IMPORTS`.

This ensures that all required directives and dependencies are imported automatically — especially Angular’s `FormField`, which is required for Signal Forms but easy to forget.

```ts
import { Component, inject, signal, viewChild } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import {
  CustomSigValidators,
  NG_ERROR_TOOLTIPS_SIGNAL_IMPORTS,
  ErrorTooltipSigFormDirective
} from '@ng-error-tooltips';

interface Employee {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    ...NG_ERROR_TOOLTIPS_SIGNAL_IMPORTS
  ],
})
export class AppComponent {
  private readonly v = inject(CustomSigValidators);

  readonly ttForm = viewChild(ErrorTooltipSigFormDirective);

  readonly employee = signal<Employee>({
    name: '',
  });

  readonly signalForm = form(this.employee, path => [
    this.v.requiredI18n(path.name),
    this.v.minLengthI18n(path.name, 3),
  ]);

  async submit() {
    await submit(this.signalForm, async () => undefined);

    if (!this.signalForm().valid()) {
      this.ttForm()?.showErrorTooltips();
    }
  }
}
```

```html
<div ngErrorTooltipSigForm>
  <input
    [formField]="signalForm.name"
    ngErrorTooltipSig
    placeholder="Enter your name*"
    type="text">
</div>

<button type="button" (click)="submit()">Submit</button>
```

---

### Two ways to pass additional properties

You can pass separate properties, such as `placement`:

```html
<input
  ngErrorTooltip
  [placement]="'right'"
  formControlName="nameInput"
  placeholder="Enter your name*"
  type="text">
```

Alternatively, pass one or more properties via an `ErrorTooltipOptions` object:

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
  placeholder="Enter your age*"
  type="number">
```

**Note:** Explicit inputs (e.g. `[placement]`) override the same values provided via `[options]`.

---

## Internationalisation (i18n)

Starting with version **21.1.0**, `ng-error-tooltips` supports **reactive multi-language error messages**.

If you do nothing, the tooltip falls back to **German (`de`)** error messages.

To enable language switching, provide the current language as a `Signal<'de' | 'fr' | 'en'>` using `provideErrorTooltips`.

Whenever the language signal changes, all visible error tooltips update automatically.

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

### Mocking `ErrorTooltipDirective` (Reactive Forms)

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
      remove: { imports: [ErrorTooltipDirective] },
      add: { imports: [MockErrorTooltipDirective] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
```

### Mocking `ErrorTooltipSigDirective` and `ErrorTooltipSigFormDirective` (Signal Forms)

```ts
import { ErrorTooltipSigDirective, MockErrorTooltipSigDirective } from '@ng-error-tooltips';

await TestBed.configureTestingModule({
  imports: [AppComponent],
})
  .overrideComponent(AppComponent, {
    remove: { imports: [ErrorTooltipSigDirective, ErrorTooltipSigFormDirective] },
    add: { imports: [MockErrorTooltipSigDirective, MockErrorTooltipSigFormDirective] }
  })
  .compileComponents();
```
