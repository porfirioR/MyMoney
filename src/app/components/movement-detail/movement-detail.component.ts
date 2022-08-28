import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementService } from '../../services/movement.service';
import { MovementModel } from '../../models/movement.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { CategoryType } from '../../enums/category-type.enum';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movement-detail',
  templateUrl: './movement-detail.component.html',
  styleUrls: ['./movement-detail.component.scss']
})
export class MovementDetailComponent implements OnInit {
  protected movement?: MovementModel

  constructor(private readonly location: Location,
    private readonly movementService: MovementService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router, private readonly dialog: MatDialog, private readonly snackBar: MatSnackBar) {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.movement = this.movementService.getMovementById(params['id'])
        if (!this.movement) {
          this.exit()
        }
      }, error: (e) => {
        throw e;
      }
    })
  }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected deleteMovement = () => {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '350px',
      data: { title: 'Delete movement', message: 'Are you sure you want to remove this move?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.movementService.delete(this.movement?.id as string, this.movement?.type as CategoryType).then(() => {
          this.snackBar.open('Movement was deleted', '', { duration: 3000 })
          this.exit()
        }).catch((reason: any) => {
          this.snackBar.open(reason, '', { duration: 3000 })
        })
      }
    });
  }

  protected editMovement = (id?: string) => {
    this.router.navigateByUrl(`/movement-update/${id}`)
  }
}
