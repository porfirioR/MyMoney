import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest, switchMap, take } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { RelatedMovementForm } from '../../forms/related-movement.form'
import { MovementModel } from '../../models/movement.model'
import { MovementService } from '../../services/movement.service'
import { RelatedMovementsService } from '../../services/related-movements.service'
import { RelatedMovementModel } from '../../models/related-movement.model'
import { RelatedMapModel } from 'src/app/models/related-map-model'
import { NumberType } from 'src/app/enums/number-type.enum'
import { UserService } from 'src/app/services/user.service'

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
    expenseAmount: new FormControl({value: null, disabled: true}, Validators.required),
    incomeAmount: new FormControl({value: null, disabled: true}, Validators.required),
    relatedIds: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null),
    showInUpsertMovement: new FormControl(false)
  })
  protected currentTap!: string
  protected categoryType = CategoryType
  protected title = 'Create Related Movement'
  protected numberType = NumberType.English
  private id = ''

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly relatedMovementsService: RelatedMovementsService,
    private readonly movementService: MovementService,
    private readonly location: Location,
    private readonly translateService: TranslateService,
    private readonly snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.currentTap = this.categoryType.income.toLocaleLowerCase()
    const config = this.activatedRoute.snapshot.data['config']
    this.numberType = config.number
    this.id = this.activatedRoute.snapshot.params['id']
    if (!this.id) {
      this.loading = false
    } else {
      this.relatedMovementsService.getById(this.id).pipe(switchMap((relatedMovement) => {
        this.formGroup.patchValue({
          id: relatedMovement.id,
          name: relatedMovement.name,
          expenseAmount: relatedMovement.expenseAmount,
          incomeAmount: relatedMovement.incomeAmount,
          relatedIds: relatedMovement.related.map(y => y.id),
          totalAmount: relatedMovement.totalAmount
        })
        const category = CategoryType
        const expense$ = this.movementService.getMovementsByIds(category.expense, relatedMovement.related.filter(x => x.type === category.expense).map(x => x.id))
        const income$ = this.movementService.getMovementsByIds(category.income, relatedMovement.related.filter(x => x.type === category.income).map(x => x.id))
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

  protected addMovement = () => {
    
  }

  protected save = (): void => {
    const request: RelatedMovementModel = this.formGroup.getRawValue()! as unknown as RelatedMovementModel
    request.id = this.id
    request.related = [...this.incomes.map(x => new RelatedMapModel(x.id!, x.type)), ...this.expenses.map(x => new RelatedMapModel(x.id!, x.type))]
    const request$ = this.id ? this.relatedMovementsService.update(request) : this.relatedMovementsService.create(request)
    request$.then(() => {
      this.snackBar.open(this.translateService.instant(`Related Movement was ${request.id ? 'updated' : 'created'}`), '', { duration: 3000 })
      this.location.back()
    }).catch(e => console.error(e))
  }

  protected deleteMovement = (id: string) => {

  }
}
