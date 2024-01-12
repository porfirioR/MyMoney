import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest, of, switchMap, take } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { RelatedMovementForm } from '../../forms/related-movement.form'
import { MovementModel } from '../../models/movement.model'
import { MovementService } from '../../services/movement.service'
import { RelatedMovementService } from '../../services/related-movement.service'
import { RelatedMovementModel } from '../../models/related-movement.model'
import { RelatedMapModel } from '../../models/related-map-model'
import { NumberType } from '../../enums/number-type.enum'
import { MatDialog } from '@angular/material/dialog'
import { DialogAddMovementComponent } from '../dialog-add-movement/dialog-add-movement.component'

@Component({
  selector: 'app-upsert-related-movement',
  templateUrl: './upsert-related-movement.component.html',
  styleUrls: ['./upsert-related-movement.component.scss']
})
export class UpsertRelatedMovementComponent implements OnInit {
  protected loading = true
  protected expenses: MovementModel[] = []
  protected incomes: MovementModel[] = []
  protected formGroup = new FormGroup<RelatedMovementForm>({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    expenseAmount: new FormControl({value: null, disabled: true}),
    incomeAmount: new FormControl({value: null, disabled: true}),
    relatedIds: new FormControl(null),
    totalAmount: new FormControl(null),
    showInUpsertMovement: new FormControl(false)
  })
  protected currentTap!: string
  protected categoryType = CategoryType
  protected title = 'Create Related Movement'
  protected numberType = NumberType.English
  protected saving = false
  private id = ''

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly relatedMovementsService: RelatedMovementService,
    private readonly movementService: MovementService,
    private readonly location: Location,
    private readonly translateService: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.currentTap = this.categoryType.income.toLocaleLowerCase()
    const config = this.activatedRoute.snapshot.data['config']
    this.numberType = config.number
    this.id = this.activatedRoute.snapshot.params['id']
    if (!this.id) {
      this.loading = false
    } else {
      this.relatedMovementsService.getById(this.id).pipe(take(1), switchMap((relatedMovement) => {
        this.formGroup.patchValue({
          id: relatedMovement.id,
          name: relatedMovement.name,
          expenseAmount: relatedMovement.expenseAmount,
          incomeAmount: relatedMovement.incomeAmount,
          relatedIds: relatedMovement.related.map(y => y.id),
          totalAmount: relatedMovement.totalAmount,
          showInUpsertMovement: relatedMovement.showInUpsertMovement
        })
        const category = CategoryType
        const expenses = relatedMovement.related.filter(x => x.type === category.expense)
        const incomes = relatedMovement.related.filter(x => x.type === category.expense)
        const expense$ = expenses.length > 0 ? this.movementService.getMovementsByIds(category.expense, expenses.map(x => x.id)) : of([])
        const income$ = incomes.length > 0 ? this.movementService.getMovementsByIds(category.income, incomes.map(x => x.id)) : of([])
        return combineLatest([expense$, income$])
      })).subscribe({
        next: ([expenses, incomes]) => {
          [this.expenses, this.incomes] = [expenses, incomes]
          this.title = 'Update Related Movement'
          this.loading = false
        }, error: (e) => {
          throw e
        }
      })
    }
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.currentTap = Object.keys(this.categoryType)[tabChangeEvent.index]
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected addMovement = (): void => {
    const dialogRef = this.dialog.open(DialogAddMovementComponent, {
      width: '500px',
      height: '80%',
    })
  }

  protected save = (): void => {
    this.saving = true
    const request: RelatedMovementModel = {
      id: this.id ?? null,
      expenseAmount: this.formGroup.controls.expenseAmount.value ?? 0,
      incomeAmount: this.formGroup.controls.incomeAmount.value ?? 0,
      name: this.formGroup.controls.name.value!,
      related: [...this.incomes.map(x => new RelatedMapModel(x.id!, x.type)), ...this.expenses.map(x => new RelatedMapModel(x.id!, x.type))],
      owner: '',
      totalAmount: this.formGroup.controls.totalAmount.value!,
      showInUpsertMovement: this.formGroup.controls.showInUpsertMovement.value!
    }
    const request$ = this.id ? this.relatedMovementsService.update(request) : this.relatedMovementsService.create(request)
    request$.then(() => {
      this.snackBar.open(this.translateService.instant(`Related Movement was ${request.id ? 'updated' : 'created'}`), '', { duration: 3000 })
      this.exit()
    }).catch(e => {
      this.saving = false
      console.error(e)
    })
  }

  protected deleteMovement = (id: string): void => {

  }
}
