import { describe, expect, it, vi } from 'vitest';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FieldTree } from '@angular/forms/signals';

import { ErrorTooltipSigDirective } from './error-tooltip-sig.directive';
import { ErrorTooltipSigFormDirective } from './error-tooltip-sig-form.directive';

type SignalFormFieldLike = FieldTree<unknown, string | number>;

@Component({
	standalone: true,
	imports: [ErrorTooltipSigDirective, ErrorTooltipSigFormDirective],
	template: `
		<section ngErrorTooltipSigForm>
			<input ngErrorTooltipSig [errorTooltipField]="firstField">
			<div>
				<input ngErrorTooltipSig [errorTooltipField]="secondField">
			</div>
		</section>
	`
})
class HostWithNestedTooltipsComponent {
	firstField = (() => ({ errors: () => [] })) as unknown as SignalFormFieldLike;
	secondField = (() => ({ errors: () => [] })) as unknown as SignalFormFieldLike;
}

@Component({
	standalone: true,
	imports: [ErrorTooltipSigFormDirective],
	template: `<section ngErrorTooltipSigForm></section>`
})
class HostWithoutTooltipsComponent {}

async function setupHost<THost>(hostType: new (...args: any[]) => THost): Promise<{
	fixture: ComponentFixture<THost>;
	formDirective: ErrorTooltipSigFormDirective;
	tooltips: ErrorTooltipSigDirective[];
}> {
	await TestBed.configureTestingModule({
		imports: [hostType],
		providers: [provideZonelessChangeDetection()],
	}).compileComponents();

	const fixture = TestBed.createComponent(hostType);
	fixture.detectChanges();

	const formDirective = fixture.debugElement
		.query(By.directive(ErrorTooltipSigFormDirective))
		.injector.get(ErrorTooltipSigFormDirective);

	const tooltips = fixture.debugElement
		.queryAll(By.directive(ErrorTooltipSigDirective))
		.map(de => de.injector.get(ErrorTooltipSigDirective));

	return { fixture, formDirective, tooltips };
}

describe('ErrorTooltipSigFormDirective', () => {
	it('should collect descendant tooltip directives', async () => {
		const { tooltips } = await setupHost(HostWithNestedTooltipsComponent);

		expect(tooltips).toHaveLength(2);
	});

	it('should delegate showErrorTooltips to all descendant tooltips', async () => {
		const { formDirective, tooltips } = await setupHost(HostWithNestedTooltipsComponent);
		const showSpies = tooltips.map(t => vi.spyOn(t, 'showErrorTooltip').mockImplementation(() => {}));

		formDirective.showErrorTooltips();

		expect(showSpies[0]).toHaveBeenCalledTimes(1);
		expect(showSpies[1]).toHaveBeenCalledTimes(1);
	});

	it('should delegate hideErrorTooltips to all descendant tooltips', async () => {
		const { formDirective, tooltips } = await setupHost(HostWithNestedTooltipsComponent);
		const hideSpies = tooltips.map(t => vi.spyOn(t, 'hideErrorTooltip').mockImplementation(() => {}));

		formDirective.hideErrorTooltips();

		expect(hideSpies[0]).toHaveBeenCalledTimes(1);
		expect(hideSpies[1]).toHaveBeenCalledTimes(1);
	});

	it('should no-op safely when no tooltip directives are present', async () => {
		const { formDirective, tooltips } = await setupHost(HostWithoutTooltipsComponent);

		expect(tooltips).toHaveLength(0);
		expect(() => formDirective.showErrorTooltips()).not.toThrow();
		expect(() => formDirective.hideErrorTooltips()).not.toThrow();
	});
});
