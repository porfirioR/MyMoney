import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { TranslateService } from '@ngx-translate/core'
import { take } from 'rxjs'
import { UserCategoryService } from '../../services/user-category.service'
import { MovementService } from '../../services/movement.service'
import { UserService } from '../../services/user.service'
import { HelperService } from '../../services/helper.service'
import { NotificationService } from '../../services/notification.service'
import { CategoryModel } from '../../models/category.model'
import { UserCategoryModel } from '../../models/user-category.model'
import { CategoryEvent } from '../../models/category-event.model'
import { ResourceType } from '../../enums/resource-type.enum'
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component'
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants'

@Component({
  selector: 'app-category-row',
  templateUrl: './category-row.component.html',
  styleUrls: ['./category-row.component.scss']
})
export class CategoryRowComponent implements OnInit {
  @Input() category!: CategoryModel
  @Output() updateCategoryEvent = new EventEmitter<CategoryEvent>()
  private ownerSystem = ResourceType.ownerSystem
  protected isOwnCategory = false
  protected saving = false

  constructor(
    private readonly dialog: MatDialog,
    private readonly userCategoryService: UserCategoryService,
    private readonly movementService: MovementService,
    private translate: TranslateService,
    private readonly user: UserService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.isOwnCategory = this.category.owner !== this.ownerSystem
  }

  // Categories without a position keep an internal order that is not meaningful to the user
  protected get hasOrder(): boolean {
    return !HelperService.isUnsetCategoryOrder(this.category.order)
  }

  // Hiding never deletes movements: the category only stops being offered when registering movements.
  // Own categories are deleted from their edit screen.
  protected toggleActive = (): void => {
    if (this.saving) { return }
    if (!this.category.active) {
      this.saveActive(true, 'category-messages.title-restarted')
      return
    }
    this.movementService.getMovementsByCategoryId(this.category.type, this.category.id).pipe(take(1)).subscribe({
      next: (movements) => {
        const dialogRef = this.dialog.open(DialogDeleteComponent, {
          width: '350px',
          data: {
            title: this.translate.instant('category-messages.title-deactivate'),
            message: this.translate.instant('category-messages.question-deactivate', { length: movements.length }),
            confirmText: 'Hide'
          }
        })
        dialogRef.afterClosed().pipe(take(1)).subscribe({
          next: (confirmed) => {
            if (confirmed) {
              this.saveActive(false, 'category-messages.deactivated')
            }
          }
        })
      },
      error: (e) => this.notificationService.error(e)
    })
  }

  // Keeps the user's colors and order, only the active flag changes
  private saveActive = async (active: boolean, messageKey: string): Promise<void> => {
    this.saving = true
    try {
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
      this.notificationService.message(messageKey)
      this.updateCategoryEvent.emit(new CategoryEvent(this.category.type))
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.saving = false
    }
  }
}
