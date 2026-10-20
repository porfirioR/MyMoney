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

  // New categories go to the end of their list
  public static getNextCategoryOrder = (categories: CategoryModel[], type: string): number => {
    const orders = categories.filter(x => x.type.toLowerCase() === type.toLowerCase()).map(x => x.order ?? 0)
    return orders.length ? Math.max(...orders) + 1 : 0
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
