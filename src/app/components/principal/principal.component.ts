import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, Observable, take } from 'rxjs';
import { CategoryModel } from 'src/app/models/category.model';
import { GroupDateMovementModel } from 'src/app/models/group-date-movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
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
  protected messageSearch = 'Search'

  constructor(private dialog: MatDialog, private categoryService: CategoryService, private readonly movementService: MovementService, private router: Router) {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
  }

  ngOnInit() {
    const requestMovement$ = this.getMovements()
    const categories$ = this.categoryService.getAll().pipe(take(1))
    combineLatest([categories$, requestMovement$]).subscribe({
      next: ([categories, movements]) => {
        this.categories = categories
        this.prepareMovementListToView(movements)
      }, error: (e) => {
        this.loading = false
        throw e;
      }
    })
  }

  protected openBottomSheet = (): void => {
    const dialogRef = this.dialog.open(SelectYearMountComponent, {
      width: '400px',
      data: this.yearMonth
    })

    dialogRef.afterClosed().subscribe((result: YearMonthModel) => {
      if (result) {
        this.yearMonth = result;
        this.messageSearch = this.yearMonth?.monthLabel ? `${this.yearMonth?.monthLabel} ${this.yearMonth.year}` : 'Search'
        this.getMovements().subscribe({
          next: (movements) => {
            this.prepareMovementListToView(movements)
          }, error: (e) => {
            this.loading = false
            throw e;
          }
        })
      }
    })
  }

  private getMovements = (): Observable<[MovementModel[], MovementModel[]]> => {
    this.loading = true
    const expenseList$ = this.movementService.getBySelectedMonth(CategoryType.expense, this.yearMonth?.month as number, this.yearMonth?.year as number)
    const incomeList$ = this.movementService.getBySelectedMonth(CategoryType.income, this.yearMonth?.month as number, this.yearMonth?.year as number)
    return combineLatest([expenseList$, incomeList$])
  }

  private prepareMovementListToView = (movements: [MovementModel[], MovementModel[]]) => {
    this.movements = movements[0].concat(movements[1])
    this.movements.forEach(x => x.date = new Date(x.time))
    this.movements = this.movements.sort((a, b) => b.time - a.time)
    if (this.movements.length === 0) {
      this.groupDateMovementList = []
      this.income = 0
      this.expenses = 0
    }
    this.movements.forEach((movement: MovementModel) => {
      const date = movement.date as Date
      let dateMovement = this.groupDateMovementList.find(x => x.date.getTime() === date.getTime())
      if (dateMovement) {
        dateMovement.movements.push(movement)
      } else {
        dateMovement = new GroupDateMovementModel(date, [movement])
        this.groupDateMovementList.push(dateMovement)
      }
      if(movement.type === CategoryType.income) {
        dateMovement.income += movement.amount
        this.income += movement.amount
      } else {
        dateMovement.expense += movement.amount
        this.expenses += movement.amount
      }
    })
    this.movementService.setMovementList(this.movements)
    this.balance = this.income - this.expenses
    this.loading = false
  }
}
