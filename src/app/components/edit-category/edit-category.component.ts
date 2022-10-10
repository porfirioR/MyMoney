import { Component, OnInit } from '@angular/core';
import { CategoryModel } from '../../models/category.model';
import { Location } from '@angular/common'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { combineLatest, take } from 'rxjs';
import { UserCategoryService } from 'src/app/services/user-category.service';
import { UserCategoryModel } from 'src/app/models/user-category.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  protected category?: CategoryModel
  protected formGroup: FormGroup = new FormGroup({
    color: new FormControl('', Validators.required),
    backgroundColor: new FormControl('#fff', Validators.required),
    order: new FormControl(0, Validators.min(0))
  })

  constructor(private readonly location: Location,
              private readonly userService: UserService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly userCategory: UserCategoryService,
              private snackBar: MatSnackBar,
    ) {
      combineLatest([this.activatedRoute.params, this.userService.getAllCategories$().pipe(take(1)), this.userService.getUserCategories$().pipe(take(1))]).subscribe({
        next: ([params, categories, userCategories]) => {
          this.category = categories.find(x => x.id === params['id'])
          if (!this.category) {
            this.exit()
          }
          const userCategory = userCategories.find(x => x.categoryId === this.category!.id)
          console.log(userCategory);
          
          if (userCategory) {
            this.formGroup.controls['color'].setValue(userCategory.color)
            this.formGroup.controls['backgroundColor'].setValue(userCategory.backgroundColor)
            this.formGroup.controls['order'].setValue(userCategory.order)
          }
        }, error: (e) => {
          throw e;
        }
      })
    }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    const request = new UserCategoryModel(
      this.category!.active,
      this.category!.id,
      undefined,
      undefined,
      undefined,
      this.formGroup.get('color')!.value,
      this.formGroup.get('backgroundColor')!.value,
      this.formGroup.get('order')!.value
    )
    this.userCategory.upsertCategory(request).then((response) => {
      this.snackBar.open('Category was updated', '', { duration: 3000 })
      this.category!.color = request.color
      this.category!.backgroundColor = request.backgroundColor
      this.category!.order = request.order
      this.userService.setCategory(this.category!)
      this.location.back()
    })
  }

}
