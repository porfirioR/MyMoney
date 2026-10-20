import { FormControl } from "@angular/forms"
import { RelatedProgressType } from "../enums/related-progress-type.enum"

export interface RelatedMovementForm {
  id: FormControl<string | null>
  name: FormControl<string | null>
  progressType: FormControl<RelatedProgressType | null>
  // Saved as totalAmount
  goal: FormControl<number | null>
  showInUpsertMovement: FormControl<boolean | null>
}
