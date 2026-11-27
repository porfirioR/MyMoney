import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, skip, take } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { GroupMovementCategoryModel, GroupMovementMonthModel } from '../../models/group-movement-category.model';
import { MovementModel } from '../../models/movement.model';
import { ChartModel } from '../../models/chart.model';
import { AnnualReportExportModel, CategoryMonthlyAmountModel } from '../../models/annual-report-export.model';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { RelatedMovementService } from '../../services/related-movement.service';
import { RegisterMovementComponent } from '../register-movement/register-movement.component';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { HelperService } from '../../services/helper.service';
import { SavingTotalsModel } from '../../models/saving-totals.model';
import { SearchHelper } from '../../services/search.helper';

@Component({
  selector: 'app-annual-report',
  templateUrl: './annual-report.component.html',
  styleUrls: ['./annual-report.component.scss']
})
export class AnnualReportComponent implements OnInit {
  private minValidYear = 2018
  protected year: number = new Date().getFullYear()
  protected redColor = 'rgb(255, 99, 132)'
  protected greenColor = 'rgb(75, 192, 192)'
  protected neutralColor = 'var(--text-secondary)'
  protected savingColor = 'rgb(54, 162, 235)'
  private savingBackgroundColor = 'rgba(54, 162, 235, 0.2)'
  protected incomeChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [''],
    datasets: [
      {
        data: [],
        label: ''
      }
    ]
  }
  protected expenseChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: ''
      }
    ]
  }
  protected monthsChartData: ChartConfiguration['data'] = {
    labels: Object.keys(MonthType).filter((v) => isNaN(Number(v))).map(x => this.translateService.instant(x)),
    datasets: [{
      type: 'bar',
      label: this.translateService.instant(CategoryType.expense),
      data: [],
      borderColor: this.redColor,
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    }, {
      type: 'bar',
      label: this.translateService.instant(CategoryType.income),
      data: [],
      borderColor: this.greenColor,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      hoverBackgroundColor: this.greenColor,
      hoverBorderColor: this.greenColor
    }]
  }
  protected globalChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          this.greenColor,
          this.redColor,
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(255, 159, 64)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        hoverBackgroundColor: [
          this.greenColor,
          this.redColor,
          'rgb(54, 162, 235)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        hoverBorderColor: [
          this.greenColor,
          this.redColor,
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(255, 159, 64)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }
    ]
  }
  protected globalChart = new ChartModel('bar', [], {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  }, true)
  protected monthsChart = new ChartModel('scatter', [], {
    responsive: true,
    scales: {
      x: {
        beginAtZero: false
      },
    },
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: this.translateService.instant('Chart separated by months')
      }
    }
  }, true)
  protected incomeChart = new ChartModel('doughnut', [], { responsive: true }, true)
  protected expenseChart = new ChartModel('doughnut', [], { responsive: true }, true)
  protected loading: boolean = true
  // Reload after editing or deleting: the report stays on screen so the open panels are kept
  protected refreshing: boolean = false
  protected incomeGroupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected expenseGroupMovementCategoryModel!: GroupMovementCategoryModel[]
  // Savings of the year: they are neither incomes nor expenses, and they only show when the year has some
  protected savingGroupMovementCategoryModel: GroupMovementCategoryModel[] = []
  protected savingTotals = new SavingTotalsModel()
  protected available: number = 0
  // Everything kept in the savings on December 31 (movements of every year up to then)
  protected savingClosingBalance: number = 0
  protected numberType = NumberType.English
  protected language = LanguageType.English
  protected incomeAmount: number = 0
  protected expenseAmount: number = 0
  protected balance: number = 0
  protected yearRange: number[] = []
  // Local search inside the categories and movements of the year
  protected searchText = ''
  protected searching = false
  protected visibleIncomeGroups: GroupMovementCategoryModel[] = []
  protected visibleExpenseGroups: GroupMovementCategoryModel[] = []
  protected visibleSavingGroups: GroupMovementCategoryModel[] = []
  protected searchCount = 0
  protected searchTotal: number | null = null

  constructor(
    private readonly movementService: MovementService,
    private readonly userService: UserService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
    private readonly dialog: MatDialog,
    private readonly relatedMovementService: RelatedMovementService
  ) {
    // Chart colors come from Chart.defaults, so the charts on screen are redrawn when the theme changes
    this.themeService.isDark$.pipe(skip(1), takeUntilDestroyed()).subscribe(() => this.charts?.forEach(x => x.chart?.update()))
  }

  @ViewChildren(BaseChartDirective) private charts?: QueryList<BaseChartDirective>
  
  ngOnInit(): void {
    const currentYear = new Date().getFullYear()
    const year = Number(this.route.snapshot.params['year'])
    this.year = Number.isInteger(year) && year >= this.minValidYear && year <= currentYear ? year : currentYear
    // Only years that can have movements: from the first valid year to the current one, newest first
    this.yearRange = Array.from({ length: currentYear - this.minValidYear + 1 }, (_, i) => currentYear - i)
    const config = this.userService.item!.userConfiguration
    this.language = config.language
    this.numberType = config.number
    this.setChartsLocale(config.number)
    this.loadYear(this.year)
  }

  protected get hasSavings(): boolean {
    return !this.savingTotals.isEmpty
  }

  private subscribeMovements = (expense: MovementModel[], income: MovementModel[], savingsUntilYearEnd: MovementModel[]): void => {
    this.expenseAmount = 0
    this.incomeAmount = 0
    this.balance = 0
    const [startTime] = this.movementService.getYearTimeRange(this.year)
    const saving = savingsUntilYearEnd.filter(x => x.time >= startTime)
    this.prepareChartDataForExpenseCategory(expense)
    this.prepareChartDataForIncomeCategory(income)
    this.prepareSavings(saving, savingsUntilYearEnd)
    this.prepareMonthsChartData(expense, income, saving)
    const labels = [this.translateService.instant(CategoryType.income), this.translateService.instant(CategoryType.expense)]
    const data = [this.incomeAmount, this.expenseAmount]
    // The third bar is what went to the savings (deposits - withdrawals)
    if (this.hasSavings) {
      labels.push(this.translateService.instant(CategoryType.saving))
      data.push(this.savingTotals.saved)
    }
    this.globalChartData.labels = labels
    this.globalChartData.datasets[0].label = this.translateService.instant('General Balance')
    this.globalChartData.datasets[0].data = data
    this.balance = this.incomeAmount - this.expenseAmount
    this.available = this.balance - this.savingTotals.saved
    // New references, so the charts already drawn are redrawn with the new values
    this.globalChartData = { ...this.globalChartData }
    this.monthsChartData = { ...this.monthsChartData }
    this.incomeChartData = { ...this.incomeChartData }
    this.expenseChartData = { ...this.expenseChartData }
    this.applySearch()
    this.loading = false
    this.refreshing = false
  }

  private prepareChartDataForIncomeCategory = (income: MovementModel[]): void => {
    income.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
    this.incomeGroupMovementCategoryModel = this.groupByCategoryName(income)
    this.incomeAmount = income.reduce((a, b) => a + b.amount, 0)

    this.incomeChart.labels = this.incomeGroupMovementCategoryModel.map(x => this.labelMovements(x, this.incomeAmount))
    this.incomeChartData.labels = this.incomeChart.labels
    this.incomeChartData.datasets[0].label = this.translateService.instant(CategoryType.income)
    this.incomeChartData.datasets[0].data = this.incomeGroupMovementCategoryModel.map(x => x.amount)
  }

  private prepareChartDataForExpenseCategory = (expense: MovementModel[]): void => {
    expense.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
    this.expenseGroupMovementCategoryModel = this.groupByCategoryName(expense)
    this.expenseAmount = expense.reduce((a, b) => a + b.amount, 0)

    this.expenseChart.labels = this.expenseGroupMovementCategoryModel.map(x => this.labelMovements(x, this.expenseAmount))
    this.expenseChartData.labels = this.expenseChart.labels
    this.expenseChartData.datasets[0].label = this.translateService.instant(CategoryType.expense)
    this.expenseChartData.datasets[0].data = this.expenseGroupMovementCategoryModel.map(x => x.amount)
  }

  private prepareSavings = (saving: MovementModel[], savingsUntilYearEnd: MovementModel[]): void => {
    this.savingTotals = HelperService.getSavingTotals(saving)
    const balances = HelperService.getSavingBalances(savingsUntilYearEnd)
    this.savingClosingBalance = [...balances.values()].reduce((a, b) => a + b, 0)
    saving.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
    this.savingGroupMovementCategoryModel = this.groupByCategoryName(saving)
    this.savingGroupMovementCategoryModel.forEach(x => {
      x.saving = HelperService.getSavingTotals(x.movements)
      x.closingBalance = balances.get(x.categoryId!) ?? 0
    })
  }

  private prepareMonthsChartData = (expense: MovementModel[], income: MovementModel[], saving: MovementModel[]): void => {
    const [expenseDataset, incomeDataset] = this.monthsChartData.datasets
    const savingDataset = this.monthsChartData.datasets[2] ?? {
      type: 'bar',
      label: this.translateService.instant(CategoryType.saving),
      data: [],
      borderColor: this.savingColor,
      backgroundColor: this.savingBackgroundColor,
      hoverBackgroundColor: this.savingColor,
      hoverBorderColor: this.savingColor
    }
    // The bar of the savings only shows when the year has some
    this.monthsChartData.datasets = this.hasSavings ? [expenseDataset, incomeDataset, savingDataset] : [expenseDataset, incomeDataset]
    Object.values(MonthType).filter((v) => !isNaN(Number(v))).map((x)  => {
      const month = +x
      const startDate = new Date(this.year, month, 1)
      startDate.setHours(0, 0, 0)
      const startTime = startDate.getTime()
      const endDate = new Date(this.year, month + 1, 0)
      endDate.setHours(23, 59, 59)
      const endTime = endDate.getTime()
      const incomeByMonth = income.filter(x => x.time >= startTime && x.time <= endTime)
      const expensesByMonth = expense.filter(x => x.time >= startTime && x.time <= endTime)
      this.monthsChartData.datasets[0].data[month] = expensesByMonth.reduce((a, b) => a + b.amount, 0)
      this.monthsChartData.datasets[1].data[month] = incomeByMonth.reduce((a, b) => a + b.amount, 0)
      savingDataset.data[month] = HelperService.getSavingTotals(saving.filter(x => x.time >= startTime && x.time <= endTime)).saved
    })
  }

  // The URL follows the selected year, so reloading or going back keeps it
  protected yearChanges = (selectedYear: number): void => {
    this.year = selectedYear
    this.router.navigate(['annual-report', selectedYear], { replaceUrl: true })
    this.loadYear(selectedYear)
  }

  private loadYear = (year: number, silent = false): void => {
    if (silent) {
      this.refreshing = true
    } else {
      this.loading = true
      // Another year: the previous search would only show empty results. Reloads after editing or deleting keep it
      this.searchText = ''
    }
    this.getMovementForCategoriesByYear(year).pipe(take(1)).subscribe({
      next: ([expense, income, saving]) => this.subscribeMovements(expense, income, saving),
      error: (e) => {
        this.loading = false
        this.refreshing = false
        this.notificationService.error(e)
      }
    })
  }

  protected onSearch = (text: string): void => {
    this.searchText = text
    this.applySearch()
  }

  // A category whose name matches shows all its movements; otherwise only the movements that match,
  // still split by month. Detail panels and categories with results are opened
  private applySearch = (): void => {
    const query = SearchHelper.parse(this.searchText)
    this.searching = query.active
    const filter = (groups: GroupMovementCategoryModel[]): GroupMovementCategoryModel[] => {
      if (!query.active) { return groups }
      return groups
        .map(group => {
          const categoryName = this.translateService.instant(group.categoryName)
          if (SearchHelper.matchesText(query, categoryName)) {
            return group
          }
          const movements = group.movements.filter(x => SearchHelper.matchesMovement(query, x, categoryName))
          const amount = movements.reduce((total, x) => total + this.getAmount(x), 0)
          const filtered = new GroupMovementCategoryModel(group.categoryName, group.icon, group.color, group.backgroundColor, amount, movements, group.categoryId)
          filtered.months = this.groupByMonth(movements)
          filtered.saving = group.saving ? HelperService.getSavingTotals(movements) : undefined
          filtered.closingBalance = group.closingBalance
          return filtered
        })
        .filter(group => group.movements.length > 0)
    }
    this.visibleIncomeGroups = filter(this.incomeGroupMovementCategoryModel)
    this.visibleExpenseGroups = filter(this.expenseGroupMovementCategoryModel)
    this.visibleSavingGroups = filter(this.savingGroupMovementCategoryModel)
    const results = [...this.visibleIncomeGroups, ...this.visibleExpenseGroups, ...this.visibleSavingGroups].flatMap(x => x.movements)
    this.searchCount = query.active ? results.length : 0
    this.searchTotal = query.active ? SearchHelper.getTotal(results) : null
  }

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
        this.loadYear(this.year, true)
      }
    })
  }

  protected deleteMovement = (movement: MovementModel): void => {
    if (this.refreshing) { return }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('movement-messages.title-delete'),
        message: this.translateService.instant('movement-messages.question-delete')
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
          this.loadYear(this.year, true)
        }).catch((e) => {
          this.refreshing = false
          this.notificationService.error(e)
        })
    })
  }

  // Keeps the panels (and whether they are open) when the report is reloaded
  // While searching, each new text creates the panels again so the ones with results open
  protected trackByCategory = (_: number, group: GroupMovementCategoryModel): string =>
    this.searching ? `${group.categoryName}|${this.searchText}` : group.categoryName

  protected trackByMonth = (_: number, month: GroupMovementMonthModel): number => month.month

  protected trackByMovement =(_: number, movement: MovementModel): string => movement.id!

  // Ticks and tooltips of every chart use the configured number format
  private setChartsLocale = (locale: string): void => {
    [this.globalChart, this.monthsChart, this.incomeChart, this.expenseChart].forEach(x => x.chartOptions = { ...x.chartOptions, locale })
  }

  // Incomes and expenses are shown positive; savings with their effect on the balance
  protected getAmount = (movement: MovementModel): number =>
    HelperService.isSaving(movement.type) ? HelperService.getSavingEffect(movement) : movement.amount

  protected getBalanceColor = (): string => this.available > 0 ? this.greenColor : this.available < 0 ? this.redColor : this.neutralColor

  private groupByCategoryName = (movements: MovementModel[]): GroupMovementCategoryModel[] => {
    const groups: GroupMovementCategoryModel[] = []
    movements.forEach((movement) => {
      // Hidden categories are included: their movements still count for the year
      const category = this.userService.getAllCategories().find(x => x.id === movement.categoryId)
      movement.categoryName = category?.name ?? ''
      movement.color = category?.color ?? DEFAULT_ICON_COLOR
      movement.backgroundColor = category?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
      movement.date = new Date(movement.time)
      // A saving adds its effect on the balance: deposits add, withdrawals subtract
      const amount = this.getAmount(movement)
      const movementCategory = groups.find(x => x.categoryName == movement.categoryName)
      if (movementCategory) {
        movementCategory.movements.push(movement)
        movementCategory.movements.sort((a, b) => a.time - b.time)
        movementCategory.amount += amount
      } else {
        groups.push(new GroupMovementCategoryModel(movement.categoryName, movement.icon, movement.color!, movement.backgroundColor!, amount, [movement], movement.categoryId))
      }
    })
    groups.sort((a, b) => b.amount - a.amount)
    groups.forEach(x => x.months = this.groupByMonth(x.movements))
    return groups
  }

  // Only the months that have movements, in calendar order
  private groupByMonth = (movements: MovementModel[]): GroupMovementMonthModel[] => {
    const months = new Map<number, GroupMovementMonthModel>()
    movements.forEach(movement => {
      const month = new Date(movement.time).getMonth()
      const group = months.get(month) ?? new GroupMovementMonthModel(month, new Date(this.year, month, 1))
      group.movements.push(movement)
      group.amount += this.getAmount(movement)
      months.set(month, group)
    })
    return [...months.values()].sort((a, b) => a.month - b.month)
  }

  protected exportReport = (): void => {
    const report: AnnualReportExportModel = {
      year: this.year,
      generatedAt: new Date().toISOString().split('T')[0],
      summary: {
        totalIncome: this.incomeAmount,
        totalExpense: this.expenseAmount,
        balance: this.balance
      },
      categoriesByMonth: {
        expense: this.buildMonthlyCategoryBreakdown(this.expenseGroupMovementCategoryModel),
        income: this.buildMonthlyCategoryBreakdown(this.incomeGroupMovementCategoryModel)
      }
    }
    // A year without savings exports the same as before
    if (this.hasSavings) {
      report.summary.totalDeposited = this.savingTotals.deposited
      report.summary.totalWithdrawn = this.savingTotals.withdrawn
      report.summary.totalYields = this.savingTotals.yields
      report.summary.totalSaved = this.savingTotals.saved
      report.summary.available = this.available
      report.summary.savingBalanceAtYearEnd = this.savingClosingBalance
      report.categoriesByMonth.saving = this.buildMonthlyCategoryBreakdown(this.savingGroupMovementCategoryModel)
    }
    this.downloadJson(report, `annual-report-${this.year}.json`)
  }

  private buildMonthlyCategoryBreakdown = (groups: GroupMovementCategoryModel[]): CategoryMonthlyAmountModel[] => {
    const monthKeys = Object.keys(MonthType).filter((v) => isNaN(Number(v)))
    return groups.map(group => {
      const months = monthKeys.reduce((acc, monthKey) => ({ ...acc, [monthKey]: 0 }), {} as Record<string, number>)
      group.movements.forEach(movement => {
        const monthKey = MonthType[new Date(movement.time).getMonth()]
        months[monthKey] += this.getAmount(movement)
      })
      return { category: group.categoryName, total: group.amount, months }
    })
  }

  private downloadJson = (data: unknown, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  private labelMovements = (x: GroupMovementCategoryModel, amountMovements: number): string => {
    let total = 0
    x.movements.forEach(x => total += x.amount)
    return `${this.translateService.instant(x.categoryName)} ${((total * 100)/amountMovements).toFixed(1)}%`
  }

  private getMovementForCategoriesByYear = (year: number) => combineLatest([
    this.movementService.getBySelectedYear(CategoryType.expense, year),
    this.movementService.getBySelectedYear(CategoryType.income, year),
    this.movementService.getSavingsUntil(this.movementService.getYearTimeRange(year)[1])
  ])
  
}
