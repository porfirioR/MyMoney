import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { TranslateService } from '@ngx-translate/core'
import { DocumentData, DocumentReference } from '@angular/fire/firestore'
import { take } from 'rxjs'
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
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants'

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
  protected isOwnCategory = false
  protected saving = false

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
    this.isOwnCategory = this.category.owner !== this.ownerSystem
  }

  ngOnDestroy(): void { }

  // Active categories are deleted (own) or deactivated (system); inactive system categories are restored
  protected deactivateReactivateCategory = (active: boolean): void => {
    if (this.saving) { return }
    if (!active) {
      this.restoreSystemCategory()
      return
    }
    this.movementService.getMovementsByCategoryId(this.category.type, this.category.id).pipe(take(1)).subscribe({
      next: (movements) => {
        const dialogRef = this.dialog.open(DialogDeleteComponent, {
          width: '350px',
          data: {
            title: this.translate.instant('category-messages.title-delete'),
            message: this.translate.instant('category-messages.question', { length: movements.length })
          }
        })
        dialogRef.afterClosed().pipe(take(1)).subscribe({
          next: (confirmed) => {
            if (confirmed) {
              this.isOwnCategory ? this.deleteOwnCategory(movements) : this.deactivateSystemCategory(movements)
            }
          }
        })
      }
    })
  }

  // System categories are never deleted: the user's data keeps active = false (and its colors/order) so it stays hidden
  private deactivateSystemCategory = async (movements: MovementModel[]): Promise<void> => {
    await this.runSaving(async () => {
      await this.saveSystemCategoryActive(false)
      await this.deleteDocuments(this.getMovementReferences(movements))
      this.snackBar.open(this.translate.instant('category-messages.deleted'), '', { duration: 3000 })
      this.updateCategoryEvent.emit(new CategoryEvent(this.category.type))
    })
  }

  private restoreSystemCategory = async (): Promise<void> => {
    await this.runSaving(async () => {
      await this.saveSystemCategoryActive(true)
      this.snackBar.open(this.translate.instant('category-messages.title-restarted'), '', { duration: 3000 })
      this.updateCategoryEvent.emit(new CategoryEvent(this.category.type))
    })
  }

  private deleteOwnCategory = async (movements: MovementModel[]): Promise<void> => {
    await this.runSaving(async () => {
      const userCategory = this.user.getUserCategories().find(x => x.categoryId === this.category.id)
      const references = this.getMovementReferences(movements)
      if (userCategory?.id) {
        references.push(this.userCategoryService.getUserCategoryReferenceById(userCategory.id))
      }
      await this.categoryService.delete(this.category.id)
      await this.deleteDocuments(references)
      this.user.removeCategory(this.category.id)
      this.snackBar.open(this.translate.instant('category-messages.deleted'), '', { duration: 3000 })
      this.updateCategoryEvent.emit(new CategoryEvent(this.category.type, this.category.id))
    })
  }

  // Keeps the user's colors and order, only the active flag changes
  private saveSystemCategoryActive = async (active: boolean): Promise<void> => {
    const userCategory = this.user.getUserCategories().find(x => x.categoryId === this.category.id)
    const request = new UserCategoryModel(
      active,
      this.category.id,
      this.user.getUserEmail(),
      userCategory?.id,
      undefined,
      userCategory?.color ?? this.category.color ?? DEFAULT_ICON_COLOR,
      userCategory?.backgroundColor ?? this.category.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
      userCategory?.order ?? this.category.order ?? 0
    )
    const docReference = await this.userCategoryService.upsertCategory(request)
    if (docReference) {
      request.id = docReference.id
    }
    this.user.setUserCategory(request)
    this.user.setCategoryActive(this.category.id, active)
  }

  private getMovementReferences = (movements: MovementModel[]): DocumentReference<DocumentData>[] =>
    movements.map(x => this.movementService.getMovementDocumentReferenceById(this.category.type, x.id!))

  // Firestore batches accept up to 500 operations
  private deleteDocuments = async (references: DocumentReference<DocumentData>[]): Promise<void> => {
    const batchSize = 500
    const commits: Promise<void>[] = []
    for (let i = 0; i < references.length; i += batchSize) {
      const batch = this.movementService.openBatch()
      references.slice(i, i + batchSize).forEach(x => batch.delete(x))
      commits.push(batch.commit())
    }
    await Promise.all(commits)
  }

  private runSaving = async (action: () => Promise<void>): Promise<void> => {
    this.saving = true
    try {
      await action()
    } catch (e) {
      console.error(e)
      this.snackBar.open(String(e), '', { duration: 3000 })
    } finally {
      this.saving = false
    }
  }

}
