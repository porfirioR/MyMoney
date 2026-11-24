import { CategoryType } from '../enums/category-type.enum'
import { IconType } from '../enums/icon-type.enum'
import { SavingDirection } from '../enums/saving-direction.enum'

export interface MovementModel {
  id?: string
  type: CategoryType
  icon: IconType
  categoryId: string
  categoryName?: string
  memorandum?: string
  date?: Date
  time: number
  // Positive, except a yield that lost value (negative)
  amount: number,
  color?: string,
  backgroundColor?: string
  // Only saving movements; never stored on incomes and expenses
  direction?: SavingDirection
}
