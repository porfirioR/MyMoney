import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, debounceTime, map, startWith, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { CategoryModel } from '../../models/category.model';
import { FilterRelatedMovementModel } from '../../models/filter-related-movement.model';
import { MovementModel } from '../../models/movement.model';
import { FilterRelatedMovementForm } from '../../forms/filter-related-movement.form';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';

@Component({
  selector: 'app-dialog-add-movement',
  templateUrl: './dialog-add-movement.component.html',
  styleUrls: ['./dialog-add-movement.component.scss']
})
export class DialogAddMovementComponent implements OnInit {
  @ViewChild('categoryInput') categoryInput?: ElementRef<HTMLInputElement>;
  protected yearRange: number[]
  protected categoryType!: CategoryType
  protected months = MonthType
  protected categories: CategoryModel[] = []
  protected formGroup: FormGroup<FilterRelatedMovementForm> = new FormGroup<FilterRelatedMovementForm>({
    year: new FormControl(null, Validators.required),
    category: new FormControl(null),
    month: new FormControl(null, Validators.required),
    text: new FormControl(null),
    selectedMovement: new FormControl([])
  })
  protected searching = false
  protected movements: MovementModel[] = []
  protected filteredMovements: MovementModel[] = []
  protected language = LanguageType.English
  protected numberType = NumberType.English
  private excludedIds: string[] = []
  protected selectedCategories: CategoryModel[] = []
  protected filteredCategories: Observable<CategoryModel[]>
  protected defaultColor = DEFAULT_ICON_COLOR
  protected defaultBackgroundColor = DEFAULT_BACKGROUND_COLOR
  private minValidYear = 2018

  constructor(
    private readonly dialogRef: MatDialogRef<DialogAddMovementComponent>,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService,
    @Optional() @Inject(MAT_DIALOG_DATA) data?: { excludedIds?: string[] }
  ) {
    this.excludedIds = data?.excludedIds ?? []
    const year = new Date().getFullYear()
    const diffYear = year - this.minValidYear
    const initialYear = year === this.minValidYear || diffYear > 8 ? this.minValidYear : year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)
    // Starts on the month the user is viewing in the main screen
    const selected = this.userService.getSelectedYearMonth()
    this.formGroup.controls.year.setValue(selected.year)
    this.formGroup.controls.month.setValue(this.months[selected.month])
    this.formGroup.controls.text.valueChanges.subscribe(() => this.applyTextFilter())
    this.formGroup.controls.month.valueChanges.subscribe(() => this.search())
    this.formGroup.controls.year.valueChanges.subscribe(() => this.search())

    this.filteredCategories = this.formGroup.controls.category.valueChanges.pipe(
      startWith(null),
      map((x: string | null) => x ? this.filter(x) : this.categories.filter(x => !this.selectedCategories.map(x => x.id).includes(x.id)).slice())
    )
  }

  ngOnInit(): void {
    this.categories = this.userService.getActiveCategories()
    this.categories.forEach(x => {
      x.color = x.color ?? this.defaultColor
      x.backgroundColor = x.backgroundColor ?? this.defaultBackgroundColor
    })
    this.userService.getUserConfiguration$().pipe(take(1)).subscribe({
      next: (configuration) => {
        this.language = configuration.language
        this.numberType = configuration.number
      }
    })
    this.search()
  }

  protected cancelAddition = (): void => this.dialogRef.close()

  protected isExpense = (movement: MovementModel): boolean => HelperService.isExpense(movement.type)

  // Without categories it brings every movement of the month; already added movements are hidden
  protected search = (): void => {
    if (this.formGroup.controls.month.invalid || this.formGroup.controls.year.invalid || this.searching) { return }
    this.searching = true
    const request = new FilterRelatedMovementModel(
      this.selectedCategories.map(x => x.id)!,
      HelperService.convertStringToMonthType(this.formGroup.value.month!.toString()),
      this.formGroup.value.year!
    )
    this.movementService.getGetMovementByFilter(request).pipe(debounceTime(100), take(1)).subscribe({
      next: ([incomes, expenses]) => {
        const selected = this.formGroup.controls.selectedMovement.value ?? []
        this.movements = [...incomes, ...expenses]
          .filter(x => !this.excludedIds.includes(x.id!))
          .sort((a, b) => b.time - a.time)
        this.movements.forEach(x => {
          x.date = new Date(x.time)
          const category = this.userService.getAllCategories().find(y => y.id === x.categoryId)
          x.color = category?.color ?? this.defaultColor
          x.backgroundColor = category?.backgroundColor ?? this.defaultBackgroundColor
          x.categoryName = category?.name
          x.memorandum = x.memorandum ? x.memorandum : category?.name ?? ''
        })
        // Keeps the selection of movements that are still in the results
        this.formGroup.controls.selectedMovement.setValue(selected.filter(id => this.movements.some(x => x.id === id)))
        this.applyTextFilter()
        this.searching = false
      }, error: (e) => {
        this.searching = false
        this.notificationService.error(e)
      }
    })
  }

  protected save = (): void => {
    const selected = this.formGroup.controls.selectedMovement.value ?? []
    if (selected.length === 0) { return }
    this.dialogRef.close(this.movements.filter(x => selected.includes(x.id!)))
  }

  private applyTextFilter = (): void => {
    const text = (this.formGroup.controls.text.value ?? '').toLowerCase().trim()
    this.filteredMovements = text
      ? this.movements.filter(x =>
        this.translateService.instant(x.memorandum ?? '').toLowerCase().includes(text) ||
        this.translateService.instant(x.categoryName ?? '').toLowerCase().includes(text))
      : this.movements
  }

  protected add = (event: MatChipInputEvent): void => {
    const value = (event.value || '').trim();
    if (value) {
      const category = this.categories.find(x => x.name === value)
      if (category) {
        this.selectedCategories = [...new Set([...this.selectedCategories, category])]
      }
    }
    this.onCategoriesChanged()

    event.chipInput!.clear()
    this.formGroup.controls.category.setValue(null)
  }

  protected remove = (category: string): void => {
    const index = this.selectedCategories.map(x => x.id).indexOf(category);
    if (index >= 0) {
      this.selectedCategories.splice(index, 1);
    }
    this.onCategoriesChanged()
    this.formGroup.controls.category.updateValueAndValidity({emitEvent: true})
  }

  protected selected = (event: MatAutocompleteSelectedEvent): void => {
    const category = this.categories.find(x => x.id === event.option.value)
    if (category) {
      this.selectedCategories = [...new Set([...this.selectedCategories, category])]
    }
    this.categoryInput!.nativeElement.value = '';
    this.formGroup.controls.category.setValue(null);
    this.onCategoriesChanged()
  }

  private filter = (value: string): CategoryModel[] => {
    const filterValue = value.toLowerCase()
    return this.categories.filter(x => !this.selectedCategories.map(x => x.id).includes(x.id) && this.translateService.instant(x.name).toLowerCase().includes(filterValue))
  }

  // Categories are an optional filter: changing them refreshes the results
  private onCategoriesChanged = (): void => this.search()
}
