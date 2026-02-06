import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') tooltipTitle: string = ''; // Initialize with default value

  tooltip: HTMLElement | null = null; // Initialize as HTMLElement or null
  offset = 10;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltip) {
      this.show();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      this.hide();
    }
  }

  private show() {
    this.tooltip = this.renderer.createElement('span');
    this.tooltip!.textContent = this.tooltipTitle; // Non-null assertion operator

    this.renderer.appendChild(document.body, this.tooltip!); // Non-null assertion operator

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip!.getBoundingClientRect(); // Non-null assertion operator

    const top = hostPos.bottom + this.offset;
    const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

    this.renderer.setStyle(this.tooltip!, 'top', `${top}px`); // Non-null assertion operator
    this.renderer.setStyle(this.tooltip!, 'left', `${left}px`); // Non-null assertion operator
    this.renderer.setStyle(this.tooltip!, 'position', 'fixed');
    this.renderer.setStyle(this.tooltip!, 'backgroundColor', '#333');
    this.renderer.setStyle(this.tooltip!, 'color', '#fff');
    this.renderer.setStyle(this.tooltip!, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltip!, 'borderRadius', '4px');
    this.renderer.setStyle(this.tooltip!, 'zIndex', '1000');
  }

  private hide() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null; // Reset tooltip to null after hiding
    }
  }
}
