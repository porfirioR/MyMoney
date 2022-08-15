import { Component, Input, OnInit } from '@angular/core';
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
  constructor() { }

  ngOnInit() {
    this.totalIncome = this.groupDateMovement.movements.filter(x => x.type === CategoryType.income).map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0)
    this.totalExpense = this.groupDateMovement.movements.filter(x => x.type === CategoryType.expense).map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0)
    this.groupDateMovement.movements.forEach(x => x.categoryName = this.categories.find(y => y.id === x.categoryId)?.name as string)
  }

  protected edit = () => { 

  } 
}
