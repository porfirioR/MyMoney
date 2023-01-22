import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { CategoryType } from '../../enums/category-type.enum';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { YearMonthModel } from '../../models/year-month-model';
import { GroupMovementCategoryModel } from '../../models/group-movement-category.model';
import { combineLatest, filter, forkJoin, mergeAll, Observable, switchMap, take } from 'rxjs';
import { MovementModel } from '../../models/movement.model';
import { SelectYearMonthComponent } from '../select-year-mount/select-year-month.component';
import { MonthType } from 'src/app/enums/month-type.enum';

@Component({
  selector: 'app-annual-report',
  templateUrl: './annual-report.component.html',
  styleUrls: ['./annual-report.component.scss']
})
export class AnnualReportComponent implements OnInit {
  @Input() year: number = new Date().getFullYear()
  private minValidYear = 2015
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
  protected loading: boolean = true
  protected yearMonth!: YearMonthModel
  protected categoryType = CategoryType
  protected groupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected formGroup: FormGroup = new FormGroup({
    type: new FormControl<CategoryType>(this.categoryType.expense),
    year: new FormControl<number>(this.year)
  })
  protected numberType = NumberType.Spanish
  protected language = LanguageType.English
  protected income: number = 0
  protected expenses: number = 0
  protected balance: number = 0
  protected yearRange: number[] = []

  constructor(
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    private translate: TranslateService
  ) { }
  
  ngOnInit(): void {
    const diffYear = this.year - this.minValidYear
    const initialYear = this.year === this.minValidYear || diffYear > 8 ? this.minValidYear : this.year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)
    this.loading = true
    this.userService.getUserConfiguration$().pipe(take(1)).pipe(switchMap(config => {
      this.language = config.language
      return combineLatest(this.movementService.getBySelectedYear(CategoryType.expense, this.year), this.movementService.getBySelectedYear(CategoryType.income, this.year))
    })).pipe(take(1))
    .subscribe({
      next: ([expense, income]) => {
        const movements = [...expense, ...income]
        movements.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
        this.groupMovementCategoryModel = this.groupByCategoryName(movements)
        let amountMovements = 0
        movements.forEach(x => amountMovements += x.amount)
        this.doughnutChartLabels = this.groupMovementCategoryModel.map(x => this.labelMovements(x, amountMovements))
        this.chartData.labels = this.doughnutChartLabels
        // this.chartData.datasets[0].label = type
        this.chartData.datasets[0].data = this.groupMovementCategoryModel.map(x => x.amount)
        this.loading = false
      }, error: (e) => {
        this.loading = false
        console.error(e)
        throw e;
      }
    })
  }

  protected yearChanges = (selectedYear: number) => {
    this.formGroup.controls['year'].setValue(selectedYear)
  }

  private groupByCategoryName = (movements: MovementModel[]): GroupMovementCategoryModel[] => {
    const groups: GroupMovementCategoryModel[] = []
    movements.forEach((movement) => {
      const category = this.userService.getActiveCategories().find(x => x.id === movement.categoryId)!
      movement.categoryName = category.name!
      movement.color = category.color!
      movement.backgroundColor = category.backgroundColor!
      movement.date = new Date(movement.time)
      movement.memorandum ? movement.memorandum : movement.categoryName
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

}
