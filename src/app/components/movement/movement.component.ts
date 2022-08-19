import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovementModel } from 'src/app/models/movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { CategoryModel } from '../../models/category.model';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss']
})
export class MovementComponent implements OnInit {
  @Input() groupDateMovement!: GroupDateMovementModel
  @Input() categories!: CategoryModel[]
  protected totalIncome!: number
  protected totalExpense!: number
  public categoryType!: CategoryType
  constructor(private readonly router : Router) { }

  ngOnInit() {
    this.totalIncome = this.groupDateMovement.income
    this.totalExpense = this.groupDateMovement.expense
    this.groupDateMovement.movements.forEach(x => x.categoryName = this.categories.find(y => y.id === x.categoryId)?.name as string)
  }

}
