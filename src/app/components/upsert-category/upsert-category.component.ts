import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { IconType } from '../../enums/icon-type.enum';
import { ResourceType } from '../../enums/resource-type.enum';
import { CategoryModel } from '../../models/category.model';
import { CategoryIconGroupModel } from '../../models/category-icon-group.model';
import { UserCategoryModel } from '../../models/user-category.model';
import { CategoryService } from '../../services/category.service';
import { UserCategoryService } from '../../services/user-category.service';
import { UserService } from '../../services/user.service';
import { HelperService } from '../../services/helper.service';
import { ConfigurationService } from '../../services/configuration.service';
import { UpsertCategoryForm } from '../../forms/upsert-category.form';
import {
  BACKGROUND_COLOR_PRESETS,
  CATEGORY_ICON_GROUPS,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_ICON_COLOR,
  HEX_COLOR_PATTERN,
  ICON_COLOR_PRESETS,
  INCOME_ICON_GROUP
} from '../../constants/category.constants';

@Component({
  selector: 'app-upsert-category',
  templateUrl: './upsert-category.component.html',
  styleUrls: ['./upsert-category.component.scss']
})
export class UpsertCategoryComponent implements OnInit {
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>
  @ViewChild('iconSection', { read: ElementRef }) iconSection?: ElementRef<HTMLElement>
  @ViewChild('colorSection', { read: ElementRef }) colorSection?: ElementRef<HTMLElement>
  protected title!: string
  protected category?: CategoryModel
  protected isSystemCategory = false
  protected saving = false
  protected iconPanelExpanded = false
  protected formGroup!: FormGroup<UpsertCategoryForm>
  protected iconGroups: CategoryIconGroupModel[] = []
  protected readonly placeholderIcon = 'category'
  protected readonly iconColorPresets = ICON_COLOR_PRESETS
  protected readonly backgroundColorPresets = BACKGROUND_COLOR_PRESETS
  protected mask = 'separator.0'
  protected thousandSeparator = '.'
  private type!: string
  private categoryNames: string[] = []

  constructor(
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly categoryService: CategoryService,
    private readonly userCategoryService: UserCategoryService,
    private readonly userService: UserService,
    private readonly configurationService: ConfigurationService,
    private readonly snackBar: MatSnackBar,
    private readonly translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.route.params,
      this.userService.getAllCategories$(),
      this.userService.getUserCategories$(),
      this.configurationService.getConfiguration()
    ]).pipe(take(1)).subscribe({
      next: ([params, categories, userCategories, configuration]) => {
        [this.mask, this.thousandSeparator] = HelperService.getMarkValues(configuration)
        if (params['id']) {
          this.category = categories.find(x => x.id === params['id'])
          if (!this.category) {
            this.exit()
            return
          }
          this.type = this.category.type
          this.isSystemCategory = this.category.owner === ResourceType.ownerSystem
          this.title = 'Edit category'
        } else {
          this.type = params['type']
          this.title = this.translateService.instant('category-messages.add', { type: this.translateService.instant(this.type) })
          this.iconPanelExpanded = true
        }
        const isIncome = this.type.toLowerCase() === CategoryType.income.toLowerCase()
        this.iconGroups = isIncome ? [INCOME_ICON_GROUP, ...CATEGORY_ICON_GROUPS] : [...CATEGORY_ICON_GROUPS, INCOME_ICON_GROUP]
        this.categoryNames = categories
          .filter(x => x.id !== this.category?.id && x.type.toLowerCase() === this.type.toLowerCase())
          .flatMap(x => [x.name, this.translateService.instant(x.name)])
          .map(x => x.toLowerCase().trim())
        const userCategory = this.category ? userCategories.find(x => x.categoryId === this.category!.id) : undefined
        this.buildForm(userCategory)
        if (!this.category) {
          setTimeout(() => this.nameInput?.nativeElement.focus())
        }
      }
    })
  }

  protected exit = (): void => {
    this.location.back()
  }

  // Enter on the name moves to the next step (icons) instead of submitting
  protected onNameEnter = (event: Event): void => {
    event.preventDefault()
    this.nameInput?.nativeElement.blur()
    this.iconPanelExpanded = true
    this.scrollTo(this.iconSection)
  }

  protected selectIcon = (icon: IconType): void => {
    this.formGroup!.controls.icon.setValue(icon)
    this.formGroup!.controls.icon.markAsTouched()
    this.iconPanelExpanded = false
    this.scrollTo(this.colorSection)
  }

  protected selectColor = (control: FormControl<string | null>, color: string): void => {
    control.setValue(color)
  }

  protected isPreset = (presets: string[], color: string | null): boolean => presets.includes(color ?? '')

  protected getIconName = (icon: IconType): string => {
    const key = Object.keys(IconType).find(k => IconType[k as keyof typeof IconType] === icon)
    return key ? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ') : icon
  }

  protected save = async (): Promise<void> => {
    if (!this.formGroup || this.formGroup.invalid || this.saving) { return }
    this.saving = true
    try {
      if (this.category) {
        await this.update(this.category)
        this.snackBar.open(this.translateService.instant('category-messages.updated'), '', { duration: 3000 })
      } else {
        await this.create()
        this.snackBar.open(this.translateService.instant('category-messages.created'), '', { duration: 3000 })
      }
      this.location.back()
    } catch (e) {
      this.saving = false
      this.snackBar.open(String(e), '', { duration: 3000 })
    }
  }

  private create = async (): Promise<void> => {
    const value = this.formGroup!.getRawValue()
    const email = this.userService.getUserEmail()
    const category = {
      name: value.name!.trim(),
      icon: value.icon!,
      type: this.type,
      active: true,
      owner: email
    } as CategoryModel
    const categoryReference = await this.categoryService.create(category)
    const userCategory = new UserCategoryModel(
      true, categoryReference.id, email, undefined, undefined, value.color!, value.backgroundColor!, Number(value.order ?? 0)
    )
    const userCategoryReference = await this.userCategoryService.upsertCategory(userCategory)
    userCategory.id = userCategoryReference?.id
    Object.assign(category, {
      id: categoryReference.id,
      color: userCategory.color,
      backgroundColor: userCategory.backgroundColor,
      order: userCategory.order
    })
    this.userService.setCategory(category)
    this.userService.setUserCategory(userCategory)
  }

  private update = async (category: CategoryModel): Promise<void> => {
    const value = this.formGroup!.getRawValue()
    const name = value.name!.trim()
    const icon = value.icon!
    if (!this.isSystemCategory && (name !== category.name || icon !== category.icon)) {
      await this.categoryService.update({
        id: category.id,
        name,
        icon,
        type: category.type,
        active: category.active,
        owner: category.owner
      } as CategoryModel)
      category.name = name
      category.icon = icon
    }
    const request = new UserCategoryModel(
      category.active,
      category.id,
      this.userService.getUserEmail(),
      this.userService.getUserCategories().find(x => x.categoryId === category.id)?.id,
      undefined,
      value.color!,
      value.backgroundColor!,
      Number(value.order ?? 0)
    )
    const docReference = await this.userCategoryService.upsertCategory(request)
    if (docReference) {
      request.id = docReference.id
    }
    category.color = request.color
    category.backgroundColor = request.backgroundColor
    category.order = request.order
    this.userService.setUserCategory(request)
  }

  private buildForm = (userCategory?: UserCategoryModel): void => {
    const color = userCategory?.color ?? DEFAULT_ICON_COLOR
    const backgroundColor = userCategory?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
    this.formGroup = new FormGroup<UpsertCategoryForm>({
      name: new FormControl(
        { value: this.category?.name ?? '', disabled: this.isSystemCategory },
        [Validators.required, this.sameNameValidator]
      ),
      icon: new FormControl(
        { value: this.category?.icon ?? null, disabled: this.isSystemCategory },
        Validators.required
      ),
      color: new FormControl(color, Validators.required),
      hexColor: new FormControl(color, [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]),
      backgroundColor: new FormControl(backgroundColor, Validators.required),
      hexBackgroundColor: new FormControl(backgroundColor, [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]),
      order: new FormControl(userCategory?.order ?? 0, Validators.min(0))
    })
    const controls = this.formGroup.controls
    this.syncColor(controls.color, controls.hexColor)
    this.syncColor(controls.backgroundColor, controls.hexBackgroundColor)
  }

  // Keeps the picker and the hex input in sync; only complete #rrggbb values reach the picker
  private syncColor = (colorControl: FormControl<string | null>, hexControl: FormControl<string | null>): void => {
    colorControl.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (color) => {
        if (hexControl.value !== color) {
          hexControl.setValue(color, { emitEvent: false })
        }
      }
    })
    hexControl.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (hexColor) => {
        const finalValue = `#${(hexColor ?? '').replace(/[^A-Fa-f0-9]/g, '')}`.toLowerCase()
        if (HEX_COLOR_PATTERN.test(finalValue) && colorControl.value !== finalValue) {
          colorControl.setValue(finalValue, { emitEvent: false })
        }
      }
    })
  }

  // Waits for the expansion panel to toggle so the target is measured at its final position
  private scrollTo = (target?: ElementRef<HTMLElement>): void => {
    setTimeout(() => target?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  private sameNameValidator = (control: AbstractControl): ValidationErrors | null => {
    const name = (control.value as string | null)?.toLowerCase().trim()
    if (name && this.categoryNames.includes(name)) {
      control.markAsTouched()
      return { sameName: true }
    }
    return null
  }
}
