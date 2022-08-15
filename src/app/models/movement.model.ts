import { CategoryType } from "../enums/category-type.enum"
import { IconType } from "../enums/icon-type.enum"

export interface MovementModel {
  id?: string
  type: CategoryType
  icon: IconType
  categoryId: string
  categoryName: string
  memorandum?: string
  date?: Date
  time: number
  amount: number
}
