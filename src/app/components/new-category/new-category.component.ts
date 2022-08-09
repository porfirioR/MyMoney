import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { NewCategoryModel } from '../../models/new-category.model';
import { NewCategoryGroupModel } from '../../models/new-category-group.model';
import { CategoryGroupIconType } from '../../enums/category-group-icon-type.enum';
import { IconType } from '../../enums/icon-type.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
})
export class NewCategoryComponent implements OnInit {
  protected type!: string;
  private expenseCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.expense,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.Burger, IconType.Keyboard, IconType.Airport
      ])
    ]
  )
  private incomeCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.income,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.Burger, IconType.Keyboard, IconType.Airport
      ])
    ]
  )
  protected currentCategory!: NewCategoryModel
  protected formGroup!: FormGroup

  constructor(protected location: Location, protected route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe({
      next: (value) => {
        this.type = value['type'];
        this.currentCategory = this.type === CategoryType.income ? this.incomeCategory : this.expenseCategory
        this.formGroup = new FormGroup({
          categoryName: new FormControl('', Validators.required),
          icon: new FormControl(this.currentCategory.groups[0].icons[0], Validators.required),
          type: new FormControl(this.type, Validators.required)
        })
      }
    })
  }

  protected exit = () => {
    this.location.back()
  }

  protected updateIcon = (icon: IconType) => {
    this.formGroup.get('icon')?.setValue(icon)
  }
}
