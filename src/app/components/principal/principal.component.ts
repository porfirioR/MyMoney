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
import { SelectYearMonthComponent } from '../select-year-mount/select-year-month.component';
import { UserCategoryService } from '../../services/user-category.service';
import { UserService } from '../../services/user.service';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { UserDataModel } from '../../models/user-data.model';
import { environment } from '../../../environments/environment';
import { UserCategoryModel } from '../../models/user-category.model';
import { NumberType } from '../../enums/number-type.enum';
import { ConfigurationModel } from '../../models/configuration.model';
import { LanguageType } from '../../enums/language-type.enum';
import { ConfigurationService } from '../../services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localEs from '@angular/common/locales/es'
import { MonthType } from '../../enums/month-type.enum';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss'],
})
export class PrincipalComponent implements OnInit {
  protected income: number = 0
  protected expenses: number = 0
  protected balance: number = 0
  protected yearMonth!: YearMonthModel
  protected movements: MovementModel[] = []
  protected loading = true
  protected groupDateMovementList: GroupDateMovementModel[] = []
  protected categories: CategoryModel[] = []
  protected categoryType = CategoryType
  protected title = environment.title
  protected numberType = NumberType.English
  private userCategories: UserCategoryModel[] = []

  constructor(private readonly dialog: MatDialog,
              private readonly categoryService: CategoryService,
              private readonly movementService: MovementService,
              private readonly userCategoryService: UserCategoryService,
              private readonly userService: UserService,
              private readonly configurationService: ConfigurationService,
              private translate: TranslateService,
              private readonly router: Router
              ) {
    this.yearMonth = HelperService.getSearchMessage()
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        const userData: UserDataModel = {
          email: user.email!,
          activeCategories: [],
          allCategories: [],
          userCategories: [],
          photo: user.photoURL,
          displayName: user.displayName!,
          userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English, user.email!)
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
    const configuration$ = this.configurationService.getConfiguration().pipe(take(1))
    combineLatest([categories$, requestMovement$, userCategories$, configuration$]).subscribe({
      next: ([categories, movements, userCategories, configuration]) => {
        userCategories.forEach(y => y.categoryId = y.category!.path.split('\/').pop()!)
        this.userCategories = userCategories
        this.prepareMovementListToView(movements)
        this.categories = this.userService.setCategories(categories, userCategories)
        if (configuration) {
          this.userService.setConfiguration(configuration)
          this.numberType = configuration.number
          this.translate.setDefaultLang(configuration.language)
          this.translate.use(configuration.language)
          if (configuration.language === LanguageType.Spanish) {
            registerLocaleData(localEs, 'es')
          }
        }
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e;
      }
    })
  }
  protected openBottomSheet = (): void => {
    const dialogRef = this.dialog.open(SelectYearMonthComponent, {
      width: '400px',
      data: this.yearMonth
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe((result: YearMonthModel) => {
      if (result && (this.yearMonth?.month !== result.month || this.yearMonth?.year !== result.year)) {
        this.yearMonth = result;
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
