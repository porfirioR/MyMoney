import { Component, Input, OnInit } from '@angular/core';
import { CategoryType } from 'src/app/enums/category-type.enum';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.css']
})
export class MovementComponent implements OnInit {
  @Input() groupDateMovement!: GroupDateMovementModel
  protected totalIncome!: number
  protected totalExpense!: number
  public categoryType!: CategoryType
  constructor() { }

  ngOnInit() {
    this.totalIncome = this.groupDateMovement.movements.filter(x => x.type === CategoryType.income).map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0)
    this.totalExpense = this.groupDateMovement.movements.filter(x => x.type === CategoryType.expense).map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0)
  }

  protected edit = () => { 

  } 
}
