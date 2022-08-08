import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { CategoryType } from '../../enums/category-type.enum'
import { CategoryModel } from '../../models/category.model'
import { CategoryService } from '../../services/category.service'
import { take } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs'

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
        this.expenseCategory = this.categoriesByType(x, CategoryType.expense)
        this.incomeCategory = this.categoriesByType(x, CategoryType.income)
      }, error: (e) => {
        throw e;
      }
    })
    this.currentTap = this.categoryType.expense.toLowerCase()
  }

  protected exit = () => {
    this.location.back()
  }

  protected categoriesByType = (categories: CategoryModel[], type: CategoryType): CategoryModel[] => {
    return categories.filter(x => x.type === type)
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.currentTap = tabChangeEvent.tab.textLabel.toLowerCase();
  }
}
