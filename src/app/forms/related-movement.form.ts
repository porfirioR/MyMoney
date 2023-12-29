import { FormControl } from "@angular/forms"

export interface RelatedMovementForm {
  id: FormControl<string | null>
  description: FormControl<string | null>
  relatedIds: FormControl<string[] | null>
  totalAmount: FormControl<number | null>
  incomeAmount: FormControl<number | null>
  expenseAmount: FormControl<number | null>
  showInUpsertMovement: FormControl<boolean | null>
}
