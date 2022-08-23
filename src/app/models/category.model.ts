import { CategoryType } from "../enums/category-type.enum"
import { IconType } from "../enums/icon-type.enum"

export class CategoryModel {
  id!: string
  active!: boolean
  name!: string
  type!: CategoryType
  icon!: IconType
  color!: string
  owner!: string
}
