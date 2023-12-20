import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, take } from 'rxjs';
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
    color: new FormControl(this.defaultColor, Validators.required),
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
  ) {
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
  }

  ngOnInit(): void { }

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

}
