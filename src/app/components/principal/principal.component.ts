import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, Observable, take } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
import { CategoryService } from '../../services/category.service';
import { MovementService } from '../../services/movement.service';
import { SelectYearMountComponent } from '../select-year-mount/select-year-mount.component';
import { UserCategoryService } from '../../services/user-category.service';
import { UserService } from '../../services/user.service';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { UserDataModel } from '../../models/user-data.model';
import { environment } from '../../../environments/environment';
import { UserCategoryModel } from '../../models/user-category.model';

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
  protected categoryType = CategoryType
  protected title = environment.title
  private userCategories: UserCategoryModel[] = []
  constructor(private readonly dialog: MatDialog,
              private readonly categoryService: CategoryService,
              private readonly movementService: MovementService,
              private readonly userCategoryService: UserCategoryService,
              private readonly userService: UserService,
              private readonly router: Router
              ) {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        const userData: UserDataModel = {
          email: user.email!,
          activeCategories: [],
          allCategories: [],
          userCategories: [],
          photo: user.photoURL,
          displayName: user.displayName!
        }
        this.userService.setUser(userData)
      } else {
        this.router.navigate(['logout'])
      }
    })
  }

  ngOnInit() {
    const requestMovement$ = this.getMovements().pipe(take(1))
    const categories$ = this.categoryService.getAll().pipe(take(1))
    const userCategories$ = this.userCategoryService.getUserCategories().pipe(take(1))
    combineLatest([categories$, requestMovement$, userCategories$]).subscribe({
      next: ([categories, movements, userCategories]) => {
        userCategories.forEach(y => y.categoryId = y.category!.path.split('\/').pop()!)
        this.userCategories = userCategories
        this.prepareMovementListToView(movements)
        this.categories = this.userService.setCategories(categories, userCategories)
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

    dialogRef.afterClosed().pipe(take(1)).subscribe((result: YearMonthModel) => {
      if (result && (this.yearMonth?.month !== result.month || this.yearMonth?.year !== result.year)) {
        this.yearMonth = result;
        this.messageSearch = this.yearMonth?.monthLabel ? `${this.yearMonth?.monthLabel} ${this.yearMonth.year}` : 'Search'
        this.movements = []
        this.income = 0
        this.expenses = 0
        this.groupDateMovementList = []
        this.balance = 0
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
    const expenseList$ = this.movementService.getBySelectedMonth(CategoryType.expense, this.yearMonth?.month!, this.yearMonth?.year!)
    const incomeList$ = this.movementService.getBySelectedMonth(CategoryType.income, this.yearMonth?.month!, this.yearMonth?.year!)
    return combineLatest([expenseList$, incomeList$])
  }

  private prepareMovementListToView = (movements: [MovementModel[], MovementModel[]]) => {
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
