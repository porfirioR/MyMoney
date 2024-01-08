import { FormControl } from "@angular/forms"

export interface RelatedMovementForm {
  id: FormControl<string | null>
  name: FormControl<string | null>
  relatedIds: FormControl<string[] | null>
  totalAmount: FormControl<number | null>
  incomeAmount: FormControl<number | null>
  expenseAmount: FormControl<number | null>
  showInUpsertMovement: FormControl<boolean | null>
}
