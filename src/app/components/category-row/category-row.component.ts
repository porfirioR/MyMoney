import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { CategoryService } from '../../services/category.service'
import { UserCategoryService } from '../../services/user-category.service'
import { MovementService } from '../../services/movement.service'
import { CategoryModel } from '../../models/category.model'
import { UserCategoryModel } from '../../models/user-category.model'
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component'
import { CategoryEvent } from '../../models/category-event.model'
import { MovementModel } from '../../models/movement.model'
import { ResourceType } from '../../enums/resource-type.enum'
import { take } from 'rxjs'

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.scss']
})
export class CategoryRowComponent implements OnInit, OnDestroy {
  @Input() category!: CategoryModel
  @Output() updateCategoryEvent = new EventEmitter<CategoryEvent>()
  private ownerSystem = ResourceType.ownerSystem

  constructor(private readonly categoryService: CategoryService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly userCategoryService: UserCategoryService,
              private readonly movementService: MovementService) { }

  ngOnInit(): void {
    if (this.category && this.category.owner !== this.ownerSystem && !this.category.name.endsWith('(propio)')) {
      this.category.name += ' (propio)'
    }
  }

  ngOnDestroy(): void {
    
  }

  protected deactivateReactivateCategory = (active: boolean): void => {
    if (active) {
      const result = this.movementService.getMovementsByCategoryId(this.category.type, this.category.id).subscribe({
        next: (deleteMovementList) => {
          const dialogRef = this.dialog.open(DialogDeleteComponent, {
            width: '350px',
            data: { title: 'Delete category', message: `Are you sure you want to delete this category?. All movements (${deleteMovementList.length}) related to this category will be deleted` }
          })
          dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
            if (result) {
              if (this.category.owner === this.ownerSystem) {
                const request = new UserCategoryModel(!active, this.category.id)
                this.userCategoryService.upsertCategory(request)
                .then(() => {
                  const categoryEvent = new CategoryEvent(this.category.type)
                  this.category.active = request.active
                  this.deleteAllMovementReferences(categoryEvent, deleteMovementList)
                  this.snackBar.open('The category was deleted', '', { duration: 3000 })
                })
                .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
              } else {
                this.categoryService.delete(this.category.id)
                .then(() => {
                  this.snackBar.open('The category was deleted', '', { duration: 3000 })
                  const categoryEvent = new CategoryEvent(this.category.type, this.category.id)
                  this.deleteAllMovementReferences(categoryEvent, deleteMovementList)
                })
                .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
              }
            }
          })
          result.unsubscribe()
        }, error: (e) => {
          console.error(e);
          throw e;
        }
      })
    } else {
      if (this.category.owner === this.ownerSystem) {
        const request = new UserCategoryModel(!active, this.category.id)
        this.userCategoryService.upsertCategory(request)
        .then(() => {
          this.category.active = request.active
          this.snackBar.open('Category was restarted', '', { duration: 3000 })
          const categoryEvent = new CategoryEvent(this.category.type)
          this.updateCategoryEvent.emit(categoryEvent)
        })
      }
    }
  }

  private deleteAllMovementReferences = (categoryEvent: CategoryEvent, movements: MovementModel[]) => {
    let batch = this.movementService.openBatch()
    let commits: Promise<void>[] = []
    movements.forEach((request, i) => {
      const docReference = this.movementService.getMovementDocumentReferenceById(this.category.type, request.id!)
      batch.delete(docReference)
      let index = i + 1
      if (index % 500 === 0 || index === movements.length) {
        commits.push(batch.commit())
        if (index % 500 === 0) {
          batch = this.movementService.openBatch()
        }
      }
    })
    Promise.all(commits)
    .then(() => this.updateCategoryEvent.emit(categoryEvent))
    .catch((e) => console.error(e))
  }

}
