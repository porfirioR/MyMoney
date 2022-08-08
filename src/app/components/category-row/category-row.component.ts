import { Component, Input, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { CategoryModel } from '../../models/category.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.css']
})
export class CategoryRowComponent implements OnInit {
  @Input() category!: CategoryModel
  constructor(private categoryService: CategoryService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  protected deactivateReactivateCategory = (active: boolean) => {
    const updateCategory = Object.assign({} as CategoryModel, this.category)
    updateCategory.active = !active
    this.categoryService.update(updateCategory).then(() => {
      this._snackBar.open('Category was updated', '', { duration: 3000 })
      this.category.active = updateCategory.active
    })
  }

  protected reorderCategory = () => {

  }
}
