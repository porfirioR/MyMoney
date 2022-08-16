import { MovementModel } from "./movement.model";

export class GroupDateMovementModel {
  public income = 0
  public expense = 0
  constructor(public date: Date, public movements: MovementModel[]) { }
}
