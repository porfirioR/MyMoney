import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserDataModel } from '../../models/user-data.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  protected isLocal = !environment.production
  protected formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  })
  protected title = environment.title
  protected isLoading = false

  constructor(
    private authService: AuthService,
    private router: Router,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService
  ) {}

  // The Google popup opens right away; if the browser blocks it or the user closes it, the button retries
  ngOnInit(): void {
    if(!this.isLocal) {
      this.loginWithGoogle()
    }
  }

  protected loginWithGoogle = (): void => {
    if (this.isLoading) { return }
    this.isLoading = true
    this.authService.loginWithGoogle()
    .then((x: UserCredential) => this.setUser(x))
    .catch((x) => {
      console.error(x)
      this.isLoading = false
      this.notificationService.message('message-error.login-failed', undefined, 4000)
    })
  };

  protected loginUser = (): void => {
    this.isLoading = true
    this.authService.signInUser(this.formGroup.value.email!, this.formGroup.value.password!)
    .then((x: UserCredential) => this.setUser(x))
    .catch((x) => {
      console.error(x)
      this.isLoading = false
      this.notificationService.message('message-error.login-failed', undefined, 4000)
    })
  }

  // The categories and configuration are loaded by UserGuard when the main screen opens
  private setUser = (credential: UserCredential): void => {
    const userData: UserDataModel = {
      email: credential.user.email!,
      activeCategories: [],
      allCategories: [],
      userCategories: [],
      photo: credential.user.photoURL,
      displayName: credential.user.displayName ?? '',
      userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English)
    }
    this.userService.setUser(userData)
    this.router.navigate([''])
  }
}
