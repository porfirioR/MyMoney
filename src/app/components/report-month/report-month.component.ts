import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { Observable, take } from 'rxjs';
import { CategoryType } from 'src/app/enums/category-type.enum';
import { GroupMovementCategoryModel } from 'src/app/models/group-movement-category.model';
import { MovementModel } from 'src/app/models/movement.model';
import { YearMonthModel } from 'src/app/models/year-month-model';
import { MovementService } from 'src/app/services/movement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-report-month',
  templateUrl: './report-month.component.html',
  styleUrls: ['./report-month.component.scss']
})
export class ReportMonthComponent implements OnInit {
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        data: [ 65, 59, 80, 81, 56, 55, 40 ],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ]
  }
  public lineChartLabels: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line'
  public lineChartPlugins = [];


  public loading: boolean = false
  protected yearMonth?: YearMonthModel
  protected categoryType = CategoryType
  protected groupMovementCategoryModel!: GroupMovementCategoryModel[]
  protected formGroup: FormGroup = new FormGroup({
    type: new FormControl<CategoryType>(this.categoryType.expense),
  })

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly movementService: MovementService,
              protected location: Location,
              private readonly userService: UserService) { }
  
  ngOnInit(): void {
    const date = new Date();
    this.yearMonth = new YearMonthModel(date.getFullYear(), '', date.getMonth())
    this.activatedRoute.params.subscribe({
      next: (params) => {
        const x = params['type']
        console.log(x)
        this.getMovementsByType(x)
      }, error: (e) => {
        throw e;
      }
    })
  }

  
  private getMovementsByType = (type: CategoryType): void => {
    this.loading = true
    this.movementService.getBySelectedMonth(type, this.yearMonth?.month!, this.yearMonth?.year!).pipe(take(1)).subscribe({
      next: (movements) => {
        movements.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
        this.groupMovementCategoryModel = this.groupByCategoryName(movements)
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e
      }
    })
  }

  public groupByCategoryName = (movements: MovementModel[]): GroupMovementCategoryModel[] => {
    const group: GroupMovementCategoryModel[] = []
    movements.forEach((movement) => {
      movement.categoryName = this.userService.getActiveCategories().find(x => x.id === movement.categoryId)?.name!
      const exist = group.find(x => x.categoryName == movement.categoryName)
      exist ? exist.movements.push(movement) : group.push(new GroupMovementCategoryModel(movement.categoryName, movement.icon, [movement]))
    });
    return group
  };

  protected exit = () => {
    this.location.back()
  }
}
