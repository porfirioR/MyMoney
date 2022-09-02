import { CategoryType } from "../enums/category-type.enum"

export class ExportRequestModel {
  public startDate!: Date
  public   endDate!: Date
  public categories!: CategoryType[]
}
