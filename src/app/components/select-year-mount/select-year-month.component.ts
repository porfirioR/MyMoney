import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from '../../services/helper.service';
import { MonthType } from '../../enums/month-type.enum';
import { YearMonthModel } from '../../models/year-month-model';
import { SelectYearMonthForm } from '../../forms/select-year-month.form';

@Component({
  selector: 'app-select-year-month',
  templateUrl: './select-year-month.component.html',
  styleUrls: ['./select-year-month.component.scss']
})
export class SelectYearMonthComponent implements OnInit {
  protected months = MonthType
  protected formGroup: FormGroup<SelectYearMonthForm>

  constructor(
    private dialogRef: MatDialogRef<SelectYearMonthComponent>,
    @Inject(MAT_DIALOG_DATA) private yearMonth: YearMonthModel
  ) {
    const currentYear = this.yearMonth.year
    const currentMonth = this.months[this.yearMonth.month]
    this.formGroup = new FormGroup<SelectYearMonthForm>({
      year: new FormControl(currentYear),
      month: new FormControl(currentMonth),
      selectedYear: new FormControl(currentYear),
      selectedMonth: new FormControl(currentMonth)
    })
  }

  ngOnInit(): void { }

  protected previousYear = (): void => {
    const year = this.formGroup.controls.selectedYear
    year.setValue(this.formGroup.value.selectedYear! - 1)
  }

  protected  nextYear = (): void => {
    const year = this.formGroup.controls.selectedYear
    year.setValue(this.formGroup.value.selectedYear! + 1)
  }

  protected changeMonth = (value: string): void => {
    const newYearMonth = new YearMonthModel(this.formGroup.controls.selectedYear.value!, HelperService.convertStringToMonthType(value))
    this.dialogRef.close(newYearMonth)
  }

}

