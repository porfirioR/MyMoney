import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, take } from 'rxjs';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { RelatedMovementService } from '../../services/related-movement.service';
import { HelperService } from '../../services/helper.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { MovementModel } from '../../models/movement.model';
import { NumberType } from '../../enums/number-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../../constants/category.constants';

@Component({
  selector: 'app-movement-detail',
  templateUrl: './movement-detail.component.html',
  styleUrls: ['./movement-detail.component.scss']
})
export class MovementDetailComponent implements OnInit {
  protected movement?: MovementModel
  protected numberType = NumberType.English
  protected language = LanguageType.English
  protected relatedMovements: string[] = []
  protected load = false
  protected deleting = false
  private defaultColor = DEFAULT_ICON_COLOR
  private defaultBackgroundColor = DEFAULT_BACKGROUND_COLOR

  constructor(
    private readonly movementService: MovementService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private translateService: TranslateService,
    private relateMovementService: RelatedMovementService,
    private readonly navigationService: NavigationService,
    private readonly notificationService: NotificationService,
  ) { }

  async ngOnInit(): Promise<void> {
    const id = this.activatedRoute.snapshot.params['id']
    const config = this.userService.item!.userConfiguration
    this.numberType = config.number
    this.language = config.language
    try {
      // After a reload the movement is not in the list of the main screen, so it is read from the server
      const movement = this.movementService.getMovementById(id) ?? await this.movementService.getMovementByIdFromServer(id)
      if (!movement) {
        this.exit()
        return
      }
      const relatedMovements = await firstValueFrom(this.relateMovementService.getRelatedMovementsShowingInMovements().pipe(take(1)))
      const userCategory = this.userService.getUserCategories().find(x => x.categoryId === movement.categoryId)
      movement.categoryName = this.userService.getAllCategories().find(x => x.id === movement.categoryId)?.name
      movement.color = userCategory?.color ?? this.defaultColor
      movement.backgroundColor = userCategory?.backgroundColor ?? this.defaultBackgroundColor
      this.relatedMovements = relatedMovements.filter(x => x.related.map(y => y.id).includes(movement.id!)).map(x => x.name!)
      this.movement = movement
      this.load = true
    } catch (e) {
      this.notificationService.error(e)
      this.exit()
    }
  }

  protected exit = () => {
    this.navigationService.back()
  }

  protected getSignedAmount = (movement: MovementModel): number => HelperService.getSignedAmount(movement)

  protected deleteMovement = (): void => {
    if (!this.movement || this.deleting) { return }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('movement-messages.title-delete'),
        message: this.translateService.instant('movement-messages.question-delete')
      }
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.deleting = true
        const movement = this.movement!
        this.movementService.delete(movement.id!, movement.type)
        .then(() => this.relateMovementService.removeMovements([movement.id!]))
        .then(() => {
          this.movementService.deleteMovementForList(movement.id!)
          this.notificationService.message('movement-messages.deleted')
          this.exit()
        }).catch((e) => {
          this.deleting = false
          this.notificationService.error(e)
        })
      }
    })
  }

  protected editMovement = (): void => {
    this.router.navigateByUrl(`/movement-update/${this.movement!.id}`)
  }
}
