import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, take } from 'rxjs';
import { IconType } from '../../enums/icon-type.enum';
import { CategoryType } from '../../enums/category-type.enum';
import { InputType } from '../../enums/input-type.enum';
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
  @ViewChild("memorandum") inputMemorandum?: ElementRef
  protected categoryType = CategoryType
  private movementId!: string
  protected defaultColor = '#000000'
  protected defaultBackgroundColor = '#ffffff'
  protected minDate = new Date('2018-01-01:00:00:00')
  protected inputCharacter = InputType.Characters
  protected inputDigit = InputType.Digits
  protected formGroup: FormGroup = new FormGroup({
    id: new FormControl<string | ''>(''),
    type: new FormControl<CategoryType>(this.categoryType.expense),
    icon: new FormControl<IconType | ''>('', Validators.required),
    categoryId: new FormControl<string>('', Validators.required),
    memorandum: new FormControl<string>('', Validators.maxLength(50)),
    date: new FormControl({value: null, disabled: true}),
    amount: new FormControl('', [Validators.required, Validators.min(0), Validators.minLength(1), Validators.max(999999999999)]),
    color: new FormControl(this.defaultColor),
    backgroundColor: new FormControl(this.defaultBackgroundColor),
    time: new FormControl('', Validators.required)
  })
  protected currentCategories!: CategoryModel[]
  protected loading = true
  protected saving = false
  protected title: string = 'Register movement'
  private categoryList!: CategoryModel[]
  private updateMovement?: MovementModel

  constructor(
    private readonly movementService: MovementService,
    protected location: Location,
    private readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    combineLatest([this.activatedRoute.params, this.userService.getActiveCategories$().pipe(take(1))]).subscribe({
      next: ([params, categories]) => {
        this.movementId = params['id']
        this.categoryList = categories
        this.updateMovement = this.movementService.getMovementById(this.movementId)
        if (this.updateMovement) {
          this.title = 'Movement update'
          this.patchFormGroup(this.updateMovement)
        } else {
          this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense)
          if (this.currentCategories.length > 0) {
            const currentCategory = this.currentCategories[0]
            this.formGroup.controls['icon'].setValue(currentCategory.icon)
            this.formGroup.controls['categoryId'].setValue(currentCategory.id)
            this.formGroup.patchValue({ color: currentCategory.color ?? this.defaultColor })
            this.formGroup.patchValue({ backgroundColor: currentCategory.backgroundColor ?? this.defaultBackgroundColor})
          }
        }

        this.formGroup.controls['type'].valueChanges.subscribe({
          next: (type) => {
            this.currentCategories = HelperService.categoriesByType(this.categoryList, type)
            const currentCategory = this.currentCategories.find(x => x.id === this.formGroup.controls['categoryId'].value)
            if(currentCategory || this.currentCategories.length === 0) {
              this.formGroup.controls['icon'].setValue('')
              this.formGroup.controls['categoryId'].setValue('')
              this.formGroup.controls['color'].setValue(this.defaultColor)
              this.formGroup.controls['backgroundColor'].setValue(this.defaultBackgroundColor)
            } else {
              this.formGroup.controls['icon'].setValue(this.currentCategories[0].icon)
              this.formGroup.controls['categoryId'].setValue(this.currentCategories[0].id)
              this.formGroup.controls['color'].setValue(this.currentCategories[0].color ?? this.defaultColor)
              this.formGroup.controls['backgroundColor'].setValue(this.currentCategories[0].backgroundColor ?? this.defaultBackgroundColor)
            }
          }
        })
        this.formGroup.controls['memorandum'].valueChanges.subscribe({
          next: (value: string) => {
            const newValue = value.replace(/,/g, '')
            this.formGroup.controls['memorandum'].patchValue(newValue, { emitEvent: false })
          }
        })
        this.formGroup.controls['date'].valueChanges.subscribe({
          next: (date: Date) => {
            const dateCopy = new Date(date.getTime())
            dateCopy.setHours(0, 0, 0, 0)
            this.formGroup.controls['time'].setValue(dateCopy.getTime()!)
          }
        })
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e
      }
    })
    this.inputCharacter = this.translate.instant(InputType.Characters)
    this.inputDigit = this.translate.instant(InputType.Digits)
  }

  protected selectedIcon = (category: CategoryModel) => {
    this.formGroup.controls['icon'].setValue(category.icon)
    this.formGroup.controls['categoryId'].setValue(category.id)
    this.formGroup.controls['color'].setValue(category.color ?? this.defaultColor)
    this.formGroup.controls['backgroundColor'].setValue(category.backgroundColor ?? this.defaultBackgroundColor)
    this.inputMemorandum?.nativeElement.focus()
    this.formGroup.markAllAsTouched()
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    const request: MovementModel = this.formGroup.getRawValue()
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
      this.snackBar.open(this.translate.instant(`Movement was ${this.movementId ? 'updated' : 'created'}`), '', { duration: 3000 })
      this.location.back()
    }).catch((error) => console.error(error))
  }

  private patchFormGroup = (movement: MovementModel) => {
    this.currentCategories = HelperService.categoriesByType(this.categoryList, movement.type)
    const currentCategory = this.currentCategories.find(x => x.id === movement.categoryId)
    this.formGroup.patchValue({ type: movement.type})
    this.formGroup.patchValue({ icon: movement.icon})
    this.formGroup.patchValue({ categoryId: movement.categoryId})
    this.formGroup.patchValue({ memorandum: movement.memorandum})
    this.formGroup.patchValue({ date: movement.date})
    this.formGroup.patchValue({ time: movement.date?.getTime()})
    this.formGroup.patchValue({ amount: Math.abs(movement.amount)})
    this.formGroup.patchValue({ color: currentCategory && currentCategory.color ? currentCategory.color : this.defaultColor})
    this.formGroup.patchValue({ backgroundColor: currentCategory && currentCategory.backgroundColor ? currentCategory.backgroundColor : this.defaultBackgroundColor})
  }
}
