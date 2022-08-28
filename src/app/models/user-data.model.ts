import { CategoryModel } from "./category.model"

export interface UserDataModel {
  email: string
  allCategories: CategoryModel[]
  activeCategories: CategoryModel[]
}
