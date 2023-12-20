import { FormControl } from "@angular/forms"
import { CategoryType } from "../enums/category-type.enum"

export interface ExportMovementForm {
  startDate: FormControl<null | Date>
  endDate: FormControl<null | Date>
  categories: FormControl<null | CategoryType[]>
}
