import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';
import { combineLatest, take } from 'rxjs';
import { IconType } from '../../enums/icon-type.enum';
import { CategoryType } from '../../enums/category-type.enum';
import { MovementModel } from '../../models/movement.model';
import { CategoryModel } from '../../models/category.model';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss']
})
export class RegisterMovementComponent implements OnInit {
  @ViewChild("memorandum") inputMemorandum?: ElementRef;
  protected categoryType = CategoryType
  private movementId!: string
  protected formGroup: FormGroup = new FormGroup({
    id: new FormControl<string | ''>(''),
    type: new FormControl<CategoryType>(this.categoryType.expense),
    icon: new FormControl<IconType | ''>('', Validators.required),
    categoryId: new FormControl<string>('', Validators.required),
    memorandum: new FormControl<string>('', Validators.maxLength(50)),
    date: new FormControl({value: '', disabled: true}, Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(0), Validators.minLength(1), Validators.max(999999999999)])
  })
  protected currentCategories!: CategoryModel[]
  protected loading = true
  protected saving = false
  private categoryList!: CategoryModel[]
  private updateMovement?: MovementModel

  constructor(
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService) { }

  ngOnInit() {
    combineLatest([this.activatedRoute.params, this.userService.getActiveCategories$().pipe(take(1))]).subscribe({
      next: ([params, categories]) => {
        this.movementId = params['id']
        this.categoryList = categories
        this.updateMovement = this.movementService.getMovementById(this.movementId)
        if (this.updateMovement) {
          this.patchFormGroup(this.updateMovement)
        } else {
          this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense)
          this.formGroup.controls['icon'].setValue(this.currentCategories[0].icon)
          this.formGroup.controls['categoryId'].setValue(this.currentCategories[0].id)
        }

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
        this.formGroup.controls['memorandum'].valueChanges.subscribe({
          next: (value: string) => {
            const newValue = value.replace(/,/g, '')
            this.formGroup.controls['memorandum'].patchValue(newValue, { emitEvent: false })
          }
        })
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e
      }
    })
  }

  protected selectedIcon = (category: CategoryModel) => {
    this.formGroup.controls['icon'].setValue(category.icon)
    this.formGroup.controls['categoryId'].setValue(category.id)
    this.inputMemorandum?.nativeElement.focus()
    this.formGroup.markAllAsTouched()
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    const request: MovementModel = this.formGroup.getRawValue()
    request.date?.setHours(0, 0, 0, 0)
    request.time = request.date?.getTime()!
    delete request.date
    this.saving = true
    let request$: Promise<void> | Promise<DocumentReference<DocumentData>> | Promise<[DocumentReference<DocumentData>, void]>
    if (this.movementId && request.type !== this.updateMovement?.type) {
      request$ = Promise.all([this.movementService.create(request), this.movementService.delete(this.movementId, this.updateMovement?.type!)])
    } else if(this.movementId) {
      request.id = this.movementId
      request$ = this.movementService.update(request)
    } else {
      request$ = this.movementService.create(request)
    }
    request$.then(() => {
      this.saving = false
      const movementUpdated = this.movementService.getMovementById(this.movementId)!
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
    this.formGroup.patchValue({ amount: Math.abs(movement.amount)})
  }
}
