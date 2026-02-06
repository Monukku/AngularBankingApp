import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = ''; // Initialize with a default value

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || 'yellow'); // Use 'yellow' as fallback if highlightColor is falsy
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(''); // Reset to default color or null handling logic
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
