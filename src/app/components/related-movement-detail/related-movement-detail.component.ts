import { Component, Input, OnInit } from '@angular/core';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { RelatedMovementDetailModel } from '../../models/related-movement-detail.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-related-movement-detail',
  templateUrl: './related-movement-detail.component.html',
  styleUrls: ['./related-movement-detail.component.scss']
})
export class RelatedMovementDetailComponent implements OnInit {
  @Input() movements: RelatedMovementDetailModel[] = []
  @Input() configuration!: ConfigurationModel
  protected language = LanguageType.English
  protected numberType = NumberType.English

  constructor(
    private translateService: TranslateService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.language = this.configuration.language
    this.numberType = this.configuration.number
  }


  protected deletedMovement = (id: string) => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translateService.instant('related-movement-messages.title-delete-movement'),
        message: this.translateService.instant('related-movement-messages.question-delete')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.movementService.delete(this.movement?.id!, this.movement?.type!).then(() => {
        //   this.snackBar.open(this.translateService.instant('related-movement-messages.deleted'), '', { duration: 3000 })
        //   this.exit()
        // }).catch((reason: any) => this.snackBar.open(reason, '', { duration: 3000 }))
      }
    })

  }
}
