import { FormControl } from "@angular/forms";

// Where the movements are searched: one month, a whole year or every date
export type MovementSearchPeriod = 'month' | 'year' | 'all'

export interface FilterRelatedMovementForm {
  period: FormControl<MovementSearchPeriod>
  year: FormControl<null | number>
  category: FormControl<null | string>
  month: FormControl<null | string>
  // Filters the loaded movements by description or category name
  text: FormControl<null | string>
  selectedMovement: FormControl<null | string[]>
}
