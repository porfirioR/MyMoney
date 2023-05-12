import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryType } from '../../enums/category-type.enum';
import { ChartConfiguration } from 'chart.js';
import { GroupMovementCategoryModel } from '../../models/group-movement-category.model';
import { combineLatest, switchMap, take } from 'rxjs';
import { MovementModel } from '../../models/movement.model';
import { ChartModel } from '../../models/chart.model';
import { MonthType } from '../../enums/month-type.enum';

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
    labels: Object.keys(MonthType).filter((v) => isNaN(Number(v))).map(x => this.translate.instant(x)),
    datasets: [{
      type: 'bar',
      label: this.translate.instant(CategoryType.expense),
      data: [],
      borderColor: this.redColor,
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    }, {
      type: 'bar',
      label: this.translate.instant(CategoryType.income),
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
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          this.greenColor,
          this.redColor,
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        hoverBackgroundColor: [
          this.greenColor,
          this.redColor,
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        hoverBorderColor: [
          this.greenColor,
          this.redColor,
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)',
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
        text: this.translate.instant('Chart separated by months')
      }
    }
  }, true)
  protected incomeChart = new ChartModel('doughnut', [], { responsive: true }, true)
  protected expenseChart = new ChartModel('doughnut', [], { responsive: true }, true)
  protected loading: boolean = true
  protected incomeGroupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected expenseGroupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected numberType = NumberType.Spanish
  protected language = LanguageType.English
  protected incomeAmount: number = 0
  protected expenseAmount: number = 0
  protected balance: number = 0
  protected yearRange: number[] = []

  constructor(
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly userService: UserService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) { }
  
  ngOnInit(): void {
    this.year = +this.route.snapshot.params['year']
    this.loading = true
    const diffYear = this.year - this.minValidYear
    const initialYear = this.year === this.minValidYear || diffYear > 8 ? this.minValidYear : this.year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)
    this.userService.getUserConfiguration$().pipe(take(1)).pipe(switchMap(config => {
      this.language = config.language
      return this.getMovementForCategoriesByYear(this.year)
    })).pipe(take(1))
    .subscribe({
      next: ([expense, income]) => this.subscribeMovements(expense, income),
      error: (e) => {
        this.loading = false
        console.error(e)
        throw e;
      }
    })
  }

  private subscribeMovements = (expense: MovementModel[], income: MovementModel[]) => {
    this.expenseAmount = 0
    this.incomeAmount = 0
    this.balance = 0
    this.prepareChartDataForExpenseCategory(expense)
    this.prepareChartDataForIncomeCategory(income)
    this.prepareMonthsChartData(expense, income)
    this.globalChartData.labels = [this.translate.instant(CategoryType.income), this.translate.instant(CategoryType.expense)]
    this.globalChartData.datasets[0].label = this.translate.instant('General Balance')
    this.globalChartData.datasets[0].data = [this.incomeAmount, this.expenseAmount]
    this.balance = this.incomeAmount - this.expenseAmount
    this.loading = false
  }

  private prepareChartDataForIncomeCategory = (income: MovementModel[]) => {
    income.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
    this.incomeGroupMovementCategoryModel = this.groupByCategoryName(income)
    this.incomeAmount = income.reduce((a, b) => a + b.amount, 0)

    this.incomeChart.labels = this.incomeGroupMovementCategoryModel.map(x => this.labelMovements(x, this.incomeAmount))
    this.incomeChartData.labels = this.incomeChart.labels
    this.incomeChartData.datasets[0].label = this.translate.instant(CategoryType.income)
    this.incomeChartData.datasets[0].data = this.incomeGroupMovementCategoryModel.map(x => x.amount)
  }

  private prepareChartDataForExpenseCategory = (expense: MovementModel[]) => {
    expense.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
    this.expenseGroupMovementCategoryModel = this.groupByCategoryName(expense)
    this.expenseAmount = expense.reduce((a, b) => a + b.amount, 0)

    this.expenseChart.labels = this.expenseGroupMovementCategoryModel.map(x => this.labelMovements(x, this.expenseAmount))
    this.expenseChartData.labels = this.expenseChart.labels
    this.expenseChartData.datasets[0].label = CategoryType.expense
    this.expenseChartData.datasets[0].data = this.expenseGroupMovementCategoryModel.map(x => x.amount)
  }

  private prepareMonthsChartData = (expense: MovementModel[], income: MovementModel[]) => {
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
    })
  }

  protected yearChanges = (selectedYear: number) => {
    this.loading = true
    this.year = selectedYear
    this.getMovementForCategoriesByYear(selectedYear).pipe(take(1)).subscribe({
      next: ([expense, income]) => this.subscribeMovements(expense, income),
      error: (e) => {
        this.loading = false
        console.error(e)
        throw e;
      }
    })
  }

  private groupByCategoryName = (movements: MovementModel[]): GroupMovementCategoryModel[] => {
    const groups: GroupMovementCategoryModel[] = []
    movements.forEach((movement) => {
      const category = this.userService.getActiveCategories().find(x => x.id === movement.categoryId)!
      movement.categoryName = category.name!
      movement.color = category.color!
      movement.backgroundColor = category.backgroundColor!
      movement.date = new Date(movement.time)
      movement.memorandum = movement.memorandum ? movement.memorandum : movement.categoryName
      const movementCategory = groups.find(x => x.categoryName == movement.categoryName)
      if (movementCategory) {
        movementCategory.movements.push(movement)
        movementCategory.movements.sort((a, b) => a.time - b.time)
        movementCategory.amount += movement.amount
      } else {
        groups.push(new GroupMovementCategoryModel(movement.categoryName, movement.icon, movement.color!, movement.backgroundColor!, movement.amount, [movement]))
      }
    })
    groups.sort((a, b) => b.amount - a.amount)
    return groups
  }

  protected exit = () => {
    this.location.back()
  }

  private labelMovements = (x: GroupMovementCategoryModel, amountMovements: number) => {
    let total = 0
    x.movements.forEach(x => total += x.amount)
    return `${this.translate.instant(x.categoryName)} ${((total * 100)/amountMovements).toFixed(1)}%`
  }

  private getMovementForCategoriesByYear = (year: number) => {
    return combineLatest(this.movementService.getBySelectedYear(CategoryType.expense, year), this.movementService.getBySelectedYear(CategoryType.income, year))
  }
}
