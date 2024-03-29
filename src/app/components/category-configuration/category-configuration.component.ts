import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { catchError } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { CategoryModel } from '../../models/category.model'
import { CategoryEvent } from '../../models/category-event.model'
import { HelperService } from '../../services/helper.service'
import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-category-configuration',
  templateUrl: './category-configuration.component.html',
  styleUrls: ['./category-configuration.component.scss']
})
export class CategoryConfigurationComponent implements OnInit {
  protected expenseCategory!: CategoryModel[]
  protected incomeCategory!: CategoryModel[]
  protected currentTap!: string
  protected categoryType = CategoryType
  protected loading = true

  constructor(
    private readonly location: Location,
    private readonly userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getAllCategories$().pipe(catchError((e) => {
      this.loading = false
      throw e
    })).subscribe({
      next: (categories) => {
        this.expenseCategory = this.orderCategoryByActive(HelperService.categoriesByType(categories, CategoryType.expense))
        this.incomeCategory = this.orderCategoryByActive(HelperService.categoriesByType(categories, CategoryType.income))
        this.loading = false
      }
    })
    this.currentTap = this.categoryType.income.toLocaleLowerCase()
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.currentTap = Object.keys(this.categoryType)[tabChangeEvent.index]
  }

  protected updateCategories = (result: CategoryEvent): void => {
    if(result.categoryId) {
      result.categoryType.toLowerCase() === CategoryType.income.toLowerCase() ?
      this.incomeCategory = this.incomeCategory.filter(x => x.id !== result.categoryId) :
      this.expenseCategory = this.expenseCategory.filter(x => x.id !== result.categoryId)
    }
    result.categoryType.toLowerCase() === CategoryType.income.toLowerCase() ?
      this.incomeCategory = this.orderCategoryByActive(this.incomeCategory) :
      this.expenseCategory = this.orderCategoryByActive(this.expenseCategory)
  }

  private orderCategoryByActive = (categories: CategoryModel[]): CategoryModel[] => categories.sort((a, b) => {
    const compareActive = a.active === b.active ? 0 : a.active ? -1 : 1
    const compareOrder = a.order - b.order
    return compareActive || compareOrder
  })
}
