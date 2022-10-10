import { AfterViewInit, Directive, ElementRef, Input, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[customColor]'
})
export class CustomColorDirective implements AfterViewInit, OnChanges {
  @Input('color') color: string = '#fff';
  @Input('backgroundColor') backgroundColor: string = '#673ab7'

  constructor(private element: ElementRef) { }

  ngAfterViewInit(): void {
    this.updateColor()
    this.updateBackgroundColor()
 }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes['color']) {
      console.log(this.color);
      this.updateColor()
    } else if (changes['backgroundColor']) {
      console.log(this.backgroundColor);
      this.updateBackgroundColor()
    }
  }


  private updateColor = () => {
    this.element.nativeElement.style.color = this.color;
  }

  private updateBackgroundColor = () => {
    this.element.nativeElement.style.backgroundColor = this.backgroundColor
  }

}
