import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { ExportRequestModel } from '../../models/export-request.model';
import { MovementModel } from '../../models/movement.model';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { ExportMovementForm } from '../../forms/export-movement.form';

@Component({
  selector: 'app-export-movement',
  templateUrl: './export-movement.component.html',
  styleUrls: ['./export-movement.component.scss']
})
export class ExportMovementComponent {
  protected minDate = new Date('2018-01-01:00:00:00')
  protected loading = false
  protected formGroup: FormGroup<ExportMovementForm> = new FormGroup<ExportMovementForm>({
    startDate: new FormControl(null, [Validators.required]),
    endDate: new FormControl(null, [Validators.required]),
    categories: new FormControl(null, [Validators.required])
  })
  private movementListResponse: MovementModel[] = []
  protected categories = CategoryType
  private request!: ExportRequestModel
  constructor(
    private readonly userService: UserService,
    private readonly movementService: MovementService,
    private readonly snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router,
  ) { }

  protected exit = (): void => {
    this.router.navigate([''])
  }

  protected export = (): void => {
    this.movementListResponse = []
    this.loading = true
    this.request = this.formGroup.getRawValue() as ExportRequestModel
    const movements$ = this.request.categories.map(x => this.movementService.getMovementToExport(x, this.request.startDate, this.request.endDate))
    combineLatest(movements$).subscribe({
      next: (response: MovementModel[][] | MovementModel[]) => {
        this.movementListResponse = this.movementListResponse.concat(response.flatMap(x => x))
      }, error: (e) => {
        this.loading = false
        console.error(e);
        throw e;
      }
    })

    setTimeout(() => {
      const unique = new Set(this.movementListResponse)
      this.returnExport([...unique])
    }, 10000);
  }

  private convertDate = (x: Date): string => `${x.getFullYear()}-${(x.getMonth() + 1)}-${x.getDate()}`;

  private returnExport = (movementList: MovementModel[]): void => {
    if (movementList.length === 0) {
      this.snackBar.open(this.translate.instant(`There are no movements in the loaded date range`), '', { duration: 5000 })
    }
    const csvHeader = environment.header
    let movementsToExport = movementList.sort((a, b) => a.time - b.time).map(x =>
      [
        new Date(x.time).toLocaleDateString(),
        x.type,
        this.userService.getActiveCategories().find(y => y.id === x.categoryId)?.name,
        x.memorandum,
        x.amount
      ].join(',')
    ).join('\r\n')
    movementsToExport = `${csvHeader}\r\n`.concat(movementsToExport)
    const encodedUri = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURI(movementsToExport)}`
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    a.href = encodedUri
    a.download = `${this.convertDate(this.request.startDate)}-${this.convertDate(this.request.endDate)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    this.loading = false
  }
}
