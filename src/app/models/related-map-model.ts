import { CategoryType } from "../enums/category-type.enum";

export class RelatedMapModel {
  constructor(
    public id: string,
    public type: CategoryType
  ) {}
}
