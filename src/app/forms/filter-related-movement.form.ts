import { FormControl } from "@angular/forms";

export interface FilterRelatedMovementForm {
  year: FormControl<null | number>
  category: FormControl<null | string>
  month: FormControl<null | string>
  selectedMovement: FormControl<null | string[]>
  hasAnyCategory: FormControl<null | boolean>
}
