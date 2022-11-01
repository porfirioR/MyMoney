import { CategoryModel } from "./category.model"
import { ConfigurationModel } from "./configuration.model"
import { UserCategoryModel } from "./user-category.model"

export interface UserDataModel {
  email: string
  allCategories: CategoryModel[]
  activeCategories: CategoryModel[]
  userCategories: UserCategoryModel[]
  photo: string | null
  displayName: string,
  userConfiguration: ConfigurationModel
}
