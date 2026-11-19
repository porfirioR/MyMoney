import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { FormControl, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { combineLatest, skip, take } from 'rxjs';
import { NumberType } from '../../enums/number-type.enum';
import { CategoryType } from '../../enums/category-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { GroupMovementCategoryModel } from '../../models/group-movement-category.model';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { SelectYearMonthComponent } from '../select-year-mount/select-year-month.component';
import { TypeForm } from '../../forms/type.form';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';
import { HelperService } from '../../services/helper.service';
import { BudgetStatusModel } from '../../models/budget-status.model';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { RelatedMovementService } from '../../services/related-movement.service';
import { RegisterMovementComponent } from '../register-movement/register-movement.component';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

@Component({
  selector: 'app-report-month',
  templateUrl: './report-month.component.html',
  styleUrls: ['./report-month.component.scss']
})
export class ReportMonthComponent implements OnInit {
  protected chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: ''
      }
    ]
  }
  protected doughnutChartLabels: string[] = []
  protected chartOptions: ChartOptions = {
    responsive: true,
  }
  protected chartLegend = true;
  protected chartType: ChartType = 'doughnut'
  protected loading: boolean = false
  // Reload after editing or deleting: the report stays on screen so the open panels are kept
  protected refreshing: boolean = false
  protected yearMonth!: YearMonthModel
  protected categoryType = CategoryType
  protected groupMovementCategoryModel: GroupMovementCategoryModel[] = []
  protected formGroup: FormGroup<TypeForm> = new FormGroup<TypeForm>({
    type: new FormControl(this.categoryType.expense),
  })
  protected numberType = NumberType.English
  protected language = LanguageType.English

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    private translate: TranslateService,
    private readonly navigationService: NavigationService,
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
    private readonly relatedMovementService: RelatedMovementService
  ) {
    // Chart colors come from Chart.defaults, so the chart on screen is redrawn when the theme changes
    this.themeService.isDark$.pipe(skip(1), takeUntilDestroyed()).subscribe(() => this.charts?.forEach(x => x.chart?.update()))
  }

  @ViewChildren(BaseChartDirective) private charts?: QueryList<BaseChartDirective>
  
  ngOnInit(): void {
    const config = this.userService.item!.userConfiguration
    this.language = config.language
    this.numberType = config.number
    // Chart labels and ticks use the same number format as the rest of the screen
    this.chartOptions = { responsive: true, locale: config.number }
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
    .subscribe({
      next: ([params, queryParams]) => {
        if (queryParams['year'] && queryParams['month']) {
          this.userService.setSelectedYearMonth(new YearMonthModel(Number(queryParams['year']), Number(queryParams['month'])))
        }
        // Without query params (reload of an old link) the month being viewed is used
        this.yearMonth = this.userService.getSelectedYearMonth()
        const type = params['type']
        this.formGroup.controls.type.setValue(type, { emitEvent: false })
        this.getMovementsByType(type)
      }, error: (e) => this.notificationService.error(e)
    })
    this.formGroup.controls.type.valueChanges.subscribe(type => this.getMovementsByType(type))
  }

  private getMovementsByType = (type: CategoryType | null, silent = false): void => {
    if (silent) {
      this.refreshing = true
    } else {
      this.loading = true
    }
    this.movementService.getBySelectedMonth(type!, this.yearMonth?.month!, this.yearMonth?.year!).pipe(take(1)).subscribe({
      next: (movements) => {
        movements.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
        this.groupMovementCategoryModel = this.groupByCategoryName(movements)
        let amountMovements = 0
        movements.forEach(x => amountMovements += x.amount)
        this.doughnutChartLabels = this.groupMovementCategoryModel.map(x => this.labelMovements(x, amountMovements))
        this.chartData.labels = this.doughnutChartLabels
        this.chartData.datasets[0].label = type!
        this.chartData.datasets[0].data = this.groupMovementCategoryModel.map(x => x.amount)
        // New reference, so the chart already drawn is redrawn with the new values
        this.chartData = { ...this.chartData }
        this.loading = false
        this.refreshing = false
      }, error: (e) => {
        this.loading = false
        this.refreshing = false
        this.notificationService.error(e)
      }
    })
  }

  private reload = (): void => this.getMovementsByType(this.formGroup.controls.type.value, true)

  // The same form of the movements screen, opened over the report so it is not lost
  protected editMovement = (movement: MovementModel): void => {
    if (this.refreshing) { return }
    const dialogRef = this.dialog.open(RegisterMovementComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { movement: { ...movement } }
    })
    dialogRef.afterClosed().pipe(take(1)).subscribe((saved?: boolean) => {
      if (saved) {
        this.reload()
      }
    })
  }

  protected deleteMovement = (movement: MovementModel): void => {
    if (this.refreshing) { return }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translate.instant('movement-messages.title-delete'),
        message: this.translate.instant('movement-messages.question-delete')
      }
    })
    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (!result) { return }
      this.refreshing = true
      this.movementService.delete(movement.id!, movement.type)
        .then(() => this.relatedMovementService.removeMovements([movement.id!]))
        .then(() => {
          this.movementService.deleteMovementForList(movement.id!)
          this.notificationService.message('movement-messages.deleted')
          this.reload()
        }).catch((e) => {
          this.refreshing = false
          this.notificationService.error(e)
        })
    })
  }

  // Keeps the panels (and whether they are open) when the report is reloaded
  protected trackByCategory = (_: number, group: GroupMovementCategoryModel): string => group.categoryName

  protected trackByMovement = (_: number, movement: MovementModel): string => movement.id!

  private groupByCategoryName = (movements: MovementModel[]): GroupMovementCategoryModel[] => {
    const groups: GroupMovementCategoryModel[] = []
    movements.forEach((movement) => {
      // Hidden categories are included: their movements still belong to the month
      const category = this.userService.getAllCategories().find(x => x.id === movement.categoryId)
      movement.categoryName = category?.name ?? ''
      movement.color = category?.color ?? DEFAULT_ICON_COLOR
      movement.backgroundColor = category?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
      movement.date = new Date(movement.time)
      const movementCategory = groups.find(x => x.categoryName == movement.categoryName)
      if (movementCategory) {
        movementCategory.movements.push(movement)
        movementCategory.movements.sort((a, b) => a.time - b.time)
        movementCategory.amount += movement.amount
      } else {
        groups.push(new GroupMovementCategoryModel(movement.categoryName, movement.icon, movement.color!, movement.backgroundColor!, movement.amount, [movement], movement.categoryId))
      }
    })
    groups.sort((a, b) => b.amount - a.amount)
    // Expense categories with a monthly budget show how much of it was spent
    const budgets = HelperService.getBudgetStatuses(this.userService.getAllCategories(), movements)
    groups.forEach(x => x.budget = x.categoryId ? budgets.get(x.categoryId) : undefined)
    return groups
  }

  protected getBudgetBarWidth = (budget: BudgetStatusModel): number => Math.min(budget.percent, 100)

  protected exit = (): void => {
    this.navigationService.back()
  }

  private labelMovements = (x: GroupMovementCategoryModel, amountMovements: number): string => {
    let total = 0
    x.movements.forEach(x => total += x.amount)
    return `${this.translate.instant(x.categoryName)} ${((total * 100)/amountMovements).toFixed(1)}%`
  }

  protected openYearMonth = (): void => {
    const dialogRef = this.dialog.open(SelectYearMonthComponent, {
      width: '400px',
      data: this.yearMonth
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe((result: YearMonthModel) => {
      // The URL keeps the month, so reloading or sharing the screen shows the same report;
      // the query params subscription loads the movements
      if (result && (this.yearMonth?.month !== result.month || this.yearMonth?.year !== result.year)) {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { year: result.year, month: result.month },
          replaceUrl: true
        })
      }
    })
  }
}
