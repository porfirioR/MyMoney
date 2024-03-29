import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, take } from 'rxjs';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { RelatedMovementService } from '../../services/related-movement.service';
import { MovementModel } from '../../models/movement.model';
import { NumberType } from '../../enums/number-type.enum';
import { LanguageType } from '../../enums/language-type.enum';

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
  private defaultColor = '#000000'
  private defaultBackgroundColor = '#ffffff'

  constructor(
    private readonly location: Location,
    private readonly movementService: MovementService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly userService: UserService,
    private translateService: TranslateService,
    private relateMovementService: RelatedMovementService,
  ) {
    combineLatest([
      this.activatedRoute.params,
      this.userService.getUserCategories$().pipe(take(1)),
      this.userService.getUserConfiguration$().pipe(take(1)),
      this.relateMovementService.getRelatedMovementsShowingInMovements().pipe(take(1))
    ]).subscribe({
      next: ([params, userCategories, config, relatedMovements]) => {
        this.movement = this.movementService.getMovementById(params['id'])
        if (!this.movement) {
          this.exit()
        }
        const userCategory = userCategories.find(x => x.categoryId === this.movement!.categoryId)
        this.movement!.color = userCategory?.color ?? this.defaultColor
        this.movement!.backgroundColor = userCategory?.backgroundColor ?? this.defaultBackgroundColor
        this.numberType = config.number
        this.language = config.language
        this.load = true
        this.relatedMovements = relatedMovements.filter(x => x.related.map(y => y.id).includes(this.movement!.id!)).map(x => x.name!)
      }, error: (e) => {
        console.error(e)
        throw e
      }
    })
  }

  ngOnInit(): void { }

  protected exit = () => {
    this.location.back()
  }

  protected deleteMovement = (): void => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('movement-messages.title-delete'),
        message: this.translateService.instant('movement-messages.question-delete')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.movementService.delete(this.movement?.id!, this.movement?.type!).then(() => {
          this.snackBar.open(this.translateService.instant('movement-messages.deleted'), '', { duration: 3000 })
          this.exit()
        }).catch((reason: any) => this.snackBar.open(reason, '', { duration: 3000 }))
      }
    })
  }

  protected editMovement = (id?: string): void => {
    this.router.navigateByUrl(`/movement-update/${id}`)
  }
}
