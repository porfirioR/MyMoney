import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
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
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  protected title = environment.title
  protected isLoading = false

  constructor(
    private authService: AuthService,
    private router: Router,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if(!this.isLocal) {
      this.login()
    }
  }

  private login = (): void => {
    this.isLoading = true
    this.authService.loginWithGoogle()
    .then((x: UserCredential) => {
      const userData: UserDataModel = {
        email: x.user.email!,
        activeCategories: [],
        allCategories: [],
        userCategories: [],
        photo: x.user.photoURL,
        displayName: x.user.displayName!,
        userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English, x.user.email!)
      }
      this.userService.setUser(userData)
      this.router.navigate([''])
    })
    .catch((x) => {
      console.error(x)
      this.isLoading = false
      this.snackBar.open(this.translateService.instant('message-error.login-failed'), '', { duration: 4000 })
    })
  };

  protected loginUser = (): void => {
    this.isLoading = true
    this.authService.signInUser(this.formGroup.value.email!, this.formGroup.value.password!)
    .then((x: UserCredential) => {
      const userData: UserDataModel = {
        email: x.user.email!,
        activeCategories: [],
        allCategories: [],
        userCategories: [],
        photo: x.user.photoURL,
        displayName: x.user.displayName!,
        userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English, x.user.email!)
      }
      this.userService.setUser(userData)
      this.router.navigate([''])
    })
    .catch((x) => {
      console.error(x)
      this.isLoading = false
      this.snackBar.open(this.translateService.instant('message-error.login-failed'), '', { duration: 4000 })
    })
  }
}
