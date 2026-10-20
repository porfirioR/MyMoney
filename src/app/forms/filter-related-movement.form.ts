import { FormControl } from "@angular/forms";

export interface FilterRelatedMovementForm {
  year: FormControl<null | number>
  category: FormControl<null | string>
  month: FormControl<null | string>
  // Filters the loaded movements by description or category name
  text: FormControl<null | string>
  selectedMovement: FormControl<null | string[]>
}
