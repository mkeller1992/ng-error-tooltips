import { Directive, Input } from "@angular/core";
import { Placement } from "../tooltip/placement.type";
import { ErrorTooltipOptions } from "../options/error-tooltip-options.interface";

@Directive({
    selector: '[ngErrorTooltip]',
    exportAs: 'ngErrorTooltip',
    standalone: true
  })
  export class MockErrorTooltipDirective {
  
      // Will contain all options collected from the @Inputs
      private collectedOptions: Partial<ErrorTooltipOptions> = {};
    
      // Pass options as a single object:
      @Input()
      options: ErrorTooltipOptions = {};
    
    
      @Input()
      set id(val: string | number) {
          this.collectedOptions.id = val;
      }
    
      @Input()
      set showFirstErrorOnly(val: boolean) {
          this.collectedOptions.showFirstErrorOnly = val;
      }
    
      @Input()
      set placement(val: Placement) {
          this.collectedOptions.placement = val;
      }
    
      @Input()
      set zIndex(val: number) {
          this.collectedOptions.zIndex = val;
      }
    
      @Input()
      set tooltipClass(val: string) {
        this.collectedOptions.tooltipClass = val;
      }
    
      @Input()
      set shadow(val: boolean) {
        this.collectedOptions.shadow = val;
      }
    
      @Input()
      set offset(val: number) {
        this.collectedOptions.offset = val;
      }
    
      @Input()
      set width(val: string) {
          this.collectedOptions.width = val;
      }
    
      @Input()
      set maxWidth(val: string) {
        this.collectedOptions.maxWidth = val;
      }
    
      @Input()
      set pointerEvents(val: 'auto' | 'none') {
          this.collectedOptions.pointerEvents = val;
      }
  }