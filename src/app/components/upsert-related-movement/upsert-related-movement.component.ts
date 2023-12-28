import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { combineLatest, switchMap } from 'rxjs'
import { CategoryType } from '../../enums/category-type.enum'
import { RelatedMovementForm } from '../../forms/related-movement.form'
import { MovementModel } from '../../models/movement.model'
import { MovementService } from '../../services/movement.service'
import { RelatedMovementsService } from '../../services/related-movements.service'

@Component({
  selector: 'app-upsert-related-movement',
  templateUrl: './upsert-related-movement.component.html',
  styleUrls: ['./upsert-related-movement.component.scss']
})
export class UpsertRelatedMovementComponent implements OnInit {
  private id: string = ''
  protected loading = true
  protected expenses: MovementModel[] = []
  protected incomes: MovementModel[] = []
  protected formGroup = new FormGroup<RelatedMovementForm>({
    id: new FormControl(null),
    description: new FormControl(null, Validators.required),
    expenseAmount: new FormControl({value: null, disabled: true}, Validators.required),
    incomeAmount: new FormControl({value: null, disabled: true}, Validators.required),
    relatedIds: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required)
  })
  protected currentTap!: string
  protected categoryType = CategoryType

  constructor(
    private activatedRoute: ActivatedRoute,
    private readonly relatedMovementsService: RelatedMovementsService,
    private readonly movementService: MovementService,
    private readonly location: Location,
  ) { }

  ngOnInit() {
    this.currentTap = this.categoryType.income.toLocaleLowerCase()
    this.id = this.activatedRoute.snapshot.params['id']
    if (!this.id) {
      this.loading = false
      return
    }
    this.relatedMovementsService.getById(this.id).pipe(switchMap(relatedMovement => {
      this.formGroup.patchValue({
        id: relatedMovement.id,
        description: relatedMovement.description,
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
        this.loading = false
    }, error: (e) => {
        throw e
      }
    })
  }

  protected tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.currentTap = Object.keys(this.categoryType)[tabChangeEvent.index]
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected addMovement = () => {
    
  }
}
