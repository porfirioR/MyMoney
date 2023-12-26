import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, switchMap } from 'rxjs';
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
  protected movements: RelatedMovementGroupModel[] = []

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
    if (this.movements.find(x => x.id === id)) {
      return
    }
    this.relatedMovementsService.getById(id).pipe(switchMap((relatedMovement) => {
      const category = CategoryType
      const expense$ = this.movementService.getMovementsByIds(category.expense, relatedMovement.related.filter(x => x.type === category.expense).map(x => x.id))
      const income$ = this.movementService.getMovementsByIds(category.income, relatedMovement.related.filter(x => x.type === category.income).map(x => x.id))
      return combineLatest([expense$, income$])
    })).subscribe({
      next: ([expenses, incomes]) => {
        this.movements.push(new RelatedMovementGroupModel(id, expenses, incomes))
        console.log(expenses)
        console.log(incomes)
      }, error: (e) => {
        throw e
      }
    })
  }
}
