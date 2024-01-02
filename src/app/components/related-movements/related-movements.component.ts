import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, of, switchMap } from 'rxjs';
import { RelatedMovementModel } from '../../models/related-movement.model';
import { RelatedMovementGroupModel } from '../../models/related-movement-group.model';
import { RelatedMovementsService } from '../../services/related-movements.service';
import { MovementService } from '../../services/movement.service';
import { CategoryType } from '../../enums/category-type.enum';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

@Component({
  selector: 'app-related-movements',
  templateUrl: './related-movements.component.html',
  styleUrls: ['./related-movements.component.scss']
})
export class RelatedMovementsComponent implements OnInit {
  protected loading = true
  protected relatedMovements: RelatedMovementModel[] = []
  protected movements: Map<string, RelatedMovementGroupModel> = new Map<string, RelatedMovementGroupModel>()

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
    if (this.movements.get(id)) {
      return
    }
    this.relatedMovementsService.getById(id).pipe(switchMap((relatedMovement) => {
      const category = CategoryType
      const expenseIds = relatedMovement.related.filter(x => x.type === category.expense)
      const incomeIds = relatedMovement.related.filter(x => x.type === category.income)
      const expense$ = expenseIds.length > 0 ? this.movementService.getMovementsByIds(category.expense, expenseIds.map(x => x.id)) : of([])
      const income$ = incomeIds.length > 0 ? this.movementService.getMovementsByIds(category.income, incomeIds.map(x => x.id)) : of([])
      return combineLatest([expense$, income$])
    })).subscribe({
      next: ([expenses, incomes]) => {
        const movement: RelatedMovementGroupModel = {
          expenses,
          incomes
        }
        this.movements.set(id, movement)
      }, error: (e) => {
        throw e
      }
    })
  }
}
