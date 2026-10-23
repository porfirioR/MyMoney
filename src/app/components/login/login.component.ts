import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  protected isLocal = !environment.production
  protected formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  })
  protected title = environment.title
  protected isLoading = false

  constructor(
    private authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  // Google's popup only opens when the button is tapped, never by itself on page load
  protected loginWithGoogle = (): void => {
    if (this.isLoading) { return }
    this.isLoading = true
    this.authService.loginWithGoogle().catch(this.loginFailed)
  }

  protected loginUser = (): void => {
    this.isLoading = true
    this.authService.signInUser(this.formGroup.value.email!, this.formGroup.value.password!).catch(this.loginFailed)
  }

  private loginFailed = (error: unknown): void => {
    console.error(error)
    this.isLoading = false
    this.notificationService.message('message-error.login-failed', undefined, 4000)
  }
}
