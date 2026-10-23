import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
  private static readonly checkInterval = 12 * 60 * 60 * 1000

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService
  ) { }

  // When a new version is deployed the installed app keeps the old one until it is reloaded:
  // the user is told and can update with one tap. It also checks again when the app comes back to the screen.
  public watch = (): void => {
    if (!this.swUpdate.isEnabled) { return }
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => this.showUpdate())
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.check()
      }
    })
    setInterval(this.check, AppUpdateService.checkInterval)
  }

  private check = (): void => {
    this.swUpdate.checkForUpdate().catch((e) => console.error(e))
  }

  private showUpdate = (): void => {
    const snackBarRef = this.snackBar.open(
      this.translate.instant('update-messages.available'),
      this.translate.instant('update-messages.action')
    )
    snackBarRef.onAction().subscribe(() => document.location.reload())
  }
}
