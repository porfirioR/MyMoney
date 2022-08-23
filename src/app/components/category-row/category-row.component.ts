import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { CategoryService } from '../../services/category.service'
import { UserCategoryService } from '../../services/user-category.service'
import { CategoryModel } from '../../models/category.model'
import { UserCategory } from '../../models/user-category.model'
import { CategoryType } from '../../enums/category-type.enum'
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component'

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.scss']
})
export class CategoryRowComponent implements OnInit {
  @Input() category!: CategoryModel
  @Output() updateCategoryEvent = new EventEmitter<CategoryType>()
  constructor(private readonly categoryService: CategoryService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly userCategoryService: UserCategoryService) { }

  ngOnInit() {
    if (this.category && this.category.owner !== 'system') {
      this.category.name += ' (propio)'
    }
  }

  protected deactivateReactivateCategory = (active: boolean) => {
    if (active) {
      const dialogRef = this.dialog.open(DialogDeleteComponent, {
        width: '350px',
        data: { title: 'Delete category', message: 'Are you sure you want to delete this category, will be deleted all movement with this category?' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (this.category.owner === 'system') {
            const request = new UserCategory(!active, this.category.id)
            this.userCategoryService.upsertCategory(request)
            .then(() => this.snackBar.open('The category was deleted', '', { duration: 3000 }))
            .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
          } else {
            this.categoryService.delete(this.category.id)
            .then(() => this.snackBar.open('The category was deleted', '', { duration: 3000 }))
            .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
          }
        }
      });
    }
    this.category.owner === 'system'


    const updateCategory = Object.assign({} as CategoryModel, this.category)
    updateCategory.active = !active
    this.categoryService.update(updateCategory).then(() => {
      this.snackBar.open('Category was updated', '', { duration: 3000 })
      this.category.active = updateCategory.active
      this.updateCategoryEvent.emit(updateCategory.type)
    })
  }

}
