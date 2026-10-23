import { Injectable } from '@angular/core';
import { CategoryType } from '../enums/category-type.enum';
import { MonthType } from '../enums/month-type.enum';
import { CategoryModel } from '../models/category.model';
import { YearMonthModel } from '../models/year-month-model';
import { ConfigurationModel } from '../models/configuration.model';
import { NumberType } from '../enums/number-type.enum';
import { RelatedMapModel } from '../models/related-map-model';
import { RelatedMovementModel } from '../models/related-movement.model';
import { RelatedMovementSummaryModel } from '../models/related-movement-summary.model';
import { RelatedProgressType } from '../enums/related-progress-type.enum';
import { MovementModel } from '../models/movement.model';
import { BudgetStatusModel } from '../models/budget-status.model';
import { UNSET_CATEGORY_ORDER } from '../constants/category.constants';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

constructor() { }

  // Movement types are compared case-insensitively ('Expense' and 'expense' both exist)
  public static isExpense = (type: string | undefined): boolean =>
    (type ?? '').toLowerCase() === CategoryType.expense.toLowerCase()

  // Groups created before progressType existed: only expenses → payments, only incomes → collections, both → balance
  public static getRelatedProgressType = (group: RelatedMovementModel): RelatedProgressType => {
    if (group.progressType) {
      return group.progressType
    }
    const hasExpense = group.related.some(x => HelperService.isExpense(x.type))
    const hasIncome = group.related.some(x => !HelperService.isExpense(x.type))
    if (hasExpense && hasIncome) {
      return RelatedProgressType.Balance
    }
    return hasIncome ? RelatedProgressType.Income : RelatedProgressType.Expense
  }

  public static getRelatedSummary = (
    progressType: RelatedProgressType,
    goal: number | null | undefined,
    movements: { amount: number, isExpense: boolean, date?: Date }[]
  ): RelatedMovementSummaryModel => {
    const expenseAmount = movements.filter(x => x.isExpense).reduce((a, b) => a + Math.abs(b.amount), 0)
    const incomeAmount = movements.filter(x => !x.isExpense).reduce((a, b) => a + Math.abs(b.amount), 0)
    const times = movements.filter(x => !!x.date).map(x => x.date!.getTime())
    const lastDate = times.length ? new Date(Math.max(...times)) : undefined
    return new RelatedMovementSummaryModel(progressType, Math.abs(Number(goal ?? 0)), expenseAmount, incomeAmount, movements.length, lastDate)
  }

  // getName receives the stored name (a translation key for system categories) and returns the text shown to the user
  public static categoriesByType = (
    categories: CategoryModel[],
    type: CategoryType,
    getName: (name: string) => string = (name) => name
  ): CategoryModel[] => categories
    .filter(x => x.type.toLocaleLowerCase() === type.toLowerCase())
    .sort((a, b) => HelperService.compareCategoryOrder(a, b, getName))

  // Lower order first; categories with the same order are sorted alphabetically
  public static compareCategoryOrder = (
    a: CategoryModel,
    b: CategoryModel,
    getName: (name: string) => string = (name) => name
  ): number => (a.order - b.order) || getName(a.name).localeCompare(getName(b.name))

  // New categories go to the end of their list (categories without a position do not count)
  public static getNextCategoryOrder = (categories: CategoryModel[], type: string): number => {
    const orders = categories
      .filter(x => x.type.toLowerCase() === type.toLowerCase())
      .map(x => x.order ?? 0)
      .filter(x => x < UNSET_CATEGORY_ORDER)
    return orders.length ? Math.max(...orders) + 1 : 0
  }

  // Budget of every expense category that has one, compared with what the given movements spent on it
  public static getBudgetStatuses = (categories: CategoryModel[], movements: MovementModel[]): Map<string, BudgetStatusModel> => {
    const statuses = new Map<string, BudgetStatusModel>()
    categories
      .filter(x => (x.budget ?? 0) > 0 && HelperService.isExpense(x.type))
      .forEach(category => {
        const spent = movements
          .filter(x => x.categoryId === category.id && HelperService.isExpense(x.type))
          .reduce((total, x) => total + Math.abs(x.amount), 0)
        statuses.set(category.id, new BudgetStatusModel(spent, category.budget!))
      })
    return statuses
  }

  public static isUnsetCategoryOrder = (order: number | undefined): boolean => (order ?? 0) >= UNSET_CATEGORY_ORDER

  // Amounts are stored positive; expenses are shown negative
  public static getSignedAmount = (movement: MovementModel): number =>
    HelperService.isExpense(movement.type) ? -Math.abs(movement.amount) : Math.abs(movement.amount)

  // First day of the viewed month, or today when the current month is viewed
  public static getDefaultMovementDate = (yearMonth: YearMonthModel): Date => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isCurrentMonth = today.getFullYear() === Number(yearMonth.year) && today.getMonth() === Number(yearMonth.month)
    return isCurrentMonth ? today : new Date(Number(yearMonth.year), Number(yearMonth.month), 1)
  }

  public static convertStringToMonthType = (value: string): MonthType => Number.parseInt(Object.entries(MonthType).find(([key, val]) => val === value)![0])

  public static getSearchMessage = (): YearMonthModel => {
    const date = new Date();
    return new YearMonthModel(date.getFullYear(), date.getMonth())
  }

  public static getMarkValues = (configuration: ConfigurationModel | undefined): [string, string] => {
    const englishMarkConfiguration: [string, string] = ['separator.0', ',']
    const spanishMarkConfiguration: [string, string] = ['separator,0', '.']
    return configuration && configuration.number === NumberType.Spanish ? spanishMarkConfiguration : englishMarkConfiguration
  }

  public static getRelatedMovementToSave = (relatedList: RelatedMapModel[]): Record<string, string>[] => relatedList.map(y => {
    const relatedValue: Record<string, string> = {}
    relatedValue['id'] = y.id,
    relatedValue['type'] = y.type
    return relatedValue
  })
}
