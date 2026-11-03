import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, catchError, debounce, map, of, startWith, switchMap, take, tap, timer } from 'rxjs';
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
import { FilterRelatedMovementForm, MovementSearchPeriod } from '../../forms/filter-related-movement.form';
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
    period: new FormControl<MovementSearchPeriod>('month', { nonNullable: true }),
    year: new FormControl(null),
    category: new FormControl(null),
    month: new FormControl(null),
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
  // Selected movements are kept here, so changing the filters does not lose them
  protected selected = new Map<string, MovementModel>()
  // Once the user picks a period, typing no longer changes it
  private periodChosenByUser = false
  // Searching every date brings every movement, so it waits for a few letters and is read only once
  protected readonly minTextAllDates = 3
  private readonly textDelay = 1000
  private allDatesCache?: { key: string, movements: MovementModel[] }
  private searchRequest$ = new Subject<number>()
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
    const currentYear = new Date().getFullYear()
    // Newest first, only years that can have movements
    this.yearRange = Array.from({ length: currentYear - this.minValidYear + 2 }, (_, i) => currentYear + 1 - i)
    // Starts on the month the user is viewing in the main screen
    const selected = this.userService.getSelectedYearMonth()
    this.formGroup.controls.year.setValue(selected.year)
    this.formGroup.controls.month.setValue(this.months[selected.month])

    // Searching by text usually means "find it wherever it is": the search moves to every date
    // Typing only filters what is loaded; it reads from the server just when every date has to be searched
    this.formGroup.controls.text.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const period = this.formGroup.controls.period.value
      if (this.hasTextForAllDates() && !this.periodChosenByUser && period === 'month') {
        this.formGroup.controls.period.setValue('all')
      } else if (period === 'all') {
        this.search(this.textDelay)
      }
      this.applyTextFilter()
    })
    this.formGroup.controls.period.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.search())
    this.formGroup.controls.month.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.search())
    this.formGroup.controls.year.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.search())
    // The list only reports the options on screen: the others keep their state
    this.formGroup.controls.selectedMovement.valueChanges.pipe(takeUntilDestroyed()).subscribe((ids) => {
      this.movements.forEach(x => (ids ?? []).includes(x.id!) ? this.selected.set(x.id!, x) : this.selected.delete(x.id!))
    })

    // Only the last search counts, so quick changes of the filters do not mix results
    this.searchRequest$.pipe(
      debounce((delay) => timer(delay)),
      tap(() => this.searching = true),
      switchMap(() => this.loadMovements().pipe(
        catchError((e) => {
          this.notificationService.error(e)
          return of(null)
        })
      )),
      takeUntilDestroyed()
    ).subscribe((movements) => {
      this.searching = false
      if (movements) {
        this.setMovements(movements)
      }
    })

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

  protected choosePeriod = (): void => {
    this.periodChosenByUser = true
  }

  protected clearText = (): void => this.formGroup.controls.text.setValue('')

  protected search = (delay = 150): void => this.searchRequest$.next(delay)

  protected hasTextForAllDates = (): boolean => (this.formGroup.controls.text.value ?? '').trim().length >= this.minTextAllDates

  private loadMovements = (): Observable<MovementModel[]> => {
    const request = this.buildRequest()
    const read$ = this.movementService.getGetMovementByFilter(request).pipe(map(([incomes, expenses]) => [...incomes, ...expenses]))
    if (this.formGroup.controls.period.value !== 'all') {
      return read$
    }
    if (!this.hasTextForAllDates()) {
      return of([])
    }
    const key = [...request.categoryIds].sort().join(',')
    if (this.allDatesCache?.key === key) {
      return of(this.allDatesCache.movements)
    }
    return read$.pipe(tap((movements) => this.allDatesCache = { key, movements }))
  }

  protected save = (): void => {
    if (this.selected.size === 0) { return }
    this.dialogRef.close([...this.selected.values()])
  }

  private buildRequest = (): FilterRelatedMovementModel => {
    const categoryIds = this.selectedCategories.map(x => x.id)
    const { period, year, month } = this.formGroup.getRawValue()
    if (period === 'month' && year && month) {
      const [start, end] = this.movementService.getMonthTimeRange(HelperService.convertStringToMonthType(month.toString()), year)
      return new FilterRelatedMovementModel(categoryIds, start, end)
    }
    if (period === 'year' && year) {
      const [start, end] = this.movementService.getYearTimeRange(year)
      return new FilterRelatedMovementModel(categoryIds, start, end)
    }
    return new FilterRelatedMovementModel(categoryIds)
  }

  // Already added movements are hidden; the newest come first
  private setMovements = (movements: MovementModel[]): void => {
    this.movements = movements
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
    this.formGroup.controls.selectedMovement.setValue(this.movements.filter(x => this.selected.has(x.id!)).map(x => x.id!), { emitEvent: false })
    this.applyTextFilter()
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

  protected selectedCategory = (event: MatAutocompleteSelectedEvent): void => {
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
