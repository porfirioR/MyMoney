import { MovementModel } from "./movement.model";

export class GroupDateMovementModel {
  constructor(public date: Date, public movements: MovementModel[]) { }
}
