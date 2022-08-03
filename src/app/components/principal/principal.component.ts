import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { YearMonthModel } from 'src/app/models/year-month-model';
import { SelectYearMountComponent } from '../select-year-mount/select-year-mount.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss'],
})
export class PrincipalComponent implements OnInit {
  protected income: number = 0
  protected expenses: number = 0
  protected balance: number = 0
  protected yearMonth?: YearMonthModel

  constructor(private dialog: MatDialog) {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
  }

  ngOnInit() {}

  protected openBottomSheet = (): void => {
    const dialogRef = this.dialog.open(SelectYearMountComponent, {
      width: '400px',
      data: this.yearMonth,
    })

    dialogRef.afterClosed().subscribe((result: YearMonthModel) => {
      if (result) {
        this.yearMonth = result;
      }
    })
  }
}
