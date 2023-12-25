import { RelatedMapModel } from "./related-map-model"

export interface RelatedMovementModel {
  id: string
  owner: string
  description: string
  related: RelatedMapModel[]
  totalAmount: number
  incomeAmount: number
  expenseAmount: number
}
