import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryModel } from '../../models/category.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dialog-add-movement',
  templateUrl: './dialog-add-movement.component.html',
  styleUrls: ['./dialog-add-movement.component.scss']
})
export class DialogAddMovementComponent implements OnInit {
  protected year: number = new Date().getFullYear()
  protected yearRange: number[]
  protected categoryType!: CategoryType
  protected months = MonthType
  protected categories: CategoryModel[] = []
  protected formGroup = new FormGroup({
    year: new FormControl(),
    category: new FormControl(),
    month: new FormControl(),
  })
  protected searching = false
  private minValidYear = 2018

  constructor(
    private readonly dialogRef: MatDialogRef<DialogAddMovementComponent>,
    private readonly movementService: MovementService,
    private readonly userService: UserService

  ) { 
    const diffYear = this.year - this.minValidYear
    const initialYear = this.year === this.minValidYear || diffYear > 8 ? this.minValidYear : this.year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)

  }

  ngOnInit(): void {
    this.categories = this.userService.getActiveCategories()
  }

  protected cancelAddition = (): void => this.dialogRef.close()

  protected search = () => {

  }

  protected save = () => {
    
  }
}