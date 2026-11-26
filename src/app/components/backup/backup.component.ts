import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { MyEventsExportForm } from '../../forms/my-events-export.form';
import { BackupPlanModel } from '../../models/backup.model';
import { BackupService } from '../../services/backup.service';
import { MovementService } from '../../services/movement.service';
import { MyEventsExportHelper } from '../../services/my-events-export.helper';
import { NotificationService } from '../../services/notification.service';
import { RelatedMovementService } from '../../services/related-movement.service';
import { UserService } from '../../services/user.service';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

// Three independent blocks: export the backup, import a backup into this account, and the file for my-events
@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent {
  // Export backup
  protected exporting = false

  // Import backup
  protected fileName?: string
  protected plan?: BackupPlanModel
  protected errorKey?: string
  protected reading = false
  protected importing = false
  protected finished = false
  protected progress = 0
  protected done = 0
  protected total = 0

  // Export for my-events
  protected minDate = new Date('2018-01-01:00:00:00')
  protected today = new Date()
  protected exportingMyEvents = false
  protected formGroup: FormGroup<MyEventsExportForm> = new FormGroup<MyEventsExportForm>({
    startDate: new FormControl(null, [Validators.required]),
    endDate: new FormControl(null, [Validators.required])
  })

  constructor(
    private readonly backupService: BackupService,
    private readonly userService: UserService,
    private readonly movementService: MovementService,
    private readonly relatedMovementService: RelatedMovementService,
    private readonly notificationService: NotificationService,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) { }

  protected get busy(): boolean {
    return this.exporting || this.reading || this.importing || this.exportingMyEvents
  }

  protected get newCategoryNames(): string {
    return this.plan?.categoriesToCreate.map(x => x.data.name).join(', ') ?? ''
  }

  protected get groupsToCreate(): number {
    return this.plan?.groups.filter(x => !x.exists).length ?? 0
  }

  protected get groupsToReplace(): number {
    return this.plan?.groups.filter(x => x.exists).length ?? 0
  }

  protected exit = (): void => {
    this.router.navigate([''])
  }

  // Every category, movement and group of the account, in the file that the import reads
  protected exportBackup = async (): Promise<void> => {
    this.exporting = true
    try {
      const backup = await this.backupService.build()
      this.downloadJson(backup, `mymoney-backup-${MyEventsExportHelper.toLocalDate(new Date())}.json`)
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.exporting = false
    }
  }

  protected onFileSelected = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.item(0)
    // The same file can be chosen again after an import
    input.value = ''
    if (!file) { return }
    this.fileName = file.name
    this.plan = undefined
    this.errorKey = undefined
    this.finished = false
    this.reading = true
    try {
      const backup = this.backupService.parse(await file.text())
      this.plan = await this.backupService.plan(backup)
    } catch (e) {
      const key = e instanceof Error ? e.message : ''
      if (key.startsWith('backup-messages.')) {
        this.errorKey = key
      } else {
        this.notificationService.error(e)
      }
    } finally {
      this.reading = false
    }
  }

  protected confirmImport = (): void => {
    if (!this.plan || this.importing) { return }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('backup-messages.confirm-title'),
        message: this.translate.instant('backup-messages.confirm-message'),
        confirmText: 'backup-messages.import-button'
      }
    })
    dialogRef.afterClosed().pipe(take(1)).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.runImport()
      }
    })
  }

  // Every movement of the range (income and expense, all categories) as the JSON that my-events imports
  protected exportForMyEvents = async (): Promise<void> => {
    if (this.formGroup.invalid) { return }
    const startDate = new Date(this.formGroup.controls.startDate.value!)
    const endDate = new Date(this.formGroup.controls.endDate.value!)
    this.exportingMyEvents = true
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
        this.notificationService.message('There are no movements in the loaded date range', undefined, 5000)
        return
      }
      this.downloadJson(report, `mymoney-export-${MyEventsExportHelper.toLocalDate(new Date())}.json`)
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.exportingMyEvents = false
    }
  }

  private runImport = async (): Promise<void> => {
    this.importing = true
    try {
      await this.backupService.import(this.plan!, (done, total) => {
        this.done = done
        this.total = total
        this.progress = total === 0 ? 100 : Math.round(done * 100 / total)
      })
      this.finished = true
      this.plan = undefined
      this.fileName = undefined
      this.notificationService.message('backup-messages.imported')
    } catch (e) {
      this.notificationService.error(e)
    } finally {
      this.importing = false
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
}
