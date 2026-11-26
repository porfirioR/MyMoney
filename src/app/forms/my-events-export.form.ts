import { FormControl } from "@angular/forms"

// Date range of the my-events export; the backup always takes everything
export interface MyEventsExportForm {
  startDate: FormControl<null | Date>
  endDate: FormControl<null | Date>
}
