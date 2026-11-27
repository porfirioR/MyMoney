import { Component, OnInit } from '@angular/core'
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { take } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { CategoryModel } from '../../models/category.model'
import { CategoryEvent } from '../../models/category-event.model'
import { HelperService } from '../../services/helper.service'
import { UserService } from '../../services/user.service'
import { NotificationService } from '../../services/notification.service'
import { SearchHelper } from '../../services/search.helper'

@Component({
  selector: 'app-category-configuration',
  templateUrl: './category-configuration.component.html',
  styleUrls: ['./category-configuration.component.scss']
})
export class CategoryConfigurationComponent implements OnInit {
  protected expenseCategory!: CategoryModel[]
  protected incomeCategory!: CategoryModel[]
  protected savingCategory!: CategoryModel[]
  protected currentTap!: string
  protected categoryType = CategoryType
  protected loading = true
  protected selectedIndex = 0
  // Local search by name in the three tabs
  protected searchText = ''
  protected searching = false
  protected visibleIncome: CategoryModel[] = []
  protected visibleExpense: CategoryModel[] = []
  protected visibleSaving: CategoryModel[] = []
  private readonly tabs = Object.keys(CategoryType)

  constructor(
    private readonly userService: UserService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const tab = this.activatedRoute.snapshot.queryParamMap.get('tab')
    this.currentTap = this.tabs.includes(tab!) ? tab! : this.tabs[0]
    this.selectedIndex = this.tabs.indexOf(this.currentTap)
    this.userService.getAllCategories$().pipe(take(1)).subscribe({
      next: (categories) => {
        this.expenseCategory = this.orderCategoryByActive(HelperService.categoriesByType(categories, CategoryType.expense))
        this.incomeCategory = this.orderCategoryByActive(HelperService.categoriesByType(categories, CategoryType.income))
        this.savingCategory = this.orderCategoryByActive(HelperService.categoriesByType(categories, CategoryType.saving))
        this.applySearch()
        this.loading = false
      }, error: (e) => {
        this.loading = false
        this.notificationService.error(e)
      }
    })
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.selectedIndex = tabChangeEvent.index
    this.currentTap = this.tabs[tabChangeEvent.index]
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { tab: this.currentTap }, replaceUrl: true })
  }

  protected updateCategories = (result: CategoryEvent): void => {
    const type = result.categoryType.toLowerCase()
    if (type === CategoryType.income.toLowerCase()) {
      this.incomeCategory = this.refreshList(this.incomeCategory, result.categoryId)
    } else if (type === CategoryType.saving.toLowerCase()) {
      this.savingCategory = this.refreshList(this.savingCategory, result.categoryId)
    } else {
      this.expenseCategory = this.refreshList(this.expenseCategory, result.categoryId)
    }
    this.applySearch()
  }

  protected onSearch = (text: string): void => {
    this.searchText = text
    this.applySearch()
  }

  // While searching, each tab shows how many of its categories match: "Gastos (3)"
  protected getTabLabel = (label: string, count: number): string => {
    const text = this.translateService.instant(label)
    return this.searching ? `${text} (${count})` : text
  }

  protected get searchCount(): number {
    return this.visibleIncome.length + this.visibleExpense.length + this.visibleSaving.length
  }

  // Categories have no amount: numbers are searched in the name too.
  // Lists are cached so the rows are not created again on every change detection
  private applySearch = (): void => {
    const query = SearchHelper.parse(this.searchText)
    this.searching = query.active
    const filter = (categories: CategoryModel[]): CategoryModel[] =>
      this.searching ? categories.filter(x => SearchHelper.normalize(this.getName(x.name)).includes(query.text)) : categories
    this.visibleIncome = filter(this.incomeCategory)
    this.visibleExpense = filter(this.expenseCategory)
    this.visibleSaving = filter(this.savingCategory)
  }

  // A categoryId means that category left the list
  private refreshList = (categories: CategoryModel[], removedId?: string): CategoryModel[] =>
    this.orderCategoryByActive(removedId ? categories.filter(x => x.id !== removedId) : categories)

  private orderCategoryByActive = (categories: CategoryModel[]): CategoryModel[] => categories.sort((a, b) => {
    const compareActive = a.active === b.active ? 0 : a.active ? -1 : 1
    return compareActive || HelperService.compareCategoryOrder(a, b, this.getName)
  })

  private getName = (name: string): string => this.translateService.instant(name)
}
