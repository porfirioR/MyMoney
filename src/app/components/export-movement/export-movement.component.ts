import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryType } from 'src/app/enums/category-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-export-movement',
  templateUrl: './export-movement.component.html',
  styleUrls: ['./export-movement.component.scss']
})
export class ExportMovementComponent implements OnInit {
  protected minDate = new Date('2015-01-01:00:00:00')
  protected loading = false
  protected formGroup: FormGroup = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    categories: new FormControl('', [Validators.required])
  })
  protected categories = CategoryType
  constructor(private readonly location: Location,
              private readonly userService: UserService,
              private readonly movementService: MovementService) { }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected export = () => {

  }

}
