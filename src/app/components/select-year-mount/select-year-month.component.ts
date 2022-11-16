import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from '../../services/helper.service';
import { MonthType } from '../../enums/month-type.enum';
import { YearMonthModel } from '../../models/year-month-model';

@Component({
  selector: 'app-select-year-month',
  templateUrl: './select-year-month.component.html',
  styleUrls: ['./select-year-month.component.scss']
})
export class SelectYearMonthComponent implements OnInit {
  protected months = MonthType
  protected formGroup: FormGroup = new FormGroup({})

  constructor(private dialogRef: MatDialogRef<SelectYearMonthComponent>,
              @Inject(MAT_DIALOG_DATA) private yearMonth: YearMonthModel) {
    const currentYear = this.yearMonth.year
    const currentMonth = this.months[this.yearMonth.month]
    this.formGroup = new FormGroup( {
      year: new FormControl(currentYear),
      month: new FormControl(currentMonth),
      selectedYear: new FormControl(currentYear),
      selectedMonth: new FormControl(currentMonth)
    })
  }

  ngOnInit() { }

  protected previousYear = () => {
    const year = this.formGroup.get('selectedYear') as FormControl
    year.setValue(year.value - 1)
  }

  protected  nextYear = () => {
    const year = this.formGroup.get('selectedYear') as FormControl
    year.setValue(year.value + 1)
  }

  protected changeMonth = (value: string): void => {
    const newYearMonth = new YearMonthModel(this.formGroup.get('selectedYear')?.value, HelperService.convertStringToMonthType(value))
    this.dialogRef.close(newYearMonth)
  }

}

