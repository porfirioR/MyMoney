import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent {
  protected title = environment.title
  protected isLoading = false

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) { }

  // In production the button opens Google's login directly (the tap allows the popup);
  // locally it goes to the manual login form
  protected goToLogin = (): void => {
    if (!environment.production) {
      this.router.navigate(['login'])
      return
    }
    if (this.isLoading) { return }
    this.isLoading = true
    this.authService.loginWithGoogle().catch((error) => {
      console.error(error)
      this.isLoading = false
      this.notificationService.message('message-error.login-failed', undefined, 4000)
    })
  }
}
