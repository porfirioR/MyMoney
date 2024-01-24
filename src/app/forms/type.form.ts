import { FormControl } from "@angular/forms";
import { CategoryType } from "../enums/category-type.enum";

export interface TypeForm {
  type: FormControl<CategoryType | null>
}
