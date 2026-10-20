import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { RelatedMovementDetailModel } from '../../models/related-movement-detail.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { RelatedMovementModel } from '../../models/related-movement.model';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { RelatedMovementService } from '../../services/related-movement.service';

@Component({
  selector: 'app-related-movement-detail',
  templateUrl: './related-movement-detail.component.html',
  styleUrls: ['./related-movement-detail.component.scss']
})
export class RelatedMovementDetailComponent implements OnInit {
  @Input() movements: RelatedMovementDetailModel[] = []
  @Input() configuration!: ConfigurationModel
  @Input() relatedMovement!: RelatedMovementModel
  @Output() deletedMovementEvent = new EventEmitter<string>()

  protected language = LanguageType.English
  protected numberType = NumberType.English

  constructor(
    private translateService: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly relatedMovementsService: RelatedMovementService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.language = this.configuration.language
    this.numberType = this.configuration.number
  }

  protected deletedMovement = (id: string): void => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('related-movement-messages.title-delete-movement'),
        message: this.translateService.instant('related-movement-messages.question-delete-movement')
      }
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        const related = this.relatedMovement.related.filter(x => x.id !== id)
        this.relatedMovementsService.updateRelated(this.relatedMovement.id!, related).then(() => {
          // Keeps the group in sync so removing a second movement does not bring back the first one
          this.relatedMovement.related = related
          this.snackBar.open(this.translateService.instant('related-movement-messages.movement-removed'), '', { duration: 3000 })
          this.deletedMovementEvent.emit(id)
        }).catch((reason: any) => this.snackBar.open(String(reason), '', { duration: 3000 }))
      }
    })

  }
}
