import { CategoryGroupIconType } from '../enums/category-group-icon-type.enum';
import { IconType } from '../enums/icon-type.enum';

export class NewCategoryGroupModel {
  constructor(
    public groupName: CategoryGroupIconType,
    public icons: IconType[]
  ) {}
}
