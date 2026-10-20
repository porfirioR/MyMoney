import { RelatedProgressType } from "../enums/related-progress-type.enum"
import { RelatedMapModel } from "./related-map-model"

export interface RelatedMovementModel {
  id?: string
  owner: string
  name: string
  related: (RelatedMapModel | Record<string, string>)[]
  // Goal of the group (0 = no goal)
  totalAmount: number
  // Stored for reference only: screens recalculate them from the movements
  incomeAmount: number
  expenseAmount: number
  showInUpsertMovement: boolean
  // Missing in groups created before it existed: see HelperService.getRelatedProgressType
  progressType?: RelatedProgressType
}
