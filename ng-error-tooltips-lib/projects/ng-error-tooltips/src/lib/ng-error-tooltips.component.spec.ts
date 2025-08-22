import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgErrorTooltipComponent } from './ng-error-tooltip.component';
import { defaultOptions } from './default-options.const';
import { provideZonelessChangeDetection } from '@angular/core';

describe('NgErrorTooltipsComponent', () => {
  let component: NgErrorTooltipComponent;
  let fixture: ComponentFixture<NgErrorTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgErrorTooltipComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgErrorTooltipComponent);
    component = fixture.componentInstance;

    component.options = defaultOptions;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
