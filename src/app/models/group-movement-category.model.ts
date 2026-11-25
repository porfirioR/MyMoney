import { IconType } from "../enums/icon-type.enum";
import { MovementModel } from "./movement.model";
import { BudgetStatusModel } from "./budget-status.model";
import { SavingTotalsModel } from "./saving-totals.model";

export class GroupMovementCategoryModel {
  // Only expense categories with a monthly budget have one
  public budget?: BudgetStatusModel
  // Only saving categories: what was deposited, withdrawn and earned (amount is the effect on the balance)
  public saving?: SavingTotalsModel
  // Only saving categories in the annual report: the balance at the end of the year
  public closingBalance?: number

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
