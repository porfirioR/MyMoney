import { FormControl } from "@angular/forms"

export interface SelectYearMonthForm {
  year: FormControl<null | number>
  month: FormControl<null | string>
  selectedYear: FormControl<null | number>
  selectedMonth: FormControl<null | string>
}
