import { MovementModel } from "./movement.model";

export class RelatedMovementGroupModel {
  constructor(
    public id: string,
    public expenses: MovementModel[],
    public incomes: MovementModel[]
  ) { }
}
