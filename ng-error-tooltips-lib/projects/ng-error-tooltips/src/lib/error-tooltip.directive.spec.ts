/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormGroupDirective, NgControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ErrorTooltipDirective } from './error-tooltip.directive';
import { NgErrorTooltipComponent } from './ng-error-tooltip.component';

@Component({
	standalone: false,
	template: `<input type="text" ngErrorTooltip [options]="options">`
})
class TestHostComponent {
	options = { placement: 'top', animationDuration: 300 };
}

describe('ErrorTooltipDirective', () => {
	let component: TestHostComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let inputDebugElement: DebugElement;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
		  declarations: [TestHostComponent],
		  imports: [ErrorTooltipDirective, NgErrorTooltipComponent, ReactiveFormsModule],  // Notice the inclusion of ErrorTooltipComponent here
		  providers: [
				provideZonelessChangeDetection(),
				{ provide: NgControl, useValue: { control: { errors: null, touched: false } } },
				FormGroupDirective,
				ControlContainer
		  ]
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		component = fixture.componentInstance;
		inputDebugElement = fixture.debugElement.query(By.directive(ErrorTooltipDirective));
		fixture.detectChanges();
	});

	it('should merge options correctly on initialization', () => {
		const directiveInstance = inputDebugElement.injector.get(ErrorTooltipDirective);
		expect(directiveInstance['mergedOptions'].placement).toEqual('top');
	  });

});
