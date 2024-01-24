import { FormControl } from "@angular/forms"
import { NumberType } from "../enums/number-type.enum"
import { LanguageType } from "../enums/language-type.enum"

export interface ConfigurationForm {
  id: FormControl<null | string>
  number: FormControl<null | string>
  language: FormControl<null | string>
}