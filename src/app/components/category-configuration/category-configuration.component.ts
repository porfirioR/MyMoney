import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { CategoryType } from '../../enums/category-type.enum'
import { CategoryModel } from '../../models/category.model'
import { CategoryService } from '../../services/category.service'
import { take } from 'rxjs';

@Component({
  selector: 'app-category-configuration',
  templateUrl: './category-configuration.component.html',
  styleUrls: ['./category-configuration.component.scss']
})
export class CategoryConfigurationComponent implements OnInit {
  protected expenseCategory!: CategoryModel[]
  protected incomeCategory!: CategoryModel[]
  protected currentTap!: string;
  protected categoryType = CategoryType;

  constructor(private categoryService: CategoryService, protected location: Location) { }

  ngOnInit() {
    this.categoryService.getAll().pipe(take(1)).subscribe({
      next: (x) => {
        this.expenseCategory = this.orderCategoryByActive(this.categoriesByType(x, CategoryType.expense))
        this.incomeCategory = this.orderCategoryByActive(this.categoriesByType(x, CategoryType.income))
      }, error: (e) => {
        throw e;
      }
    })
    this.currentTap = this.categoryType.expense
  }

  protected exit = () => {
    this.location.back()
  }

  protected categoriesByType = (categories: CategoryModel[], type: CategoryType): CategoryModel[] => {
    return categories.filter(x => x.type === type)
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.currentTap = tabChangeEvent.tab.textLabel;
  }

  protected reorderCategory = (type: CategoryType) => {
    type === CategoryType.income ?
      this.incomeCategory = this.orderCategoryByActive(this.incomeCategory) :
      this.expenseCategory = this.orderCategoryByActive(this.expenseCategory)
  }

  private orderCategoryByActive = (categories: CategoryModel[]) => categories.sort((a, b) => a.active === b.active ? 0 : a.active ? -1 : 1)
}
