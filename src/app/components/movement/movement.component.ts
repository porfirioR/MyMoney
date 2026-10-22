import { Component, Input, OnInit } from '@angular/core';
import { NumberType } from '../../enums/number-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { CategoryModel } from '../../models/category.model';
import { GroupDateMovementModel } from '../../models/group-date-movement.model';
import { MovementModel } from '../../models/movement.model';
import { HelperService } from '../../services/helper.service';
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

  // The movements are shared with the detail and edit screens, so only the category name is added to them:
  // memorandum and amount stay as they are stored
  ngOnInit(): void {
    this.language = this.userService.item!.userConfiguration.language
    this.totalIncome = this.groupDateMovement.income
    this.totalExpense = this.groupDateMovement.expense
    this.groupDateMovement.movements.forEach(x => {
      x.categoryName = this.categories.find(y => y.id === x.categoryId)?.name
    })
  }

  protected getSignedAmount = (movement: MovementModel): number => HelperService.getSignedAmount(movement)
}
