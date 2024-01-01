import { RelatedMapModel } from "./related-map-model"

export interface RelatedMovementModel {
  id: string
  owner: string
  name: string
  related: RelatedMapModel[]
  totalAmount: number
  incomeAmount: number
  expenseAmount: number
}
