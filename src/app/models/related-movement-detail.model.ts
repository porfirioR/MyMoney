import { IconType } from "../enums/icon-type.enum";
import { SavingDirection } from "../enums/saving-direction.enum";
import { MovementModel } from "./movement.model";

export class RelatedMovementDetailModel {
  constructor(
    public id: string,
    public date: Date,
    public memorandum: string,
    public amount: number,
    public isExpense: boolean,
    public icon: IconType,
    public color?: string,
    public backgroundColor?: string,
    // The stored movement, so it can be edited from the group
    public movement?: MovementModel,
    // Only saving movements
    public direction?: SavingDirection
  ) { }

  // What the list shows: expenses negative, savings with their effect on the saved balance
  public get signedAmount(): number {
    if (this.direction) {
      return this.direction === SavingDirection.Withdrawal ? -Math.abs(this.amount)
        : this.direction === SavingDirection.Yield ? this.amount : Math.abs(this.amount)
    }
    return this.isExpense ? -Math.abs(this.amount) : Math.abs(this.amount)
  }
}
