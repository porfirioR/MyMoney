import { FormControl } from "@angular/forms"
import { IconType } from "../enums/icon-type.enum"

export interface CategoryForm {
  name: FormControl<null | string>
  icon: FormControl<null | IconType>
  type: FormControl<null | string>
  active: FormControl<null | boolean>
  owner: FormControl<null | string>
}
