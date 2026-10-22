import { IconType } from "../enums/icon-type.enum";
import { MovementModel } from "./movement.model";
import { BudgetStatusModel } from "./budget-status.model";

export class GroupMovementCategoryModel {
  // Only expense categories with a monthly budget have one
  public budget?: BudgetStatusModel

  constructor(
    public categoryName: string,
    public icon: IconType,
    public color: string,
    public backgroundColor: string,
    public amount: number = 0,
    public movements: MovementModel[] = [],
    public categoryId?: string
  ) { }
}
