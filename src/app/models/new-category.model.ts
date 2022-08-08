import { CategoryType } from '../enums/category-type.enum';
import { NewCategoryGroupModel } from './new-category-group.model';

export class NewCategoryModel {
  constructor(
    public type: CategoryType,
    public groups: NewCategoryGroupModel[]
  ) {}
}
