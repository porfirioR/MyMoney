import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { GroupMovementCategoryModel } from '../../models/group-movement-category.model';
import { MovementModel } from '../../models/movement.model';
import { YearMonthModel } from '../../models/year-month-model';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { SelectYearMountComponent } from '../select-year-mount/select-year-mount.component';

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
  protected yearMonth?: YearMonthModel
  protected categoryType = CategoryType
  protected groupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected messageSearch = 'Search'
  protected formGroup: FormGroup = new FormGroup({
    type: new FormControl<CategoryType>(this.categoryType.expense),
  })

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly movementService: MovementService,
              protected location: Location,
              private readonly userService: UserService,
              private readonly dialog: MatDialog) { }
  
  ngOnInit(): void {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
    this.activatedRoute.params.subscribe({
      next: (params) => {
        const type = params['type']
        this.formGroup.controls['type'].setValue(type)
        this.getMovementsByType(type)
      }, error: (e) => {
        throw e;
      }
    })
    this.formGroup.controls['type'].valueChanges.subscribe(this.getMovementsByType)
  }

  
  private getMovementsByType = (type: CategoryType): void => {
    this.loading = true
    this.movementService.getBySelectedMonth(type, this.yearMonth?.month!, this.yearMonth?.year!).pipe(take(1)).subscribe({
      next: (movements) => {
        movements.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
        this.groupMovementCategoryModel = this.groupByCategoryName(movements)

        let amountMovements = 0
        movements.forEach(x => amountMovements += x.amount)
        this.doughnutChartLabels = this.groupMovementCategoryModel.map(x => this.labelMovements(x, amountMovements))
        this.chartData.labels = this.doughnutChartLabels
        this.chartData.datasets[0].label = type
        this.chartData.datasets[0].data = this.groupMovementCategoryModel.map(x => x.amount)
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e
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
    return `${x.categoryName} ${((total * 100)/amountMovements).toFixed(1)}%`
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
        this.getMovementsByType(this.formGroup.controls['type'].value)
      }
    })
  }
}
