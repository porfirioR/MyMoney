import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest, switchMap, take } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { NumberType } from '../../enums/number-type.enum'
import { LanguageType } from '../../enums/language-type.enum'
import { RelatedProgressType } from '../../enums/related-progress-type.enum'
import { RelatedMovementForm } from '../../forms/related-movement.form'
import { MovementModel } from '../../models/movement.model'
import { RelatedMovementModel } from '../../models/related-movement.model'
import { RelatedMovementSummaryModel } from '../../models/related-movement-summary.model'
import { RelatedMapModel } from '../../models/related-map-model'
import { ConfigurationModel } from '../../models/configuration.model'
import { MovementService } from '../../services/movement.service'
import { RelatedMovementService } from '../../services/related-movement.service'
import { HelperService } from '../../services/helper.service'
import { UserService } from '../../services/user.service'
import { NavigationService } from '../../services/navigation.service'
import { NotificationService } from '../../services/notification.service'
import { DialogAddMovementComponent } from '../dialog-add-movement/dialog-add-movement.component'

@Component({
  selector: 'app-upsert-related-movement',
  templateUrl: './upsert-related-movement.component.html',
  styleUrls: ['./upsert-related-movement.component.scss']
})
export class UpsertRelatedMovementComponent implements OnInit {
  protected loading = true
  protected movements: MovementModel[] = []
  protected formGroup = new FormGroup<RelatedMovementForm>({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    progressType: new FormControl(RelatedProgressType.Expense, Validators.required),
    goal: new FormControl(null, Validators.min(0)),
    showInUpsertMovement: new FormControl(false)
  })
  protected summary: RelatedMovementSummaryModel = HelperService.getRelatedSummary(RelatedProgressType.Expense, 0, [])
  protected progressTypes = Object.values(RelatedProgressType)
  protected title = 'Create Related Movement'
  protected numberType = NumberType.English
  protected language = LanguageType.English
  protected saving = false
  protected thousandSeparator = '.'
  protected mask = 'separator.0'
  private id = ''

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly relatedMovementsService: RelatedMovementService,
    private readonly movementService: MovementService,
    private readonly translateService: TranslateService,
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private readonly navigationService: NavigationService,
    private readonly notificationService: NotificationService,
  ) {
    const configuration = this.activatedRoute.snapshot.data['config'] as ConfigurationModel
    [this.mask, this.thousandSeparator] = HelperService.getMarkValues(configuration)
    this.numberType = configuration.number
    this.language = configuration.language
    this.id = this.activatedRoute.snapshot.params['id']
  }

  ngOnInit(): void {
    // The summary follows the form so the user sees the effect of the goal and type right away
    this.formGroup.controls.progressType.valueChanges.subscribe(() => this.refreshSummary())
    this.formGroup.controls.goal.valueChanges.subscribe(() => this.refreshSummary())
    if (!this.id) {
      this.loading = false
      return
    }
    this.relatedMovementsService.getById(this.id).pipe(take(1), switchMap((relatedMovement) => {
      this.formGroup.patchValue({
        id: relatedMovement.id,
        name: relatedMovement.name,
        progressType: HelperService.getRelatedProgressType(relatedMovement),
        goal: relatedMovement.totalAmount ? Math.abs(relatedMovement.totalAmount) : null,
        showInUpsertMovement: relatedMovement.showInUpsertMovement
      }, { emitEvent: false })
      const expenseIds = relatedMovement.related.filter(x => HelperService.isExpense(x.type)).map(x => x.id)
      const incomeIds = relatedMovement.related.filter(x => !HelperService.isExpense(x.type)).map(x => x.id)
      return combineLatest([
        this.movementService.getMovementsByIds(CategoryType.expense, expenseIds),
        this.movementService.getMovementsByIds(CategoryType.income, incomeIds)
      ]).pipe(take(1))
    })).subscribe({
      next: ([expenses, incomes]) => {
        this.setMovements([...expenses, ...incomes])
        this.title = 'Update Related Movement'
        this.loading = false
      }, error: (e) => {
        this.loading = false
        this.notificationService.error(e)
        this.exit()
      }
    })
  }

  protected exit = (): void => {
    this.navigationService.back('/related-movements')
  }

  protected addMovement = (): void => {
    const dialogRef = this.dialog.open(DialogAddMovementComponent, {
      width: '500px',
      height: '80%',
      data: { excludedIds: this.movements.map(x => x.id!) }
    })
    dialogRef.afterClosed().pipe(take(1)).subscribe({
      next: (movements: MovementModel[] | undefined) => {
        if (movements?.length) {
          this.setMovements([...this.movements, ...movements.filter(x => !this.movements.some(y => y.id === x.id))])
        }
      }
    })
  }

  protected removeMovement = (movementId: string): void => {
    this.setMovements(this.movements.filter(x => x.id !== movementId))
  }

  protected isExpense = (movement: MovementModel): boolean => HelperService.isExpense(movement.type)

  protected save = (): void => {
    if (this.formGroup.invalid || this.saving) { return }
    this.saving = true
    const value = this.formGroup.getRawValue()
    const related = this.movements.map(x => new RelatedMapModel(x.id!, x.type))
    const request: RelatedMovementModel = {
      id: this.id || undefined,
      name: value.name!.trim(),
      related: HelperService.getRelatedMovementToSave(related),
      owner: '',
      totalAmount: Number(value.goal ?? 0),
      expenseAmount: this.summary.expenseAmount,
      incomeAmount: this.summary.incomeAmount,
      showInUpsertMovement: !!value.showInUpsertMovement,
      progressType: value.progressType!
    }
    const request$ = this.id ? this.relatedMovementsService.update(request) : this.relatedMovementsService.create(request)
    request$.then(() => {
      this.notificationService.message(`Related Movement was ${this.id ? 'updated' : 'created'}`)
      this.exit()
    }).catch(e => {
      this.saving = false
      this.notificationService.error(e)
    })
  }

  private setMovements = (movements: MovementModel[]): void => {
    this.movements = movements
      .map(x => {
        x.date = new Date(x.time)
        x.memorandum = x.memorandum ? x.memorandum : this.userService.getAllCategories().find(y => y.id === x.categoryId)?.name ?? ''
        return x
      })
      .sort((a, b) => b.time - a.time)
    this.refreshSummary()
  }

  private refreshSummary = (): void => {
    const value = this.formGroup.getRawValue()
    this.summary = HelperService.getRelatedSummary(
      value.progressType ?? RelatedProgressType.Expense,
      value.goal,
      this.movements.map(x => ({ amount: x.amount, isExpense: HelperService.isExpense(x.type), date: x.date }))
    )
  }
}
