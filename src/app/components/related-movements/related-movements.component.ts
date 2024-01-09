import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, of, switchMap, take } from 'rxjs';
import { RelatedMovementModel } from '../../models/related-movement.model';
import { RelatedMovementDetailModel } from '../../models/related-movement-detail.model';
import { CategoryModel } from '../../models/category.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { RelatedMovementService } from '../../services/related-movement.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryType } from '../../enums/category-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

@Component({
  selector: 'app-related-movements',
  templateUrl: './related-movements.component.html',
  styleUrls: ['./related-movements.component.scss']
})
export class RelatedMovementsComponent implements OnInit {
  protected loading = true
  protected relatedMovements: RelatedMovementModel[] = []
  protected movements: Map<string, RelatedMovementDetailModel[]> = new Map<string, RelatedMovementDetailModel[]>()
  protected categories: CategoryModel[] = []
  protected configuration!: ConfigurationModel
  protected numberType = NumberType.English

  constructor(
    private readonly location: Location,
    private readonly relatedMovementsService: RelatedMovementService,
    private readonly dialog: MatDialog,
    private translate: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.userService.getUserConfiguration$().pipe(take(1)),
      this.relatedMovementsService.getAll().pipe(take(1))
    ]).subscribe({
      next: ([configuration, relatedMovements]) => {
        this.configuration = configuration
        this.relatedMovements = relatedMovements
        this.loading = false
        this.numberType = this.configuration.number
      }, error: (e) => {
        this.loading = false
        throw e
      }
    })
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected deleteRelatedMovement = (id: string): void => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translate.instant('related-movement-messages.title-delete'),
        message: this.translate.instant('related-movement-messages.question-delete')
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.relatedMovementsService.delete(id).then(() => {
          this.snackBar.open(this.translate.instant('related-movement-messages.deleted'), '', { duration: 3000 })
          this.exit()
        }).catch((reason: any) => this.snackBar.open(reason, '', { duration: 3000 }))
      }
    })
  }

  protected displayMovements = (id: string) => {
    if (this.movements.get(id)) {
      return
    }
    this.relatedMovementsService.getById(id).pipe(take(1), switchMap((relatedMovement) => {
      const category = CategoryType
      const expenseIds = relatedMovement.related.filter(x => x.type === category.expense)
      const incomeIds = relatedMovement.related.filter(x => x.type === category.income)
      const expense$ = expenseIds.length > 0 ? this.movementService.getMovementsByIds(category.expense, expenseIds.map(x => x.id)) : of([])
      const income$ = incomeIds.length > 0 ? this.movementService.getMovementsByIds(category.income, incomeIds.map(x => x.id)) : of([])
      return combineLatest([expense$, income$])
    })).subscribe({
      next: ([expenses, incomes]) => {
        let expenseAmount = 0
        let incomeAmount = 0
        const movements: RelatedMovementDetailModel[] = [...expenses, ...incomes].sort((a, b) => a.time - b.time).map(x => {
          const category = this.userService.getActiveCategories().find(y => y.id === x.categoryId)!
          if (x.type === CategoryType.expense) {
            expenseAmount += x.amount
          } else {
            incomeAmount += x.amount
          }
          return new RelatedMovementDetailModel(
            x.id!,
            new Date(x.time),
            x.memorandum! ? x.memorandum : category.name,
            x.amount,
            x.type === CategoryType.expense
          )
        })
        const currentRelatedMovement = this.relatedMovements.find(x => x.id === id)!
        currentRelatedMovement.incomeAmount = incomeAmount
        currentRelatedMovement.expenseAmount = expenseAmount
        this.movements.set(id, movements)
      }, error: (e) => {
        throw e
      }
    })
  }

  protected deletedMovement = (movementId: string, relatedId: string) => {
    let movement = this.movements.get(relatedId)
    movement = movement?.filter(x => x.id !== movementId)
    if (!movement || movement?.length === 0) {
      this.movements.delete(relatedId)
    } else {
      this.movements.set(relatedId, movement)
    }
  }
}
