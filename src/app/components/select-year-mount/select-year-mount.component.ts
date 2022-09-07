import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YearMonthModel } from '../../models/year-month-model';

@Component({
  selector: 'app-select-year-mount',
  templateUrl: './select-year-mount.component.html',
  styleUrls: ['./select-year-mount.component.scss']
})
export class SelectYearMountComponent implements OnInit {
  protected months  = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ]
  protected formGroup: FormGroup = new FormGroup({})

  constructor(private dialogRef: MatDialogRef<SelectYearMountComponent>,
              @Inject(MAT_DIALOG_DATA) private yearMonth: YearMonthModel) {
    const currentYear = this.yearMonth.year
    const currentMonth = this.yearMonth.monthLabel ? this.yearMonth.monthLabel : this.months[this.yearMonth.month]
    this.formGroup = new FormGroup( {
      year: new FormControl(currentYear),
      month: new FormControl(currentMonth),
      selectedYear: new FormControl(currentYear),
      selectedMonth: new FormControl(currentMonth)
    })
  }

  ngOnInit() {
  }

  protected previousYear = () => {
    const year = this.formGroup.get('selectedYear') as FormControl
    year.setValue(year.value - 1)
  }

  protected  nextYear = () => {
    const year = this.formGroup.get('selectedYear') as FormControl
    year.setValue(year.value + 1)
  }

  protected changeMonth = (monthLabel: string): void => {
    const newYearMonth = new YearMonthModel(this.formGroup.get('selectedYear')?.value, monthLabel, this.months.indexOf(monthLabel))
    this.dialogRef.close(newYearMonth)
  }

}

