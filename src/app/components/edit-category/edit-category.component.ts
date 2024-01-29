import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, debounceTime, distinctUntilChanged, take } from 'rxjs';
import { UserCategoryService } from '../../services/user-category.service';
import { UserService } from '../../services/user.service';
import { HelperService } from '../../services/helper.service';
import { ConfigurationService } from '../../services/configuration.service';
import { CategoryModel } from '../../models/category.model';
import { UserCategoryModel } from '../../models/user-category.model';
import { ColorForm } from '../../forms/color.form';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  protected category?: CategoryModel
  protected defaultColor = '#000000'
  protected defaultBackgroundColor = '#ffffff'
  protected formGroup: FormGroup<ColorForm> = new FormGroup<ColorForm>({
    hexColor: new FormControl(this.defaultColor, [Validators.required]),
    color: new FormControl(this.defaultColor, Validators.required),
    hexBackgroundColor: new FormControl(this.defaultBackgroundColor, [Validators.required]),
    backgroundColor: new FormControl(this.defaultBackgroundColor, Validators.required),
    order: new FormControl(0, Validators.min(0))
  })
  protected mask = 'separator.0'
  protected thousandSeparator = '.'

  constructor(
    private readonly location: Location,
    private readonly userService: UserService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userCategory: UserCategoryService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private configurationService: ConfigurationService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.activatedRoute.params,
      this.userService.getAllCategories$().pipe(take(1)),
      this.userService.getUserCategories$().pipe(take(1)),
      this.configurationService.getConfiguration().pipe(take(1))
    ]).subscribe({
      next: ([params, categories, userCategories, configuration]) => {
        [this.mask, this.thousandSeparator] = HelperService.getMarkValues(configuration)
        this.category = categories.find(x => x.id === params['id'])
        if (!this.category) { this.exit() }
        const userCategory = userCategories.find(x => x.categoryId === this.category!.id)
        if (userCategory) {
          this.formGroup.controls.color.setValue(userCategory.color)
          this.formGroup.controls.backgroundColor.setValue(userCategory.backgroundColor)
          this.formGroup.controls.order.setValue(userCategory.order)
        }
      }
    })
    this.valueChanges()
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected save = (): void => {
    const request = new UserCategoryModel(
      this.category!.active,
      this.category!.id,
      this.userService.getUserEmail(),
      this.userService.getUserCategories().find(x => x.categoryId === this.category?.id)?.id,
      undefined,
      this.formGroup.controls.color.value ?? undefined,
      this.formGroup.controls.backgroundColor.value ?? undefined,
      this.formGroup.controls.order.value ?? undefined
    )
    this.userCategory.upsertCategory(request).then((docReference) => {
      this.snackBar.open(this.translate.instant('category-messages.updated'), '', { duration: 3000 })
      this.category!.color = request.color
      this.category!.backgroundColor = request.backgroundColor
      this.category!.order = request.order
      if (!!docReference) {
        request.id = docReference.id
      }
      this.userService.setUserCategory(request)
      this.location.back()
    })
  }

  private valueChanges = (): void => {
    this.formGroup.controls.hexColor.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe({
      next: (hexColor) => this.hexColorValueChanges(this.formGroup.controls.color, this.formGroup.controls.hexColor, hexColor) 
    })
    this.formGroup.controls.color.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (color) => this.colorValueChanges(this.formGroup.controls.hexColor, color)
    })
    this.formGroup.controls.hexBackgroundColor.valueChanges.pipe(debounceTime(500),distinctUntilChanged()).subscribe({
      next: (hexColor) => this.hexColorValueChanges(this.formGroup.controls.backgroundColor, this.formGroup.controls.hexBackgroundColor, hexColor) 
    })
    this.formGroup.controls.backgroundColor.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (color) => this.colorValueChanges(this.formGroup.controls.hexBackgroundColor, color)
    })
  }

  private colorValueChanges = (refColor: FormControl<string | null>, color: string | null): void => {
    const hexColor = refColor
    if (hexColor.value != color) {
      hexColor.setValue(color, { emitEvent: false, onlySelf: true })
    }
  }

  private hexColorValueChanges = (
    refColor: FormControl,
    refHexColor: FormControl,
    hexColor: string | null,
    defaultColor: string = this.defaultColor
  ): void => {
    let finalValue = hexColor?.replace(/[^A-Fa-f0-9]/g, '').slice(0, 6)
    finalValue = finalValue ? `#${finalValue}` : defaultColor
    refHexColor.setValue(finalValue, { emitEvent: false } )
    if (refColor.value != finalValue) {
      refColor.setValue(finalValue)
    }
  }
}
