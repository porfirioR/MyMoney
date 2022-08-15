import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { IconType } from '../../enums/icon-type.enum';
import { MovementModel } from '../../models/movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss']
})
export class RegisterMovementComponent implements OnInit {
  protected categoryType = CategoryType
  private movementId!: string
  protected formGroup: FormGroup = new FormGroup({
    id: new FormControl<string | ''>(''),
    type: new FormControl<CategoryType>(this.categoryType.expense),
    icon: new FormControl<IconType | ''>('', Validators.required),
    categoryId: new FormControl<string>('', Validators.required),
    memorandum: new FormControl<string>(''),
    date: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(0), Validators.minLength(1)])
  })
  protected currentCategories!: CategoryModel[]
  protected loading = true
  protected saving = false
  private categoryList!: CategoryModel[]

  constructor(private categoryService: CategoryService,
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly snackBar: MatSnackBar) { }

  ngOnInit() {
    this.categoryService.getAll().pipe(take(1)).subscribe({
      next: (categories: CategoryModel[]) => {
        this.categoryList = categories.filter(x => x.active)
        this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense)
        this.formGroup.controls['type'].valueChanges.subscribe({
          next: (value) => {
            this.currentCategories = HelperService.categoriesByType(this.categoryList, value)
            const currentCategory = this.currentCategories.find(x => x.id === this.formGroup.controls['categoryId'].value)
            if(!currentCategory) {
              this.formGroup.controls['icon'].setValue('')
              this.formGroup.controls['categoryId'].setValue('')
            }
          }
        })
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e;
      }
    })
  }

  protected selectedIcon = (category: CategoryModel) => {
    this.formGroup.controls['icon'].setValue(category.icon)
    this.formGroup.controls['categoryId'].setValue(category.id)
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    const request: MovementModel = this.formGroup.getRawValue()
    request.date?.setHours(0, 0, 0, 0)
    request.time = request.date?.getTime() as number
    delete request.date
    this.saving = true
    this.movementService.create(request).then(() => {
      this.saving = false
      this.snackBar.open(`Movement was ${this.movementId ? 'updated' : 'created'}`, '', { duration: 3000 })
      this.location.back()
    }).catch((error) => console.log(error))
  }

}
