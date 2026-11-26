import { SavingDirection } from '../enums/saving-direction.enum'
import { CategoryModel } from './category.model'

// An expense or income category whose movements go to a saving category
export interface MoveToSavingPlanModel {
  category: CategoryModel
  target: CategoryModel
  direction: SavingDirection
}

export class MoveToSavingResultModel {
  public movements = 0
  // Names of the groups that became saving groups, and of the ones that now mix savings with incomes or expenses
  public savingGroups = new Set<string>()
  public mixedGroups = new Set<string>()
}
