import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { RelatedMovementsService } from 'src/app/services/related-movements.service';
import { RelatedMovementModel } from 'src/app/models/related-movement-model';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { MovementService } from 'src/app/services/movement.service';
import { CategoryType } from 'src/app/enums/category-type.enum';

@Component({
  selector: 'app-related-movements',
  templateUrl: './related-movements.component.html',
  styleUrls: ['./related-movements.component.scss']
})
export class RelatedMovementsComponent implements OnInit {
  protected loading = true
  protected relatedMovements: RelatedMovementModel[] = []

  constructor(
    private readonly location: Location,
    private readonly relatedMovementsService: RelatedMovementsService,
    private readonly dialog: MatDialog,
    private translate: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly movementService: MovementService
  ) { }

  ngOnInit() {
    this.relatedMovementsService.getAll()
    .subscribe({
      next: (relatedMovements: RelatedMovementModel[]) => {
        this.relatedMovements = relatedMovements
        this.loading = false
      }, error: (e) => {
        this.loading = false
        throw e
      }
    })
  }

  protected exit = (): void => {
    this.location.back()
  }

  protected deleteRelatedMovement = (): void => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: {
        title: this.translate.instant('related-movement-messages.title-delete'),
        message: this.translate.instant('related-movement-messages.question-delete')
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.movementService.delete(this.movement?.id!, this.movement?.type!).then(() => {
        //   this.snackBar.open(this.translate.instant('movement-messages.deleted'), '', { duration: 3000 })
        //   this.exit()
        // }).catch((reason: any) => this.snackBar.open(reason, '', { duration: 3000 }))
      }
    })
  }

  protected displayMovements = (id: string) => {
    this.relatedMovementsService.getById(id).pipe(switchMap((relatedMovement) => {
        const category = CategoryType
        const expense$ = this.movementService.getMovementsByIds(category.expense, relatedMovement.related.filter(x => x.type === category.expense).map(x => x.id))
        const income$ = this.movementService.getMovementsByIds(category.income, relatedMovement.related.filter(x => x.type === category.income).map(x => x.id))
        return combineLatest([expense$, income$])
    })).subscribe({
      next: ([expense, income]) => {
        console.log(expense)
        console.log(income)
      }, error: (e) => {
        
        throw e
      }
    })
  }
}
