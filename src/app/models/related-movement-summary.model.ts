import { RelatedProgressType } from '../enums/related-progress-type.enum';

// Totals of a related movement group, always calculated from its real movements
export class RelatedMovementSummaryModel {
  constructor(
    public progressType: RelatedProgressType,
    public goal: number,
    public expenseAmount: number,
    public incomeAmount: number,
    public count: number,
    public lastDate?: Date,
    // Saving movements (only saving groups have them)
    public depositAmount = 0,
    public withdrawalAmount = 0,
    // Can be negative when the saving lost value
    public yieldAmount = 0
  ) { }

  public get balance(): number {
    return this.incomeAmount - this.expenseAmount
  }

  // What is in the saving today
  public get savingBalance(): number {
    return this.depositAmount - this.withdrawalAmount + this.yieldAmount
  }

  public get isSaving(): boolean {
    return this.progressType === RelatedProgressType.Saving
  }

  public get progress(): number {
    switch (this.progressType) {
      case RelatedProgressType.Income: return this.incomeAmount
      case RelatedProgressType.Balance: return this.balance
      // Withdrawing at the end does not undo what was saved: the goal follows the deposits
      case RelatedProgressType.Saving: return this.depositAmount
      default: return this.expenseAmount
    }
  }

  // What is left to reach the goal; negative when the goal was exceeded
  public get remaining(): number {
    return this.goal - Math.max(this.progress, 0)
  }

  // Can go over 100 when the goal is exceeded; the progress bar clamps it
  public get percent(): number {
    return this.goal > 0 ? Math.max(this.progress, 0) / this.goal * 100 : 0
  }
}
