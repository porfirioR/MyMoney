import { Component, Input, OnInit } from '@angular/core';
import { NumberType } from '../../enums/number-type.enum';
import { CategoryType } from '../../enums/category-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { CategoryModel } from '../../models/category.model';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';
import { take } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss']
})
export class MovementComponent implements OnInit {
  @Input() groupDateMovement!: GroupDateMovementModel
  @Input() categories!: CategoryModel[]
  @Input() numberType = NumberType.English
  protected totalIncome!: number
  protected totalExpense!: number
  protected language = LanguageType.English

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserConfiguration$().pipe(take(1)).subscribe({
      next: (config) => {
        this.language = config.language
      }, error: (e) => {
        console.error(e)
        throw e;
      }
    })
    this.totalIncome = this.groupDateMovement.income
    this.totalExpense = this.groupDateMovement.expense
    this.groupDateMovement.movements.forEach(x => {
      x.categoryName = this.categories.find(y => y.id === x.categoryId)?.name!
      x.memorandum = x.memorandum ? x.memorandum : x.categoryName
      x.amount = x.type === CategoryType.expense ? -x.amount : x.amount
    })
  }

}
