import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly snackBar: MatSnackBar, private readonly translate: TranslateService) { }

  public message = (key: string, params?: object, duration = 3000): void => {
    this.snackBar.open(this.translate.instant(key, params), '', { duration })
  }

  // Requests that fail (offline, permissions) are shown to the user instead of breaking the subscription silently
  public error = (error: unknown): void => {
    console.error(error)
    this.snackBar.open(this.translate.instant('message-error.generic'), '', { duration: 4000 })
  }
}
