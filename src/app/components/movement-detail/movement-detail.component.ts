import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementModel } from 'src/app/models/movement.model';

@Component({
  selector: 'app-movement-detail',
  templateUrl: './movement-detail.component.html',
  styleUrls: ['./movement-detail.component.css']
})
export class MovementDetailComponent implements OnInit {
  protected movement!: MovementModel
  constructor(private readonly location: Location, private readonly router: Router) {

    this.movement = this.router.getCurrentNavigation()?.extras.state as MovementModel
    if (!this.movement) {
      this.location.back()
    }
   }

  ngOnInit() {
    console.log(this.movement)
  }

  protected exit = () => {
    this.location.back()
  }

  protected deleteMovement = () => {

  }

  protected editMovement = () => {

  }
}
