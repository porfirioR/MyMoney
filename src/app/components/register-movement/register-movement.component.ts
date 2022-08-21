import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable, take } from 'rxjs';
import { IconType } from '../../enums/icon-type.enum';
import { MovementModel } from '../../models/movement.model';
import { CategoryType } from '../../enums/category-type.enum';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss']
})
export class RegisterMovementComponent implements OnInit {
  protected categoryType = CategoryType
  private movementId!: string
  protected formGroup: FormGroup = new FormGroup({
    id: new FormControl<string | ''>(''),
    type: new FormControl<CategoryType>(this.categoryType.expense),
    icon: new FormControl<IconType | ''>('', Validators.required),
    categoryId: new FormControl<string>('', Validators.required),
    memorandum: new FormControl<string>(''),
    date: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(0), Validators.minLength(1)])
  })
  protected currentCategories!: CategoryModel[]
  protected loading = true
  protected saving = false
  private categoryList!: CategoryModel[]
  private updateMovement?: MovementModel

  constructor(private categoryService: CategoryService,
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    combineLatest([this.activatedRoute.params, this.categoryService.getAll().pipe(take(1))]).subscribe({
      next: ([params, categories]) => {
        this.movementId = params['id']
        this.categoryList = categories.filter(x => x.active)
        this.updateMovement = this.movementService.getMovementById(this.movementId)
        this.updateMovement ?
          this.patchFormGroup(this.updateMovement) :
          this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense)
        this.formGroup.controls['type'].valueChanges.subscribe({
          next: (value) => {
            this.currentCategories = HelperService.categoriesByType(this.categoryList, value)
            const currentCategory = this.currentCategories.find(x => x.id === this.formGroup.controls['categoryId'].value)
            if(!currentCategory) {
              this.formGroup.controls['icon'].setValue('')
              this.formGroup.controls['categoryId'].setValue('')
            }
          }
        })
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e;
      }
    })
  }

  protected selectedIcon = (category: CategoryModel) => {
    this.formGroup.controls['icon'].setValue(category.icon)
    this.formGroup.controls['categoryId'].setValue(category.id)
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    const request: MovementModel = this.formGroup.getRawValue()
    request.date?.setHours(0, 0, 0, 0)
    request.time = request.date?.getTime() as number
    delete request.date
    this.saving = true
    let request$: Promise<void> | Promise<DocumentReference<DocumentData>> | Promise<[DocumentReference<DocumentData>, void]>
    if (this.movementId && request.type !== this.updateMovement?.type) {
      request$ = Promise.all([this.movementService.create(request), this.movementService.delete(this.movementId, this.updateMovement?.type as CategoryType)])
    } else if(this.movementId) {
      request.id = this.movementId
      request$ = this.movementService.update(request)
    } else {
      request$ = this.movementService.create(request)
    }
    request$.then(() => {
      this.saving = false
      const movementUpdated = this.movementService.getMovementById(this.movementId) as MovementModel
      if (request.id) {
        movementUpdated.type = request.type
        movementUpdated.icon = request.icon
        movementUpdated.categoryId = request.categoryId
        movementUpdated.memorandum = request.memorandum
        movementUpdated.amount = request.amount
        movementUpdated.id = request.id
        movementUpdated.time = request.time
      } else {
        this.movementService.deleteMovementForList(this.movementId)
      }
      this.snackBar.open(`Movement was ${this.movementId ? 'updated' : 'created'}`, '', { duration: 3000 })
      this.location.back()
    }).catch((error) => console.log(error))
  }

  private patchFormGroup = (movement: MovementModel) => {
    this.currentCategories = HelperService.categoriesByType(this.categoryList, movement.type)
    this.formGroup.patchValue({ type: movement.type})
    this.formGroup.patchValue({ icon: movement.icon})
    this.formGroup.patchValue({ categoryId: movement.categoryId})
    this.formGroup.patchValue({ memorandum: movement.memorandum})
    this.formGroup.patchValue({ date: movement.date})
    this.formGroup.patchValue({ amount: movement.amount})
  }
}
