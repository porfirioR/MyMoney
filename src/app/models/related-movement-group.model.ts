import { MovementModel } from "./movement.model";

export interface RelatedMovementGroupModel {
  expenses: MovementModel[],
  incomes: MovementModel[]
}
