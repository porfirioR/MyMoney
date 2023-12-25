import { Component, OnInit } from '@angular/core';
import { MovementService } from 'src/app/services/movement.service';
import { RelatedMovementsService } from 'src/app/services/related-movements.service';

@Component({
  selector: 'app-upsert-related-movement',
  templateUrl: './upsert-related-movement.component.html',
  styleUrls: ['./upsert-related-movement.component.scss']
})
export class UpsertRelatedMovementComponent implements OnInit {

  constructor(
    private readonly relatedMovementsService: RelatedMovementsService,
    private readonly movementService: MovementService
  ) { }

  ngOnInit() {
  }

}
