// How much of a category's monthly budget was spent
export class BudgetStatusModel {
  // From this percent the budget is shown as close to its limit
  public static readonly nearPercent = 90

  constructor(
    public spent: number,
    public budget: number
  ) { }

  // Can go over 100 when the budget is exceeded; the bar clamps it
  public get percent(): number {
    return this.budget > 0 ? this.spent / this.budget * 100 : 0
  }

  public get isOver(): boolean {
    return this.spent > this.budget
  }

  public get isNear(): boolean {
    return !this.isOver && this.percent >= BudgetStatusModel.nearPercent
  }
}
