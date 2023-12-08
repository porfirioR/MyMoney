import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
import { catchError, take } from 'rxjs'
import { CategoryService } from '../../services/category.service'
import { UserCategoryService } from '../../services/user-category.service'
import { MovementService } from '../../services/movement.service'
import { UserService } from '../../services/user.service'
import { CategoryModel } from '../../models/category.model'
import { UserCategoryModel } from '../../models/user-category.model'
import { CategoryEvent } from '../../models/category-event.model'
import { MovementModel } from '../../models/movement.model'
import { ResourceType } from '../../enums/resource-type.enum'
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component'

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.scss']
})
export class CategoryRowComponent implements OnInit, OnDestroy {
  @Input() category!: CategoryModel
  @Output() updateCategoryEvent = new EventEmitter<CategoryEvent>()
  @Output() deletedCategoryEvent = new EventEmitter<CategoryEvent>()
  private ownerSystem = ResourceType.ownerSystem

  constructor(
    private readonly categoryService: CategoryService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly userCategoryService: UserCategoryService,
    private readonly movementService: MovementService,
    private translate: TranslateService,
    private readonly user: UserService
  ) { }

  ngOnInit(): void {
    const user = this.translate.instant('(user)')
    if (this.category && this.category.owner !== this.ownerSystem && !this.category.name.endsWith(user)) {
      this.category.name = `${this.translate.instant(this.category.name)} ${user}`
    }
  }

  ngOnDestroy(): void { }

  protected deactivateReactivateCategory = (active: boolean): void => {
    if (active) {
      const result = this.movementService.getMovementsByCategoryId(this.category.type, this.category.id).subscribe({
        next: (deleteMovementList) => {
          const dialogRef = this.dialog.open(DialogDeleteComponent, {
            width: '350px',
            data: { title: this.translate.instant('category-messages.title-delete'), message: this.translate.instant('category-messages.question', {length: deleteMovementList.length}) }
          })
          dialogRef.afterClosed().pipe(take(1)).pipe(catchError((e) => {
            console.error(e);
            throw e;
          })).subscribe(result => {
            if (result) {
              if (this.category.owner === this.ownerSystem) {
                const request = new UserCategoryModel(!active, this.category.id, this.ownerSystem)
                this.userCategoryService.upsertCategory(request)
                .then(() => {
                  const categoryEvent = new CategoryEvent(this.category.type)
                  this.category.active = request.active
                  this.deleteAllMovementReferences(categoryEvent, deleteMovementList)
                  this.snackBar.open(this.translate.instant('category-messages.deleted'), '', { duration: 3000 })
                })
                .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
              } else {
                this.categoryService.delete(this.category.id).then(() => {
                  this.snackBar.open(this.translate.instant('category-messages.deleted'), '', { duration: 3000 })
                  const categoryEvent = new CategoryEvent(this.category.type, this.category.id)
                  this.deleteAllMovementReferences(categoryEvent, deleteMovementList)
                })
                .catch((reason) => this.snackBar.open(reason, '', { duration: 3000 }))
              }
            }
          })
          result.unsubscribe()
        }
      })
    } else if (this.category.owner === this.ownerSystem) {
      const request = new UserCategoryModel(!active, this.category.id, this.ownerSystem)
      this.userCategoryService.upsertCategory(request).then(() => {
        this.category.active = request.active
        this.snackBar.open(this.translate.instant('category-messages.title-restarted'), '', { duration: 3000 })
        const categoryEvent = new CategoryEvent(this.category.type)
        this.updateCategoryEvent.emit(categoryEvent)
      })
    }
  }

  private deleteAllMovementReferences = (categoryEvent: CategoryEvent, movements: MovementModel[]): void => {
    const userCategory = this.user.getUserCategories().find(x => x.categoryId === this.category.id)
    let batch = this.movementService.openBatch()
    let commits: Promise<void>[] = []
    if (!!userCategory) {
      const userCategoryDocReference = this.userCategoryService.getUserCategoryReferenceById(userCategory.id!)
      batch.delete(userCategoryDocReference)
      if (movements.length === 0) {
        commits.push(batch.commit())
      }
    }
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
