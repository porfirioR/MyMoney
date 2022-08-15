import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Route, Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { CategoryModel } from 'src/app/models/category.model';
import { GroupDateMovementModel } from 'src/app/models/group-date-movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { MovementService } from '../../services/movement.service';
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
  protected movements: MovementModel[] = []
  protected loading = true
  protected groupDateMovementList: GroupDateMovementModel[] = []
  protected categories: CategoryModel[] = []

  constructor(private dialog: MatDialog,
    private categoryService: CategoryService,
    private readonly movementService: MovementService,
    private router: Router) {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
  }

  ngOnInit() {
    const expenseList$ = this.movementService.getBySelectedMonth(CategoryType.expense, this.yearMonth?.month as number, this.yearMonth?.year as number)
    const incomeList$ = this.movementService.getBySelectedMonth(CategoryType.income, this.yearMonth?.month as number, this.yearMonth?.year as number)
    const categories$ = this.categoryService.getAll().pipe(take(1))
    combineLatest([categories$, expenseList$, incomeList$]).subscribe({
      next: ([categories, expenseMovement, incomeMovement]) => {
        this.categories = categories
        this.movements = expenseMovement.concat(incomeMovement)
        this.movements.forEach(x => x.date = new Date(x.time))
        this.movements = this.movements.sort((a, b) => a.time - b.time)
        this.movements.forEach((movement: MovementModel) => {
          const date = movement.date as Date
          const dateMovement = this.groupDateMovementList.find(x => x.date.getTime() === date.getTime())
          dateMovement ?
            dateMovement.movements.push(movement) :
            this.groupDateMovementList.push(new GroupDateMovementModel(date, [movement]))
        })
        console.log(this.groupDateMovementList)
        
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e;
      }
    })
  }

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
