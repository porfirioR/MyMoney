import { RelatedMapModel } from "./related-map-model"

export interface RelatedMovementModel {
  id?: string
  owner: string
  name: string
  related: (RelatedMapModel | Record<string, string>)[]
  totalAmount: number
  incomeAmount: number
  expenseAmount: number
  showInUpsertMovement: boolean
}
