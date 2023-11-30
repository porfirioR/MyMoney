import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserDataModel } from '../../models/user-data.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(private authService: AuthService, private router: Router, private readonly userService: UserService) {}

  ngOnInit() {
    if(!this.isLocal) {
      this.login()
    }
  }

  private login = () => {
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
    .catch((x) => console.error(x))
  };

  protected loginUser = () => {
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
    .catch((x) => console.error(x))
  }
}
