import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryModel } from '../../models/category.model';
import { FilterRelatedMovementModel } from '../../models/filter-related-movement.model';
import { MovementModel } from '../../models/movement.model';
import { FilterRelatedMovementForm } from '../../forms/filter-related-movement.form';

@Component({
  selector: 'app-dialog-add-movement',
  templateUrl: './dialog-add-movement.component.html',
  styleUrls: ['./dialog-add-movement.component.scss']
})
export class DialogAddMovementComponent implements OnInit {
  protected yearRange: number[]
  protected categoryType!: CategoryType
  protected months = MonthType
  protected categories: CategoryModel[] = []
  protected formGroup: FormGroup<FilterRelatedMovementForm> = new FormGroup<FilterRelatedMovementForm>({
    year: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required),
    month: new FormControl(null, Validators.required),
    selectedMovement: new FormControl(null),
  })
  protected searching = false
  protected movements: MovementModel[] = []
  private minValidYear = 2018

  constructor(
    private readonly dialogRef: MatDialogRef<DialogAddMovementComponent>,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
  ) { 
    const year = new Date().getFullYear()
    const diffYear = year - this.minValidYear
    const initialYear = year === this.minValidYear || diffYear > 8 ? this.minValidYear : year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)
  }

  ngOnInit(): void {
    this.categories = this.userService.getActiveCategories()
  }

  protected cancelAddition = (): void => this.dialogRef.close()

  protected search = (): void => {
    this.searching = true
    const request = new FilterRelatedMovementModel(
      this.formGroup.value.category!,
      HelperService.convertStringToMonthType(this.formGroup.value.month!.toString()),
      this.formGroup.value.year!
    )
    this.movementService.getGetMovementByFilter(request).subscribe({
      next: ([incomes, expenses]) => {
        this.movements = [...incomes, ...expenses].sort((a, b) => b.time - a.time)
        this.movements.forEach(x => {
          x.date = new Date(x.time)
          const category = this.categories.find(y => y.id === x.categoryId)!
          x.color = category.color
          x.backgroundColor = category.backgroundColor
          x.memorandum = x.memorandum ?? category.name
        })
        this.searching = false
      }, error: (e) => {
        throw e
      }
    })
  }

  protected save = () => {
    
  }
}
