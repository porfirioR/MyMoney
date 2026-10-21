import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { doc } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { InputType } from '../../enums/input-type.enum';
import { MovementModel } from '../../models/movement.model';
import { CategoryModel } from '../../models/category.model';
import { RelatedMovementModel } from '../../models/related-movement.model';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { RelatedMovementService } from '../../services/related-movement.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { MovementForm } from '../../forms/movement.form';
import { CalculatorDialogData } from '../../models/calculator-dialog-data';
import { DialogCalculatorComponent } from '../dialog-calculator/dialog-calculator.component';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss']
})
export class RegisterMovementComponent implements OnInit {
  @ViewChild("memorandum") inputMemorandum?: ElementRef
  protected categoryType = CategoryType
  protected defaultColor = DEFAULT_ICON_COLOR
  protected defaultBackgroundColor = DEFAULT_BACKGROUND_COLOR
  protected minDate = new Date('2018-01-01:00:00:00')
  protected inputCharacter = InputType.Characters
  protected inputDigit = InputType.Digits
  protected formGroup: FormGroup<MovementForm> = new FormGroup<MovementForm>({
    id: new FormControl(''),
    type: new FormControl(this.categoryType.expense),
    icon: new FormControl(null, Validators.required),
    categoryId: new FormControl(null, Validators.required),
    memorandum: new FormControl('', Validators.maxLength(50)),
    date: new FormControl({ value: null, disabled: true }),
    amount: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(999999999999)]),
    color: new FormControl(this.defaultColor),
    backgroundColor: new FormControl(this.defaultBackgroundColor),
    time: new FormControl(null, Validators.required),
    relatedMovements: new FormControl(null),
  })
  protected currentCategories: CategoryModel[] = []
  protected loading = true
  protected saving = false
  protected title: string = 'Register movement'
  protected mask = 'separator.0'
  protected thousandSeparator = '.'
  protected relatedMovements: RelatedMovementModel[] = []
  private categoryList!: CategoryModel[]
  private updateMovement?: MovementModel

  constructor(
    private readonly movementService: MovementService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private translate: TranslateService,
    private relateMovementService: RelatedMovementService,
    private readonly navigationService: NavigationService,
    private readonly notificationService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    [this.mask, this.thousandSeparator] = HelperService.getMarkValues(this.userService.item!.userConfiguration)
    this.inputCharacter = this.translate.instant(InputType.Characters)
    this.inputDigit = this.translate.instant(InputType.Digits)
    this.categoryList = this.userService.getActiveCategories()
    const movementId: string | undefined = this.activatedRoute.snapshot.params['id']
    try {
      this.relatedMovements = await firstValueFrom(this.relateMovementService.getRelatedMovementsShowingInMovements().pipe(take(1)))
      if (movementId) {
        // After a reload the movement is not in the list of the main screen, so it is read from the server
        this.updateMovement = this.movementService.getMovementById(movementId) ?? await this.movementService.getMovementByIdFromServer(movementId)
        if (!this.updateMovement) {
          this.exit()
          return
        }
        this.title = 'Movement update'
        this.patchFormGroup(this.updateMovement)
      } else {
        this.currentCategories = HelperService.categoriesByType(this.categoryList, this.categoryType.expense, this.getCategoryName)
        if (this.currentCategories.length > 0) {
          this.selectCategory(this.currentCategories[0])
        }
        // New movements start on today, or on the first day of the month being viewed
        this.setDate(HelperService.getDefaultMovementDate(this.userService.getSelectedYearMonth()))
      }
    } catch (e) {
      this.notificationService.error(e)
      this.exit()
      return
    }

    this.formGroup.controls.type.valueChanges.subscribe({
      next: (type) => {
        this.currentCategories = HelperService.categoriesByType(this.categoryList, type!, this.getCategoryName)
        const currentCategory = this.currentCategories.find(x => x.id === this.formGroup.controls.categoryId.value)
        if (currentCategory) { return }
        if (this.currentCategories.length > 0) {
          this.selectCategory(this.currentCategories[0])
        } else {
          this.formGroup.controls.icon.setValue(null)
          this.formGroup.controls.categoryId.setValue('')
          this.formGroup.controls.color.setValue(this.defaultColor)
          this.formGroup.controls.backgroundColor.setValue(this.defaultBackgroundColor)
        }
      }
    })
    this.formGroup.controls.memorandum.valueChanges.subscribe({
      next: (value: string | null) => {
        const newValue = value?.replace(/,/g, '')
        this.formGroup.controls.memorandum.patchValue(newValue!, { emitEvent: false })
      }
    })
    this.formGroup.controls.date.valueChanges.subscribe({
      next: (date) => this.setDate(date!)
    })
    this.loading = false
  }

  protected selectedIcon = (category: CategoryModel): void => {
    this.selectCategory(category)
    this.inputMemorandum?.nativeElement.focus()
    this.formGroup.markAllAsTouched()
  }

  protected exit = (): void => {
    this.navigationService.back()
  }

  private getCategoryName = (name: string): string => this.translate.instant(name)

  protected openCalculator = (): void => {
    const dialogRef = this.dialog.open(DialogCalculatorComponent, {
      width: '320px',
      data: { initialValue: this.formGroup.controls.amount.value, thousandSeparator: this.thousandSeparator } as CalculatorDialogData
    })
    dialogRef.afterClosed().subscribe({
      next: (result?: number) => {
        if (result !== undefined && result !== null) {
          this.formGroup.controls.amount.setValue(result)
        }
      }
    })
  }

  protected save = async (): Promise<void> => {
    if (this.formGroup.invalid || this.saving) { return }
    const request: MovementModel = {
      type: this.formGroup.controls.type.value!,
      icon: this.formGroup.controls.icon.value!,
      categoryId: this.formGroup.controls.categoryId.value!,
      memorandum: this.formGroup.controls.memorandum.value!,
      amount: this.formGroup.controls.amount.value!,
      color: this.formGroup.controls.color.value!,
      backgroundColor: this.formGroup.controls.backgroundColor.value!,
      time: this.formGroup.controls.time.value!,
    }
    // saving stays true until the screen closes, so a second tap cannot duplicate the movement
    this.saving = true
    const oldId = this.updateMovement?.id
    let movementId: string
    try {
      if (this.updateMovement && request.type !== this.updateMovement.type) {
        // The type is part of the path, so the movement moves to the other collection in a single batch
        const batch = this.movementService.openBatch()
        const newReference = doc(this.movementService.getReference(request.type))
        batch.set(newReference, request)
        batch.delete(this.movementService.getMovementDocumentReferenceById(this.updateMovement.type, oldId!))
        await batch.commit()
        movementId = newReference.id
        this.movementService.deleteMovementForList(oldId!)
      } else if (this.updateMovement) {
        request.id = oldId
        await this.movementService.update(request)
        movementId = oldId!
        Object.assign(this.updateMovement, request, { date: new Date(request.time) })
      } else {
        movementId = (await this.movementService.create(request)).id
      }
    } catch (e) {
      this.saving = false
      this.notificationService.error(e)
      return
    }
    try {
      await this.saveRelatedMovements(oldId, movementId, request.type)
      this.notificationService.message(`Movement was ${oldId ? 'updated' : 'created'}`)
    } catch (e) {
      // The movement is already saved: show the error and close instead of allowing a duplicate save
      this.notificationService.error(e)
    }
    this.exit()
  }

  private selectCategory = (category: CategoryModel): void => {
    this.formGroup.controls.icon.setValue(category.icon)
    this.formGroup.controls.categoryId.setValue(category.id)
    this.formGroup.controls.color.setValue(category.color ?? this.defaultColor)
    this.formGroup.controls.backgroundColor.setValue(category.backgroundColor ?? this.defaultBackgroundColor)
  }

  private setDate = (date: Date): void => {
    const dateCopy = new Date(date.getTime())
    dateCopy.setHours(0, 0, 0, 0)
    this.formGroup.controls.date.setValue(dateCopy, { emitEvent: false })
    this.formGroup.controls.time.setValue(dateCopy.getTime())
  }

  private patchFormGroup = (movement: MovementModel): void => {
    this.currentCategories = HelperService.categoriesByType(this.categoryList, movement.type, this.getCategoryName)
    const currentCategory = this.currentCategories.find(x => x.id === movement.categoryId)
    const relatedMovementIds = this.relatedMovements.filter(x => x.related.map(y => y.id).includes(movement.id!)).map(x => x.id!)
    this.formGroup.patchValue({
      type: movement.type,
      icon: movement.icon,
      categoryId: movement.categoryId,
      memorandum: movement.memorandum ?? '',
      date: movement.date,
      time: movement.date?.getTime(),
      amount: Math.abs(movement.amount),
      color: currentCategory && currentCategory.color ? currentCategory.color : this.defaultColor,
      backgroundColor: currentCategory && currentCategory.backgroundColor ? currentCategory.backgroundColor : this.defaultBackgroundColor,
      relatedMovements: relatedMovementIds
    })
  }

  // Each group is written once with its final list. Groups offered in the form follow the selection;
  // the others keep the movement if they had it (with the new id when the type changed)
  private saveRelatedMovements = async (oldId: string | undefined, newId: string, type: CategoryType): Promise<void> => {
    const groups = await firstValueFrom(this.relateMovementService.getAll().pipe(take(1)))
    const selectableIds = this.relatedMovements.map(x => x.id!)
    const selectedIds = this.formGroup.controls.relatedMovements.value ?? []
    const batch = this.relateMovementService.openBatch()
    let changes = 0
    groups.forEach(group => {
      const wasIncluded = !!oldId && group.related.some(x => x.id === oldId)
      const include = selectableIds.includes(group.id!) ? selectedIds.includes(group.id!) : wasIncluded
      if ((!wasIncluded && !include) || (wasIncluded && include && oldId === newId)) { return }
      const related = group.related.filter(x => x.id !== oldId).map(x => ({ id: x.id, type: x.type }))
      if (include) {
        related.push({ id: newId, type })
      }
      batch.update(this.relateMovementService.getReferenceById(group.id!), { related })
      changes++
    })
    if (changes > 0) {
      await batch.commit()
    }
  }
}
