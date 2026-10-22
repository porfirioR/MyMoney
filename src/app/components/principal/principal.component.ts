import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { combineLatest, Observable, take } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
import { UserCategoryModel } from '../../models/user-category.model';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { HelperService } from '../../services/helper.service';
import { NotificationService } from '../../services/notification.service';
import { SelectYearMonthComponent } from '../select-year-mount/select-year-month.component';
import { CategoryType } from '../../enums/category-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss'],
})
export class PrincipalComponent implements OnInit {
  private static readonly hideAmountsStorageKey = 'my-money.hide-amounts'
  protected hideAmounts = false
  protected income: number = 0
  protected expenses: number = 0
  protected balance: number = 0
  protected yearMonth!: YearMonthModel
  protected movements: MovementModel[] = []
  protected loading = true
  protected groupDateMovementList: GroupDateMovementModel[] = []
  // Every category (also hidden ones) so old movements still show their name
  protected categories: CategoryModel[] = []
  protected categoryType = CategoryType
  protected title = environment.title
  protected numberType = NumberType.English
  private userCategories: UserCategoryModel[] = []

  constructor(
    private readonly dialog: MatDialog,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService
  ) {
    this.yearMonth = this.userService.getSelectedYearMonth()
    this.hideAmounts = this.readHideAmounts()
  }

  // The user data (categories and configuration) is already loaded by UserGuard
  ngOnInit(): void {
    this.categories = this.userService.getAllCategories()
    this.userCategories = this.userService.getUserCategories()
    this.numberType = this.userService.item!.userConfiguration.number
    this.loadMovements()
  }

  protected toggleAmountsVisibility = (): void => {
    this.hideAmounts = !this.hideAmounts
    try {
      localStorage.setItem(PrincipalComponent.hideAmountsStorageKey, String(this.hideAmounts))
    } catch { }
  }

  protected openYearMonth = (): void => {
    const dialogRef = this.dialog.open(SelectYearMonthComponent, {
      width: '400px',
      data: this.yearMonth
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe((result: YearMonthModel) => {
      if (result && (this.yearMonth?.month !== result.month || this.yearMonth?.year !== result.year)) {
        this.yearMonth = result;
        this.userService.setSelectedYearMonth(result)
        this.loadMovements()
      }
    })
  }

  private loadMovements = (): void => {
    this.loading = true
    this.getMovements().subscribe({
      next: (movements) => this.prepareMovementListToView(movements),
      error: (e) => {
        this.loading = false
        this.notificationService.error(e)
      }
    })
  }

  private readHideAmounts = (): boolean => {
    try {
      return localStorage.getItem(PrincipalComponent.hideAmountsStorageKey) === 'true'
    } catch {
      return false
    }
  }

  private getMovements = (): Observable<[MovementModel[], MovementModel[]]> => {
    const expenseList$ = this.movementService.getBySelectedMonth(CategoryType.expense, this.yearMonth?.month!, this.yearMonth?.year!)
    const incomeList$ = this.movementService.getBySelectedMonth(CategoryType.income, this.yearMonth?.month!, this.yearMonth?.year!)
    return combineLatest([expenseList$, incomeList$]).pipe(take(1))
  }

  private prepareMovementListToView = (movements: [MovementModel[], MovementModel[]]): void => {
    this.income = 0
    this.expenses = 0
    this.groupDateMovementList = []
    this.movements = movements[0].concat(movements[1])
    this.movements.forEach(x => x.date = new Date(x.time))
    this.movements = this.movements.sort((a, b) => b.time - a.time)
    this.movements.forEach((movement: MovementModel) => {
      const userCategory = this.userCategories.find(x => x.categoryId === movement.categoryId)
      if (userCategory) {
        movement.color = userCategory.color
        movement.backgroundColor = userCategory.backgroundColor
      }
      const date = movement.date!
      let dateMovement = this.groupDateMovementList.find(x => x.date.getTime() === date.getTime())
      if (dateMovement) {
        dateMovement.movements.push(movement)
      } else {
        dateMovement = new GroupDateMovementModel(date, [movement])
        this.groupDateMovementList.push(dateMovement)
      }
      if (HelperService.isExpense(movement.type)) {
        dateMovement.expense += movement.amount
        this.expenses += movement.amount
      } else {
        dateMovement.income += movement.amount
        this.income += movement.amount
      }
    })
    this.movementService.setMovementList(this.movements)
    this.balance = this.income - this.expenses
    this.loading = false
  }
}
