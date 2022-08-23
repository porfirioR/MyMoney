import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { CategoryService } from '../../services/category.service'
import { CategoryModel } from '../../models/category.model'
import { CategoryType } from '../../enums/category-type.enum'

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.scss']
})
export class CategoryRowComponent implements OnInit {
  @Input() category!: CategoryModel
  @Output() updateCategoryEvent = new EventEmitter<CategoryType>()
  constructor(private readonly categoryService: CategoryService, private readonly snackBar: MatSnackBar) { }

  ngOnInit() {
    if (this.category && this.category.owner !== 'system') {
      this.category.name += ' (personalizado)'
    }
  }

  protected deactivateReactivateCategory = (active: boolean) => {
    const updateCategory = Object.assign({} as CategoryModel, this.category)
    updateCategory.active = !active
    this.categoryService.update(updateCategory).then(() => {
      this.snackBar.open('Category was updated', '', { duration: 3000 })
      this.category.active = updateCategory.active
      this.updateCategoryEvent.emit(updateCategory.type)
    })
  }

}
