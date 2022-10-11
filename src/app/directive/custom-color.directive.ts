import { AfterViewInit, Directive, ElementRef, Input, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[customColor]'
})
export class CustomColorDirective implements AfterViewInit, OnChanges {
  @Input('color') color: string | undefined = '#fff';
  @Input('backgroundColor') backgroundColor: string | undefined = '#673ab7'

  constructor(private element: ElementRef) { }

  ngAfterViewInit(): void {
    this.updateColor()
    this.updateBackgroundColor()
 }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['color']) {
      this.updateColor()
    }
    if (changes['backgroundColor']) {
      this.updateBackgroundColor()
    }
  }

  private updateColor = () => {
    this.element.nativeElement.style.color = this.color
  }

  private updateBackgroundColor = () => {
    this.element.nativeElement.style.backgroundColor = this.backgroundColor
  }

}
