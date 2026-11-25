import { CategoryType } from "../enums/category-type.enum"
import { IconType } from "../enums/icon-type.enum"

export class CategoryModel {
  id!: string
  active!: boolean
  name!: string
  type!: CategoryType
  icon!: IconType
  color!: string
  backgroundColor!: string
  order!: number
  owner!: string
  // Copied from the user data (user_categories); null or missing when there is no budget
  budget?: number | null
  // Saving categories only: true when the money generates interest (CDA, mutual fund...), so yields can be recorded
  earnsInterest?: boolean
}
