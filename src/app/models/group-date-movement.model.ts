import { MovementModel } from "./movement.model";

export class GroupDateMovementModel {
  public income = 0
  public expense = 0
  // Net effect of the saving movements of the day (deposits − withdrawals + yields)
  public saving = 0
  // True when the day has saving movements, even if they add up to 0
  public hasSavings = false
  constructor(public date: Date, public movements: MovementModel[]) { }
}
