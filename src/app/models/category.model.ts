import { CategoryType } from "../enums/category-type.enum"

export class CategoryModel {
  id!: string
  active!: boolean
  name!: string
  type!: CategoryType
  icon!: string
}
