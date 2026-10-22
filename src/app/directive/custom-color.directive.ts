import { AfterViewInit, Directive, ElementRef, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../constants/category.constants';

@Directive({
  selector: '[customColor]'
})
export class CustomColorDirective implements AfterViewInit, OnChanges {
  @Input('color') color: string | undefined = '#fff';
  @Input('backgroundColor') backgroundColor: string | undefined = '#673ab7'

  constructor(private element: ElementRef) { }

  ngAfterViewInit(): void {
    this.updateColors()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['color'] || changes['backgroundColor']) {
      this.updateColors()
    }
  }

  // The default pair (black icon on white) follows the light/dark theme; colors chosen by the user are kept as they are
  private updateColors = (): void => {
    const isDefaultPair = this.color?.toLowerCase() === DEFAULT_ICON_COLOR && this.backgroundColor?.toLowerCase() === DEFAULT_BACKGROUND_COLOR
    this.element.nativeElement.style.color = isDefaultPair ? 'var(--icon-default-color)' : this.color
    this.element.nativeElement.style.backgroundColor = isDefaultPair ? 'var(--icon-default-background)' : this.backgroundColor
  }

}
