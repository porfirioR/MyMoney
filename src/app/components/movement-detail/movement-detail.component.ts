import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementService } from 'src/app/services/movement.service';
import { MovementModel } from '../../models/movement.model';

@Component({
  selector: 'app-movement-detail',
  templateUrl: './movement-detail.component.html',
  styleUrls: ['./movement-detail.component.scss']
})
export class MovementDetailComponent implements OnInit {
  protected movement?: MovementModel

  constructor(private readonly location: Location, private readonly movementService: MovementService,
    private readonly activatedRoute: ActivatedRoute, private readonly router: Router) {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.movement = this.movementService.getMovementById(params['id'])
        if (!this.movement) {
          this.location.back()
        }
      }, error: (e) => {
        throw e;
      }
    })
  }

  ngOnInit() {
    console.log(this.movement)
  }

  protected exit = () => {
    this.location.back()
  }

  protected deleteMovement = () => {

  }

  protected editMovement = (id?: string) => {
    this.router.navigateByUrl(`/movement-update/${id}`)
  }
}
