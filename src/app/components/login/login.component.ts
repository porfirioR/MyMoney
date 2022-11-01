import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserDataModel } from '../../models/user-data.model';
import { ConfigurationModel } from 'src/app/models/configuration.model';
import { LanguageType } from 'src/app/enums/language-type.enum';
import { NumberType } from 'src/app/enums/number-type.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router, private readonly userService: UserService) {}

  ngOnInit() {
    this.login()
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
    .catch((x) => console.log(x))
  };
}
