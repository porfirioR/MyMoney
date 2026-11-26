import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { SavingDirection } from '../../enums/saving-direction.enum';
import { NumberType } from '../../enums/number-type.enum';
import { CategoryModel } from '../../models/category.model';
import { MoveToSavingPlanModel, MoveToSavingResultModel } from '../../models/move-to-saving.model';
import { HelperService } from '../../services/helper.service';
import { MoveToSavingService } from '../../services/move-to-saving.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';

// A row of the list: the category and, once selected, where its movements go
interface MoveToSavingRow {
  category: CategoryModel
  suggested: boolean
  selected: boolean
  target?: CategoryModel
  direction: SavingDirection
  // Undefined while it is being counted
  count?: number
}

@Component({
  selector: 'app-move-to-saving',
  templateUrl: './move-to-saving.component.html',
  styleUrls: ['./move-to-saving.component.scss']
})
export class MoveToSavingComponent implements OnInit {
  protected rows: MoveToSavingRow[] = []
  protected savingCategories: CategoryModel[] = []
  protected showAll = false
  protected moving = false
  protected result?: MoveToSavingResultModel
  protected hidingOld = false
  protected oldHidden = false
  protected directions = SavingDirection
  protected numberType = NumberType.English
  protected defaultColor = DEFAULT_ICON_COLOR
  protected defaultBackgroundColor = DEFAULT_BACKGROUND_COLOR
  private movedCategories: CategoryModel[] = []

  constructor(
    private readonly moveToSavingService: MoveToSavingService,
    private readonly userService: UserService,
    private readonly navigationService: NavigationService,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.numberType = this.userService.item?.userConfiguration.number ?? NumberType.English
    this.savingCategories = this.moveToSavingService.getSavingCategories()
    this.rows = this.moveToSavingService.getCandidates().map(category => ({
      category,
      suggested: this.moveToSavingService.isSavingLike(category),
      selected: false,
      direction: SavingDirection.Deposit
    }))
    // Without suggestions every category is shown, so the user can still choose
    this.showAll = !this.rows.some(x => x.suggested)
  }

  protected get visibleRows(): MoveToSavingRow[] {
    return this.showAll ? this.rows : this.rows.filter(x => x.suggested || x.selected)
  }

  protected get selectedRows(): MoveToSavingRow[] {
    return this.rows.filter(x => x.selected)
  }

  protected get totalMovements(): number {
    return this.selectedRows.reduce((total, x) => total + (x.count ?? 0), 0)
  }

  protected get canMove(): boolean {
    const selected = this.selectedRows
    return !this.moving && selected.length > 0 && selected.every(x => x.target && x.count !== undefined) && this.totalMovements > 0
  }

  protected isExpense = (category: CategoryModel): boolean => HelperService.isExpense(category.type)

  // A yield only makes sense in a saving that earns interest
  protected canYield = (row: MoveToSavingRow): boolean => !!row.target?.earnsInterest

  protected toggleRow = (row: MoveToSavingRow): void => {
    row.selected = !row.selected
    if (!row.selected) { return }
    row.target = row.target ?? this.moveToSavingService.suggestTarget(row.category, this.savingCategories)
    row.direction = this.moveToSavingService.suggestDirection(row.category, row.target)
    if (row.count === undefined) {
      this.moveToSavingService.countMovements(row.category)
        .then(count => row.count = count)
        .catch(e => {
          row.selected = false
          this.notificationService.error(e)
        })
    }
  }

  protected selectTarget = (row: MoveToSavingRow, target: CategoryModel): void => {
    row.target = target
    if (row.direction === SavingDirection.Yield && !this.canYield(row)) {
      row.direction = SavingDirection.Withdrawal
    }
  }

  protected compareCategories = (a?: CategoryModel, b?: CategoryModel): boolean => a?.id === b?.id

  protected move = (): void => {
    if (!this.canMove) { return }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('move-to-saving.confirm-title'),
        message: this.translateService.instant('move-to-saving.confirm-message', { count: this.totalMovements }),
        confirmText: 'move-to-saving.confirm-button'
      }
    })
    dialogRef.afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.runMigration()
      }
    })
  }

  protected hideOldCategories = async (): Promise<void> => {
    if (this.hidingOld) { return }
    this.hidingOld = true
    try {
      await this.moveToSavingService.hideCategories(this.movedCategories.filter(x => x.active))
      this.oldHidden = true
      this.notificationService.message('move-to-saving.hidden')
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.hidingOld = false
    }
  }

  protected get hasActiveOldCategories(): boolean {
    return this.movedCategories.some(x => x.active)
  }

  protected toNames = (names: Set<string>): string => [...names].join(', ')

  protected exit = (): void => this.navigationService.back('/category')

  private runMigration = async (): Promise<void> => {
    this.moving = true
    const selected = this.selectedRows
    const plans: MoveToSavingPlanModel[] = selected.map(x => ({ category: x.category, target: x.target!, direction: x.direction }))
    try {
      this.result = await this.moveToSavingService.migrate(plans)
      this.movedCategories = selected.map(x => x.category)
      // Once something was moved, the main screen stops suggesting it
      if (!this.userService.item?.userConfiguration.moveToSavingDismissed) {
        await this.moveToSavingService.dismissNotice().catch(() => undefined)
      }
    } catch (e) {
      // Running it again continues with what was not moved yet
      this.notificationService.error(e)
      selected.forEach(x => x.count = undefined)
      selected.forEach(x => this.moveToSavingService.countMovements(x.category).then(count => x.count = count).catch(() => undefined))
    } finally {
      this.moving = false
    }
  }
}
