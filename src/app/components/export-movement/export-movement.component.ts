import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, firstValueFrom, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { ExportRequestModel } from '../../models/export-request.model';
import { MovementModel } from '../../models/movement.model';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';
import { ExportMovementForm } from '../../forms/export-movement.form';
import { RelatedMovementService } from '../../services/related-movement.service';
import { MyEventsExportHelper } from '../../services/my-events-export.helper';

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
    private readonly notificationService: NotificationService,
    private readonly relatedMovementService: RelatedMovementService,
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
        this.notificationService.error(e)
      }
    })

    setTimeout(() => {
      const unique = new Set(this.movementListResponse)
      this.returnExport([...unique])
    }, 10000);
  }

  protected canExportForMyEvents = (): boolean =>
    !!this.formGroup.controls.startDate.value && !!this.formGroup.controls.endDate.value && !this.loading

  // Every movement of the range (income and expense, all categories) as the JSON that my-events imports
  protected exportForMyEvents = async (): Promise<void> => {
    const startDate = new Date(this.formGroup.controls.startDate.value!)
    const endDate = new Date(this.formGroup.controls.endDate.value!)
    this.loading = true
    try {
      const [incomes, expenses, relatedGroups] = await Promise.all([
        firstValueFrom(this.movementService.getMovementToExport(CategoryType.income, new Date(startDate), new Date(endDate)).pipe(take(1))),
        firstValueFrom(this.movementService.getMovementToExport(CategoryType.expense, new Date(startDate), new Date(endDate)).pipe(take(1))),
        firstValueFrom(this.relatedMovementService.getAll().pipe(take(1))),
      ])
      const report = MyEventsExportHelper.build({
        categories: this.userService.getAllCategories(),
        movements: [...incomes, ...expenses],
        relatedGroups: relatedGroups.map(g => ({ ...g, related: g.related.map(r => ({ id: r['id'] })) })),
        from: MyEventsExportHelper.toLocalDate(startDate),
        to: MyEventsExportHelper.toLocalDate(endDate),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        exportedAt: new Date(),
      })
      if (report.movements.length === 0) {
        this.snackBar.open(this.translate.instant('There are no movements in the loaded date range'), '', { duration: 5000 })
        return
      }
      this.downloadJson(report, `mymoney-export-${MyEventsExportHelper.toLocalDate(new Date())}.json`)
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.loading = false
    }
  }

  private downloadJson = (data: unknown, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
