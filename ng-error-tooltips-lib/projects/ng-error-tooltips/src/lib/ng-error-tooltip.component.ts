import { Component, ElementRef, HostBinding, Input, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { defaultOptions } from './default-options.const';
import { ErrorTooltipOptions } from './error-tooltip-options.interface';
import { Placement, PLACEMENTS } from './placement.type';

@Component({
  selector: 'lib-ng-error-tooltip',
  templateUrl: './ng-error-tooltip.component.html',
  styleUrls: ['./ng-error-tooltip.component.scss']
})
export class NgErrorTooltipComponent implements OnInit {

  	/* Inputs will be passed by error-tooltip-directive */

	@Input({ required: true })
  errors: string[] = [];

  @Input({ required: true })
  options!: ErrorTooltipOptions;

  @Input({ required: true })
  formControl!: any;

  @HostBinding('class.tooltip') tooltipClass = true;
  @HostBinding('style.top') hostStyleTop = '-9999px'; // Initial position is off-screen
  @HostBinding('style.left') hostStyleLeft = '-9999px'; // Initial position is off-screen
  @HostBinding('style.z-index') hostStyleZIndex!: number;
  @HostBinding('style.width') hostStyleWidth!: string;
  @HostBinding('style.max-width') hostStyleMaxWidth!: string;
  @HostBinding('style.pointer-events') hostStylePointerEvents!: string;
  @HostBinding('class.tooltip-show') hostClassShow = false;
  @HostBinding('class.tooltip-hide') hostClassHide = true;
  @HostBinding('class.tooltip-display-none') hostClassDisplayNone = true;
  @HostBinding('class.tooltip-shadow') hostClassShadow!: boolean;
  @HostBinding('class.tooltip-error') hostClassTooltipError = true;

  /* Informs error-tooltip-directive when user clicked on tooltip: */

  private userClickOnTooltipSubject = new Subject<void>();
  userClickOnTooltip$ = this.userClickOnTooltipSubject.asObservable();

  constructor(private elementRef: ElementRef,
      private renderer: Renderer2) {}

  ngOnInit() {
    this.setStyles();
  }

  showTooltip(formControlRef: ElementRef<any>) {
    // Set the placement class:
    const placement = this.options?.placement ?? defaultOptions.placement;
    this.setPlacementClass(placement);

    this.setVisibilityAndPosition(formControlRef);
  }

  handleTooltipClick() {
    this.userClickOnTooltipSubject.next();
  }

  private setPlacementClass(placement: Placement | undefined): void {
    this.removeAllPlacementClasses(PLACEMENTS);
    this.renderer.addClass(this.elementRef.nativeElement, `tooltip-${placement ?? ''}`);
  }

  private removeAllPlacementClasses(placements: Placement[]): void {
    placements.forEach(placement => {
      this.renderer.removeClass(this.elementRef.nativeElement, `tooltip-${placement}`);
    });
  }

  setVisibilityAndPosition(formControlRef: ElementRef<any>): void {
    const wasVisible = !this.hostClassHide;
    // Initial position is off-screen, so that measurements can be taken and the tooltip doesn't flicker on the screen
    const isVisible = this.setVisibilityOfTooltip(formControlRef);

    if (wasVisible && isVisible) {
      const formControlPosition = formControlRef.nativeElement.getBoundingClientRect();
      this.setAbsolutePosition(formControlPosition);
    }
    else if (!wasVisible && isVisible) {
      // Apply timeout to ensure tooltip is rendered before calculating its height and width:
      setTimeout(() => {
        const formControlPosition = formControlRef.nativeElement.getBoundingClientRect();
        this.setAbsolutePosition(formControlPosition);
      }, 0);
    }
  }

  private setVisibilityOfTooltip(formControlRef: ElementRef<any>): boolean {
    const isFormControlVisible = !this.isElementCovered(formControlRef);
    this.hostClassDisplayNone = !isFormControlVisible;
    this.hostClassShow = isFormControlVisible;
    this.hostClassHide = !isFormControlVisible;
    return isFormControlVisible;
  }

  private setAbsolutePosition(formControlPosition: DOMRect): void {
      const isFormCtrlSVG = this.formControl instanceof SVGElement;
      const tooltip = this.elementRef.nativeElement;

      const formControlHeight = isFormCtrlSVG ? this.formControl.getBoundingClientRect().height : this.formControl.offsetHeight;
      const formControlWidth = isFormCtrlSVG ? this.formControl.getBoundingClientRect().width : this.formControl.offsetWidth;
      const tooltipHeight = tooltip.clientHeight;
      const tooltipWidth = tooltip.clientWidth;
      const scrollY = window.scrollY;

      const placement = this.options?.placement ?? defaultOptions.placement;
      const tooltipOffset = this.options?.offset ?? defaultOptions.offset!;

      let topStyle;

      switch (placement) {
        case 'top':
        case 'top-left':
          topStyle = (formControlPosition.top + scrollY) - (tooltipHeight + tooltipOffset);
          break;

        case 'bottom':
        case 'bottom-left':
          topStyle = (formControlPosition.top + scrollY) + formControlHeight + tooltipOffset;
          break;

        case 'left':
        case 'right':
          topStyle = (formControlPosition.top + scrollY) + formControlHeight / 2 - tooltipHeight / 2;
          break;
      }

      let leftStyle;

      switch (placement) {
        case 'top':
        case 'bottom':
          leftStyle = (formControlPosition.left + formControlWidth / 2) - tooltipWidth / 2;
          break;

        case 'bottom-left':
        case 'top-left':
          leftStyle = formControlPosition.left;
          break;

        case 'left':
          leftStyle = formControlPosition.left - tooltipWidth - tooltipOffset;
          break;

        case 'right':
          leftStyle = formControlPosition.left + formControlWidth + tooltipOffset;
          break;
      }

    const prevHostStyleTop = this.hostStyleTop;
    const prevHostStyleLeft = this.hostStyleLeft;

    // Round values to two decimal places
    const roundedTopStyle = `${topStyle.toFixed(2)}px`;
    const roundedLeftStyle = `${leftStyle.toFixed(2)}px`;

    // Update only if the rounded position has changed
    if (prevHostStyleTop !== roundedTopStyle || prevHostStyleLeft !== roundedLeftStyle) {
      this.hostStyleTop = roundedTopStyle;
      this.hostStyleLeft = roundedLeftStyle;
    }
  }

  private isElementCovered(formControlRef: ElementRef<any>): boolean {
    const rect = formControlRef.nativeElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const elementAtPoint = document.elementFromPoint(x, y);

    // If the element at the point is the same as the form control, it's not covered
    if (elementAtPoint && elementAtPoint.isSameNode(formControlRef.nativeElement)) {
      return false;
    }

    // If the covering element is another instance of app-error-tooltip, don't consider it covered
    if (elementAtPoint && (elementAtPoint.tagName === 'APP-ERROR-TOOLTIP' ||
               elementAtPoint.className === 'tooltip-label' ||
               elementAtPoint.className === 'tooltip-arrow' ||
               elementAtPoint.className === 'tooltip-error-list')) {
      return false;
    }

    // Traverse up the DOM tree to check if the element is inside the form control
    let currentElement = elementAtPoint;
    while (currentElement) {
      if (currentElement.isSameNode(formControlRef.nativeElement)) {
        return false;  // The form control is not covered if the point is inside it
      }
      currentElement = currentElement.parentElement;
    }

    // If we traverse up the DOM and don't find the form control, it's considered covered
    return true;
  }

  private setStyles() {
    this.setCustomClass();
    this.setZIndex();
    this.setPointerEvents();

    this.hostClassShadow = this.options.shadow ?? true;
    this.hostStyleMaxWidth = this.options.maxWidth ?? '';
    this.hostStyleWidth = this.options.width ? this.options.width : '';
  }

  private setZIndex(): void {
    if (this.options.zIndex !== 0) {
      this.hostStyleZIndex = this.options.zIndex ?? defaultOptions.zIndex ?? 0;
    }
  }

  private setPointerEvents(): void {
    if (this.options.pointerEvents) {
      this.hostStylePointerEvents = this.options.pointerEvents;
    }
  }

  private setCustomClass(){
    if (this.options.tooltipClass) {
      this.options.tooltipClass.split(' ').forEach((className:any) => {
        this.renderer.addClass(this.elementRef.nativeElement, className);
      });
    }
  }
}
