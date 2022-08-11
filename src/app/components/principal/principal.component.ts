import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { YearMonthModel } from 'src/app/models/year-month-model';
import { CategoryService } from 'src/app/services/category.service';
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

  constructor(private dialog: MatDialog, private categoryService: CategoryService) {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
    categoryService.getAll().pipe(take(1)).subscribe({
      next: (x) => {
        console.log(x);
      }, error: (e) => {
        throw e;
      }
    })
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
