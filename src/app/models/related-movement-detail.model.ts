
export class RelatedMovementDetailModel {
  constructor(
    public id: string,
    public date: Date,
    public memorandum: string,
    public amount: number,
    public isExpense: boolean
  ) { }
}
