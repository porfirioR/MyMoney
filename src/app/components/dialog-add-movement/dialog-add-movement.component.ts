import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryModel } from '../../models/category.model';
import { FilterRelatedMovementModel } from '../../models/filter-related-movement.model';
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
  })
  protected searching = false
  private minValidYear = 2018

  constructor(
    private readonly dialogRef: MatDialogRef<DialogAddMovementComponent>,
    private readonly movementService: MovementService,
    private readonly userService: UserService

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

  protected search = () => {
    const request = new FilterRelatedMovementModel(
      this.formGroup.value.category!,
      this.formGroup.value.month!,
      this.formGroup.value.year!
    )
    this.movementService.getGetMovementByFilter(request).subscribe({
      next: ([incomes, expenses]) => {
      }, error: (e) => {
        throw e
      }
    })
  }

  protected save = () => {
    
  }
}
