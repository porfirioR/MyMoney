import { FormControl } from "@angular/forms"
import { IconType } from "../enums/icon-type.enum"

export interface UpsertCategoryForm {
  name: FormControl<null | string>
  icon: FormControl<null | IconType>
  color: FormControl<null | string>
  hexColor: FormControl<null | string>
  backgroundColor: FormControl<null | string>
  hexBackgroundColor: FormControl<null | string>
  order: FormControl<null | number>
}
