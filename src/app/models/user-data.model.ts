import { CategoryModel } from "./category.model"
import { UserCategoryModel } from "./user-category.model"

export interface UserDataModel {
  email: string
  allCategories: CategoryModel[]
  activeCategories: CategoryModel[]
  userCategories: UserCategoryModel[]
}
