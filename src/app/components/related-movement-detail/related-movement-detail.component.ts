import { Component, Input, OnInit } from '@angular/core';
import { RelatedMovementDetailModel } from 'src/app/models/related-movement-detail.model';

@Component({
  selector: 'app-related-movement-detail',
  templateUrl: './related-movement-detail.component.html',
  styleUrls: ['./related-movement-detail.component.scss']
})
export class RelatedMovementDetailComponent implements OnInit {
  @Input() movements: RelatedMovementDetailModel[] = []

  constructor() { }

  ngOnInit() {
  }


  protected deletedMovement = (id: string) => {

  }
}
