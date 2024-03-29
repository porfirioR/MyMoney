import { FormControl } from "@angular/forms"

export interface ColorForm {
  color: FormControl<null | string>
  hexColor: FormControl<null | string>
  hexBackgroundColor: FormControl<null | string>
  backgroundColor: FormControl<null | string>
  order: FormControl<null | number>
}
