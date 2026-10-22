import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, map, of, switchMap, take } from 'rxjs';
import { RelatedMovementModel } from '../../models/related-movement.model';
import { RelatedMovementDetailModel } from '../../models/related-movement-detail.model';
import { RelatedMovementSummaryModel } from '../../models/related-movement-summary.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { RelatedMovementService } from '../../services/related-movement.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { HelperService } from '../../services/helper.service';
import { NotificationService } from '../../services/notification.service';
import { CategoryType } from '../../enums/category-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

@Component({
  selector: 'app-related-movements',
  templateUrl: './related-movements.component.html',
  styleUrls: ['./related-movements.component.scss']
})
export class RelatedMovementsComponent implements OnInit {
  protected loading = true
  protected relatedMovements: RelatedMovementModel[] = []
  protected movements = new Map<string, RelatedMovementDetailModel[]>()
  protected summaries = new Map<string, RelatedMovementSummaryModel>()
  protected configuration!: ConfigurationModel
  protected numberType = NumberType.English
  protected language = LanguageType.English

  constructor(
    private readonly relatedMovementsService: RelatedMovementService,
    private readonly dialog: MatDialog,
    private translate: TranslateService,
    private readonly notificationService: NotificationService,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
  ) { }

  // All movements are loaded upfront so every card shows its real progress
  ngOnInit(): void {
    combineLatest([
      this.userService.getUserConfiguration$().pipe(take(1)),
      this.relatedMovementsService.getAll().pipe(take(1))
    ]).pipe(switchMap(([configuration, relatedMovements]) => {
      this.configuration = configuration
      this.numberType = configuration.number
      this.language = configuration.language
      this.relatedMovements = relatedMovements
      return relatedMovements.length ? combineLatest(relatedMovements.map(this.getMovements)) : of([])
    })).subscribe({
      next: (movementLists) => {
        movementLists.forEach((movements, i) => this.setMovements(this.relatedMovements[i], movements))
        // Groups with the most recent activity first
        this.relatedMovements.sort((a, b) =>
          (this.summaries.get(b.id!)?.lastDate?.getTime() ?? 0) - (this.summaries.get(a.id!)?.lastDate?.getTime() ?? 0))
        this.loading = false
      }, error: (e) => {
        this.loading = false
        this.notificationService.error(e)
      }
    })
  }

  protected deleteRelatedMovement = (id: string): void => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translate.instant('related-movement-messages.title-delete'),
        message: this.translate.instant('related-movement-messages.question-delete')
      }
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.relatedMovementsService.delete(id).then(() => {
          this.relatedMovements = this.relatedMovements.filter(x => x.id !== id)
          this.movements.delete(id)
          this.summaries.delete(id)
          this.notificationService.message('related-movement-messages.deleted')
        }).catch((e) => this.notificationService.error(e))
      }
    })
  }

  protected deletedMovement = (movementId: string, relatedMovement: RelatedMovementModel) => {
    const movements = (this.movements.get(relatedMovement.id!) ?? []).filter(x => x.id !== movementId)
    this.setMovements(relatedMovement, movements)
  }

  private getMovements = (relatedMovement: RelatedMovementModel): Observable<RelatedMovementDetailModel[]> => {
    const expenseIds = relatedMovement.related.filter(x => HelperService.isExpense(x.type)).map(x => x.id)
    const incomeIds = relatedMovement.related.filter(x => !HelperService.isExpense(x.type)).map(x => x.id)
    return combineLatest([
      this.movementService.getMovementsByIds(CategoryType.expense, expenseIds),
      this.movementService.getMovementsByIds(CategoryType.income, incomeIds)
    ]).pipe(take(1), map(([expenses, incomes]) => [...expenses, ...incomes]
      .sort((a, b) => b.time - a.time)
      .map(x => new RelatedMovementDetailModel(
        x.id!,
        new Date(x.time),
        x.memorandum ? x.memorandum : this.userService.getAllCategories().find(y => y.id === x.categoryId)?.name ?? '',
        x.amount,
        HelperService.isExpense(x.type),
        x.icon,
        x.color,
        x.backgroundColor
      ))
    ))
  }

  private setMovements = (relatedMovement: RelatedMovementModel, movements: RelatedMovementDetailModel[]): void => {
    this.movements.set(relatedMovement.id!, movements)
    this.summaries.set(relatedMovement.id!, HelperService.getRelatedSummary(
      HelperService.getRelatedProgressType(relatedMovement),
      relatedMovement.totalAmount,
      movements
    ))
  }
}
