import { MonthType } from "../enums/month-type.enum";

export class YearMonthModel {
  public shortMonth!: string
  constructor(public year: number, public month: MonthType) {
    this.shortMonth = MonthType[month]
  }
}
