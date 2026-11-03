import { IconType } from "../enums/icon-type.enum";
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
    public movement?: MovementModel
  ) { }
}
