import { FormControl } from "@angular/forms";
import { CategoryType } from "../enums/category-type.enum";
import { IconType } from "../enums/icon-type.enum";

export interface MovementForm {
  id: FormControl<string | null>
  type: FormControl<CategoryType| null>
  icon: FormControl<IconType | null>
  categoryId: FormControl<string | null>
  memorandum: FormControl<string | null>
  date: FormControl<Date | null>
  amount: FormControl<number | null>
  color: FormControl<string | null>
  backgroundColor: FormControl<string | null>
  time: FormControl<number | null>
  relatedMovements: FormControl<string[] | null>
}
