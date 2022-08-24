import { CategoryType } from "../enums/category-type.enum";

export class CategoryEvent {
  constructor(public categoryType: CategoryType, public categoryId?: string) { }
}
