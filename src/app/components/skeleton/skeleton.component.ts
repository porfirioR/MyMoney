import { Component, Input } from '@angular/core';

// Placeholder cards shown while a screen loads, so it does not stay blank
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() set cards(value: number) {
    this.cardList = Array.from({ length: value })
  }
  @Input() lines = 3
  protected cardList: unknown[] = Array.from({ length: 3 })

  protected get lineList(): unknown[] {
    return Array.from({ length: this.lines })
  }
}
