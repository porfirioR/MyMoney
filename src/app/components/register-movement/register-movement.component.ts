import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss']
})
export class RegisterMovementComponent implements OnInit {
  protected categoryType = CategoryType
  protected formGroup!: FormGroup
  private categoryList!: CategoryModel[]
  protected currentCategories!: CategoryModel[]

  constructor(private categoryService: CategoryService, protected location: Location) { }

  ngOnInit() {
    this.categoryService.getAll().pipe(take(1)).subscribe({
      next: (categories: CategoryModel[]) => {
        this.categoryList = categories.filter(x => x.active)
        this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense)
        this.formGroup = new FormGroup( {
          type: new FormControl(this.categoryType.expense),
          icon: new FormControl(''),
          categoryId: new FormControl('', Validators.required),
          memorandum: new FormControl(''),
          date: new FormControl(''),
          amount: new FormControl('', [Validators.required, Validators.min(0), Validators.minLength(1)])
        })
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
      }, error: (e) => {
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
}
