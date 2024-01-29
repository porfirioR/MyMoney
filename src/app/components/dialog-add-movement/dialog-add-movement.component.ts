import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, debounceTime, map, of, startWith, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { MonthType } from '../../enums/month-type.enum';
import { HelperService } from '../../services/helper.service';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { CategoryModel } from '../../models/category.model';
import { FilterRelatedMovementModel } from '../../models/filter-related-movement.model';
import { MovementModel } from '../../models/movement.model';
import { FilterRelatedMovementForm } from '../../forms/filter-related-movement.form';
import { TranslateService } from '@ngx-translate/core';

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
    selectedMovement: new FormControl(null),
    hasAnyCategory: new FormControl(false)
  })
  protected searching = false
  protected movements: MovementModel[] = []
  protected selectedCategories: CategoryModel[] = []
  protected filteredCategories: Observable<CategoryModel[]>
  protected defaultColor = '#000000'
  protected defaultBackgroundColor = '#ffffff'
  private minValidYear = 2018

  constructor(
    private readonly dialogRef: MatDialogRef<DialogAddMovementComponent>,
    private readonly movementService: MovementService,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
  ) {
    const year = new Date().getFullYear()
    const diffYear = year - this.minValidYear
    const initialYear = year === this.minValidYear || diffYear > 8 ? this.minValidYear : year - diffYear
    this.yearRange = [...Array(15).keys()].map(x => initialYear + x)
    this.formGroup.controls.year.setValue(year)
    this.formGroup.controls.month.setValue(this.months[0])

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
  }

  protected cancelAddition = (): void => this.dialogRef.close()

  protected search = (): void => {
    this.searching = true
    const request = new FilterRelatedMovementModel(
      this.selectedCategories.map(x => x.id)!,
      HelperService.convertStringToMonthType(this.formGroup.value.month!.toString()),
      this.formGroup.value.year!
    )
    this.movementService.getGetMovementByFilter(request).pipe(debounceTime(100), take(1)).subscribe({
      next: ([incomes, expenses]) => {
        this.movements = [...new Set([...incomes, ...expenses])].sort((a, b) => b.time - a.time)
        this.movements.forEach(x => {
          x.date = new Date(x.time)
          const category = this.categories.find(y => y.id === x.categoryId)!
          x.color = category.color
          x.backgroundColor = category.backgroundColor
          x.memorandum = !!x.memorandum ? x.memorandum : category.name
        })
        this.searching = false
      }, error: (e) => {
        this.searching = false
        throw e
      }
    })
  }

  protected save = () => {
    const movementToSave = this.movements.filter(x => this.formGroup.controls.selectedMovement.value!.some(y => y === x.id))
    this.dialogRef.close(movementToSave)
  }

  protected add = (event: MatChipInputEvent): void => {
    const value = (event.value || '').trim();
    if (value) {
      const category = this.categories.find(x => x.name === value)
      if (category) {
        this.selectedCategories = [...new Set([...this.selectedCategories, category])]
      }
    }
    this.checkSelectedCategory()

    event.chipInput!.clear()
    this.formGroup.controls.category.setValue(null)
  }

  protected remove = (category: string): void => {
    const index = this.selectedCategories.map(x => x.id).indexOf(category);
    if (index >= 0) {
      this.selectedCategories.splice(index, 1);
    }
    this.checkSelectedCategory()
    this.formGroup.controls.category.updateValueAndValidity({emitEvent: true})
  }

  protected selected = (event: MatAutocompleteSelectedEvent): void => {
    const category = this.categories.find(x => x.id === event.option.value)
    if (category) {
      this.selectedCategories = [...new Set([...this.selectedCategories, category])]
    }
    this.categoryInput!.nativeElement.value = '';
    this.formGroup.controls.category.setValue(null);
    this.checkSelectedCategory()
  }

  private filter = (value: string): CategoryModel[] => {
    const filterValue = value.toLowerCase()
    return this.categories.filter(x => !this.selectedCategories.map(x => x.id).includes(x.id) && this.translateService.instant(x.name).toLowerCase().includes(filterValue))
  }

  private checkSelectedCategory = (): void => this.formGroup.controls.hasAnyCategory.patchValue(this.selectedCategories.length > 0)
}
