import { IconType } from "../enums/icon-type.enum";

export class RelatedMovementDetailModel {
  constructor(
    public id: string,
    public date: Date,
    public memorandum: string,
    public amount: number,
    public isExpense: boolean,
    public icon: IconType,
    public color?: string,
    public backgroundColor?: string
  ) { }
}
