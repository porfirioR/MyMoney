import { FormControl } from "@angular/forms"
import { ThemeType } from "../enums/theme-type.enum"

export interface ConfigurationForm {
  id: FormControl<null | string>
  number: FormControl<null | string>
  language: FormControl<null | string>
  theme: FormControl<null | ThemeType>
}
